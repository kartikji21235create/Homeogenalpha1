/**
 * scoring_v2.ts — deterministic repertorization with classical refinements.
 *
 * Drop-in companion to src/lib/scoring.ts. Everything is integer arithmetic
 * ("centi-points") so results are byte-identical across runs and platforms.
 *
 * What v2 adds over Score(R) = Σ grade × weight:
 *   1. Rubric-type multipliers (mental / general / particular).  Default 100% each
 *      => identical to v1. Use PROFILE_KENTIAN as a starting point, then TUNE ON THE
 *      DEV SPLIT of your eval set (eval/eval_v2.ts). The numbers in the profile are
 *      placeholders, not clinical truth.
 *   2. Parent/child overlap: if a confirmed rubric and one of its confirmed
 *      descendants both contain a remedy, only the more specific (child) counts.
 *      Stops "Anger" + "Anger; irritability" from double-counting.
 *   3. Eliminating rubrics: remedies absent from an eliminating rubric are excluded.
 *   4. Contradictions: a remedy listed in the OPPOSITE rubric of a confirmed rubric
 *      (e.g. "worse warmth" vs "better warmth") and NOT in the confirmed one is penalised.
 *   5. Clinical tiebreak chain instead of remedy_id order.
 *   6. Per-remedy breakdown, so every number can be reproduced and shown to the doctor.
 */

export type RubricType = 'mental' | 'general' | 'particular';
export type Grade = 1 | 2 | 3 | 4;
export type Weight = 1 | 2 | 3 | 4;

export interface ConfirmedRubric {
  id: string;
  type: RubricType;
  weight: Weight;
  /** Remedies NOT in this rubric are removed from the ranking. */
  eliminating?: boolean;
  /** Rubric id of the opposite modality, e.g. "worse warmth" <-> "better warmth". */
  oppositeId?: string;
}

export interface Mapping {
  remedyId: number;
  rubricId: string;
  grade: Grade;
}

export interface ScoreOptions {
  /** Percent multipliers per rubric type. Default: 100/100/100 (== v1 behaviour). */
  typeMultiplierPct?: Record<RubricType, number>;
  /** Penalty (percent of grade×weight) for a contradicting remedy. Default 50. */
  contradictionPenaltyPct?: number;
  /** rubricId -> parent rubricId (or null). Needed for overlap handling. */
  parentOf?: Record<string, string | null>;
  /** remedyId -> number of rubric entries in the repertory (for normalised score). */
  remedyEntryCount?: Record<number, number>;
  /** Ranking key. 'score' (default, deterministic integer) or 'normalized'. */
  rankBy?: 'score' | 'normalized';
  /** Max rows returned. Default 12. */
  limit?: number;
}

export interface RemedyBreakdownLine {
  rubricId: string;
  grade: Grade;
  weight: Weight;
  type: RubricType;
  centi: number;
  suppressedByChild?: string;
}

export interface RemedyScore {
  rank: number;
  remedyId: number;
  /** Display score = scoreCenti / 100. */
  score: number;
  scoreCenti: number;
  mentalGeneralCenti: number;
  rubricsCovered: number;
  rubricsTotal: number;
  /** rubricsCovered / rubricsTotal, in [0,1]. */
  coverage: number;
  grade4Hits: number;
  contradictionCenti: number;
  /** score / sqrt(entryCount); null if remedyEntryCount not supplied. */
  normalizedScore: number | null;
  breakdown: RemedyBreakdownLine[];
  contradictions: { rubricId: string; oppositeId: string; centi: number }[];
}

export const PROFILE_FLAT: Record<RubricType, number> = {
  mental: 100,
  general: 100,
  particular: 100,
};

/** Placeholder classical-hierarchy profile. Tune against your dev eval set. */
export const PROFILE_KENTIAN: Record<RubricType, number> = {
  mental: 150,
  general: 125,
  particular: 100,
};

function assertInt(n: number, lo: number, hi: number, what: string): void {
  if (!Number.isInteger(n) || n < lo || n > hi) {
    throw new RangeError(`${what} must be an integer in [${lo}, ${hi}], got ${n}`);
  }
}

/** All ancestor ids of `id` using parentOf (cycle-safe). */
function ancestorsOf(id: string, parentOf: Record<string, string | null>): string[] {
  const out: string[] = [];
  const seen = new Set<string>([id]);
  let cur = parentOf[id] ?? null;
  while (cur !== null && cur !== undefined && !seen.has(cur)) {
    out.push(cur);
    seen.add(cur);
    cur = parentOf[cur] ?? null;
  }
  return out;
}

export function scoreV2(
  confirmed: ConfirmedRubric[],
  mappings: Mapping[],
  opts: ScoreOptions = {},
): RemedyScore[] {
  const mult = opts.typeMultiplierPct ?? PROFILE_FLAT;
  const penaltyPct = opts.contradictionPenaltyPct ?? 50;
  const parentOf = opts.parentOf ?? {};
  const limit = opts.limit ?? 12;
  const rankBy = opts.rankBy ?? 'score';

  assertInt(penaltyPct, 0, 1000, 'contradictionPenaltyPct');
  for (const t of ['mental', 'general', 'particular'] as RubricType[]) {
    assertInt(mult[t], 0, 1000, `typeMultiplierPct.${t}`);
  }

  // --- validate inputs -----------------------------------------------------
  const confirmedIds = new Set<string>();
  for (const c of confirmed) {
    assertInt(c.weight, 1, 4, `weight of rubric ${c.id}`);
    if (confirmedIds.has(c.id)) throw new Error(`duplicate confirmed rubric ${c.id}`);
    confirmedIds.add(c.id);
  }

  // --- index mappings: rubricId -> remedyId -> grade (max if repeated) ------
  const byRubric = new Map<string, Map<number, Grade>>();
  for (const m of mappings) {
    assertInt(m.grade, 1, 4, `grade of ${m.rubricId}/${m.remedyId}`);
    let inner = byRubric.get(m.rubricId);
    if (!inner) {
      inner = new Map();
      byRubric.set(m.rubricId, inner);
    }
    const prev = inner.get(m.remedyId) ?? 0;
    if (m.grade > prev) inner.set(m.remedyId, m.grade);
  }

  // --- confirmed descendants of each confirmed rubric ------------------------
  const confirmedDescendants = new Map<string, string[]>();
  for (const c of confirmed) confirmedDescendants.set(c.id, []);
  for (const c of confirmed) {
    for (const anc of ancestorsOf(c.id, parentOf)) {
      if (confirmedIds.has(anc)) confirmedDescendants.get(anc)!.push(c.id);
    }
  }

  // --- candidate remedies: appear in at least one confirmed rubric ------------
  const candidates = new Set<number>();
  for (const c of confirmed) {
    for (const rid of byRubric.get(c.id)?.keys() ?? []) candidates.add(rid);
  }

  const results: Omit<RemedyScore, 'rank'>[] = [];

  for (const remedyId of candidates) {
    // eliminators
    let eliminated = false;
    for (const c of confirmed) {
      if (c.eliminating && !byRubric.get(c.id)?.has(remedyId)) {
        eliminated = true;
        break;
      }
    }
    if (eliminated) continue;

    let scoreCenti = 0;
    let mgCenti = 0;
    let covered = 0;
    let grade4Hits = 0;
    let contraCenti = 0;
    const breakdown: RemedyBreakdownLine[] = [];
    const contradictions: RemedyScore['contradictions'] = [];

    // stable iteration: sort by rubric id so breakdown order is deterministic
    const ordered = [...confirmed].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

    for (const c of ordered) {
      const g = byRubric.get(c.id)?.get(remedyId);
      if (g) {
        const childHit = (confirmedDescendants.get(c.id) ?? []).find((d) =>
          byRubric.get(d)?.has(remedyId),
        );
        const centi = g * c.weight * mult[c.type];
        if (childHit) {
          breakdown.push({
            rubricId: c.id, grade: g, weight: c.weight, type: c.type, centi: 0,
            suppressedByChild: childHit,
          });
          continue;
        }
        scoreCenti += centi;
        if (c.type !== 'particular') mgCenti += centi;
        covered += 1;
        if (g === 4) grade4Hits += 1;
        breakdown.push({ rubricId: c.id, grade: g, weight: c.weight, type: c.type, centi });
      } else if (c.oppositeId) {
        const og = byRubric.get(c.oppositeId)?.get(remedyId);
        if (og) {
          const pen = og * c.weight * penaltyPct;
          contraCenti += pen;
          contradictions.push({ rubricId: c.id, oppositeId: c.oppositeId, centi: pen });
        }
      }
    }

    scoreCenti -= contraCenti;

    const n = opts.remedyEntryCount?.[remedyId];
    const normalizedScore =
      n && n > 0 ? Math.round((scoreCenti / 100 / Math.sqrt(n)) * 1000) / 1000 : null;

    results.push({
      remedyId,
      score: scoreCenti / 100,
      scoreCenti,
      mentalGeneralCenti: mgCenti,
      rubricsCovered: covered,
      rubricsTotal: confirmed.length,
      coverage: confirmed.length ? covered / confirmed.length : 0,
      grade4Hits,
      contradictionCenti: contraCenti,
      normalizedScore,
      breakdown,
      contradictions,
    });
  }

  // --- tiebreak chain (all deterministic) -------------------------------------
  // 1 primary key (score or normalized)  2 fewer contradictions  3 mental+general weight
  // 4 rubrics covered  5 grade-4 hits  6 remedy id (last resort, pure stability)
  results.sort((a, b) => {
    if (rankBy === 'normalized') {
      const na = a.normalizedScore ?? -Infinity;
      const nb = b.normalizedScore ?? -Infinity;
      if (na !== nb) return nb > na ? 1 : -1;
    } else if (a.scoreCenti !== b.scoreCenti) {
      return b.scoreCenti - a.scoreCenti;
    }
    if (a.contradictionCenti !== b.contradictionCenti) return a.contradictionCenti - b.contradictionCenti;
    if (a.mentalGeneralCenti !== b.mentalGeneralCenti) return b.mentalGeneralCenti - a.mentalGeneralCenti;
    if (a.rubricsCovered !== b.rubricsCovered) return b.rubricsCovered - a.rubricsCovered;
    if (a.grade4Hits !== b.grade4Hits) return b.grade4Hits - a.grade4Hits;
    return a.remedyId - b.remedyId;
  });

  return results.slice(0, limit).map((r, i) => ({ rank: i + 1, ...r }));
}

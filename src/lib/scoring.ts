/**
 * Deterministic Repertorization Scoring Engine (PRD Section 9, Problem 19)
 * 
 * Order: score DESC, rubrics_covered DESC, remedy_id ASC (total and stable tiebreaker chain).
 * Mode: additive (Kent, Boenninghausen, Boger support in future iterations).
 */

export interface ConfirmedRubricItem {
  rubric_id: number;
  weight: number; // 1 to 4
}

export interface RemedyMappingItem {
  rubric_id: number;
  medicine_id: number;
  grade: number; // 1 to 4
}

export interface RemedyItem {
  id: number;
  common_name: string;
  abbreviation?: string;
}

export interface RubricContribution {
  rubric_id: number;
  grade: number; // 1 to 4
  weight: number; // 1 to 4
  subtotal: number; // grade * weight
}

export interface RankedMedicineResult {
  medicine_id: number;
  common_name: string;
  score: number;
  rubrics_covered: number;
  breakdown?: RubricContribution[];
}

export interface ScoringSnapshot {
  mode: "additive" | "kent" | "boenninghausen" | "boger";
  repertory_version: string;
  rubric_revision: number;
  inputs: ConfirmedRubricItem[];
  ranked: RankedMedicineResult[];
  calculated_at: string;
}

/**
 * Deterministically computes the ranked medicines.
 * Matches the exact SQL semantics:
 *   SUM(mrm.grade * cr.weight) AS score,
 *   COUNT(DISTINCT cr.rubric_id) AS rubrics_covered
 * ORDER BY score DESC, rubrics_covered DESC, m.id ASC
 * LIMIT 12;
 */
export function calculateRepertorizationScore(
  confirmedRubrics: ConfirmedRubricItem[],
  remedyMappings: RemedyMappingItem[],
  remedies: RemedyItem[],
  limit = 12
): RankedMedicineResult[] {
  // Validate that all weights are defined between 1 and 4
  for (const cr of confirmedRubrics) {
    if (cr.weight === null || cr.weight === undefined || cr.weight < 1 || cr.weight > 4) {
      throw new Error(`Invalid weight for rubric_id ${cr.rubric_id}. Must be between 1 and 4.`);
    }
  }

  const remedyMap = new Map<number, RemedyItem>();
  for (const r of remedies) {
    remedyMap.set(r.id, r);
  }

  // Map rubric_id -> weight
  const rubricWeightMap = new Map<number, number>();
  for (const cr of confirmedRubrics) {
    rubricWeightMap.set(cr.rubric_id, cr.weight);
  }

  // Group by medicine_id
  const scores = new Map<
    number,
    { score: number; coveredRubrics: Set<number>; breakdown: RubricContribution[] }
  >();

  for (const mapping of remedyMappings) {
    const weight = rubricWeightMap.get(mapping.rubric_id);
    if (weight === undefined) {
      continue; // rubric was not in confirmed list
    }

    if (!scores.has(mapping.medicine_id)) {
      scores.set(mapping.medicine_id, {
        score: 0,
        coveredRubrics: new Set<number>(),
        breakdown: [],
      });
    }

    const current = scores.get(mapping.medicine_id)!;
    const subtotal = mapping.grade * weight;
    current.score += subtotal;
    current.coveredRubrics.add(mapping.rubric_id);
    current.breakdown.push({
      rubric_id: mapping.rubric_id,
      grade: mapping.grade,
      weight,
      subtotal,
    });
  }

  // Convert to array
  const results: RankedMedicineResult[] = [];
  for (const [medId, data] of scores.entries()) {
    const remedy = remedyMap.get(medId);
    if (!remedy) continue;

    results.push({
      medicine_id: medId,
      common_name: remedy.common_name,
      score: data.score,
      rubrics_covered: data.coveredRubrics.size,
      breakdown: data.breakdown,
    });
  }

  // Total deterministic ordering:
  // 1. score DESC
  // 2. rubrics_covered DESC
  // 3. medicine_id ASC (crucial tiebreaker)
  results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (b.rubrics_covered !== a.rubrics_covered) {
      return b.rubrics_covered - a.rubrics_covered;
    }
    return a.medicine_id - b.medicine_id;
  });

  return results.slice(0, limit);
}

/**
 * eval_v2.ts — end-to-end accuracy harness for Homeogenalpha1.
 *
 * Measures, separately for `dev` and `test` splits:
 *   - retrieval:  Recall@{5,10,20,50}, rubric MRR
 *   - selection:  precision / recall / F1 of the rubrics the selector proposes
 *   - remedy:     top-1 / top-3 / top-5 hit rate and MRR of the doctor-verified remedy
 *
 * RULES (so the numbers mean something):
 *   1. Tune synonyms, weights, profiles ONLY by looking at the `dev` split.
 *   2. The `test` split is run for reporting / the CI gate and never inspected case-by-case.
 *   3. Every case needs `verifiedBy` (>= 1 practising homoeopath) and a `source`.
 *      Cases without them are skipped and counted, never silently used.
 *
 * Adapters are injected so this file has no dependency on your app internals:
 *   retrieve(narrative)            -> ranked candidate rubric ids (best first)
 *   select(narrative, candidates)  -> rubric ids the selector proposes
 *   rank(case, confirmedRubrics)   -> ranked remedy ids (best first)
 */

export interface EvalCase {
  id: string;
  split: 'dev' | 'test';
  narrative: string;
  /** Rubrics a physician would confirm for this narrative. */
  expectedRubricIds: string[];
  /** Rubrics WITH doctor weights, used for the remedy-rank stage. */
  confirmedRubrics: { id: string; weight: 1 | 2 | 3 | 4 }[];
  /** Remedy ids considered correct (verified outcome or textbook case). */
  expectedRemedyIds: number[];
  source: string; // e.g. "Kent Lectures case 12", "clinic case #A-123 (anonymised)"
  verifiedBy: string[]; // reviewer initials/ids
}

export interface Adapters {
  retrieve(narrative: string): Promise<string[]> | string[];
  select(narrative: string, candidates: string[]): Promise<string[]> | string[];
  rank(c: EvalCase, confirmed: { id: string; weight: 1 | 2 | 3 | 4 }[]): Promise<number[]> | number[];
}

export interface SplitReport {
  split: 'dev' | 'test';
  cases: number;
  skipped: number;
  recallAt: Record<number, number>;
  rubricMRR: number;
  selection: { precision: number; recall: number; f1: number };
  remedy: { top1: number; top3: number; top5: number; mrr: number };
}

const KS = [5, 10, 20, 50];
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const round4 = (n: number) => Math.round(n * 10000) / 10000;

function isValid(c: EvalCase): boolean {
  return c.verifiedBy.length >= 1 && c.source.trim().length > 0 && c.expectedRubricIds.length > 0 && c.expectedRemedyIds.length > 0;
}

export async function runEval(cases: EvalCase[], a: Adapters): Promise<SplitReport[]> {
  const reports: SplitReport[] = [];
  for (const split of ['dev', 'test'] as const) {
    const all = cases.filter((c) => c.split === split);
    const valid = all.filter(isValid);
    const recall: Record<number, number[]> = Object.fromEntries(KS.map((k) => [k, []]));
    const rmrr: number[] = [];
    const prec: number[] = [];
    const rec: number[] = [];
    const t1: number[] = [], t3: number[] = [], t5: number[] = [], rrk: number[] = [];

    for (const c of valid) {
      const cands = await a.retrieve(c.narrative);
      const expected = new Set(c.expectedRubricIds);

      for (const k of KS) {
        const top = new Set(cands.slice(0, k));
        const hit = c.expectedRubricIds.filter((r) => top.has(r)).length;
        recall[k].push(hit / c.expectedRubricIds.length);
      }
      const firstIdx = cands.findIndex((id) => expected.has(id));
      rmrr.push(firstIdx >= 0 ? 1 / (firstIdx + 1) : 0);

      const proposed = new Set(await a.select(c.narrative, cands.slice(0, 20)));
      const tp = [...proposed].filter((r) => expected.has(r)).length;
      prec.push(proposed.size ? tp / proposed.size : 0);
      rec.push(tp / expected.size);

      const ranked = await a.rank(c, c.confirmedRubrics);
      const want = new Set(c.expectedRemedyIds);
      const pos = ranked.findIndex((id) => want.has(id));
      t1.push(pos === 0 ? 1 : 0);
      t3.push(pos >= 0 && pos < 3 ? 1 : 0);
      t5.push(pos >= 0 && pos < 5 ? 1 : 0);
      rrk.push(pos >= 0 ? 1 / (pos + 1) : 0);
    }

    const p = mean(prec);
    const r = mean(rec);
    reports.push({
      split,
      cases: valid.length,
      skipped: all.length - valid.length,
      recallAt: Object.fromEntries(KS.map((k) => [k, round4(mean(recall[k]))])),
      rubricMRR: round4(mean(rmrr)),
      selection: { precision: round4(p), recall: round4(r), f1: round4(p + r ? (2 * p * r) / (p + r) : 0) },
      remedy: { top1: round4(mean(t1)), top3: round4(mean(t3)), top5: round4(mean(t5)), mrr: round4(mean(rrk)) },
    });
  }
  return reports;
}

export interface Thresholds {
  /** Minimum acceptable values on the TEST split. */
  minCasesTest: number;
  minRecallAt20: number;
  minSelectionF1: number;
  minRemedyTop5: number;
  /** Fail if any metric drops more than this vs baseline (absolute, e.g. 0.02). */
  maxRegression: number;
}

export function gate(
  reports: SplitReport[],
  t: Thresholds,
  baseline?: SplitReport[],
): { pass: boolean; failures: string[] } {
  const f: string[] = [];
  const test = reports.find((r) => r.split === 'test');
  if (!test) return { pass: false, failures: ['no test split report'] };
  if (test.cases < t.minCasesTest) f.push(`test cases ${test.cases} < required ${t.minCasesTest} (numbers not trustworthy yet)`);
  if (test.recallAt[20] < t.minRecallAt20) f.push(`Recall@20 ${test.recallAt[20]} < ${t.minRecallAt20}`);
  if (test.selection.f1 < t.minSelectionF1) f.push(`selection F1 ${test.selection.f1} < ${t.minSelectionF1}`);
  if (test.remedy.top5 < t.minRemedyTop5) f.push(`remedy top-5 ${test.remedy.top5} < ${t.minRemedyTop5}`);
  const bt = baseline?.find((r) => r.split === 'test');
  if (bt) {
    const pairs: [string, number, number][] = [
      ['Recall@20', test.recallAt[20], bt.recallAt[20]],
      ['selection F1', test.selection.f1, bt.selection.f1],
      ['remedy top-5', test.remedy.top5, bt.remedy.top5],
      ['remedy MRR', test.remedy.mrr, bt.remedy.mrr],
    ];
    for (const [name, now, was] of pairs) {
      if (was - now > t.maxRegression) f.push(`${name} regressed ${was} -> ${now}`);
    }
  }
  return { pass: f.length === 0, failures: f };
}

export function formatReport(reports: SplitReport[]): string {
  return reports
    .map(
      (r) =>
        `[${r.split}] cases=${r.cases} skipped=${r.skipped}\n` +
        `  Recall@5/10/20/50 = ${KS.map((k) => r.recallAt[k]).join(' / ')}   rubric MRR = ${r.rubricMRR}\n` +
        `  selection P/R/F1  = ${r.selection.precision} / ${r.selection.recall} / ${r.selection.f1}\n` +
        `  remedy top1/3/5   = ${r.remedy.top1} / ${r.remedy.top3} / ${r.remedy.top5}   MRR = ${r.remedy.mrr}`,
    )
    .join('\n');
}

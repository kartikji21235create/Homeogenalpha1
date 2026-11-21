import { test, describe } from "node:test";
import * as assert from "node:assert/strict";
import { runEval, gate, formatReport, EvalCase, Adapters } from "../evals/eval_v2";

const mk = (id: string, split: "dev" | "test", verified = true): EvalCase => ({
  id,
  split,
  narrative: id,
  expectedRubricIds: ["a", "b"],
  confirmedRubrics: [{ id: "a", weight: 2 }],
  expectedRemedyIds: [7],
  source: "synthetic",
  verifiedBy: verified ? ["X"] : [],
});

const adapters: Adapters = {
  retrieve: () => ["a", "z", "b"], // a@1, b@3
  select: () => ["a", "z"], // tp=1, proposed=2
  rank: () => [3, 7, 9], // correct remedy at position 2
};

describe("Multi-Metric Evaluation V2 Harness & Gate", () => {
  test("metrics, split separation and skipping of unverified cases", async () => {
    const reps = await runEval([mk("d1", "dev"), mk("t1", "test"), mk("t2", "test", false)], adapters);
    const t = reps.find((r) => r.split === "test")!;
    assert.equal(t.cases, 1);
    assert.equal(t.skipped, 1);
    assert.equal(t.recallAt[5], 1);
    assert.equal(t.rubricMRR, 1);
    assert.equal(t.selection.precision, 0.5);
    assert.equal(t.selection.recall, 0.5);
    assert.equal(t.remedy.top1, 0);
    assert.equal(t.remedy.top3, 1);
    assert.equal(t.remedy.mrr, 0.5);
    assert.ok(formatReport(reps).includes("[test]"));
  });

  test("gate fails on too few cases and on regression", async () => {
    const reps = await runEval([mk("t1", "test")], adapters);
    const g = gate(
      reps,
      {
        minCasesTest: 50,
        minRecallAt20: 0.9,
        minSelectionF1: 0.9,
        minRemedyTop5: 0.9,
        maxRegression: 0.02,
      },
      reps
    );
    assert.equal(g.pass, false);
    assert.ok(g.failures.some((x) => x.includes("not trustworthy")));
  });
});

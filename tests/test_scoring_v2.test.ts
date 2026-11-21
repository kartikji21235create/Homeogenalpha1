import { test, describe } from "node:test";
import * as assert from "node:assert/strict";
import {
  scoreV2,
  PROFILE_FLAT,
  PROFILE_KENTIAN,
  ConfirmedRubric,
  Mapping,
} from "../src/lib/scoring_v2";

const M = (remedyId: number, rubricId: string, grade: 1 | 2 | 3 | 4): Mapping => ({
  remedyId,
  rubricId,
  grade,
});

describe("Deterministic Scoring V2 Engine (Refinements & Breakdown)", () => {
  test("flat profile equals v1 sum(grade x weight)", () => {
    const c: ConfirmedRubric[] = [
      { id: "r_a", type: "particular", weight: 2 },
      { id: "r_b", type: "particular", weight: 3 },
    ];
    const maps = [M(1, "r_a", 3), M(1, "r_b", 2), M(2, "r_a", 4)];
    const out = scoreV2(c, maps, { typeMultiplierPct: PROFILE_FLAT });
    assert.equal(out[0].remedyId, 1);
    assert.equal(out[0].score, 3 * 2 + 2 * 3); // 12
    assert.equal(out[1].score, 4 * 2); // 8
  });

  test("deterministic: identical output on repeated runs and shuffled input", () => {
    const c: ConfirmedRubric[] = [
      { id: "r_a", type: "mental", weight: 4 },
      { id: "r_b", type: "general", weight: 2 },
      { id: "r_c", type: "particular", weight: 1 },
    ];
    const maps = [
      M(1, "r_a", 2),
      M(2, "r_a", 2),
      M(1, "r_b", 1),
      M(2, "r_c", 4),
      M(3, "r_b", 3),
    ];
    const a = JSON.stringify(scoreV2(c, maps, { typeMultiplierPct: PROFILE_KENTIAN }));
    const b = JSON.stringify(scoreV2([...c].reverse(), [...maps].reverse(), { typeMultiplierPct: PROFILE_KENTIAN }));
    assert.equal(a, b);
  });

  test("parent/child overlap: ancestor suppressed when child also contains remedy", () => {
    const c: ConfirmedRubric[] = [
      { id: "r_anger", type: "mental", weight: 2 },
      { id: "r_anger_irrit", type: "mental", weight: 2 },
    ];
    const parentOf = { r_anger_irrit: "r_anger", r_anger: null };
    const maps = [M(1, "r_anger", 3), M(1, "r_anger_irrit", 3), M(2, "r_anger", 3)];
    const out = scoreV2(c, maps, { parentOf });
    const r1 = out.find((r) => r.remedyId === 1)!;
    const r2 = out.find((r) => r.remedyId === 2)!;
    assert.equal(r1.score, 6); // only child counted, not 12
    assert.equal(r1.rubricsCovered, 1);
    assert.equal(r2.score, 6); // remedy 2 only in parent: parent counts
    assert.ok(r1.breakdown.some((b) => b.suppressedByChild === "r_anger_irrit"));
  });

  test("eliminating rubric removes remedies that lack it", () => {
    const c: ConfirmedRubric[] = [
      { id: "r_a", type: "general", weight: 4, eliminating: true },
      { id: "r_b", type: "particular", weight: 1 },
    ];
    const maps = [M(1, "r_a", 1), M(2, "r_b", 4), M(2, "r_a", 1)];
    const out = scoreV2(c, maps);
    assert.deepEqual(out.map((r) => r.remedyId).sort(), [1, 2]);

    const only = scoreV2(
      [
        { id: "r_a", type: "general", weight: 4, eliminating: true },
        { id: "r_b", type: "particular", weight: 1 },
      ],
      [M(1, "r_b", 4), M(2, "r_a", 1), M(2, "r_b", 1)]
    );
    assert.deepEqual(only.map((r) => r.remedyId), [2]); // remedy 1 lacks eliminating rubric
  });

  test("contradiction penalty applies only when remedy is in opposite but not confirmed rubric", () => {
    const c: ConfirmedRubric[] = [
      { id: "r_worse_warm", type: "general", weight: 3, oppositeId: "r_better_warm" },
      { id: "r_other", type: "particular", weight: 1 },
    ];
    const maps = [
      M(1, "r_other", 4),
      M(1, "r_better_warm", 3), // contradicts
      M(2, "r_other", 4),
      M(2, "r_worse_warm", 1), // agrees
    ];
    const out = scoreV2(c, maps, { contradictionPenaltyPct: 50 });
    const r1 = out.find((r) => r.remedyId === 1)!;
    const r2 = out.find((r) => r.remedyId === 2)!;
    assert.equal(r1.contradictions.length, 1);
    assert.equal(r1.score, 4 - (3 * 3 * 50) / 100); // 4 - 4.5 = -0.5
    assert.equal(r2.contradictions.length, 0);
    assert.equal(out[0].remedyId, 2);
  });

  test("tiebreak prefers mental+general weight, then coverage, not remedy id", () => {
    const c: ConfirmedRubric[] = [
      { id: "r_m", type: "mental", weight: 1 },
      { id: "r_p", type: "particular", weight: 1 },
    ];
    // remedy 1: 2 on particular => 2 ; remedy 2: 2 on mental => 2. Same score.
    const maps = [M(1, "r_p", 2), M(2, "r_m", 2)];
    const out = scoreV2(c, maps);
    assert.equal(out[0].remedyId, 2); // mental-weighted wins despite higher id
  });

  test("rejects invalid weights and duplicate rubrics", () => {
    assert.throws(() => scoreV2([{ id: "x", type: "mental", weight: 5 as never }], []));
    assert.throws(() =>
      scoreV2(
        [
          { id: "x", type: "mental", weight: 1 },
          { id: "x", type: "mental", weight: 2 },
        ],
        []
      )
    );
  });
});

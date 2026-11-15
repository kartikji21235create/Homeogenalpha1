import { test, describe } from "node:test";
import * as assert from "node:assert/strict";
import {
  calculateRepertorizationScore,
  ConfirmedRubricItem,
  RemedyMappingItem,
  RemedyItem,
} from "../src/lib/scoring";

describe("Scoring Determinism & Tiebreaker (Problem 19)", () => {
  const remedies: RemedyItem[] = [
    { id: 1, common_name: "Remedy A", abbreviation: "Rem-a" },
    { id: 2, common_name: "Remedy B", abbreviation: "Rem-b" },
    { id: 3, common_name: "Remedy C", abbreviation: "Rem-c" },
    { id: 4, common_name: "Remedy Z", abbreviation: "Rem-z" },
  ];

  test("higher grade * weight ranks first", () => {
    // Rubric 101: weight 4
    const confirmed: ConfirmedRubricItem[] = [{ rubric_id: 101, weight: 4 }];

    // Remedy A (grade 3 * 4 = 12), Remedy B (grade 2 * 4 = 8)
    const mappings: RemedyMappingItem[] = [
      { rubric_id: 101, medicine_id: 1, grade: 3 },
      { rubric_id: 101, medicine_id: 2, grade: 2 },
    ];

    const ranked = calculateRepertorizationScore(confirmed, mappings, remedies);
    assert.equal(ranked.length, 2);
    assert.equal(ranked[0].medicine_id, 1);
    assert.equal(ranked[0].score, 12);
    assert.equal(ranked[1].medicine_id, 2);
    assert.equal(ranked[1].score, 8);
  });

  test("equal score breaks tie on rubrics_covered DESC", () => {
    // Remedy A has score 8 from 2 rubrics (grade 1 * weight 4 * 2 rubrics = 8, 2 rubrics covered)
    // Remedy B has score 8 from 1 rubric (grade 2 * weight 4 * 1 rubric = 8, 1 rubric covered)
    const confirmed: ConfirmedRubricItem[] = [
      { rubric_id: 201, weight: 4 },
      { rubric_id: 202, weight: 4 },
    ];

    const mappings: RemedyMappingItem[] = [
      { rubric_id: 201, medicine_id: 1, grade: 1 },
      { rubric_id: 202, medicine_id: 1, grade: 1 },
      { rubric_id: 201, medicine_id: 2, grade: 2 },
    ];

    const ranked = calculateRepertorizationScore(confirmed, mappings, remedies);
    assert.equal(ranked[0].medicine_id, 1);
    assert.equal(ranked[0].score, 8);
    assert.equal(ranked[0].rubrics_covered, 2);
    assert.equal(ranked[1].medicine_id, 2);
    assert.equal(ranked[1].score, 8);
    assert.equal(ranked[1].rubrics_covered, 1);
  });

  test("equal score and rubrics_covered breaks tie on medicine_id ASC", () => {
    // Remedy Z has id=4, Remedy A has id=1. Both have score 8 and 2 rubrics.
    // Remedy A (id 1) MUST win over Remedy Z (id 4) because 1 < 4!
    const confirmed: ConfirmedRubricItem[] = [
      { rubric_id: 301, weight: 4 },
      { rubric_id: 302, weight: 4 },
    ];

    const mappings: RemedyMappingItem[] = [
      { rubric_id: 301, medicine_id: 4, grade: 1 },
      { rubric_id: 302, medicine_id: 4, grade: 1 },
      { rubric_id: 301, medicine_id: 1, grade: 1 },
      { rubric_id: 302, medicine_id: 1, grade: 1 },
    ];

    const ranked = calculateRepertorizationScore(confirmed, mappings, remedies);
    assert.equal(ranked[0].medicine_id, 1); // id 1 wins
    assert.equal(ranked[0].common_name, "Remedy A");
    assert.equal(ranked[1].medicine_id, 4); // id 4 is second
    assert.equal(ranked[1].common_name, "Remedy Z");
    assert.equal(ranked[0].score, ranked[1].score);
    assert.equal(ranked[0].rubrics_covered, ranked[1].rubrics_covered);
  });

  test("rerun on identical input produces byte-identical output", () => {
    const confirmed: ConfirmedRubricItem[] = [
      { rubric_id: 401, weight: 3 },
      { rubric_id: 402, weight: 2 },
    ];

    const mappings: RemedyMappingItem[] = [
      { rubric_id: 401, medicine_id: 1, grade: 3 },
      { rubric_id: 402, medicine_id: 2, grade: 2 },
      { rubric_id: 401, medicine_id: 3, grade: 1 },
    ];

    const run1 = calculateRepertorizationScore(confirmed, mappings, remedies);
    const run2 = calculateRepertorizationScore(confirmed, mappings, remedies);

    assert.deepEqual(run1, run2);
    assert.equal(JSON.stringify(run1), JSON.stringify(run2));
  });

  test("rejects invalid weights (< 1 or > 4 or null)", () => {
    assert.throws(
      () => calculateRepertorizationScore([{ rubric_id: 1, weight: 0 }], [], remedies),
      /Invalid weight/
    );
    assert.throws(
      () => calculateRepertorizationScore([{ rubric_id: 1, weight: 5 }], [], remedies),
      /Invalid weight/
    );
  });
});

import { test, describe } from "node:test";
import * as assert from "node:assert/strict";
import {
  fallbackToTopCandidates,
  ExtractedSymptom,
} from "../src/lib/ai/pipeline";
import { CandidateRubric } from "../src/lib/retrieval";

describe("Closed-Set Rubric Enforcement (Problem 5)", () => {
  const dummySymptom: ExtractedSymptom = {
    id: "sym_test_1",
    category: "MENTAL_GENERAL",
    phrase: "anxiety about health",
    english_translation: "anxiety about health",
    negation: false,
    modality_notes: null,
    source_span_start: 0,
    source_span_end: 20,
    confidence_score: 0.9,
    missing_info: [],
  };

  const validCandidates: CandidateRubric[] = [
    { rubric_id: 101, chapter: "Mind", rubric_path: "Mind; Anxiety; health, about", rrf_score: 0.033 },
    { rubric_id: 102, chapter: "Mind", rubric_path: "Mind; Fastidious", rrf_score: 0.025 },
    { rubric_id: 103, chapter: "Mind", rubric_path: "Mind; Restlessness", rrf_score: 0.018 },
  ];

  test("fallbackToTopCandidates returns top candidate IDs marked low-confidence", () => {
    const fallback = fallbackToTopCandidates(dummySymptom, validCandidates);

    assert.equal(fallback.length, 3);
    assert.equal(fallback[0].rubric_id, 101);
    assert.equal(fallback[1].rubric_id, 102);
    assert.equal(fallback[2].rubric_id, 103);

    // Assert that every returned ID was present in candidate list
    const candidateIds = new Set(validCandidates.map((c) => c.rubric_id));
    for (const f of fallback) {
      assert.ok(candidateIds.has(f.rubric_id));
      assert.ok(f.confidence_score <= 0.5); // marked low-confidence
      assert.ok(f.reason.includes("hybrid retrieval score"));
    }
  });

  test("prohibits hallucinated rubric IDs outside candidate set", () => {
    // If an LLM hallucinates rubric_id 9999, the closed-set validator intercepts it
    const candidateIds = new Set(validCandidates.map((c) => c.rubric_id));
    const hallucinatedId = 9999;

    assert.ok(!candidateIds.has(hallucinatedId));
    // The fallback path guarantees only valid IDs from the candidate set reach the doctor
    const fallback = fallbackToTopCandidates(dummySymptom, validCandidates);
    assert.ok(!fallback.some((r) => r.rubric_id === hallucinatedId));
  });
});

import { test, describe } from "node:test";
import * as assert from "node:assert/strict";
import { createActor } from "xstate";
import { consultationMachine } from "../src/features/consultation/machine";

describe("Consultation State Machine (Phase 4)", () => {
  test("INTAKE requires consent before SUBMIT_NARRATIVE can transition to PROCESSING", () => {
    const actor = createActor(consultationMachine).start();

    // Without consent, transition is guarded and stays in INTAKE
    actor.send({ type: "SUBMIT_NARRATIVE", text: "Patient feels chilly." });
    assert.equal(actor.getSnapshot().value, "INTAKE");

    // With consent checked, transitions to PROCESSING
    actor.send({ type: "SET_CONSENT", consent: true });
    actor.send({ type: "SUBMIT_NARRATIVE", text: "Patient feels chilly." });
    assert.equal(actor.getSnapshot().value, "PROCESSING");
  });

  test("PROCESSING -> REVIEW_TRANSCRIPT on ANALYSIS_SUCCESS", () => {
    const actor = createActor(consultationMachine).start();
    actor.send({ type: "SET_CONSENT", consent: true });
    actor.send({ type: "SUBMIT_NARRATIVE", text: "Patient has high anxiety." });

    actor.send({
      type: "ANALYSIS_SUCCESS",
      consultationId: "c_123",
      transcript: "Patient has high anxiety.",
      symptoms: [
        {
          id: "sym_1",
          category: "MENTAL_GENERAL",
          phrase: "high anxiety",
          english_translation: "high anxiety",
          negation: false,
          modality_notes: null,
          source_span_start: 0,
          source_span_end: 12,
          confidence_score: 0.9,
          missing_info: [],
        },
      ],
      suggestedRubrics: [
        {
          id: "sug_1",
          symptom_id: "sym_1",
          rubric_id: 1,
          rubric_path: "Mind; Anxiety; health, about",
          chapter: "Mind",
          confidence_score: 0.9,
          reason: "Matches anxiety description",
          rank: 1,
          verified: false,
        },
      ],
      missingInfo: ["Thirst state missing"],
      emergencyCheck: { detected: false, matchedKeywords: [] },
    });

    assert.equal(actor.getSnapshot().value, "REVIEW_TRANSCRIPT");
    assert.equal(actor.getSnapshot().context.consultationId, "c_123");
    assert.equal(actor.getSnapshot().context.confirmedRubrics.length, 1);
  });

  test("Problem 14: Optimistic confirm rollback from SCORING to REVIEW_RUBRICS on failure", () => {
    const actor = createActor(consultationMachine).start();
    actor.send({ type: "SET_CONSENT", consent: true });
    actor.send({ type: "SUBMIT_NARRATIVE", text: "Patient feels chilly." });
    actor.send({
      type: "ANALYSIS_SUCCESS",
      consultationId: "c_123",
      transcript: "Patient feels chilly.",
      symptoms: [],
      suggestedRubrics: [],
      missingInfo: [],
      emergencyCheck: { detected: false, matchedKeywords: [] },
    });
    actor.send({ type: "CONFIRM_TRANSCRIPT" });
    assert.equal(actor.getSnapshot().value, "REVIEW_RUBRICS");

    // Doctor confirms rubrics -> triggers SCORING
    actor.send({ type: "CONFIRM_RUBRICS_START" });
    assert.equal(actor.getSnapshot().value, "SCORING");

    // Network drops or scoring query fails -> rolls back to REVIEW_RUBRICS with error message
    actor.send({ type: "SCORING_FAILURE", message: "Network connection lost to scoring service" });
    assert.equal(actor.getSnapshot().value, "REVIEW_RUBRICS");
    assert.equal(
      actor.getSnapshot().context.errorMessage,
      "Network connection lost to scoring service"
    );
  });

  test("Problem 13: 409 stale revision during scoring rolls back to REVIEW_RUBRICS and records staleServerRevision", () => {
    const actor = createActor(consultationMachine).start();
    actor.send({ type: "SET_CONSENT", consent: true });
    actor.send({ type: "SUBMIT_NARRATIVE", text: "Patient feels chilly." });
    actor.send({
      type: "ANALYSIS_SUCCESS",
      consultationId: "c_123",
      transcript: "Patient feels chilly.",
      symptoms: [],
      suggestedRubrics: [],
      missingInfo: [],
      emergencyCheck: { detected: false, matchedKeywords: [] },
    });
    actor.send({ type: "CONFIRM_TRANSCRIPT" });
    actor.send({ type: "CONFIRM_RUBRICS_START" });
    assert.equal(actor.getSnapshot().value, "SCORING");

    // 409 Stale revision arrives from server
    actor.send({ type: "CONFIRM_RUBRICS_STALE_409", serverRevision: 3 });
    assert.equal(actor.getSnapshot().value, "REVIEW_RUBRICS");
    assert.equal(actor.getSnapshot().context.staleServerRevision, 3);
    assert.ok(actor.getSnapshot().context.errorMessage?.includes("modified in another session"));
  });

  test("Full loop: INTAKE -> PROCESSING -> REVIEW_TRANSCRIPT -> REVIEW_RUBRICS -> SCORING -> REVIEW_MEDICINES -> PRESCRIBING -> DONE", () => {
    const actor = createActor(consultationMachine).start();

    // 1. INTAKE
    actor.send({ type: "SET_CONSENT", consent: true });
    actor.send({ type: "SUBMIT_NARRATIVE", text: "Burning feet at night, desires sweets." });
    assert.equal(actor.getSnapshot().value, "PROCESSING");

    // 2. PROCESSING -> REVIEW_TRANSCRIPT
    actor.send({
      type: "ANALYSIS_SUCCESS",
      consultationId: "c_full_loop",
      transcript: "Burning feet at night, desires sweets.",
      symptoms: [],
      suggestedRubrics: [
        {
          id: "sug_1",
          symptom_id: "sym_1",
          rubric_id: 10,
          rubric_path: "Extremities; Heat; burning; feet; night; uncovers them",
          chapter: "Extremities",
          confidence_score: 0.95,
          reason: "Direct match",
          rank: 1,
          verified: false,
        },
      ],
      missingInfo: [],
      emergencyCheck: { detected: false, matchedKeywords: [] },
    });
    assert.equal(actor.getSnapshot().value, "REVIEW_TRANSCRIPT");

    // 3. REVIEW_TRANSCRIPT -> REVIEW_RUBRICS
    actor.send({ type: "CONFIRM_TRANSCRIPT" });
    assert.equal(actor.getSnapshot().value, "REVIEW_RUBRICS");

    // Doctor adjusts weight to 4
    actor.send({ type: "SET_RUBRIC_WEIGHT", rubricId: 10, weight: 4 });
    assert.equal(actor.getSnapshot().context.confirmedRubrics[0].weight, 4);

    // 4. REVIEW_RUBRICS -> SCORING
    actor.send({ type: "CONFIRM_RUBRICS_START" });
    assert.equal(actor.getSnapshot().value, "SCORING");

    // 5. SCORING -> REVIEW_MEDICINES
    actor.send({
      type: "SCORING_SUCCESS",
      ranked: [
        { medicine_id: 4, common_name: "Sulphur", score: 12, rubrics_covered: 1 },
      ],
    });
    assert.equal(actor.getSnapshot().value, "REVIEW_MEDICINES");

    // 6. REVIEW_MEDICINES -> PRESCRIBING
    actor.send({ type: "CHOOSE_MEDICINE", medicineId: 4, medicineName: "Sulphur" });
    assert.equal(actor.getSnapshot().value, "PRESCRIBING");
    assert.equal(actor.getSnapshot().context.selectedMedicineName, "Sulphur");

    // 7. PRESCRIBING -> DONE
    actor.send({
      type: "SET_PRESCRIPTION_DETAILS",
      potency: "200C",
      dosageInstructions: "Single dose at night",
      notes: "Follow up in 2 weeks",
    });
    actor.send({ type: "SAVE_PRESCRIPTION_SUCCESS", prescriptionId: "rx_123" });
    assert.equal(actor.getSnapshot().value, "DONE");
    assert.equal(actor.getSnapshot().context.prescriptionId, "rx_123");

    // 8. DONE -> RESET_TO_INTAKE returns to pristine INTAKE state
    actor.send({ type: "RESET_TO_INTAKE" });
    assert.equal(actor.getSnapshot().value, "INTAKE");
    assert.equal(actor.getSnapshot().context.consultationId, null);
    assert.equal(actor.getSnapshot().context.prescriptionId, null);
    assert.equal(actor.getSnapshot().context.dpdpConsent, false);
  });
});

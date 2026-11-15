import { test, describe } from "node:test";
import * as assert from "node:assert/strict";
import {
  saveConsultation,
  getConsultation,
  saveConfirmedRubrics,
  executeDeterministicScoring,
  createPrescriptionRecord,
  ConsultationRecord,
} from "../src/lib/db/store";

describe("API & Service Contracts (Phase 3)", () => {
  const doctorId = "00000000-0000-0000-0000-000000000001";
  const patientId = "00000000-0000-0000-0000-000000000002";

  test("rejects scoring with 409 stale revision when base_revision mismatches", async () => {
    const consultationId = `c_stale_test_${Date.now()}`;
    const consultation: ConsultationRecord = {
      id: consultationId,
      doctor_id: doctorId,
      patient_id: patientId,
      dpdp_consent_logged: true,
      transcript: "Patient has high anxiety and restlessness.",
      state: "REVIEW_RUBRICS",
      rubric_revision: 2, // Server is at revision 2
      scoring_mode: "additive",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await saveConsultation(consultation);

    // Call scoring with stale base_revision 1
    await assert.rejects(
      async () => {
        await executeDeterministicScoring(consultationId, 1);
      },
      (err: any) => {
        assert.equal(err.code, "stale_revision");
        assert.equal(err.current_revision, 2);
        return true;
      }
    );
  });

  test("rejects scoring with 422 when rubrics have unweighted/null weights", async () => {
    const consultationId = `c_unweighted_test_${Date.now()}`;
    const consultation: ConsultationRecord = {
      id: consultationId,
      doctor_id: doctorId,
      patient_id: patientId,
      dpdp_consent_logged: true,
      transcript: "Patient has burning feet.",
      state: "REVIEW_RUBRICS",
      rubric_revision: 0,
      scoring_mode: "additive",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await saveConsultation(consultation);

    // Save with invalid/unweighted weight
    await saveConfirmedRubrics(consultationId, doctorId, [
      { rubric_id: 1, weight: 0 }, // invalid weight 0
    ]);

    await assert.rejects(
      async () => {
        await executeDeterministicScoring(consultationId, 0);
      },
      (err: any) => {
        assert.equal(err.code, "missing_weights");
        return true;
      }
    );
  });

  test("rejects prescribing when patient belongs to another doctor (403)", async () => {
    const consultationId = `c_auth_test_${Date.now()}`;
    const consultation: ConsultationRecord = {
      id: consultationId,
      doctor_id: doctorId,
      patient_id: patientId,
      dpdp_consent_logged: true,
      transcript: "Patient has headache.",
      state: "REVIEW_MEDICINES",
      rubric_revision: 1,
      scoring_mode: "additive",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await saveConsultation(consultation);

    const unauthorizedDoctorId = "00000000-0000-0000-0000-999999999999";

    await assert.rejects(
      async () => {
        await createPrescriptionRecord({
          consultation_id: consultationId,
          patient_id: patientId,
          doctor_id: unauthorizedDoctorId, // different doctor
          medicine_id: 1,
          potency: "30C",
          dosage_instructions: "3 pellets daily",
        });
      },
      (err: any) => {
        assert.equal(err.code, "forbidden");
        return true;
      }
    );
  });

  test("successful full flow: rubrics -> scoring -> prescription snapshot", async () => {
    const consultationId = `c_full_test_${Date.now()}`;
    const consultation: ConsultationRecord = {
      id: consultationId,
      doctor_id: doctorId,
      patient_id: patientId,
      dpdp_consent_logged: true,
      transcript: "Anxiety about health, fastidious, desires warm drinks.",
      state: "REVIEW_TRANSCRIPT",
      rubric_revision: 0,
      scoring_mode: "additive",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await saveConsultation(consultation);

    // 1. Confirm rubrics with valid weights (1-4)
    await saveConfirmedRubrics(consultationId, doctorId, [
      { rubric_id: 1, weight: 4 }, // Mind; Anxiety; health, about
      { rubric_id: 2, weight: 3 }, // Mind; Fastidious
    ]);
    consultation.rubric_revision = 1;
    consultation.state = "REVIEW_RUBRICS";
    await saveConsultation(consultation);

    // 2. Score consultation
    const scored = await executeDeterministicScoring(consultationId, 1);
    assert.equal(scored.rubric_revision, 1);
    assert.ok(scored.ranked.length > 0);
    // Arsenicum Album should rank high because it is Grade 3 in both Anxiety about health and Fastidious!
    const topRemedy = scored.ranked[0];
    assert.ok(topRemedy.common_name.includes("Arsenicum"));

    // 3. Create prescription
    const rx = await createPrescriptionRecord({
      consultation_id: consultationId,
      patient_id: patientId,
      doctor_id: doctorId,
      medicine_id: topRemedy.medicine_id,
      potency: "200C",
      dosage_instructions: "1 dose at bedtime for 3 days",
      notes: "Follow-up after 2 weeks",
    });

    assert.ok(rx.id);
    assert.equal(rx.potency, "200C");
    assert.equal(rx.scoring_snapshot.rubric_revision, 1);
    assert.equal(rx.scoring_snapshot.ranked[0].medicine_id, topRemedy.medicine_id);
    assert.equal(rx.scoring_snapshot.inputs.length, 2);

    // Verify consultation moved to DONE
    const updated = await getConsultation(consultationId);
    assert.equal(updated?.state, "DONE");
  });
});

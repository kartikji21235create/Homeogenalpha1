import { test, describe } from "node:test";
import * as assert from "node:assert/strict";
import {
  createPatient,
  saveConsultation,
  saveConfirmedRubrics,
  createPrescriptionRecord,
  deletePatientCascading,
  getConsultation,
  getConfirmedRubrics,
  db,
  ConsultationRecord,
} from "../src/lib/db/store";

describe("Cascading Patient Deletion & Data Erasure (PRD Section 11, Rule 6 & Phase 5)", () => {
  const doctorId = "00000000-0000-0000-0000-000000000001";

  test("deleting a patient completely purges consultations, confirmed rubrics, and prescriptions", async () => {
    // 1. Create patient
    const patient = await createPatient(doctorId, {
      display_name: "Rahul Verma",
      sex: "MALE",
      year_of_birth: 1990,
    });
    assert.ok(patient.id);

    // 2. Create consultation for this patient
    const consultationId = `c_del_test_${Date.now()}`;
    const consultation: ConsultationRecord = {
      id: consultationId,
      doctor_id: doctorId,
      patient_id: patient.id,
      dpdp_consent_logged: true,
      transcript: "Restlessness at night, anxiety.",
      state: "REVIEW_RUBRICS",
      rubric_revision: 1,
      scoring_mode: "additive",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await saveConsultation(consultation);

    // 3. Save confirmed rubrics
    await saveConfirmedRubrics(consultationId, doctorId, [
      { rubric_id: 1, weight: 3 },
    ]);

    // 4. Create prescription
    const rx = await createPrescriptionRecord({
      consultation_id: consultationId,
      patient_id: patient.id,
      doctor_id: doctorId,
      medicine_id: 1,
      potency: "30C",
      dosage_instructions: "Once daily",
    });
    assert.ok(rx.id);

    // Also add a case event, folder mapping, and share link
    db.caseEvents.set(consultationId, [{
      id: "ev_test_1",
      consultation_id: consultationId,
      patient_id: patient.id,
      doctor_id: doctorId,
      event_type: "follow_up",
      title: "Test Event",
      description: "Note",
      created_at: new Date().toISOString()
    }]);
    db.consultationFolderMap.set(consultationId, "fld_test_1");
    db.shares.set("sh_test_token_1", {
      token: "sh_test_token_1",
      consultation_id: consultationId,
      doctor_id: doctorId,
      expires_at: new Date(Date.now() + 100000).toISOString(),
      created_at: new Date().toISOString()
    });

    // Verify records exist before delete
    assert.ok(db.patients.has(patient.id));
    assert.ok(await getConsultation(consultationId));
    assert.equal((await getConfirmedRubrics(consultationId)).length, 1);
    assert.ok(db.prescriptions.has(rx.id));
    assert.ok(db.caseEvents.has(consultationId));
    assert.ok(db.consultationFolderMap.has(consultationId));
    assert.ok(db.shares.has("sh_test_token_1"));

    // 5. Execute cascading patient deletion
    const result = await deletePatientCascading(patient.id, doctorId);
    assert.equal(result.deletedPatientId, patient.id);
    assert.equal(result.consultationsDeleted, 1);
    assert.equal(result.prescriptionsDeleted, 1);

    // 6. Assert everything is purged under DPDP
    assert.equal(db.patients.has(patient.id), false);
    assert.equal(await getConsultation(consultationId), null);
    assert.equal((await getConfirmedRubrics(consultationId)).length, 0);
    assert.equal(db.prescriptions.has(rx.id), false);
    assert.equal(db.caseEvents.has(consultationId), false);
    assert.equal(db.consultationFolderMap.has(consultationId), false);
    assert.equal(db.shares.has("sh_test_token_1"), false);
  });
});

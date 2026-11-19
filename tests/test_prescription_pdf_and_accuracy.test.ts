import { describe, it } from "node:test";
import assert from "node:assert";
import { NextRequest } from "next/server";
import { GET as getCasePdf } from "../src/app/api/cases/[id]/pdf/route";
import {
  saveConsultation,
  saveConfirmedRubrics,
  createPrescriptionRecord,
  db,
} from "../src/lib/db/store";
import { hybridSearch, expandSynonyms } from "../src/lib/retrieval";

describe("Prescription PDF Download & Retrieval Accuracy Engine", () => {
  process.env.AUTH_BYPASS = "true";
  const doctorId = "00000000-0000-0000-0000-000000000001";
  const patientId = "00000000-0000-0000-0000-000000000002";
  const caseId = "cs_pdf_acc_001";

  it("generates an official Medical Prescription Slip (Rx) in printable PDF format", async () => {
    // 1. Setup case, rubrics, and prescription
    await saveConsultation({
      id: caseId,
      patient_id: patientId,
      doctor_id: doctorId,
      state: "DONE",
      dpdp_consent_logged: true,
      transcript: "Patient complains of burning stomach pain, relieved by warm sips of water. Great restlessness at midnight.",
      rubric_revision: 1,
      scoring_mode: "additive",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    await saveConfirmedRubrics(caseId, doctorId, [
      { rubric_id: 1, weight: 3 },
      { rubric_id: 2, weight: 4 },
    ]);

    await createPrescriptionRecord({
      consultation_id: caseId,
      patient_id: patientId,
      doctor_id: doctorId,
      medicine_id: 1, // Arsenicum Album
      potency: "200 CH",
      dosage_instructions: "4 globules twice daily directly on clean tongue for 7 days",
      notes: "Take 30 minutes before breakfast and dinner.",
    });

    // 2. Request Rx PDF with autoprint
    const req = new NextRequest(
      `http://localhost:3000/api/cases/${caseId}/pdf?type=prescription&autoprint=1`
    );
    const res = await getCasePdf(req, { params: Promise.resolve({ id: caseId }) });

    assert.strictEqual(res.status, 200);
    assert.ok(res.headers.get("content-type")?.includes("text/html"));

    const html = await res.text();

    // Verify Official Rx Header & Credentials
    assert.ok(html.includes("Hahnemannian Homoeopathic Clinic"));
    assert.ok(html.includes("Dr. Hahnemann"));
    assert.ok(html.includes("HOM-IND-1897"));

    // Verify Patient Demographics
    assert.ok(html.includes("Aarav Sharma"));
    assert.ok(html.includes("P-1001"));
    assert.ok(html.includes("MALE"));

    // Verify Prescription Body & Posology
    assert.ok(html.includes("℞"));
    assert.ok(html.includes("Arsenicum Album"));
    assert.ok(html.includes("200 CH"));
    assert.ok(html.includes("4 globules twice daily"));
    assert.ok(html.includes("Take 30 minutes before breakfast"));

    // Verify Homoeopathic Dietetic & Antidote Precautions
    assert.ok(html.includes("Clean Palate"));
    assert.ok(html.includes("Antidote Precautions"));
    assert.ok(html.includes("camphor"));
    assert.ok(html.includes("menthol"));

    // Verify Auto-print script for instant download/save
    assert.ok(html.includes("window.print()"));
  });

  it("generates a full clinical case report by default", async () => {
    const req = new NextRequest(`http://localhost:3000/api/cases/${caseId}/pdf`);
    const res = await getCasePdf(req, { params: Promise.resolve({ id: caseId }) });

    assert.strictEqual(res.status, 200);
    const html = await res.text();

    assert.ok(html.includes("Homeogenalpha1 Clinical Report"));
    assert.ok(html.includes("Verified Consultation Transcript"));
    assert.ok(html.includes("Confirmed Repertory Rubrics"));
    assert.ok(html.includes("Deterministic scoring verified"));
  });

  it("increases retrieval accuracy with morphological stemming, n-grams, and colloquial synonyms", () => {
    // 1. Synonym expansion accuracy
    const expandedThrobbing = expandSynonyms("patient suffers from severe throbbing headache", db.synonyms);
    assert.ok(expandedThrobbing.toLowerCase().includes("head; pain; pulsating"));

    const expandedSun = expandSynonyms("severe headache in sun", db.synonyms);
    assert.ok(expandedSun.toLowerCase().includes("head; pain; sun, from exposure to"));

    const expandedStool = expandSynonyms("early morning loose motions driving out of bed", db.synonyms);
    assert.ok(expandedStool.toLowerCase().includes("rectum; diarrhoea; morning; bed, driving out of"));

    // 2. Hybrid search accuracy with morphological variants
    // Querying with variant "burning" matches "Heat; burning" with top ranking
    const burningCandidates = hybridSearch("burning soles at night", db.rubrics, db.synonyms, { limit: 5 });
    assert.ok(burningCandidates.length > 0);
    assert.ok(burningCandidates[0].rubric_path.toLowerCase().includes("burning") || burningCandidates[0].rubric_path.toLowerCase().includes("heat"));

    // Querying "pulsating head pain" returns "Head; Pain; pulsating" as top result
    const headacheCandidates = hybridSearch("pulsating head pain", db.rubrics, db.synonyms, { limit: 5 });
    assert.ok(headacheCandidates.length > 0);
    assert.ok(headacheCandidates[0].rubric_path.includes("pulsating"));

    // Querying "stiff joints better motion" returns continued motion rubric
    const motionCandidates = hybridSearch("stiff joints better when moving around", db.rubrics, db.synonyms, { limit: 5 });
    assert.ok(motionCandidates.length > 0);
    assert.ok(motionCandidates[0].rubric_path.includes("motion"));
  });
});

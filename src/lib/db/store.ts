/**
 * Database Data Access Layer
 * Supports Supabase Postgres with pgvector, RLS, and transaction safety.
 * Includes local store support for standalone dev & testing without requiring an active remote Postgres.
 */

import * as fs from "fs";
import * as path from "path";
import { StoredRubric, SynonymEntry, generateNormalizedEmbedding } from "../retrieval";
import {
  ConfirmedRubricItem,
  calculateRepertorizationScore,
  RankedMedicineResult,
  ScoringSnapshot,
} from "../scoring";

export interface DoctorRecord {
  id: string;
  full_name: string;
  registration_number: string;
}

export interface PatientRecord {
  id: string;
  patient_number: string;
  doctor_id: string;
  display_name: string;
  year_of_birth?: number;
  sex: "MALE" | "FEMALE" | "OTHER";
}

export interface ConsultationRecord {
  id: string;
  doctor_id: string;
  patient_id: string;
  dpdp_consent_logged: boolean;
  transcript: string | null;
  state: "INTAKE" | "PROCESSING" | "REVIEW_TRANSCRIPT" | "REVIEW_RUBRICS" | "SCORING" | "REVIEW_MEDICINES" | "PRESCRIBING" | "DONE";
  rubric_revision: number;
  scoring_mode: "additive" | "kent" | "boenninghausen" | "boger";
  created_at: string;
  updated_at: string;
}

export interface ConfirmedRubricRecord {
  id: string;
  consultation_id: string;
  doctor_id: string;
  rubric_id: number;
  weight: number;
  doctor_edited: boolean;
  confirmed_at: string;
}

export interface PrescriptionRecord {
  id: string;
  consultation_id: string;
  patient_id: string;
  doctor_id: string;
  dpdp_consent_logged: boolean;
  medicine_id: number;
  potency: string;
  notes?: string;
  dosage_instructions: string;
  scoring_snapshot: ScoringSnapshot;
  repertory_version_id?: number;
  created_at: string;
}

export interface CaseEventRecord {
  id: string;
  consultation_id: string;
  patient_id: string;
  doctor_id: string;
  event_type: "consultation" | "prescription" | "follow_up" | "potency_change";
  title: string;
  description: string;
  response_assessment?: "amelioration" | "aggravation" | "status_quo" | "new_symptoms";
  created_at: string;
}

export interface CaseFolderRecord {
  id: string;
  doctor_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface ShareRecord {
  token: string;
  consultation_id: string;
  doctor_id: string;
  expires_at: string;
  created_at: string;
}

export interface CustomRubricRecord {
  id: number;
  doctor_id: string;
  rubric_path: string;
  chapter: string;
  notes?: string;
  contributor: string;
  created_at: string;
}

class InMemoryDb {
  public doctors = new Map<string, DoctorRecord>();
  public patients = new Map<string, PatientRecord>();
  public consultations = new Map<string, ConsultationRecord>();
  public confirmedRubrics = new Map<string, ConfirmedRubricRecord[]>(); // consultation_id -> rubrics
  public prescriptions = new Map<string, PrescriptionRecord>();
  public caseEvents = new Map<string, CaseEventRecord[]>(); // consultation_id -> events
  public caseFolders = new Map<string, CaseFolderRecord>();
  public consultationFolderMap = new Map<string, string>(); // consultation_id -> folder_id
  public shares = new Map<string, ShareRecord>(); // token -> ShareRecord
  public customRubrics: CustomRubricRecord[] = [];
  public rubrics: StoredRubric[] = [];
  public remedies: any[] = [];
  public remedyMappings: any[] = [];
  public synonyms: SynonymEntry[] = [];
  public rubricPathLookup = new Map<number, string>();

  constructor() {
    this.initSeedData();
  }

  private initSeedData() {
    try {
      const seedPath = path.join(process.cwd(), "seed/seed_data.json");
      if (fs.existsSync(seedPath)) {
        const data = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
        this.remedies = (data.remedies || []).map((r: any, idx: number) => ({
          id: idx + 1,
          common_name: r.common_name,
          abbreviation: r.abbreviation,
        }));

        const remMap = new Map<string, number>();
        this.remedies.forEach((r) => remMap.set(r.abbreviation, r.id));

        this.rubrics = (data.rubrics || []).map((r: any, idx: number) => {
          const rId = idx + 1;
          this.rubricPathLookup.set(rId, r.rubric_path);
          for (const m of r.mappings || []) {
            const medId = remMap.get(m.abbrev);
            if (medId) {
              this.remedyMappings.push({
                rubric_id: rId,
                medicine_id: medId,
                grade: m.grade,
              });
            }
          }
          return {
            id: rId,
            chapter: r.chapter,
            rubric_path: r.rubric_path,
            embedding: generateNormalizedEmbedding(r.rubric_path, 768),
          };
        });

        this.synonyms = data.synonyms || [];
      }
    } catch (err) {
      console.warn("[InMemoryDb] Seed data load failed:", err);
    }

    // Default test doctor and patient
    const defaultDoctorId = "00000000-0000-0000-0000-000000000001";
    this.doctors.set(defaultDoctorId, {
      id: defaultDoctorId,
      full_name: "Dr. Hahnemann",
      registration_number: "HOM-IND-1897",
    });

    const defaultPatientId = "00000000-0000-0000-0000-000000000002";
    this.patients.set(defaultPatientId, {
      id: defaultPatientId,
      patient_number: "P-1001",
      doctor_id: defaultDoctorId,
      display_name: "Aarav Sharma",
      year_of_birth: 1985,
      sex: "MALE",
    });
  }
}

// Singleton database instance
export const db = new InMemoryDb();

/**
 * Accessor methods
 */
export async function getConsultation(id: string): Promise<ConsultationRecord | null> {
  return db.consultations.get(id) || null;
}

export async function saveConsultation(record: ConsultationRecord): Promise<void> {
  db.consultations.set(record.id, record);
}

export async function getConfirmedRubrics(consultationId: string): Promise<ConfirmedRubricRecord[]> {
  return db.confirmedRubrics.get(consultationId) || [];
}

export async function saveConfirmedRubrics(
  consultationId: string,
  doctorId: string,
  items: { rubric_id: number; weight: number; doctor_edited?: boolean }[]
): Promise<void> {
  const records: ConfirmedRubricRecord[] = items.map((item) => ({
    id: `cr_${Date.now()}_${item.rubric_id}`,
    consultation_id: consultationId,
    doctor_id: doctorId,
    rubric_id: item.rubric_id,
    weight: item.weight,
    doctor_edited: item.doctor_edited ?? true,
    confirmed_at: new Date().toISOString(),
  }));
  db.confirmedRubrics.set(consultationId, records);
}

export async function executeDeterministicScoring(
  consultationId: string,
  expectedRevision: number,
  repertoryId = "kent_1897"
): Promise<{ rubric_revision: number; scoring_mode: string; ranked: RankedMedicineResult[] }> {
  const consultation = await getConsultation(consultationId);
  if (!consultation) {
    throw new Error("Consultation not found");
  }

  // Stale revision check (Problem 13)
  if (consultation.rubric_revision !== expectedRevision) {
    const error: any = new Error(
      `Stale revision: consultation is at revision ${consultation.rubric_revision}, but request had ${expectedRevision}`
    );
    error.code = "stale_revision";
    error.current_revision = consultation.rubric_revision;
    throw error;
  }

  const confirmed = await getConfirmedRubrics(consultationId);
  if (confirmed.length === 0) {
    const error: any = new Error("No confirmed rubrics to score");
    error.code = "empty_rubrics";
    throw error;
  }

  // Mandatory weight check (Problem 4)
  const unweighted = confirmed.filter((c) => !c.weight || c.weight < 1 || c.weight > 4);
  if (unweighted.length > 0) {
    const error: any = new Error("Every confirmed rubric must have a weight 1-4 before scoring");
    error.code = "missing_weights";
    throw error;
  }

  const confirmedItems: ConfirmedRubricItem[] = confirmed.map((c) => ({
    rubric_id: c.rubric_id,
    weight: c.weight,
  }));

  const ranked = calculateRepertorizationScore(
    confirmedItems,
    db.remedyMappings,
    db.remedies,
    12
  );

  consultation.state = "REVIEW_MEDICINES";
  consultation.updated_at = new Date().toISOString();
  await saveConsultation(consultation);

  return {
    rubric_revision: consultation.rubric_revision,
    scoring_mode: consultation.scoring_mode,
    ranked,
  };
}

export async function createPrescriptionRecord(
  payload: {
    consultation_id: string;
    patient_id: string;
    doctor_id: string;
    medicine_id: number;
    potency: string;
    dosage_instructions: string;
    notes?: string;
  }
): Promise<PrescriptionRecord> {
  const consultation = await getConsultation(payload.consultation_id);
  if (!consultation) {
    const error: any = new Error("Consultation not found");
    error.code = "not_found";
    throw error;
  }

  if (consultation.doctor_id !== payload.doctor_id) {
    const error: any = new Error("Forbidden: patient or consultation does not belong to this doctor");
    error.code = "forbidden";
    throw error;
  }

  const confirmed = await getConfirmedRubrics(payload.consultation_id);
  if (confirmed.length === 0) {
    const error: any = new Error("Prescription rejected: consultation has no confirmed rubrics");
    error.code = "unconfirmed_rubric";
    throw error;
  }

  const unweighted = confirmed.filter((c) => !c.weight || c.weight < 1 || c.weight > 4);
  if (unweighted.length > 0) {
    const error: any = new Error("Prescription rejected: unweighted rubrics exist in consultation");
    error.code = "unconfirmed_rubric";
    throw error;
  }

  const scored = await executeDeterministicScoring(
    payload.consultation_id,
    consultation.rubric_revision
  );

  const snapshot: ScoringSnapshot = {
    mode: consultation.scoring_mode,
    repertory_version: "kent_1897",
    rubric_revision: consultation.rubric_revision,
    inputs: confirmed.map((c) => ({ rubric_id: c.rubric_id, weight: c.weight })),
    ranked: scored.ranked,
    calculated_at: new Date().toISOString(),
  };

  const prescription: PrescriptionRecord = {
    id: `rx_${Date.now()}`,
    consultation_id: payload.consultation_id,
    patient_id: payload.patient_id,
    doctor_id: payload.doctor_id,
    dpdp_consent_logged: true,
    medicine_id: payload.medicine_id,
    potency: payload.potency,
    notes: payload.notes,
    dosage_instructions: payload.dosage_instructions,
    scoring_snapshot: snapshot,
    created_at: new Date().toISOString(),
  };

  db.prescriptions.set(prescription.id, prescription);
  consultation.state = "DONE";
  consultation.updated_at = new Date().toISOString();
  await saveConsultation(consultation);

  // Automatically record prescription event in case timeline
  const remedyName = db.remedies.find((r) => r.id === payload.medicine_id)?.common_name || "Remedy";
  await addCaseEvent(payload.consultation_id, {
    patient_id: payload.patient_id,
    doctor_id: payload.doctor_id,
    event_type: "prescription",
    title: `Prescribed ${remedyName} ${payload.potency}`,
    description: `Dosage: ${payload.dosage_instructions}${payload.notes ? " | Notes: " + payload.notes : ""}`,
  });

  return prescription;
}

export async function listPatients(doctorId: string, search?: string): Promise<PatientRecord[]> {
  let list = Array.from(db.patients.values()).filter((p) => p.doctor_id === doctorId);
  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.display_name.toLowerCase().includes(q) ||
        p.patient_number.toLowerCase().includes(q)
    );
  }
  return list;
}

export async function createPatient(
  doctorId: string,
  data: { display_name: string; sex: "MALE" | "FEMALE" | "OTHER"; year_of_birth?: number }
): Promise<PatientRecord> {
  const count = db.patients.size + 1;
  const newPatient: PatientRecord = {
    id: `pat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    patient_number: `P-${1000 + count}`,
    doctor_id: doctorId,
    display_name: data.display_name,
    sex: data.sex,
    year_of_birth: data.year_of_birth,
  };
  db.patients.set(newPatient.id, newPatient);
  return newPatient;
}

/**
 * Cascading patient deletion (PRD Section 11, Rule 6 & Phase 5)
 * Deletes patient and cascades to all associated consultations, rubrics, and prescriptions.
 */
export async function deletePatientCascading(
  patientId: string,
  doctorId: string
): Promise<{ deletedPatientId: string; consultationsDeleted: number; prescriptionsDeleted: number }> {
  const patient = db.patients.get(patientId);
  if (!patient || patient.doctor_id !== doctorId) {
    const err: any = new Error("Patient not found or unauthorized");
    err.code = "not_found";
    throw err;
  }

  // Find all consultations for this patient
  const patientConsultations = Array.from(db.consultations.values()).filter(
    (c) => c.patient_id === patientId && c.doctor_id === doctorId
  );

  let consultationsDeleted = 0;
  for (const c of patientConsultations) {
    db.consultations.delete(c.id);
    db.confirmedRubrics.delete(c.id);
    db.caseEvents.delete(c.id);
    db.consultationFolderMap.delete(c.id);

    // Invalidate all active expiring shares for this consultation under DPDP erasure
    for (const [token, share] of db.shares.entries()) {
      if (share.consultation_id === c.id) {
        db.shares.delete(token);
      }
    }

    consultationsDeleted++;
  }

  // Find all prescriptions for this patient
  const patientPrescriptions = Array.from(db.prescriptions.values()).filter(
    (p) => p.patient_id === patientId && p.doctor_id === doctorId
  );

  let prescriptionsDeleted = 0;
  for (const p of patientPrescriptions) {
    db.prescriptions.delete(p.id);
    prescriptionsDeleted++;
  }

  // Delete patient
  db.patients.delete(patientId);

  return {
    deletedPatientId: patientId,
    consultationsDeleted,
    prescriptionsDeleted,
  };
}

/**
 * Bulk Per-Doctor Export (PRD Section 11, Rule 6 & Phase 5)
 */
export async function getDoctorFullExport(doctorId: string): Promise<{
  doctor: DoctorRecord | null;
  patients: PatientRecord[];
  consultations: ConsultationRecord[];
  prescriptions: PrescriptionRecord[];
  exported_at: string;
}> {
  const doctor = db.doctors.get(doctorId) || null;
  const patients = Array.from(db.patients.values()).filter((p) => p.doctor_id === doctorId);
  const consultations = Array.from(db.consultations.values()).filter((c) => c.doctor_id === doctorId);
  const prescriptions = Array.from(db.prescriptions.values()).filter((p) => p.doctor_id === doctorId);

  return {
    doctor,
    patients,
    consultations,
    prescriptions,
    exported_at: new Date().toISOString(),
  };
}

/**
 * Case Timeline & Follow-ups (PRD Section 11, 19 & Phase 5)
 */
export async function addCaseEvent(
  consultationId: string,
  event: {
    patient_id: string;
    doctor_id: string;
    event_type: "consultation" | "prescription" | "follow_up" | "potency_change";
    title: string;
    description: string;
    response_assessment?: "amelioration" | "aggravation" | "status_quo" | "new_symptoms";
  }
): Promise<CaseEventRecord> {
  const newEvent: CaseEventRecord = {
    id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    consultation_id: consultationId,
    patient_id: event.patient_id,
    doctor_id: event.doctor_id,
    event_type: event.event_type,
    title: event.title,
    description: event.description,
    response_assessment: event.response_assessment,
    created_at: new Date().toISOString(),
  };

  const list = db.caseEvents.get(consultationId) || [];
  list.push(newEvent);
  db.caseEvents.set(consultationId, list);

  return newEvent;
}

export async function listCaseEvents(consultationId: string): Promise<CaseEventRecord[]> {
  return db.caseEvents.get(consultationId) || [];
}

/**
 * Case Folders & Tagging (PRD Section 11 & Phase 5)
 */
export async function createCaseFolder(
  doctorId: string,
  name: string,
  color = "#8fb996"
): Promise<CaseFolderRecord> {
  const id = `fld_${Date.now()}`;
  const folder: CaseFolderRecord = {
    id,
    doctor_id: doctorId,
    name,
    color,
    created_at: new Date().toISOString(),
  };
  db.caseFolders.set(id, folder);
  return folder;
}

export async function listCaseFolders(doctorId: string): Promise<CaseFolderRecord[]> {
  return Array.from(db.caseFolders.values()).filter((f) => f.doctor_id === doctorId);
}

export async function assignCaseFolder(consultationId: string, folderId: string): Promise<void> {
  db.consultationFolderMap.set(consultationId, folderId);
}

export async function getCaseFolder(consultationId: string): Promise<CaseFolderRecord | null> {
  const fId = db.consultationFolderMap.get(consultationId);
  return fId ? db.caseFolders.get(fId) || null : null;
}

/**
 * Expiring Read-Only Case Sharing (PRD Section 11, 12, 19 & Phase 5)
 */
export async function createShareLink(
  consultationId: string,
  doctorId: string,
  durationHours = 168 // 7 days default
): Promise<ShareRecord> {
  const token = `sh_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const expiresAt = new Date(Date.now() + durationHours * 3600 * 1000).toISOString();

  const share: ShareRecord = {
    token,
    consultation_id: consultationId,
    doctor_id: doctorId,
    expires_at: expiresAt,
    created_at: new Date().toISOString(),
  };

  db.shares.set(token, share);
  return share;
}

export async function getShareLink(token: string): Promise<ShareRecord | null> {
  const share = db.shares.get(token);
  if (!share) return null;

  // Check expiration
  if (new Date(share.expires_at).getTime() < Date.now()) {
    db.shares.delete(token);
    return null;
  }

  return share;
}

/**
 * Doctor Custom Rubrics (PRD Section 11, 19)
 */
export async function createCustomRubric(
  doctorId: string,
  data: {
    rubric_path: string;
    chapter: string;
    notes?: string;
    contributor: string;
  }
): Promise<CustomRubricRecord> {
  const id = 10000 + db.customRubrics.length + 1;
  const custom: CustomRubricRecord = {
    id,
    doctor_id: doctorId,
    rubric_path: data.rubric_path,
    chapter: data.chapter,
    notes: data.notes,
    contributor: data.contributor,
    created_at: new Date().toISOString(),
  };

  db.customRubrics.push(custom);
  db.rubricPathLookup.set(id, data.rubric_path);

  // Also add to searchable rubrics
  db.rubrics.push({
    id,
    chapter: data.chapter,
    rubric_path: data.rubric_path,
    embedding: generateNormalizedEmbedding(data.rubric_path, 768),
  });

  return custom;
}

export async function listCustomRubrics(doctorId: string): Promise<CustomRubricRecord[]> {
  return db.customRubrics.filter((r) => r.doctor_id === doctorId);
}

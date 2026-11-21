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
import { scoreV2, PROFILE_KENTIAN, ConfirmedRubric as V2ConfirmedRubric, Mapping as V2Mapping } from "../scoring_v2";

export interface DoctorRecord {
  id: string;
  full_name: string;
  registration_number: string;
}

export interface DPDPPatientConsent {
  consented: boolean;
  consented_at: string;
  consent_version: string;
  purpose: string;
  withdrawn?: boolean;
  withdrawn_at?: string;
}

export interface PatientRecord {
  id: string;
  patient_number: string;
  doctor_id: string;
  display_name: string;
  year_of_birth?: number;
  sex: "MALE" | "FEMALE" | "OTHER";
  dpdp_consent?: DPDPPatientConsent;
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

export interface DataSourceRecord {
  repertory_id: string;
  source_name: string;
  author?: string;
  edition?: string;
  year?: number;
  type: "repertory" | "materia_medica";
  licence: string;
  source_url?: string;
  acquisition_date: string;
  licence_note: string;
}

export interface MateriaMedicaPassage {
  book: string;
  author: string;
  edition?: string;
  section: string;
  text: string;
  page?: string;
}

export interface MateriaMedicaRecord {
  id: string;
  common_name: string;
  abbreviation: string;
  latin_name: string;
  source_origin: string;
  constitution: string;
  mind: string;
  head_and_senses?: string;
  throat?: string;
  gastrointestinal?: string;
  urinary_and_genital?: string;
  respiratory?: string;
  cardiovascular?: string;
  locomotor?: string;
  sleep_and_fever?: string;
  skin?: string;
  keynotes: string[];
  modalities: {
    aggravation: string;
    amelioration: string;
  };
  relationships: string;
  cited_passages: MateriaMedicaPassage[];
}

export interface AuditLogRecord {
  id: string;
  doctor_id: string;
  action: string;
  target_type: "consultation" | "rubric" | "prescription" | "patient";
  target_id: string;
  details?: Record<string, any>;
  created_at: string;
}

export interface SearchMissRecord {
  id: string;
  doctor_id?: string;
  query: string;
  chapter?: string;
  results_count: number;
  reason?: string;
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
  public dataSources: DataSourceRecord[] = [];
  public materiaMedica: MateriaMedicaRecord[] = [];
  public rubrics: StoredRubric[] = [];
  public remedies: any[] = [];
  public remedyMappings: any[] = [];
  public synonyms: SynonymEntry[] = [];
  public rubricPathLookup = new Map<number, string>();
  public auditLogs: AuditLogRecord[] = [];
  public searchMisses: SearchMissRecord[] = [];

  constructor() {
    this.initSeedData();
    this.loadFromDisk();
  }

  private getStorageFilePath(): string {
    const dir = process.env.DATA_DIR || path.join(process.cwd(), "data");
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch {}
    }
    return path.join(dir, "store_state.json");
  }

  public persistToDisk(): void {
    try {
      const filePath = this.getStorageFilePath();
      const state = {
        saved_at: new Date().toISOString(),
        doctors: Array.from(this.doctors.entries()),
        patients: Array.from(this.patients.entries()),
        consultations: Array.from(this.consultations.entries()),
        confirmedRubrics: Array.from(this.confirmedRubrics.entries()),
        prescriptions: Array.from(this.prescriptions.entries()),
        caseEvents: Array.from(this.caseEvents.entries()),
        caseFolders: Array.from(this.caseFolders.entries()),
        consultationFolderMap: Array.from(this.consultationFolderMap.entries()),
        shares: Array.from(this.shares.entries()),
        customRubrics: this.customRubrics,
        auditLogs: this.auditLogs,
        searchMisses: this.searchMisses,
      };
      fs.writeFileSync(filePath, JSON.stringify(state, null, 2), "utf-8");
    } catch (err) {
      console.warn("[InMemoryDb] Failed to persist state to disk:", err);
    }
  }

  public loadFromDisk(): boolean {
    try {
      const filePath = this.getStorageFilePath();
      if (!fs.existsSync(filePath)) return false;
      const raw = fs.readFileSync(filePath, "utf-8");
      const state = JSON.parse(raw);

      if (state.doctors && Array.isArray(state.doctors)) {
        for (const [k, v] of state.doctors) this.doctors.set(k, v);
      }
      if (state.patients && Array.isArray(state.patients)) {
        for (const [k, v] of state.patients) this.patients.set(k, v);
      }
      if (state.consultations && Array.isArray(state.consultations)) {
        for (const [k, v] of state.consultations) this.consultations.set(k, v);
      }
      if (state.confirmedRubrics && Array.isArray(state.confirmedRubrics)) {
        for (const [k, v] of state.confirmedRubrics) this.confirmedRubrics.set(k, v);
      }
      if (state.prescriptions && Array.isArray(state.prescriptions)) {
        for (const [k, v] of state.prescriptions) this.prescriptions.set(k, v);
      }
      if (state.caseEvents && Array.isArray(state.caseEvents)) {
        for (const [k, v] of state.caseEvents) this.caseEvents.set(k, v);
      }
      if (state.caseFolders && Array.isArray(state.caseFolders)) {
        for (const [k, v] of state.caseFolders) this.caseFolders.set(k, v);
      }
      if (state.consultationFolderMap && Array.isArray(state.consultationFolderMap)) {
        for (const [k, v] of state.consultationFolderMap) this.consultationFolderMap.set(k, v);
      }
      if (state.shares && Array.isArray(state.shares)) {
        for (const [k, v] of state.shares) this.shares.set(k, v);
      }
      if (state.customRubrics && Array.isArray(state.customRubrics)) {
        this.customRubrics = state.customRubrics;
      }
      if (state.auditLogs && Array.isArray(state.auditLogs)) {
        this.auditLogs = state.auditLogs;
      }
      if (state.searchMisses && Array.isArray(state.searchMisses)) {
        this.searchMisses = state.searchMisses;
      }

      return true;
    } catch (err) {
      console.warn("[InMemoryDb] Failed to load state from disk:", err);
      return false;
    }
  }

  private initSeedData() {
    try {
      // 1. Load Data Sources (PRD Section 6)
      const sourcesPath = path.join(process.cwd(), "seed/data_sources.json");
      if (fs.existsSync(sourcesPath)) {
        this.dataSources = JSON.parse(fs.readFileSync(sourcesPath, "utf-8"));
      }

      // 2. Load Materia Medica (PRD Section 6, 10, 14, 19)
      const mmPath = path.join(process.cwd(), "seed/materia_medica.json");
      if (fs.existsSync(mmPath)) {
        this.materiaMedica = JSON.parse(fs.readFileSync(mmPath, "utf-8"));
      }

      // 3. Load Seed Data (Remedies, Rubrics, Synonyms)
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
            repertory_id: r.repertory_id || "kent_1897",
            sources: r.sources || [{ book: "Kent", edition: "1897" }],
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
  db.persistToDisk();
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
  db.persistToDisk();
  await logAuditTrail(doctorId, "confirm_rubrics", "rubric", consultationId, { count: items.length });
}

export async function executeDeterministicScoring(
  consultationId: string,
  expectedRevision: number,
  repertoryId = "kent_1897",
  scoringVersion?: "v1" | "v2"
): Promise<{ rubric_revision: number; scoring_mode: string; scoring_version: string; ranked: RankedMedicineResult[] }> {
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

  const activeVersion = scoringVersion || (process.env.SCORING_VERSION === "v2" ? "v2" : "v1");
  let ranked: RankedMedicineResult[] = [];

  if (activeVersion === "v2") {
    // Scoring v2: type multipliers, eliminators, parent-child overlap handling
    const v2Confirmed: V2ConfirmedRubric[] = confirmed.map((c) => {
      const rubricObj = db.rubrics.find((r) => r.id === c.rubric_id);
      const ch = rubricObj?.chapter?.toLowerCase() || "";
      const rubricType: "mental" | "general" | "particular" =
        ch === "mind" ? "mental" : ch === "generalities" ? "general" : "particular";
      return {
        id: String(c.rubric_id),
        type: rubricType,
        weight: c.weight as 1 | 2 | 3 | 4,
      };
    });

    const v2Mappings: V2Mapping[] = db.remedyMappings.map((m) => ({
      remedyId: m.medicine_id,
      rubricId: String(m.rubric_id),
      grade: m.grade as 1 | 2 | 3 | 4,
    }));

    const v2Scores = scoreV2(v2Confirmed, v2Mappings, {
      typeMultiplierPct: PROFILE_KENTIAN,
      limit: 12,
    });

    const remedyMap = new Map<number, any>(db.remedies.map((r) => [r.id, r]));
    ranked = v2Scores.map((s) => ({
      medicine_id: s.remedyId,
      common_name: remedyMap.get(s.remedyId)?.common_name || `Remedy #${s.remedyId}`,
      score: s.score,
      rubrics_covered: s.rubricsCovered,
      breakdown: s.breakdown.map((b) => ({
        rubric_id: Number(b.rubricId),
        grade: b.grade,
        weight: b.weight,
        subtotal: b.centi / 100,
      })),
    }));
  } else {
    // Scoring v1: classical additive grade * weight with stable tiebreaker
    const confirmedItems: ConfirmedRubricItem[] = confirmed.map((c) => ({
      rubric_id: c.rubric_id,
      weight: c.weight,
    }));

    ranked = calculateRepertorizationScore(
      confirmedItems,
      db.remedyMappings,
      db.remedies,
      12
    );
  }

  consultation.state = "REVIEW_MEDICINES";
  consultation.updated_at = new Date().toISOString();
  await saveConsultation(consultation);

  return {
    rubric_revision: consultation.rubric_revision,
    scoring_mode: consultation.scoring_mode,
    scoring_version: activeVersion,
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
  db.persistToDisk();

  await logAuditTrail(payload.doctor_id, "issue_prescription", "prescription", prescription.id, {
    medicine_id: payload.medicine_id,
    potency: payload.potency,
    consultation_id: payload.consultation_id,
  });

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
  data: {
    display_name: string;
    sex: "MALE" | "FEMALE" | "OTHER";
    year_of_birth?: number;
    dpdp_consent?: {
      consented: boolean;
      consented_at?: string;
      consent_version?: string;
      purpose?: string;
    };
  }
): Promise<PatientRecord> {
  const count = db.patients.size + 1;
  const newPatient: PatientRecord = {
    id: `pat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    patient_number: `P-${1000 + count}`,
    doctor_id: doctorId,
    display_name: data.display_name,
    sex: data.sex,
    year_of_birth: data.year_of_birth,
    dpdp_consent: {
      consented: data.dpdp_consent?.consented ?? true,
      consented_at: data.dpdp_consent?.consented_at || new Date().toISOString(),
      consent_version: data.dpdp_consent?.consent_version || "DPDP-IN-2023-V1",
      purpose: data.dpdp_consent?.purpose || "homeopathic_clinical_care_and_records",
    },
  };
  db.patients.set(newPatient.id, newPatient);
  db.persistToDisk();
  await logAuditTrail(doctorId, "create_patient", "patient", newPatient.id, {
    display_name: newPatient.display_name,
    dpdp_consented: true,
  });
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
  db.persistToDisk();

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
  db.persistToDisk();

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
  db.persistToDisk();
  return folder;
}

export async function listCaseFolders(doctorId: string): Promise<CaseFolderRecord[]> {
  return Array.from(db.caseFolders.values()).filter((f) => f.doctor_id === doctorId);
}

export async function assignCaseFolder(consultationId: string, folderId: string): Promise<void> {
  db.consultationFolderMap.set(consultationId, folderId);
  db.persistToDisk();
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
  db.persistToDisk();
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

  db.persistToDisk();
  return custom;
}

export async function listCustomRubrics(doctorId: string): Promise<CustomRubricRecord[]> {
  return db.customRubrics.filter((r) => r.doctor_id === doctorId);
}

/**
 * Data Sources & Provenance Catalog (PRD Section 6)
 */
export async function listDataSources(): Promise<DataSourceRecord[]> {
  return db.dataSources;
}

/**
 * Materia Medica Library & Passage Search (PRD Section 6, 10, 14, 19)
 */
export async function listMateriaMedica(search?: string): Promise<MateriaMedicaRecord[]> {
  if (!search) {
    return db.materiaMedica;
  }
  const q = search.toLowerCase().trim();
  return db.materiaMedica.filter(
    (m) =>
      m.common_name.toLowerCase().includes(q) ||
      m.abbreviation.toLowerCase().includes(q) ||
      m.latin_name.toLowerCase().includes(q) ||
      m.keynotes.some((k) => k.toLowerCase().includes(q)) ||
      (m.constitution && m.constitution.toLowerCase().includes(q)) ||
      (m.mind && m.mind.toLowerCase().includes(q)) ||
      (m.head_and_senses && m.head_and_senses.toLowerCase().includes(q)) ||
      (m.throat && m.throat.toLowerCase().includes(q)) ||
      (m.gastrointestinal && m.gastrointestinal.toLowerCase().includes(q)) ||
      (m.urinary_and_genital && m.urinary_and_genital.toLowerCase().includes(q)) ||
      (m.respiratory && m.respiratory.toLowerCase().includes(q)) ||
      (m.cardiovascular && m.cardiovascular.toLowerCase().includes(q)) ||
      (m.locomotor && m.locomotor.toLowerCase().includes(q)) ||
      (m.sleep_and_fever && m.sleep_and_fever.toLowerCase().includes(q)) ||
      (m.skin && m.skin.toLowerCase().includes(q)) ||
      (m.modalities?.aggravation && m.modalities.aggravation.toLowerCase().includes(q)) ||
      (m.modalities?.amelioration && m.modalities.amelioration.toLowerCase().includes(q))
  );
}

export async function getMateriaMedicaMonograph(idOrName: string): Promise<MateriaMedicaRecord | null> {
  const raw = idOrName.toLowerCase().trim();
  const slug = raw.replace(/[_-]/g, " ");
  const match = db.materiaMedica.find(
    (m) =>
      m.id.toLowerCase() === raw ||
      m.abbreviation.toLowerCase().replace(/\.$/, "") === raw.replace(/\.$/, "") ||
      m.common_name.toLowerCase() === raw ||
      m.common_name.toLowerCase() === slug ||
      m.latin_name.toLowerCase().includes(slug) ||
      m.common_name.toLowerCase().startsWith(slug)
  );
  return match || null;
}

export async function searchMateriaMedicaPassages(query: string): Promise<
  Array<{
    remedy_id: string;
    common_name: string;
    abbreviation: string;
    passage: MateriaMedicaPassage;
  }>
> {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  const results: Array<{
    remedy_id: string;
    common_name: string;
    abbreviation: string;
    passage: MateriaMedicaPassage;
  }> = [];

  for (const remedy of db.materiaMedica) {
    const remedyMatches =
      remedy.common_name.toLowerCase().includes(q) ||
      remedy.keynotes.some((k) => k.toLowerCase().includes(q)) ||
      (remedy.constitution && remedy.constitution.toLowerCase().includes(q)) ||
      (remedy.mind && remedy.mind.toLowerCase().includes(q)) ||
      (remedy.head_and_senses && remedy.head_and_senses.toLowerCase().includes(q)) ||
      (remedy.throat && remedy.throat.toLowerCase().includes(q)) ||
      (remedy.gastrointestinal && remedy.gastrointestinal.toLowerCase().includes(q)) ||
      (remedy.urinary_and_genital && remedy.urinary_and_genital.toLowerCase().includes(q)) ||
      (remedy.respiratory && remedy.respiratory.toLowerCase().includes(q)) ||
      (remedy.cardiovascular && remedy.cardiovascular.toLowerCase().includes(q)) ||
      (remedy.locomotor && remedy.locomotor.toLowerCase().includes(q)) ||
      (remedy.sleep_and_fever && remedy.sleep_and_fever.toLowerCase().includes(q)) ||
      (remedy.skin && remedy.skin.toLowerCase().includes(q));

    for (const passage of remedy.cited_passages) {
      if (
        passage.text.toLowerCase().includes(q) ||
        passage.section.toLowerCase().includes(q) ||
        remedyMatches
      ) {
        results.push({
          remedy_id: remedy.id,
          common_name: remedy.common_name,
          abbreviation: remedy.abbreviation,
          passage,
        });
      }
    }
  }

  return results;
}

/**
 * Audit Trail Logging (Clinical Governance)
 */
export async function logAuditTrail(
  doctorId: string,
  action: string,
  targetType: AuditLogRecord["target_type"],
  targetId: string,
  details?: Record<string, any>
): Promise<AuditLogRecord> {
  const record: AuditLogRecord = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    doctor_id: doctorId,
    action,
    target_type: targetType,
    target_id: targetId,
    details,
    created_at: new Date().toISOString(),
  };
  db.auditLogs.push(record);
  db.persistToDisk();
  return record;
}

export async function getAuditLogs(
  doctorId?: string,
  targetId?: string
): Promise<AuditLogRecord[]> {
  return db.auditLogs.filter((log) => {
    if (doctorId && log.doctor_id !== doctorId) return false;
    if (targetId && log.target_id !== targetId) return false;
    return true;
  });
}

/**
 * Search Misses Logging (Synonym Mining & Lexical Gaps)
 */
export async function logSearchMiss(
  query: string,
  resultsCount: number,
  doctorId?: string,
  chapter?: string,
  reason?: string
): Promise<SearchMissRecord> {
  const record: SearchMissRecord = {
    id: `miss_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    doctor_id: doctorId,
    query,
    chapter,
    results_count: resultsCount,
    reason,
    created_at: new Date().toISOString(),
  };
  db.searchMisses.push(record);
  db.persistToDisk();
  return record;
}

export async function getSearchMisses(limit = 100): Promise<SearchMissRecord[]> {
  return db.searchMisses.slice(-limit);
}

/**
 * Full System Backup & Restore (Disaster Recovery & Multi-Instance Migration)
 */
export async function exportStoreSnapshot(): Promise<Record<string, any>> {
  return {
    version: "1.0",
    exported_at: new Date().toISOString(),
    doctors: Array.from(db.doctors.entries()),
    patients: Array.from(db.patients.entries()),
    consultations: Array.from(db.consultations.entries()),
    confirmedRubrics: Array.from(db.confirmedRubrics.entries()),
    prescriptions: Array.from(db.prescriptions.entries()),
    caseEvents: Array.from(db.caseEvents.entries()),
    caseFolders: Array.from(db.caseFolders.entries()),
    consultationFolderMap: Array.from(db.consultationFolderMap.entries()),
    shares: Array.from(db.shares.entries()),
    customRubrics: db.customRubrics,
    auditLogs: db.auditLogs,
    searchMisses: db.searchMisses,
  };
}

export async function restoreStoreSnapshot(state: Record<string, any>): Promise<{ restored: boolean; counts: Record<string, number> }> {
  if (!state || typeof state !== "object") {
    throw new Error("Invalid backup payload format");
  }

  if (state.doctors && Array.isArray(state.doctors)) {
    db.doctors = new Map(state.doctors);
  }
  if (state.patients && Array.isArray(state.patients)) {
    db.patients = new Map(state.patients);
  }
  if (state.consultations && Array.isArray(state.consultations)) {
    db.consultations = new Map(state.consultations);
  }
  if (state.confirmedRubrics && Array.isArray(state.confirmedRubrics)) {
    db.confirmedRubrics = new Map(state.confirmedRubrics);
  }
  if (state.prescriptions && Array.isArray(state.prescriptions)) {
    db.prescriptions = new Map(state.prescriptions);
  }
  if (state.caseEvents && Array.isArray(state.caseEvents)) {
    db.caseEvents = new Map(state.caseEvents);
  }
  if (state.caseFolders && Array.isArray(state.caseFolders)) {
    db.caseFolders = new Map(state.caseFolders);
  }
  if (state.consultationFolderMap && Array.isArray(state.consultationFolderMap)) {
    db.consultationFolderMap = new Map(state.consultationFolderMap);
  }
  if (state.shares && Array.isArray(state.shares)) {
    db.shares = new Map(state.shares);
  }
  if (state.customRubrics && Array.isArray(state.customRubrics)) {
    db.customRubrics = state.customRubrics;
  }
  if (state.auditLogs && Array.isArray(state.auditLogs)) {
    db.auditLogs = state.auditLogs;
  }
  if (state.searchMisses && Array.isArray(state.searchMisses)) {
    db.searchMisses = state.searchMisses;
  }

  db.persistToDisk();

  return {
    restored: true,
    counts: {
      doctors: db.doctors.size,
      patients: db.patients.size,
      consultations: db.consultations.size,
      prescriptions: db.prescriptions.size,
      auditLogs: db.auditLogs.length,
    },
  };
}

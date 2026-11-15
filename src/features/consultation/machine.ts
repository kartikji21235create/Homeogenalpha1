/**
 * Consultation Finite State Machine (XState v5)
 * Strictly complies with PRD v4 Section 7 (7 active states + DONE)
 * States:
 *   1. INTAKE
 *   2. PROCESSING
 *   3. REVIEW_TRANSCRIPT
 *   4. REVIEW_RUBRICS
 *   5. SCORING
 *   6. REVIEW_MEDICINES
 *   7. PRESCRIBING
 *   8. DONE
 */

import { setup, assign } from "xstate";
import { ExtractedSymptom, SelectedRubric } from "@/lib/ai/pipeline";
import { RankedMedicineResult, ScoringSnapshot } from "@/lib/scoring";
import { EmergencyCheckResult } from "@/lib/ai/emergency";

export interface ConfirmedRubricState {
  rubric_id: number;
  rubric_path: string;
  chapter: string;
  symptom_phrase: string;
  weight: number; // 1-4
  doctor_edited: boolean;
  confidence_score: number;
  reason?: string;
  source_page?: string;
}

export interface ConsultationContext {
  consultationId: string | null;
  patientId: string;
  patientDisplayName: string;
  dpdpConsent: boolean;
  transcript: string;
  symptoms: ExtractedSymptom[];
  suggestedRubrics: SelectedRubric[];
  confirmedRubrics: ConfirmedRubricState[];
  rubricRevision: number;
  rankedMedicines: RankedMedicineResult[];
  selectedMedicineId: number | null;
  selectedMedicineName: string | null;
  potency: string;
  dosageInstructions: string;
  prescriptionNotes: string;
  prescriptionId: string | null;
  scoringSnapshot: ScoringSnapshot | null;
  missingInfo: string[];
  emergencyCheck: EmergencyCheckResult | null;
  errorMessage: string | null;
  staleServerRevision: number | null;
}

export const initialConsultationContext: ConsultationContext = {
  consultationId: null,
  patientId: "00000000-0000-0000-0000-000000000002",
  patientDisplayName: "Aarav Sharma",
  dpdpConsent: false,
  transcript: "",
  symptoms: [],
  suggestedRubrics: [],
  confirmedRubrics: [],
  rubricRevision: 0,
  rankedMedicines: [],
  selectedMedicineId: null,
  selectedMedicineName: null,
  potency: "",
  dosageInstructions: "",
  prescriptionNotes: "",
  prescriptionId: null,
  scoringSnapshot: null,
  missingInfo: [],
  emergencyCheck: null,
  errorMessage: null,
  staleServerRevision: null,
};

export type ConsultationEvent =
  | { type: "SET_CONSENT"; consent: boolean }
  | { type: "SET_PATIENT"; patientId: string; patientDisplayName: string }
  | { type: "CLEAR_ERROR" }
  | { type: "SUBMIT_NARRATIVE"; text: string }
  | {
      type: "ANALYSIS_SUCCESS";
      consultationId: string;
      transcript: string;
      symptoms: ExtractedSymptom[];
      suggestedRubrics: SelectedRubric[];
      missingInfo: string[];
      emergencyCheck: EmergencyCheckResult;
    }
  | { type: "ANALYSIS_FAILURE"; message: string }
  | { type: "EDIT_TRANSCRIPT"; text: string }
  | { type: "CONFIRM_TRANSCRIPT" }
  | { type: "SET_RUBRIC_WEIGHT"; rubricId: number; weight: number }
  | { type: "REMOVE_RUBRIC"; rubricId: number }
  | {
      type: "ADD_MANUAL_RUBRIC";
      rubricId: number;
      rubricPath: string;
      chapter: string;
    }
  | { type: "CONFIRM_RUBRICS_START" }
  | { type: "CONFIRM_RUBRICS_SUCCESS"; newRevision: number }
  | { type: "CONFIRM_RUBRICS_STALE_409"; serverRevision: number }
  | { type: "SCORING_SUCCESS"; ranked: RankedMedicineResult[] }
  | { type: "SCORING_FAILURE"; message: string }
  | { type: "CHOOSE_MEDICINE"; medicineId: number; medicineName: string }
  | {
      type: "SET_PRESCRIPTION_DETAILS";
      potency: string;
      dosageInstructions: string;
      notes?: string;
    }
  | { type: "SAVE_PRESCRIPTION_START" }
  | { type: "SAVE_PRESCRIPTION_SUCCESS"; prescriptionId: string }
  | { type: "SAVE_PRESCRIPTION_FAILURE"; message: string }
  | { type: "RESET_TO_INTAKE" };

export const consultationMachine = setup({
  types: {
    context: {} as ConsultationContext,
    events: {} as ConsultationEvent,
  },
  actions: {
    setConsent: assign({
      dpdpConsent: ({ event }) => (event.type === "SET_CONSENT" ? event.consent : false),
    }),
    setPatient: assign({
      patientId: ({ event }) =>
        event.type === "SET_PATIENT" ? event.patientId : "00000000-0000-0000-0000-000000000002",
      patientDisplayName: ({ event }) =>
        event.type === "SET_PATIENT" ? event.patientDisplayName : "Aarav Sharma",
    }),
    recordError: assign({
      errorMessage: ({ event }) => ("message" in event ? event.message : "An error occurred"),
    }),
    clearError: assign({
      errorMessage: () => null,
    }),
    handleAnalysisSuccess: assign(({ event }) => {
      if (event.type !== "ANALYSIS_SUCCESS") return {};

      // Initialize confirmed rubrics with default suggestions
      const initialConfirmed: ConfirmedRubricState[] = event.suggestedRubrics.map((sug) => {
        const matchingSymptom = event.symptoms.find((s) => s.id === sug.symptom_id);
        return {
          rubric_id: sug.rubric_id,
          rubric_path: sug.rubric_path,
          chapter: sug.chapter,
          symptom_phrase: matchingSymptom?.phrase || "General narrative",
          weight: 3, // default initial suggested weight
          doctor_edited: false,
          confidence_score: sug.confidence_score,
          reason: sug.reason,
          source_page: "Kent Rep. 1897",
        };
      });

      return {
        consultationId: event.consultationId,
        transcript: event.transcript,
        symptoms: event.symptoms,
        suggestedRubrics: event.suggestedRubrics,
        confirmedRubrics: initialConfirmed,
        missingInfo: event.missingInfo,
        emergencyCheck: event.emergencyCheck,
        errorMessage: null,
      };
    }),
    updateWeight: assign({
      confirmedRubrics: ({ context, event }) => {
        if (event.type !== "SET_RUBRIC_WEIGHT") return context.confirmedRubrics;
        return context.confirmedRubrics.map((r) =>
          r.rubric_id === event.rubricId
            ? { ...r, weight: event.weight, doctor_edited: true }
            : r
        );
      },
      // Clear downstream scoring if rubrics change
      rankedMedicines: () => [],
      selectedMedicineId: () => null,
      selectedMedicineName: () => null,
    }),
    removeRubric: assign({
      confirmedRubrics: ({ context, event }) => {
        if (event.type !== "REMOVE_RUBRIC") return context.confirmedRubrics;
        return context.confirmedRubrics.filter((r) => r.rubric_id !== event.rubricId);
      },
      rankedMedicines: () => [],
      selectedMedicineId: () => null,
      selectedMedicineName: () => null,
    }),
    addManualRubric: assign({
      confirmedRubrics: ({ context, event }) => {
        if (event.type !== "ADD_MANUAL_RUBRIC") return context.confirmedRubrics;
        const exists = context.confirmedRubrics.some((r) => r.rubric_id === event.rubricId);
        if (exists) return context.confirmedRubrics;

        return [
          ...context.confirmedRubrics,
          {
            rubric_id: event.rubricId,
            rubric_path: event.rubricPath,
            chapter: event.chapter,
            symptom_phrase: "Manual repertory addition",
            weight: 3,
            doctor_edited: true,
            confidence_score: 1.0,
            reason: "Doctor manually selected from repertory",
            source_page: "Kent Rep. 1897",
          },
        ];
      },
      rankedMedicines: () => [],
      selectedMedicineId: () => null,
      selectedMedicineName: () => null,
    }),
    recordStale409: assign({
      staleServerRevision: ({ event }) =>
        event.type === "CONFIRM_RUBRICS_STALE_409" ? event.serverRevision : null,
      errorMessage: () =>
        "Rubrics were modified in another session. Please review the updated rubrics list before scoring.",
    }),
    setRankedMedicines: assign({
      rankedMedicines: ({ event }) =>
        event.type === "SCORING_SUCCESS" ? event.ranked : [],
    }),
    setSelectedMedicine: assign({
      selectedMedicineId: ({ event }) =>
        event.type === "CHOOSE_MEDICINE" ? event.medicineId : null,
      selectedMedicineName: ({ event }) =>
        event.type === "CHOOSE_MEDICINE" ? event.medicineName : null,
    }),
    setPrescriptionDetails: assign({
      potency: ({ event }) => (event.type === "SET_PRESCRIPTION_DETAILS" ? event.potency : ""),
      dosageInstructions: ({ event }) =>
        event.type === "SET_PRESCRIPTION_DETAILS" ? event.dosageInstructions : "",
      prescriptionNotes: ({ event }) =>
        event.type === "SET_PRESCRIPTION_DETAILS" ? event.notes || "" : "",
    }),
    handlePrescriptionSaved: assign({
      prescriptionId: ({ event }) =>
        event.type === "SAVE_PRESCRIPTION_SUCCESS" ? event.prescriptionId : null,
    }),
  },
}).createMachine({
  id: "consultation",
  initial: "INTAKE",
  context: initialConsultationContext,
  states: {
    INTAKE: {
      on: {
        SET_CONSENT: { actions: "setConsent" },
        SET_PATIENT: { actions: "setPatient" },
        CLEAR_ERROR: { actions: "clearError" },
        SUBMIT_NARRATIVE: {
          guard: ({ context }) => context.dpdpConsent,
          target: "PROCESSING",
          actions: assign({
            transcript: ({ event }) => event.text,
          }),
        },
      },
    },

    PROCESSING: {
      on: {
        ANALYSIS_SUCCESS: {
          target: "REVIEW_TRANSCRIPT",
          actions: "handleAnalysisSuccess",
        },
        ANALYSIS_FAILURE: {
          target: "INTAKE",
          actions: "recordError",
        },
      },
    },

    REVIEW_TRANSCRIPT: {
      on: {
        EDIT_TRANSCRIPT: {
          actions: assign({ transcript: ({ event }) => event.text }),
        },
        CONFIRM_TRANSCRIPT: {
          target: "REVIEW_RUBRICS",
        },
        RESET_TO_INTAKE: {
          target: "INTAKE",
          actions: assign(() => ({ ...initialConsultationContext })),
        },
      },
    },

    REVIEW_RUBRICS: {
      on: {
        CLEAR_ERROR: { actions: "clearError" },
        SET_RUBRIC_WEIGHT: { actions: "updateWeight" },
        REMOVE_RUBRIC: { actions: "removeRubric" },
        ADD_MANUAL_RUBRIC: { actions: "addManualRubric" },
        CONFIRM_RUBRICS_START: {
          target: "SCORING",
          actions: "clearError",
        },
        CONFIRM_RUBRICS_STALE_409: {
          actions: "recordStale409",
        },
        RESET_TO_INTAKE: {
          target: "INTAKE",
          actions: assign(() => ({ ...initialConsultationContext })),
        },
      },
    },

    SCORING: {
      on: {
        SCORING_SUCCESS: {
          target: "REVIEW_MEDICINES",
          actions: "setRankedMedicines",
        },
        SCORING_FAILURE: {
          // Problem 14: Optimistic confirm rollback on scoring failure
          target: "REVIEW_RUBRICS",
          actions: "recordError",
        },
        CONFIRM_RUBRICS_STALE_409: {
          target: "REVIEW_RUBRICS",
          actions: "recordStale409",
        },
      },
    },

    REVIEW_MEDICINES: {
      on: {
        CHOOSE_MEDICINE: {
          target: "PRESCRIBING",
          actions: "setSelectedMedicine",
        },
        CONFIRM_RUBRICS_START: {
          target: "REVIEW_RUBRICS",
        },
      },
    },

    PRESCRIBING: {
      on: {
        CLEAR_ERROR: { actions: "clearError" },
        SET_PRESCRIPTION_DETAILS: {
          actions: "setPrescriptionDetails",
        },
        SAVE_PRESCRIPTION_SUCCESS: {
          target: "DONE",
          actions: "handlePrescriptionSaved",
        },
        SAVE_PRESCRIPTION_FAILURE: {
          actions: "recordError",
        },
      },
    },

    DONE: {
      on: {
        RESET_TO_INTAKE: {
          target: "INTAKE",
          actions: assign(() => ({ ...initialConsultationContext })),
        },
      },
    },
  },
});

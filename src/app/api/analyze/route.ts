import { NextRequest, NextResponse } from "next/server";
import { runConsultationAnalyzePipeline } from "@/lib/ai/pipeline";
import { db, saveConsultation, ConsultationRecord } from "@/lib/db/store";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const [auth, authError] = await requireAuth();
    if (authError) return authError;

    const body = await req.json();
    const { text, patient_id, dpdp_consent, patient_display_name } = body;

    // Consent check (PRD Section 11, Rule 8)
    if (!dpdp_consent) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "no_consent",
            message: "DPDP consent is required before narrative analysis.",
          },
        },
        { status: 400 }
      );
    }

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "empty_text",
            message: "Narrative text cannot be empty.",
          },
        },
        { status: 422 }
      );
    }

    // Require patient_id — no silent fallback to a hardcoded default
    if (!patient_id || typeof patient_id !== "string") {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "missing_patient",
            message: "patient_id is required.",
          },
        },
        { status: 422 }
      );
    }

    const doctorId = auth.doctorId;
    const patientId = patient_id;

    // Run Stage B Pipeline: Extract -> Retrieve -> Select
    const apiKey = process.env.GEMINI_API_KEY;
    const analysis = await runConsultationAnalyzePipeline(
      text,
      db.rubrics,
      db.synonyms,
      apiKey,
      patient_display_name
    );

    // Persist consultation state
    const consultationId = `c_${Date.now()}`;
    const consultationRecord: ConsultationRecord = {
      id: consultationId,
      doctor_id: doctorId,
      patient_id: patientId,
      dpdp_consent_logged: true,
      transcript: analysis.transcript,
      state: "REVIEW_TRANSCRIPT",
      rubric_revision: 0,
      scoring_mode: "additive",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await saveConsultation(consultationRecord);

    return NextResponse.json({
      ok: true,
      data: {
        consultation_id: consultationId,
        transcript: analysis.transcript,
        symptoms: analysis.symptoms,
        suggested_rubrics: analysis.suggested_rubrics,
        missing_info: analysis.missing_info,
        emergency_check: analysis.emergency_check,
      },
    });
  } catch (err: any) {
    console.error("[POST /api/analyze error]", err);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: err.code || "internal_error",
          message: err.message || "An unexpected error occurred during analysis.",
        },
      },
      { status: 500 }
    );
  }
}

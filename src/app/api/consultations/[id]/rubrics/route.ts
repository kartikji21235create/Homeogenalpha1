import { NextRequest, NextResponse } from "next/server";
import {
  getConsultation,
  saveConsultation,
  saveConfirmedRubrics,
} from "@/lib/db/store";
import { requireAuth } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const [auth, authError] = await requireAuth();
    if (authError || !auth) return authError!;

    const { id } = await context.params;
    const body = await req.json();
    const { base_revision, confirmed_rubrics } = body;

    const consultation = await getConsultation(id);
    if (!consultation) {
      return NextResponse.json(
        { ok: false, error: { code: "not_found", message: "Consultation not found." } },
        { status: 404 }
      );
    }

    if (consultation.doctor_id !== auth.doctorId) {
      return NextResponse.json(
        { ok: false, error: { code: "forbidden", message: "You do not own this consultation." } },
        { status: 403 }
      );
    }

    // Stale revision check (Problem 13: 409 stale revision, never a silent re-rank)
    if (consultation.rubric_revision !== base_revision) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "stale_revision",
            message: `Consultation rubrics were modified elsewhere. Current revision is ${consultation.rubric_revision}, requested ${base_revision}.`,
            details: {
              current_revision: consultation.rubric_revision,
              base_revision,
            },
          },
        },
        { status: 409 }
      );
    }

    if (!Array.isArray(confirmed_rubrics) || confirmed_rubrics.length === 0) {
      return NextResponse.json(
        { ok: false, error: { code: "empty_rubrics", message: "At least one rubric must be confirmed." } },
        { status: 422 }
      );
    }

    for (const item of confirmed_rubrics) {
      const w = Number(item.weight);
      if (!w || isNaN(w) || w < 1 || w > 4) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "invalid_weight",
              message: `Rubric ID ${item.rubric_id} has invalid weight ${item.weight}. Must be an integer between 1 and 4.`,
            },
          },
          { status: 422 }
        );
      }
    }

    await saveConfirmedRubrics(
      id,
      consultation.doctor_id,
      confirmed_rubrics.map((r: any) => ({
        rubric_id: Number(r.rubric_id),
        weight: Number(r.weight),
        doctor_edited: Boolean(r.doctor_edited ?? true),
      }))
    );

    consultation.rubric_revision += 1;
    consultation.state = "REVIEW_RUBRICS";
    consultation.updated_at = new Date().toISOString();
    await saveConsultation(consultation);

    return NextResponse.json({
      ok: true,
      data: {
        rubric_revision: consultation.rubric_revision,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "server_error", message: err.message || "Failed to update rubrics." } },
      { status: 500 }
    );
  }
}

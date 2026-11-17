import { NextRequest, NextResponse } from "next/server";
import { executeDeterministicScoring, getConsultation } from "@/lib/db/store";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const [auth, authError] = await requireAuth();
    if (authError || !auth) return authError!;

    const body = await req.json().catch(() => ({}));
    const { consultation_id, base_revision, repertory_id = "kent_1897" } = body;

    if (!consultation_id) {
      return NextResponse.json(
        { ok: false, error: { code: "missing_fields", message: "consultation_id is required." } },
        { status: 422 }
      );
    }

    const consultation = await getConsultation(consultation_id);
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

    if (consultation.rubric_revision !== base_revision) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "stale_revision",
            message: `Stale revision: consultation is at revision ${consultation.rubric_revision}, but scoring was requested against ${base_revision}.`,
            details: {
              current_revision: consultation.rubric_revision,
              base_revision,
            },
          },
        },
        { status: 409 }
      );
    }

    const result = await executeDeterministicScoring(
      consultation_id,
      base_revision,
      repertory_id
    );

    return NextResponse.json({
      ok: true,
      data: result,
    });
  } catch (err: any) {
    if (err.code === "stale_revision") {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "stale_revision",
            message: err.message,
            details: { current_revision: err.current_revision },
          },
        },
        { status: 409 }
      );
    }

    if (err.code === "missing_weights" || err.code === "empty_rubrics") {
      return NextResponse.json(
        { ok: false, error: { code: err.code, message: err.message } },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { ok: false, error: { code: "server_error", message: err.message || "Scoring failed." } },
      { status: 500 }
    );
  }
}

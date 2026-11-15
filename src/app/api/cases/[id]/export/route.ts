import { NextRequest, NextResponse } from "next/server";
import { getConsultation, getConfirmedRubrics, db } from "@/lib/db/store";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const consultation = await getConsultation(id);

    if (!consultation) {
      return NextResponse.json(
        { ok: false, error: { code: "not_found", message: "Case consultation not found." } },
        { status: 404 }
      );
    }

    const confirmed = await getConfirmedRubrics(id);
    const prescriptions = Array.from(db.prescriptions.values()).filter(
      (p) => p.consultation_id === id
    );

    return NextResponse.json({
      ok: true,
      data: {
        consultation,
        confirmed_rubrics: confirmed.map((cr) => ({
          rubric_id: cr.rubric_id,
          rubric_path: db.rubricPathLookup.get(cr.rubric_id) || "Unknown rubric",
          weight: cr.weight,
          doctor_edited: cr.doctor_edited,
        })),
        prescriptions,
        exported_at: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "server_error", message: err.message } },
      { status: 500 }
    );
  }
}

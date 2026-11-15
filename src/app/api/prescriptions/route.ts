import { NextRequest, NextResponse } from "next/server";
import { createPrescriptionRecord } from "@/lib/db/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      consultation_id,
      patient_id,
      medicine_id,
      potency,
      dosage_instructions,
      notes,
    } = body;

    if (!consultation_id || !medicine_id || !potency || !dosage_instructions) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "missing_fields",
            message: "consultation_id, medicine_id, potency, and dosage_instructions are required.",
          },
        },
        { status: 422 }
      );
    }

    const doctorId = "00000000-0000-0000-0000-000000000001";
    const patientId = patient_id || "00000000-0000-0000-0000-000000000002";

    const prescription = await createPrescriptionRecord({
      consultation_id,
      patient_id: patientId,
      doctor_id: doctorId,
      medicine_id: Number(medicine_id),
      potency: String(potency),
      dosage_instructions: String(dosage_instructions),
      notes: notes ? String(notes) : undefined,
    });

    return NextResponse.json(
      {
        ok: true,
        data: {
          id: prescription.id,
          consultation_id: prescription.consultation_id,
          medicine_id: prescription.medicine_id,
          potency: prescription.potency,
          dosage_instructions: prescription.dosage_instructions,
          scoring_snapshot: prescription.scoring_snapshot,
          created_at: prescription.created_at,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err.code === "forbidden") {
      return NextResponse.json(
        { ok: false, error: { code: "forbidden", message: err.message } },
        { status: 403 }
      );
    }

    if (err.code === "unconfirmed_rubric" || err.code === "missing_weights") {
      // Maps trigger / integrity check error to friendly 422
      return NextResponse.json(
        { ok: false, error: { code: "unconfirmed_rubric", message: err.message } },
        { status: 422 }
      );
    }

    if (err.code === "not_found") {
      return NextResponse.json(
        { ok: false, error: { code: "not_found", message: err.message } },
        { status: 404 }
      );
    }

    console.error("[POST /api/prescriptions error]", err);
    return NextResponse.json(
      { ok: false, error: { code: "server_error", message: err.message || "Failed to create prescription." } },
      { status: 500 }
    );
  }
}

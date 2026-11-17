import { NextRequest, NextResponse } from "next/server";
import {
  getConsultation,
  listCaseEvents,
  addCaseEvent,
} from "@/lib/db/store";
import { requireAuth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const [auth, authError] = await requireAuth();
    if (authError || !auth) return authError!;

    const { id } = await context.params;
    const consultation = await getConsultation(id);
    if (!consultation) {
      return NextResponse.json(
        { ok: false, error: { code: "not_found", message: "Case not found." } },
        { status: 404 }
      );
    }

    if (consultation.doctor_id !== auth.doctorId) {
      return NextResponse.json(
        { ok: false, error: { code: "forbidden", message: "Forbidden." } },
        { status: 403 }
      );
    }

    const events = await listCaseEvents(id);

    return NextResponse.json({
      ok: true,
      data: {
        events,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "server_error", message: err.message } },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const [auth, authError] = await requireAuth();
    if (authError || !auth) return authError!;

    const { id } = await context.params;
    const consultation = await getConsultation(id);
    if (!consultation) {
      return NextResponse.json(
        { ok: false, error: { code: "not_found", message: "Case not found." } },
        { status: 404 }
      );
    }

    if (consultation.doctor_id !== auth.doctorId) {
      return NextResponse.json(
        { ok: false, error: { code: "forbidden", message: "Forbidden." } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, event_type, response_assessment } = body;

    if (!title || !description) {
      return NextResponse.json(
        { ok: false, error: { code: "missing_fields", message: "title and description are required." } },
        { status: 422 }
      );
    }

    const newEvent = await addCaseEvent(id, {
      patient_id: consultation.patient_id,
      doctor_id: auth.doctorId,
      event_type: event_type || "follow_up",
      title: String(title),
      description: String(description),
      response_assessment,
    });

    return NextResponse.json({
      ok: true,
      data: newEvent,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "server_error", message: err.message } },
      { status: 500 }
    );
  }
}

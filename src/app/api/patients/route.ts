import { NextRequest, NextResponse } from "next/server";
import { listPatients, createPatient } from "@/lib/db/store";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const [auth, authError] = await requireAuth();
    if (authError || !auth) return authError!;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;

    const patients = await listPatients(auth.doctorId, search);

    return NextResponse.json({
      ok: true,
      data: {
        patients,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "server_error", message: err.message } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const [auth, authError] = await requireAuth();
    if (authError || !auth) return authError!;

    const body = await req.json();
    const { display_name, sex, year_of_birth } = body;

    if (!display_name || !sex) {
      return NextResponse.json(
        { ok: false, error: { code: "missing_fields", message: "display_name and sex are required." } },
        { status: 422 }
      );
    }

    const patient = await createPatient(auth.doctorId, {
      display_name,
      sex,
      year_of_birth: year_of_birth ? Number(year_of_birth) : undefined,
    });

    return NextResponse.json({
      ok: true,
      data: patient,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "server_error", message: err.message } },
      { status: 500 }
    );
  }
}

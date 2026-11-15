import { NextRequest, NextResponse } from "next/server";
import { listPatients, createPatient } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const doctorId = "00000000-0000-0000-0000-000000000001";

    const patients = await listPatients(doctorId, search);

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
    const body = await req.json();
    const { display_name, sex, year_of_birth } = body;

    if (!display_name || !sex) {
      return NextResponse.json(
        { ok: false, error: { code: "missing_fields", message: "display_name and sex are required." } },
        { status: 422 }
      );
    }

    const doctorId = "00000000-0000-0000-0000-000000000001";
    const patient = await createPatient(doctorId, {
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

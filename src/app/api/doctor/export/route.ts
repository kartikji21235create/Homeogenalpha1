import { NextResponse } from "next/server";
import { getDoctorFullExport } from "@/lib/db/store";

export async function GET() {
  try {
    const doctorId = "00000000-0000-0000-0000-000000000001";
    const exportData = await getDoctorFullExport(doctorId);

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="homeogen_export_doctor_${Date.now()}.json"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "server_error", message: err.message } },
      { status: 500 }
    );
  }
}

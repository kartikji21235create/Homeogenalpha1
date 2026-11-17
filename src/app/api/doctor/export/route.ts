import { NextResponse } from "next/server";
import { getDoctorFullExport } from "@/lib/db/store";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const [auth, authError] = await requireAuth();
    if (authError || !auth) return authError!;

    const exportData = await getDoctorFullExport(auth.doctorId);

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

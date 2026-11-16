import { NextResponse } from "next/server";
import { getDoctorUsageSummary, checkSpendAlarm } from "@/lib/plans";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const [auth, authError] = await requireAuth();
    if (authError) return authError;

    const summary = getDoctorUsageSummary(auth.doctorId);
    const alarm = checkSpendAlarm(auth.doctorId, "PRO");

    return NextResponse.json({
      ok: true,
      data: {
        summary,
        alarm,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "server_error", message: err.message } },
      { status: 500 }
    );
  }
}

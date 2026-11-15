import { NextResponse } from "next/server";
import { getDoctorUsageSummary, checkSpendAlarm } from "@/lib/plans";

export async function GET() {
  const doctorId = "00000000-0000-0000-0000-000000000001";
  const summary = getDoctorUsageSummary(doctorId);
  const alarm = checkSpendAlarm(doctorId, "PRO");

  return NextResponse.json({
    ok: true,
    data: {
      summary,
      alarm,
    },
  });
}

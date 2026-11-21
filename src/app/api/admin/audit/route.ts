import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctor_id") || undefined;
    const targetId = searchParams.get("target_id") || undefined;
    const action = searchParams.get("action") || undefined;

    let logs = await getAuditLogs(doctorId, targetId);
    if (action) {
      logs = logs.filter((l) => l.action === action);
    }

    return NextResponse.json(
      {
        ok: true,
        data: {
          total: logs.length,
          logs: logs.slice(-200).reverse(), // most recent first
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

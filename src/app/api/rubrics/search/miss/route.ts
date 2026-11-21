import { NextRequest, NextResponse } from "next/server";
import { logSearchMiss } from "@/lib/db/store";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const [auth] = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const { query, chapter, results_count = 0, reason } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { ok: false, error: { code: "bad_request", message: "Query string is required." } },
        { status: 400 }
      );
    }

    const record = await logSearchMiss(
      query.trim(),
      Number(results_count) || 0,
      auth?.doctorId,
      chapter,
      reason
    );

    return NextResponse.json({
      ok: true,
      data: {
        id: record.id,
        logged_at: record.created_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "server_error", message: err.message } },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { listDataSources } from "@/lib/db/store";

export async function GET() {
  try {
    const sources = await listDataSources();
    return NextResponse.json({
      ok: true,
      data: {
        total: sources.length,
        count: sources.length,
        sources,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "server_error", message: err.message } },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { exportStoreSnapshot, restoreStoreSnapshot } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  try {
    const snapshot = await exportStoreSnapshot();
    const filename = `homeogen-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;

    return new NextResponse(JSON.stringify(snapshot, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to generate backup" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "Invalid backup JSON payload" },
        { status: 400 }
      );
    }

    const result = await restoreStoreSnapshot(body);
    return NextResponse.json({ ok: true, data: result }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to restore backup" },
      { status: 500 }
    );
  }
}

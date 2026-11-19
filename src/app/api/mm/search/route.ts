import { NextRequest, NextResponse } from "next/server";
import { searchMateriaMedicaPassages } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "empty_query",
            message: "Search query 'q' cannot be empty.",
          },
        },
        { status: 400 }
      );
    }

    const passages = await searchMateriaMedicaPassages(query);

    return NextResponse.json({
      ok: true,
      data: {
        query,
        count: passages.length,
        passages,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "server_error", message: err.message } },
      { status: 500 }
    );
  }
}

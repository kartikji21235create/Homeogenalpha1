import { NextRequest, NextResponse } from "next/server";
import { hybridSearch } from "@/lib/retrieval";
import { db } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json(
        { ok: false, error: { code: "empty_query", message: "Search query 'q' cannot be empty." } },
        { status: 400 }
      );
    }

    const candidates = hybridSearch(query, db.rubrics, db.synonyms, { limit: 20 });

    return NextResponse.json({
      ok: true,
      data: {
        query,
        count: candidates.length,
        rubrics: candidates.map((c) => ({
          rubric_id: c.rubric_id,
          rubric_path: c.rubric_path,
          chapter: c.chapter,
          rrf_score: c.rrf_score,
        })),
      },
    });
  } catch (err: any) {
    console.error("[GET /api/rubrics/search error]", err);
    return NextResponse.json(
      { ok: false, error: { code: "server_error", message: err.message || "Rubric search failed." } },
      { status: 500 }
    );
  }
}

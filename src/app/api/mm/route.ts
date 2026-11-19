import { NextRequest, NextResponse } from "next/server";
import { listMateriaMedica } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || url.searchParams.get("q") || undefined;

    const remedies = await listMateriaMedica(search);

    return NextResponse.json({
      ok: true,
      data: {
        total: remedies.length,
        count: remedies.length,
        remedies: remedies.map((r) => ({
          id: r.id,
          common_name: r.common_name,
          abbreviation: r.abbreviation,
          latin_name: r.latin_name,
          source_origin: r.source_origin,
          constitution: r.constitution,
          keynotes: r.keynotes,
          passages_count: r.cited_passages.length,
        })),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "server_error", message: err.message } },
      { status: 500 }
    );
  }
}

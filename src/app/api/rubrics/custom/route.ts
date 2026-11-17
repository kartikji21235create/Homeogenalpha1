import { NextRequest, NextResponse } from "next/server";
import { listCustomRubrics, createCustomRubric } from "@/lib/db/store";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const [auth, authError] = await requireAuth();
    if (authError || !auth) return authError!;

    const rubrics = await listCustomRubrics(auth.doctorId);
    return NextResponse.json({
      ok: true,
      data: {
        rubrics,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "server_error", message: err.message } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const [auth, authError] = await requireAuth();
    if (authError || !auth) return authError!;

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { ok: false, error: { code: "invalid_json", message: "Request body must be valid JSON." } },
        { status: 400 }
      );
    }
    const { rubric_path, chapter, notes, contributor } = body;

    if (!rubric_path || !chapter) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "missing_fields",
            message: "rubric_path and chapter are required.",
          },
        },
        { status: 422 }
      );
    }

    const custom = await createCustomRubric(auth.doctorId, {
      rubric_path: String(rubric_path).trim(),
      chapter: String(chapter).trim(),
      notes: notes ? String(notes).trim() : undefined,
      contributor: contributor ? String(contributor).trim() : "Verified Doctor Experience",
    });

    return NextResponse.json(
      {
        ok: true,
        data: custom,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "server_error", message: err.message } },
      { status: 500 }
    );
  }
}

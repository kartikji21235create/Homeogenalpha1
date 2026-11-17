import { NextRequest, NextResponse } from "next/server";
import {
  listCaseFolders,
  createCaseFolder,
  assignCaseFolder,
} from "@/lib/db/store";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const [auth, authError] = await requireAuth();
    if (authError || !auth) return authError!;

    const folders = await listCaseFolders(auth.doctorId);
    return NextResponse.json({
      ok: true,
      data: {
        folders,
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
    const { name, color } = body;

    if (!name) {
      return NextResponse.json(
        { ok: false, error: { code: "missing_name", message: "Folder name is required." } },
        { status: 422 }
      );
    }

    const folder = await createCaseFolder(auth.doctorId, String(name).trim(), color);
    return NextResponse.json(
      {
        ok: true,
        data: folder,
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

export async function PUT(req: NextRequest) {
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
    const { consultation_id, folder_id } = body;

    if (!consultation_id || !folder_id) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "missing_fields",
            message: "consultation_id and folder_id are required.",
          },
        },
        { status: 422 }
      );
    }

    await assignCaseFolder(consultation_id, folder_id);

    return NextResponse.json({
      ok: true,
      data: {
        consultation_id,
        folder_id,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "server_error", message: err.message } },
      { status: 500 }
    );
  }
}

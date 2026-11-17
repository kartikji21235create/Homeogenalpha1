import { NextRequest, NextResponse } from "next/server";
import { deletePatientCascading } from "@/lib/db/store";
import { requireAuth } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const [auth, authError] = await requireAuth();
    if (authError || !auth) return authError!;

    const { id } = await context.params;

    const result = await deletePatientCascading(id, auth.doctorId);

    return NextResponse.json({
      ok: true,
      data: result,
    });
  } catch (err: any) {
    if (err.code === "not_found") {
      return NextResponse.json(
        { ok: false, error: { code: "not_found", message: err.message } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ok: false, error: { code: "server_error", message: err.message } },
      { status: 500 }
    );
  }
}

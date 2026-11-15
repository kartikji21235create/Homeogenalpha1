import { NextRequest, NextResponse } from "next/server";
import { deletePatientCascading } from "@/lib/db/store";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const doctorId = "00000000-0000-0000-0000-000000000001";

    const result = await deletePatientCascading(id, doctorId);

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

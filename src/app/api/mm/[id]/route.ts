import { NextRequest, NextResponse } from "next/server";
import { getMateriaMedicaMonograph } from "@/lib/db/store";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const remedy = await getMateriaMedicaMonograph(id);

    if (!remedy) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "not_found",
            message: `Materia Medica entry for '${id}' not found.`,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: remedy,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "server_error", message: err.message } },
      { status: 500 }
    );
  }
}

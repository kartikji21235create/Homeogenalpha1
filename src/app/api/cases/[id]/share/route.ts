import { NextRequest, NextResponse } from "next/server";
import { getConsultation, createShareLink } from "@/lib/db/store";
import { requireAuth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const [auth, authError] = await requireAuth();
    if (authError || !auth) return authError!;

    const { id } = await context.params;
    const consultation = await getConsultation(id);
    if (!consultation) {
      return NextResponse.json(
        { ok: false, error: { code: "not_found", message: "Case not found." } },
        { status: 404 }
      );
    }

    if (consultation.doctor_id !== auth.doctorId) {
      return NextResponse.json(
        { ok: false, error: { code: "forbidden", message: "Forbidden." } },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const durationHours = Number(body.durationHours) || 168; // default 7 days

    const share = await createShareLink(id, auth.doctorId, durationHours);

    const origin = req.nextUrl.origin || "";
    const shareUrl = `${origin}/share/${share.token}`;

    return NextResponse.json({
      ok: true,
      data: {
        token: share.token,
        share_url: shareUrl,
        expires_at: share.expires_at,
      },
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "server_error", message: err.message } },
      { status: 500 }
    );
  }
}

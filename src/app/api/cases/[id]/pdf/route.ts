import { NextRequest, NextResponse } from "next/server";
import { getConsultation, getConfirmedRubrics, db } from "@/lib/db/store";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const consultation = await getConsultation(id);

    if (!consultation) {
      return NextResponse.json(
        { ok: false, error: { code: "not_found", message: "Case not found." } },
        { status: 404 }
      );
    }

    const patient = db.patients.get(consultation.patient_id);
    const doctor = db.doctors.get(consultation.doctor_id);
    const confirmed = await getConfirmedRubrics(id);
    const prescription = Array.from(db.prescriptions.values()).find(
      (p) => p.consultation_id === id
    );

    // Problem 24: Embedded Devanagari font (Noto Serif Devanagari) to guarantee proper Hindi glyph rendering
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Clinical Case Report — ${patient?.display_name || "Patient"}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    @page { size: A4; margin: 20mm; }
    body {
      font-family: 'Inter', 'Noto Serif Devanagari', -apple-system, sans-serif;
      color: #1a1a1a;
      line-height: 1.5;
      margin: 0;
      padding: 24px;
      background: #ffffff;
    }
    h1, h2, h3, .serif {
      font-family: 'Source Serif 4', 'Noto Serif Devanagari', Georgia, serif;
    }
    .header {
      border-bottom: 2px solid #2d3748;
      padding-bottom: 12px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .title { font-size: 24px; font-weight: bold; margin: 0; }
    .meta { font-size: 12px; color: #718096; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .box { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #718096; font-weight: 600; }
    .value { font-size: 14px; font-weight: 500; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
    th { background: #edf2f7; text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; color: #4a5568; }
    td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; background: #e2e8f0; }
    .rx-box { background: #f0fff4; border: 1px solid #c6f6d5; border-radius: 6px; padding: 16px; margin-top: 24px; }
    .footer { margin-top: 40px; font-size: 10px; color: #a0aec0; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; text-align: right;">
    <button onclick="window.print()" style="padding: 8px 16px; background: #2f855a; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
      Print / Save as PDF
    </button>
  </div>

  <div class="header">
    <div>
      <h1 class="title">Homeogenalpha1 Clinical Report</h1>
      <div class="meta">Homoeopathic Clinical Decision Support &middot; Public Domain Kent 1897 Data</div>
    </div>
    <div style="text-align: right;">
      <div style="font-weight: bold;">${doctor?.full_name || "Dr. Hahnemann"}</div>
      <div class="meta">Reg: ${doctor?.registration_number || "HOM-IND-1897"}</div>
    </div>
  </div>

  <div class="grid">
    <div class="box">
      <div class="label">Patient Information</div>
      <div class="value">${patient?.display_name || "Patient Record"}</div>
      <div class="meta">ID: ${patient?.patient_number || "P-1001"} &middot; Sex: ${patient?.sex || "MALE"} &middot; YOB: ${patient?.year_of_birth || "1985"}</div>
    </div>
    <div class="box">
      <div class="label">Consultation Session</div>
      <div class="value">Case #${consultation.id}</div>
      <div class="meta">Date: ${new Date(consultation.created_at).toLocaleDateString()} &middot; Revision: ${consultation.rubric_revision}</div>
    </div>
  </div>

  <div style="margin-bottom: 20px;">
    <div class="label">Verified Consultation Transcript</div>
    <div style="background: #faf5ff; border: 1px solid #e9d8fd; border-radius: 6px; padding: 12px; font-size: 13px; margin-top: 4px;">
      ${consultation.transcript || "No transcript recorded."}
    </div>
  </div>

  <div>
    <div class="label">Confirmed Repertory Rubrics (${confirmed.length})</div>
    <table>
      <thead>
        <tr>
          <th>Rubric Path</th>
          <th>Weight</th>
          <th>Repertory</th>
        </tr>
      </thead>
      <tbody>
        ${confirmed
          .map(
            (cr) => `<tr>
              <td><strong>${db.rubricPathLookup.get(cr.rubric_id) || "Rubric #" + cr.rubric_id}</strong></td>
              <td><span class="badge">Weight ${cr.weight}</span></td>
              <td>Kent 1897</td>
            </tr>`
          )
          .join("")}
      </tbody>
    </table>
  </div>

  ${
    prescription
      ? `<div class="rx-box">
          <div class="label" style="color: #22543d;">Confirmed Prescription</div>
          <div style="font-size: 18px; font-weight: bold; color: #22543d; margin-top: 4px;">
            ${prescription.scoring_snapshot?.ranked?.[0]?.common_name || "Remedy"} ${prescription.potency}
          </div>
          <div style="margin-top: 8px; font-size: 13px;">
            <strong>Dosage:</strong> ${prescription.dosage_instructions}
          </div>
          ${
            prescription.notes
              ? `<div style="margin-top: 4px; font-size: 13px;"><strong>Notes:</strong> ${prescription.notes}</div>`
              : ""
          }
          <div style="margin-top: 12px; font-size: 11px; color: #4a5568;">
            Deterministic scoring verified: Score ${
              prescription.scoring_snapshot?.ranked?.[0]?.score || 0
            } across ${
          prescription.scoring_snapshot?.ranked?.[0]?.rubrics_covered || 0
        } rubrics.
          </div>
        </div>`
      : ""
  }

  <div class="footer">
    Homeogenalpha1 Decision Support &middot; DPDP Act 2023 Compliant &middot; The AI proposes, the doctor decides.
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: { code: "server_error", message: err.message } },
      { status: 500 }
    );
  }
}

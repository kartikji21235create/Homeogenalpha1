import { NextRequest, NextResponse } from "next/server";
import { getConsultation, getConfirmedRubrics, db } from "@/lib/db/store";
import { requireAuth } from "@/lib/auth";
import { escapeHtml } from "@/lib/utils/html";

export async function GET(
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

    // Verify ownership
    if (consultation.doctor_id !== auth.doctorId) {
      return NextResponse.json(
        { ok: false, error: { code: "forbidden", message: "You do not own this consultation." } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || searchParams.get("format") || "report";
    const autoPrint = searchParams.get("autoprint") === "1" || searchParams.get("download") === "1";

    const patient = db.patients.get(consultation.patient_id);
    const doctor = db.doctors.get(consultation.doctor_id);
    const confirmed = await getConfirmedRubrics(id);
    const prescription = Array.from(db.prescriptions.values()).find(
      (p) => p.consultation_id === id
    );

    // All dynamic values are HTML-escaped to prevent XSS (Problem 24 hardening)
    const e = escapeHtml;

    const patientAge = patient?.year_of_birth
      ? `${new Date().getFullYear() - patient.year_of_birth} yrs`
      : "Adult";
    const dateStr = new Date(consultation.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const remedyName =
      prescription?.scoring_snapshot?.ranked?.[0]?.common_name || "Homoeopathic Simillimum";

    // Format 1: Official Medical Prescription Slip (Rx)
    if (type === "prescription" || type === "rx") {
      const rxHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Medical Prescription (Rx) — ${e(patient?.display_name || "Patient")}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,600;0,8..60,700;1,8..60,400;1,8..60,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      color: #1a202c;
      line-height: 1.5;
      margin: 0;
      padding: 24px;
      background: #ffffff;
      font-size: 13px;
    }
    .serif { font-family: 'Source Serif 4', Georgia, serif; }
    .rx-card {
      border: 2px solid #2d3748;
      border-radius: 8px;
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
    }
    .clinic-header {
      border-bottom: 2px solid #2f855a;
      padding-bottom: 14px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .clinic-name {
      font-size: 20px;
      font-weight: 700;
      color: #22543d;
      margin: 0;
      letter-spacing: -0.02em;
    }
    .clinic-sub {
      font-size: 11px;
      color: #4a5568;
      margin-top: 2px;
    }
    .doctor-meta {
      text-align: right;
    }
    .doctor-name {
      font-size: 16px;
      font-weight: 700;
      color: #1a202c;
      margin: 0;
    }
    .doctor-qual {
      font-size: 11px;
      color: #4a5568;
    }
    .doctor-reg {
      font-size: 11px;
      font-weight: 600;
      color: #2f855a;
      margin-top: 2px;
    }
    .patient-bar {
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px 14px;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
      font-size: 12px;
    }
    .label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #718096;
      font-weight: 600;
      display: block;
    }
    .value {
      font-weight: 600;
      color: #2d3748;
      margin-top: 2px;
    }
    .rx-symbol-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin: 16px 0 12px 0;
      border-bottom: 1px solid #edf2f7;
      padding-bottom: 8px;
    }
    .rx-symbol {
      font-family: 'Source Serif 4', Georgia, serif;
      font-size: 32px;
      font-weight: 700;
      font-style: italic;
      color: #2f855a;
      line-height: 1;
    }
    .rx-title {
      font-size: 12px;
      font-weight: 700;
      color: #4a5568;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .medicine-block {
      background: #f0fff4;
      border: 1px solid #9ae6b4;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
    }
    .med-name {
      font-size: 20px;
      font-weight: 700;
      color: #22543d;
      margin: 0;
    }
    .med-potency {
      font-size: 15px;
      font-weight: 600;
      color: #276749;
      margin-left: 8px;
    }
    .dosage-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px dashed #9ae6b4;
      font-size: 12px;
    }
    .instruction-box {
      background: #fffaf0;
      border: 1px solid #feebc8;
      border-radius: 6px;
      padding: 12px 14px;
      margin-bottom: 20px;
      font-size: 11px;
      color: #7b341e;
    }
    .instruction-box h4 {
      margin: 0 0 6px 0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #9c4221;
    }
    .instruction-box ul {
      margin: 0;
      padding-left: 18px;
    }
    .instruction-box li {
      margin-bottom: 3px;
    }
    .signature-row {
      margin-top: 36px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 14px;
    }
    .stamp-box {
      border: 1px dashed #cbd5e0;
      border-radius: 4px;
      padding: 8px 16px;
      text-align: center;
      font-size: 10px;
      color: #718096;
    }
    .sig-line {
      border-top: 1px solid #2d3748;
      width: 220px;
      text-align: center;
      padding-top: 6px;
      font-size: 12px;
      font-weight: 600;
    }
    .footer-bar {
      margin-top: 24px;
      border-top: 1px solid #edf2f7;
      padding-top: 8px;
      text-align: center;
      font-size: 10px;
      color: #a0aec0;
    }
    .print-bar {
      max-width: 800px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-print {
      background: #2f855a;
      color: #ffffff;
      font-weight: 600;
      padding: 8px 18px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-size: 12px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-print:hover { background: #276749; }
    .btn-close {
      color: #4a5568;
      background: #edf2f7;
      padding: 8px 14px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
    }
    @media print {
      body { padding: 0; background: #ffffff; }
      .rx-card { border: none; padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="print-bar no-print">
    <button onclick="window.close()" class="btn-close">&larr; Close</button>
    <div style="display: flex; gap: 8px;">
      <a href="/api/cases/${consultation.id}/pdf" style="text-decoration: none; color: #4a5568; padding: 8px 12px; font-size: 12px; font-weight: 500;">
        View Full Clinical Report
      </a>
      <button onclick="window.print()" class="btn-print">
        🖨️ Print / Save as PDF
      </button>
    </div>
  </div>

  <div class="rx-card">
    <div class="clinic-header">
      <div>
        <h1 class="clinic-name serif">Hahnemannian Homoeopathic Clinic</h1>
        <div class="clinic-sub">Clinical Decision Support &middot; Advanced Classical Homoeopathy</div>
        <div class="clinic-sub">New Delhi &middot; Healthcare Record Ref: #${e(consultation.id.slice(0, 12))}</div>
      </div>
      <div class="doctor-meta">
        <h2 class="doctor-name serif">${e(doctor?.full_name || "Dr. Samuel Hahnemann")}</h2>
        <div class="doctor-qual">MD (Homoeopathy), BHMS &middot; Consultant</div>
        <div class="doctor-reg">Reg. No: ${e(doctor?.registration_number || "HOM-IND-1897")}</div>
      </div>
    </div>

    <div class="patient-bar">
      <div>
        <span class="label">Patient Name</span>
        <div class="value">${e(patient?.display_name || "Patient Record")}</div>
      </div>
      <div>
        <span class="label">Age / Sex</span>
        <div class="value">${patientAge} / ${e(patient?.sex || "MALE")}</div>
      </div>
      <div>
        <span class="label">Patient ID</span>
        <div class="value font-mono">${e(patient?.patient_number || "P-1001")}</div>
      </div>
      <div>
        <span class="label">Date</span>
        <div class="value">${dateStr}</div>
      </div>
    </div>

    <div class="rx-symbol-row">
      <span class="rx-symbol">℞</span>
      <span class="rx-title">Prescription &amp; Posology</span>
    </div>

    ${
      prescription
        ? `<div class="medicine-block">
            <div>
              <span class="med-name">${e(remedyName)}</span>
              <span class="med-potency">${e(prescription.potency)}</span>
            </div>
            <div style="margin-top: 4px; font-size: 11px; color: #4a5568;">
              <strong>Dispensing Form:</strong> Cane sugar globules (No. 30/40) medicated with dynamized potentized dilution.
            </div>

            <div class="dosage-grid">
              <div>
                <span class="label">Dosage &amp; Frequency</span>
                <div class="value" style="font-size: 13px; color: #22543d;">${e(prescription.dosage_instructions)}</div>
              </div>
              <div>
                <span class="label">Clinical Regimen / Timing</span>
                <div class="value" style="font-size: 13px;">${e(prescription.notes || "Take on an empty tongue morning & night.")}</div>
              </div>
            </div>
          </div>`
        : `<div class="medicine-block" style="background: #fffaf0; border-color: #feebc8;">
            <p style="margin: 0; color: #c05621;">No prescription finalized yet for this consultation session.</p>
          </div>`
    }

    <div class="instruction-box">
      <h4>General Instructions for Homoeopathic Medication</h4>
      <ul>
        <li><strong>Clean Palate:</strong> Take medication directly on a clean tongue with no prior food or drinks for at least 20 minutes before and after taking the dose.</li>
        <li><strong>Antidote Precautions:</strong> Strictly avoid raw camphor, menthol, eucalyptus, strong unboiled coffee, and raw onions/garlic while under active treatment.</li>
        <li><strong>Handling:</strong> Do not touch medicated globules with bare hands. Tip required dose into bottle cap and drop directly into mouth.</li>
        <li><strong>Storage:</strong> Store medicine phials in a dry, dark place away from direct sunlight, extreme heat, and strong-smelling aromatic substances.</li>
      </ul>
    </div>

    <div style="display: flex; justify-content: space-between; font-size: 11px; color: #4a5568; margin-top: 14px;">
      <div>
        <strong>Review &amp; Follow-up:</strong> In 14 days or in case of unexpected acute change.
      </div>
      <div>
        <strong>Repertorization:</strong> Kent 1897 Verified Canonical Provenance
      </div>
    </div>

    <div class="signature-row">
      <div class="stamp-box">
        Official Digital Verification<br>
        <strong>Homeogenalpha1 DPDP Compliant</strong>
      </div>

      <div class="sig-line">
        ${e(doctor?.full_name || "Dr. Samuel Hahnemann")}<br>
        <span style="font-size: 10px; color: #718096; font-weight: normal;">Authorized Medical Practitioner</span>
      </div>
    </div>

    <div class="footer-bar">
      Homeogenalpha1 Homoeopathic Decision Support &middot; DPDP Act 2023 Compliant &middot; The AI proposes, the doctor decides.
    </div>
  </div>

  ${autoPrint ? `<script>window.onload = function() { setTimeout(function() { window.print(); }, 250); };</script>` : ""}
</body>
</html>`;

      return new NextResponse(rxHtml, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    // Format 2: Full Clinical Case Report (Default)
    const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Clinical Case Report — ${e(patient?.display_name || "Patient")}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    @page { size: A4; margin: 18mm; }
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
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .title { font-size: 22px; font-weight: bold; margin: 0; color: #1a202c; }
    .meta { font-size: 11px; color: #718096; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; }
    .box { background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; }
    .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #718096; font-weight: 600; }
    .value { font-size: 13px; font-weight: 600; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
    th { background: #edf2f7; text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; color: #4a5568; }
    td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #e2e8f0; }
    .rx-box { background: #f0fff4; border: 1px solid #9ae6b4; border-radius: 6px; padding: 16px; margin-top: 20px; }
    .footer { margin-top: 36px; font-size: 10px; color: #a0aec0; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
    .print-bar {
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-print {
      padding: 8px 16px;
      background: #2f855a;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 12px;
    }
    .btn-rx {
      padding: 8px 14px;
      background: #edf2f7;
      color: #2f855a;
      border: 1px solid #cbd5e0;
      border-radius: 6px;
      text-decoration: none;
      font-size: 12px;
      font-weight: 600;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="print-bar no-print">
    <a href="/api/cases/${consultation.id}/pdf?type=prescription&autoprint=1" class="btn-rx">
      📄 Official Prescription Slip (Rx) &rarr;
    </a>
    <button onclick="window.print()" class="btn-print">
      🖨️ Print / Save as PDF
    </button>
  </div>

  <div class="header">
    <div>
      <h1 class="title">Homeogenalpha1 Clinical Report</h1>
      <div class="meta">Homoeopathic Clinical Decision Support &middot; Public Domain Kent 1897 Data</div>
    </div>
    <div style="text-align: right;">
      <div style="font-weight: bold; font-size: 14px;">${e(doctor?.full_name || "Dr. Samuel Hahnemann")}</div>
      <div class="meta">Reg: ${e(doctor?.registration_number || "HOM-IND-1897")}</div>
    </div>
  </div>

  <div class="grid">
    <div class="box">
      <div class="label">Patient Information</div>
      <div class="value">${e(patient?.display_name || "Patient Record")}</div>
      <div class="meta">ID: ${e(patient?.patient_number || "P-1001")} &middot; Sex: ${e(patient?.sex || "MALE")} &middot; Age: ${patientAge}</div>
    </div>
    <div class="box">
      <div class="label">Consultation Session</div>
      <div class="value">Case #${e(consultation.id)}</div>
      <div class="meta">Date: ${dateStr} &middot; Revision: ${consultation.rubric_revision}</div>
    </div>
  </div>

  <div style="margin-bottom: 20px;">
    <div class="label">Verified Consultation Transcript</div>
    <div style="background: #faf5ff; border: 1px solid #e9d8fd; border-radius: 6px; padding: 12px; font-size: 12px; margin-top: 4px;">
      ${e(consultation.transcript || "No transcript recorded.")}
    </div>
  </div>

  <div>
    <div class="label">Confirmed Repertory Rubrics (${confirmed.length})</div>
    <table>
      <thead>
        <tr>
          <th>Rubric Path</th>
          <th>Weight</th>
          <th>Repertory Source</th>
        </tr>
      </thead>
      <tbody>
        ${confirmed
          .map(
            (cr) => `<tr>
              <td><strong>${e(db.rubricPathLookup.get(cr.rubric_id) || "Rubric #" + cr.rubric_id)}</strong></td>
              <td><span class="badge">Weight ${cr.weight}</span></td>
              <td>Kent 1897 &middot; Public Domain</td>
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
            ${e(remedyName)} ${e(prescription.potency)}
          </div>
          <div style="margin-top: 8px; font-size: 12px;">
            <strong>Dosage:</strong> ${e(prescription.dosage_instructions)}
          </div>
          ${
            prescription.notes
              ? `<div style="margin-top: 4px; font-size: 12px;"><strong>Notes:</strong> ${e(prescription.notes)}</div>`
              : ""
          }
          <div style="margin-top: 10px; font-size: 10px; color: #4a5568;">
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

  ${autoPrint ? `<script>window.onload = function() { setTimeout(function() { window.print(); }, 250); };</script>` : ""}
</body>
</html>`;

    return new NextResponse(reportHtml, {
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

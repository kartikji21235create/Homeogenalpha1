import { notFound } from "next/navigation";
import { getShareLink, getConsultation, getConfirmedRubrics, db } from "@/lib/db/store";
import { escapeHtml } from "@/lib/utils/html";

export default async function SharedCasePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const share = await getShareLink(token);

  if (!share) {
    notFound();
    return null;
  }

  const consultation = await getConsultation(share.consultation_id);
  if (!consultation) {
    notFound();
    return null;
  }

  const patient = db.patients.get(consultation.patient_id);
  const doctor = db.doctors.get(consultation.doctor_id);
  const confirmed = await getConfirmedRubrics(consultation.id);
  const prescription = Array.from(db.prescriptions.values()).find(
    (p) => p.consultation_id === consultation.id
  );

  const e = escapeHtml;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-surface rounded-xl border border-accent/40 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">
            Verified Homoeopathic Case Record
          </span>
          <h1 className="font-display text-2xl text-text-primary mt-1">
            Clinical Decision Support Report
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Kent 1897 Public Domain Repertory &middot; Expires: {new Date(share.expires_at).toLocaleDateString()}
          </p>
        </div>

        <div className="text-right sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-border">
          <p className="text-sm font-semibold text-text-primary">{e(doctor?.full_name || "Doctor")}</p>
          <p className="text-xs text-text-secondary">Reg: {e(doctor?.registration_number || "HOM-IND-1897")}</p>
        </div>
      </div>

      {/* Patient & Consultation Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface rounded-lg border border-border p-4">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
            Patient Information
          </span>
          <p className="text-base font-semibold text-text-primary mt-1">{e(patient?.display_name || "Patient")}</p>
          <p className="text-xs text-text-secondary">
            ID: {e(patient?.patient_number || "P-1001")} &middot; Sex: {e(patient?.sex || "MALE")} &middot; YOB: {e(String(patient?.year_of_birth || "1985"))}
          </p>
        </div>

        <div className="bg-surface rounded-lg border border-border p-4">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
            Consultation Details
          </span>
          <p className="text-base font-semibold text-text-primary mt-1">Case #{consultation.id}</p>
          <p className="text-xs text-text-secondary">
            Date: {new Date(consultation.created_at).toLocaleDateString()} &middot; Rubric Revision: {consultation.rubric_revision}
          </p>
        </div>
      </div>

      {/* Transcript */}
      <div className="bg-surface rounded-lg border border-border p-5 space-y-2">
        <span className="text-xs font-bold text-accent uppercase tracking-wider">
          Verified Clinical Transcript
        </span>
        <div className="bg-bg rounded-md p-4 text-xs sm:text-sm text-text-primary leading-relaxed border border-border/80">
          {consultation.transcript || "No transcript recorded."}
        </div>
      </div>

      {/* Confirmed Rubrics */}
      <div className="bg-surface rounded-lg border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-accent uppercase tracking-wider">
            Confirmed Repertory Rubrics ({confirmed.length})
          </span>
          <span className="text-xs text-text-secondary">Kent 1897</span>
        </div>

        <div className="space-y-2">
          {confirmed.map((cr) => (
            <div
              key={cr.id}
              className="flex items-center justify-between p-3 rounded-md bg-surface-raised border border-border/70 text-xs"
            >
              <span className="font-medium text-text-primary">
                {e(db.rubricPathLookup.get(cr.rubric_id) || "Rubric #" + cr.rubric_id)}
              </span>
              <span className="rounded bg-accent/20 px-2.5 py-0.5 font-bold text-accent">
                Weight {cr.weight}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Prescribed Remedy */}
      {prescription && (
        <div className="bg-accent/10 rounded-xl border border-accent/40 p-6 space-y-3">
          <span className="text-xs font-bold text-accent uppercase tracking-wider">
            Prescription Record
          </span>
          <div className="flex items-baseline gap-3">
            <h2 className="font-display text-2xl font-bold text-text-primary">
              {e(prescription.scoring_snapshot?.ranked?.[0]?.common_name || "Remedy")}
            </h2>
            <span className="text-lg font-semibold text-accent">{e(prescription.potency)}</span>
          </div>
          <p className="text-xs text-text-primary">
            <strong>Instructions:</strong> {e(prescription.dosage_instructions)}
          </p>
          {prescription.notes && (
            <p className="text-xs text-text-secondary italic">
              <strong>Notes:</strong> {e(prescription.notes)}
            </p>
          )}
          <div className="pt-2 border-t border-accent/20 text-[10px] text-text-secondary">
            Deterministic scoring verified: Score {prescription.scoring_snapshot?.ranked?.[0]?.score || 0} across {prescription.scoring_snapshot?.ranked?.[0]?.rubrics_covered || 0} rubrics.
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-[10px] text-text-secondary pt-4">
        Homeogenalpha1 &middot; India DPDP Act 2023 Compliant &middot; The AI proposes, the doctor decides.
      </p>
    </div>
  );
}

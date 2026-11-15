import React from "react";
import Link from "next/link";

export default function PrivacyNoticePage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 space-y-10 text-text-primary">
      <div className="space-y-2 border-b border-border pb-6">
        <span className="text-xs font-semibold text-accent uppercase tracking-wider">
          Compliance &amp; Data Governance
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Privacy Notice &amp; DPDP Disclosure
        </h1>
        <p className="text-sm text-text-secondary">
          Compliance declaration under the Digital Personal Data Protection Act (DPDP), 2023 and Rules (Nov 2025).
        </p>
      </div>

      <section className="space-y-4 text-sm leading-relaxed text-text-secondary">
        <h2 className="font-display text-xl font-semibold text-text-primary">
          1. Data Fiduciary &amp; Purpose Specification
        </h2>
        <p>
          Homeogenalpha1 operates solely as a clinical decision-support tool under the direction and supervision of licensed homoeopathic medical practitioners. We process patient consultation transcripts exclusively for the purpose of identifying clinical symptoms and proposing reference rubrics from public domain homoeopathic repertories.
        </p>
      </section>

      <section className="space-y-4 text-sm leading-relaxed text-text-secondary">
        <h2 className="font-display text-xl font-semibold text-text-primary">
          2. Technical De-Identification &amp; Redaction Controls
        </h2>
        <p>
          In adherence to strict privacy safeguards:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-2">
          <li>
            <strong className="text-text-primary">Automatic Pattern Redaction:</strong> Before any narrative text is transmitted to an AI model provider, names, phone numbers, and email patterns are systematically redacted.
          </li>
          <li>
            <strong className="text-text-primary">No Audio or PII on Disk:</strong> Release 1 operates strictly in typed-text mode. No audio files or raw voice recordings are stored or persisted on disk.
          </li>
          <li>
            <strong className="text-text-primary">No Model Training on Patient Data:</strong> We explicitly prohibit AI model providers from utilizing customer consultation transcripts for foundation model training or retraining.
          </li>
        </ul>
      </section>

      <section className="space-y-4 text-sm leading-relaxed text-text-secondary">
        <h2 className="font-display text-xl font-semibold text-text-primary">
          3. Data Retention &amp; Cascading Erasure Rights
        </h2>
        <p>
          In accordance with National Medical Commission (NMC) professional conduct guidelines and the DPDP Act:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-2">
          <li>
            <strong className="text-text-primary">Retention Period:</strong> Consultation records and prescription snapshots are retained for a default duration of 3 years to ensure clinical continuity, after which they are subject to automated archival or erasure.
          </li>
          <li>
            <strong className="text-text-primary">Right to Erasure (Cascading Deletion):</strong> A patient or treating physician may request the deletion of a patient record at any time. When a patient is deleted, the system triggers an irreversible cascading deletion purging all associated consultations, symptoms, rubrics, and prescriptions.
          </li>
        </ul>
      </section>

      <section className="space-y-4 text-sm leading-relaxed text-text-secondary">
        <h2 className="font-display text-xl font-semibold text-text-primary">
          4. Grievance Redressal
        </h2>
        <p>
          For data protection inquiries or grievance redressal under DPDP Rules:
        </p>
        <div className="rounded-lg border border-border bg-surface p-4 text-xs space-y-1">
          <p><strong className="text-text-primary">Data Protection Officer:</strong> Compliance &amp; Legal Desk</p>
          <p><strong className="text-text-primary">Email:</strong> privacy@homeogen.app</p>
          <p><strong className="text-text-primary">Jurisdiction:</strong> Republic of India</p>
        </div>
      </section>

      <div className="pt-6 border-t border-border flex justify-between items-center text-xs text-text-secondary">
        <span>Last updated: November 15, 2026</span>
        <Link href="/" className="text-accent hover:underline font-semibold">
          &larr; Return to Dashboard
        </Link>
      </div>
    </main>
  );
}

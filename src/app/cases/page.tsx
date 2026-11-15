"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface ConsultationItem {
  id: string;
  patient_id: string;
  transcript: string;
  state: string;
  rubric_revision: number;
  created_at: string;
}

export default function CasesPage() {
  const [cases, setCases] = useState<ConsultationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In our app, we can fetch all cases via export or direct query
    fetch("/api/doctor/export")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.consultations) {
          setCases(data.consultations);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">
            Clinical Records
          </span>
          <h1 className="font-display text-3xl font-bold text-text-primary mt-1">
            Case Timeline &amp; History
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Review past consultations, immutable scoring snapshots, and clinical reports.
          </p>
        </div>

        <div className="flex gap-3">
          <a
            href="/api/doctor/export"
            download
            className="rounded-lg border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-text-primary hover:border-accent transition"
          >
            Export All Cases (JSON)
          </a>
          <Link
            href="/consultation"
            className="rounded-lg bg-accent px-4 py-2.5 text-xs font-semibold text-bg hover:bg-accent-strong transition"
          >
            + New Consultation
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-text-secondary text-sm">
          Loading consultation records...
        </div>
      ) : cases.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center space-y-3">
          <p className="text-base font-semibold text-text-primary">No consultation records yet.</p>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Begin by taking a new patient narrative or running an AI-assisted repertorisation.
          </p>
          <Link
            href="/consultation"
            className="inline-block mt-3 rounded-lg bg-accent px-5 py-2 text-xs font-semibold text-bg hover:bg-accent-strong transition"
          >
            Start First Case
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-border bg-surface p-5 space-y-3 hover:border-accent/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-display font-semibold text-base text-text-primary">
                    Case #{c.id.slice(0, 12)}
                  </span>
                  <span className="rounded bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent uppercase">
                    {c.state}
                  </span>
                  <span className="text-xs text-text-secondary">
                    Rev {c.rubric_revision}
                  </span>
                </div>
                <span className="text-xs text-text-secondary">
                  {new Date(c.created_at).toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-text-secondary line-clamp-2 italic bg-bg/50 p-2.5 rounded border border-border/50">
                &ldquo;{c.transcript || "No transcript"}&rdquo;
              </p>

              <div className="flex items-center justify-between pt-2 text-xs">
                <span className="text-text-secondary">
                  Patient ID: <code className="text-text-primary">{c.patient_id.slice(0, 10)}...</code>
                </span>
                <div className="flex gap-3">
                  <a
                    href={`/api/cases/${c.id}/export`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline font-medium"
                  >
                    View JSON
                  </a>
                  <a
                    href={`/api/cases/${c.id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded bg-accent/15 border border-accent/40 px-3 py-1 text-accent font-semibold hover:bg-accent hover:text-bg transition"
                  >
                    Print Case PDF &rarr;
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

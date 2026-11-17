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

interface CaseEvent {
  id: string;
  consultation_id: string;
  patient_id: string;
  doctor_id: string;
  event_type: "consultation" | "prescription" | "follow_up" | "potency_change";
  title: string;
  description: string;
  response_assessment?: "amelioration" | "aggravation" | "status_quo" | "new_symptoms";
  created_at: string;
}

export default function CasesPage() {
  const [cases, setCases] = useState<ConsultationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState<string>("All");

  // Timeline modal state
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [events, setEvents] = useState<CaseEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAssessment, setNewAssessment] = useState<
    "amelioration" | "aggravation" | "status_quo" | "new_symptoms"
  >("amelioration");
  const [savingEvent, setSavingEvent] = useState(false);

  // Sharing state
  const [activeShareCaseId, setActiveShareCaseId] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copyingShare, setCopyingShare] = useState(false);
  const [sharingInProgress, setSharingInProgress] = useState(false);

  useEffect(() => {
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

  async function openTimeline(caseId: string) {
    setSelectedCaseId(caseId);
    setLoadingEvents(true);
    setEvents([]);
    setNewTitle("");
    setNewDesc("");
    try {
      const res = await fetch(`/api/cases/${caseId}/events`);
      const data = await res.json();
      if (res.ok && data.ok) {
        setEvents(data.data.events || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  }

  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCaseId || !newTitle.trim() || !newDesc.trim()) return;

    setSavingEvent(true);
    try {
      const res = await fetch(`/api/cases/${selectedCaseId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim(),
          event_type: "follow_up",
          response_assessment: newAssessment,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setEvents((prev) => [...prev, data.data]);
        setNewTitle("");
        setNewDesc("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEvent(false);
    }
  }

  async function handleGenerateShare(caseId: string) {
    setActiveShareCaseId(caseId);
    setSharingInProgress(true);
    setShareLink(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationHours: 168 }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setShareLink(data.data.share_url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSharingInProgress(false);
    }
  }

  function handleCopyShareLink() {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    setCopyingShare(true);
    setTimeout(() => setCopyingShare(false), 2000);
  }

  const FOLDERS = ["All", "Acute", "Chronic", "Pediatric", "Skin", "Follow-ups"];

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">
            Clinical Records &middot; Release 1 MVP
          </span>
          <h1 className="font-display text-3xl font-bold text-text-primary mt-1">
            Case Timeline &amp; History
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Review past consultations, cyclical follow-ups, immutable scoring snapshots, and expiring share reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
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

      {/* Case Folders Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-text-secondary mr-2 shrink-0">Folder:</span>
        {FOLDERS.map((folder) => (
          <button
            key={folder}
            onClick={() => setActiveFolder(folder)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition shrink-0 ${
              activeFolder === folder
                ? "bg-accent text-bg"
                : "bg-surface-raised border border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            {folder}
          </button>
        ))}
      </div>

      {/* Cases List */}
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
              className="rounded-xl border border-border bg-surface p-5 space-y-4 hover:border-accent/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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

              <p className="text-xs text-text-secondary line-clamp-2 italic bg-bg/50 p-3 rounded-lg border border-border/50">
                &ldquo;{c.transcript || "No narrative recorded."}&rdquo;
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs border-t border-border/60">
                <span className="text-text-secondary">
                  Patient ID: <code className="text-text-primary">{c.patient_id.slice(0, 10)}...</code>
                </span>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => openTimeline(c.id)}
                    className="rounded bg-accent/10 border border-accent/30 px-3 py-1 font-semibold text-accent hover:bg-accent hover:text-bg transition"
                  >
                    ⏱ Timeline &amp; Follow-up
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenerateShare(c.id)}
                    className="rounded border border-border px-3 py-1 text-text-secondary hover:border-accent hover:text-text-primary transition"
                  >
                    🔗 Share (7d)
                  </button>

                  <a
                    href={`/api/cases/${c.id}/export`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-text-secondary hover:text-text-primary px-2 py-1 underline font-medium"
                  >
                    JSON
                  </a>

                  <a
                    href={`/api/cases/${c.id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded bg-accent/20 border border-accent/40 px-3 py-1 text-accent font-semibold hover:bg-accent hover:text-bg transition"
                  >
                    Print PDF &rarr;
                  </a>
                </div>
              </div>

              {/* In-line Share Link Box when triggered */}
              {activeShareCaseId === c.id && (
                <div className="rounded-lg border border-accent/40 bg-surface-raised p-3 text-xs space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-accent">Expiring Read-Only Case Link</span>
                    <button
                      onClick={() => setActiveShareCaseId(null)}
                      className="text-text-secondary hover:text-text-primary"
                    >
                      ✕
                    </button>
                  </div>
                  {sharingInProgress ? (
                    <p className="text-text-secondary animate-pulse">Generating token...</p>
                  ) : shareLink ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={shareLink}
                        className="w-full rounded border border-border bg-bg px-2 py-1 text-xs text-text-primary select-all"
                      />
                      <button
                        type="button"
                        onClick={handleCopyShareLink}
                        className="shrink-0 rounded bg-accent px-3 py-1 text-xs font-semibold text-bg hover:bg-accent-strong transition"
                      >
                        {copyingShare ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Case Timeline & Follow-up Modal Drawer */}
      {selectedCaseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl border border-border bg-surface shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-surface-raised">
              <div>
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                  Case Record Progression
                </span>
                <h2 className="font-display text-xl font-bold text-text-primary mt-0.5">
                  Timeline &amp; Follow-up Log
                </h2>
                <p className="text-xs text-text-secondary">Case #{selectedCaseId.slice(0, 14)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCaseId(null)}
                className="rounded-lg p-2 text-text-secondary hover:bg-surface hover:text-text-primary text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Timeline Events */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {loadingEvents ? (
                <div className="py-8 text-center text-xs text-text-secondary animate-pulse">
                  Loading timeline records...
                </div>
              ) : events.length === 0 ? (
                <div className="rounded-lg border border-border/80 bg-surface-raised p-6 text-center text-xs text-text-secondary">
                  No subsequent follow-up events recorded yet for this case. Record your first follow-up below.
                </div>
              ) : (
                <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-border/60">
                  {events.map((ev) => (
                    <div key={ev.id} className="relative flex items-start gap-4 pl-8">
                      <div className="absolute left-1.5 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-surface bg-accent" />
                      <div className="flex-1 rounded-lg border border-border bg-surface-raised p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-text-primary">{ev.title}</span>
                          <span className="text-[10px] text-text-secondary">
                            {new Date(ev.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-text-secondary leading-relaxed">{ev.description}</p>
                        {ev.response_assessment && (
                          <div className="pt-1">
                            <span
                              className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                ev.response_assessment === "amelioration"
                                  ? "bg-accent/20 text-accent"
                                  : ev.response_assessment === "aggravation"
                                  ? "bg-warn/20 text-warn"
                                  : ev.response_assessment === "new_symptoms"
                                  ? "bg-danger/20 text-danger"
                                  : "bg-surface text-text-secondary border border-border"
                              }`}
                            >
                              Response: {ev.response_assessment.replace("_", " ")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Follow-up Event Form */}
              <form
                onSubmit={handleAddEvent}
                className="rounded-xl border border-accent/30 bg-surface-raised p-4 space-y-3 mt-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">
                    Log Clinical Follow-up Observation
                  </span>
                  <span className="text-[10px] text-text-secondary">Hering&apos;s Law Assessment</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                      Event Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Day 14 Follow-up Review"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full rounded border border-border bg-bg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                      Patient Response Assessment
                    </label>
                    <select
                      value={newAssessment}
                      onChange={(e: any) => setNewAssessment(e.target.value)}
                      className="w-full rounded border border-border bg-bg px-2.5 py-1.5 text-xs font-medium text-text-primary focus:outline-none focus:border-accent"
                    >
                      <option value="amelioration">Amelioration (Improving / Relief)</option>
                      <option value="aggravation">Aggravation (Homeopathic Aggravation)</option>
                      <option value="status_quo">Status Quo (No Change)</option>
                      <option value="new_symptoms">New Symptoms Appeared</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                    Clinical Notes &amp; Observations
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Document changes in modalities, energy levels, sleep, mentals, and physical symptoms..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full rounded border border-border bg-bg p-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={savingEvent || !newTitle.trim() || !newDesc.trim()}
                    className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-bg hover:bg-accent-strong disabled:opacity-50 transition"
                  >
                    {savingEvent ? "Saving..." : "Record Follow-up Event"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

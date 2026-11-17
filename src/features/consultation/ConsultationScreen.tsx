"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useMachine } from "@xstate/react";
import { consultationMachine } from "./machine";
import { Stepper } from "./Stepper";
import { RubricSearchModal } from "./RubricSearchModal";

export function ConsultationScreen() {
  const searchParams = useSearchParams();
  const [state, send] = useMachine(consultationMachine);
  const [narrativeInput, setNarrativeInput] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "matrix">("matrix");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    const urlPatientId = searchParams.get("patientId");
    const urlPatientName = searchParams.get("name");
    if (urlPatientId && urlPatientName) {
      send({
        type: "SET_PATIENT",
        patientId: urlPatientId,
        patientDisplayName: urlPatientName,
      });
    }
  }, [searchParams, send]);

  // Prescription form local state
  const [potencyInput, setPotencyInput] = useState("200C");
  const [dosageInput, setDosageInput] = useState("3 globules once daily at bedtime for 3 days");
  const [notesInput, setNotesInput] = useState("Advised to avoid coffee and strong aromatics. Review in 14 days.");

  const {
    consultationId,
    patientDisplayName,
    dpdpConsent,
    transcript,
    symptoms,
    confirmedRubrics,
    rubricRevision,
    rankedMedicines,
    selectedMedicineId,
    selectedMedicineName,
    missingInfo,
    emergencyCheck,
    errorMessage,
    staleServerRevision,
    prescriptionId,
    scoringSnapshot,
    savingPrescription,
  } = state.context;

  const current = state.value as string;

  // 1. Submit narrative for analysis
  async function handleSubmitNarrative() {
    if (!narrativeInput.trim() || !dpdpConsent) return;

    send({ type: "SUBMIT_NARRATIVE", text: narrativeInput });

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: narrativeInput,
          patient_id: state.context.patientId,
          dpdp_consent: dpdpConsent,
          patient_display_name: patientDisplayName,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        send({
          type: "ANALYSIS_FAILURE",
          message: json.error?.message || "Failed to analyze narrative.",
        });
        return;
      }

      send({
        type: "ANALYSIS_SUCCESS",
        consultationId: json.data.consultation_id,
        transcript: json.data.transcript,
        symptoms: json.data.symptoms,
        suggestedRubrics: json.data.suggested_rubrics,
        missingInfo: json.data.missing_info,
        emergencyCheck: json.data.emergency_check,
      });
    } catch (err: any) {
      send({
        type: "ANALYSIS_FAILURE",
        message: err.message || "Network error during analysis.",
      });
    }
  }

  // 2. Confirm Rubrics & Run Scoring
  async function handleConfirmRubricsAndScore() {
    if (!consultationId) return;

    // Validate weights 1-4
    const unweighted = confirmedRubrics.some((r) => !r.weight || r.weight < 1 || r.weight > 4);
    if (unweighted) {
      alert("Please ensure every rubric has an assigned weight between 1 and 4.");
      return;
    }

    send({ type: "CONFIRM_RUBRICS_START" });

    try {
      // Step A: PUT /api/rubrics/[id] to save rubrics and bump revision
      const putRes = await fetch(`/api/rubrics/${consultationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_revision: rubricRevision,
          confirmed_rubrics: confirmedRubrics.map((r) => ({
            rubric_id: r.rubric_id,
            weight: r.weight,
            doctor_edited: r.doctor_edited,
          })),
        }),
      });

      const putData = await putRes.json();
      if (putRes.status === 409) {
        send({
          type: "CONFIRM_RUBRICS_STALE_409",
          serverRevision: putData.error?.details?.current_revision || rubricRevision + 1,
        });
        return;
      }
      if (!putRes.ok || !putData.ok) {
        send({
          type: "SCORING_FAILURE",
          message: putData.error?.message || "Failed to update rubrics.",
        });
        return;
      }

      const newRevision = putData.data.rubric_revision;

      // Step B: POST /api/repertorize/[id] to calculate rankings
      const scoreRes = await fetch(`/api/repertorize/${consultationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_revision: newRevision,
          repertory_id: "kent_1897",
        }),
      });

      const scoreData = await scoreRes.json();
      if (!scoreRes.ok || !scoreData.ok) {
        send({
          type: "SCORING_FAILURE",
          message: scoreData.error?.message || "Deterministic scoring failed.",
        });
        return;
      }

      send({
        type: "SCORING_SUCCESS",
        ranked: scoreData.data.ranked,
      });
    } catch (err: any) {
      send({
        type: "SCORING_FAILURE",
        message: err.message || "Network error during scoring.",
      });
    }
  }

  // 3. Save Final Prescription
  async function handleSavePrescription() {
    if (!consultationId || !selectedMedicineId) return;

    send({ type: "SAVE_PRESCRIPTION_START" });

    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultation_id: consultationId,
          patient_id: state.context.patientId,
          medicine_id: selectedMedicineId,
          potency: potencyInput,
          dosage_instructions: dosageInput,
          notes: notesInput,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        send({
          type: "SAVE_PRESCRIPTION_FAILURE",
          message: data.error?.message || "Failed to save prescription.",
        });
        return;
      }

      send({
        type: "SET_PRESCRIPTION_DETAILS",
        potency: potencyInput,
        dosageInstructions: dosageInput,
        notes: notesInput,
      });
      send({
        type: "SAVE_PRESCRIPTION_SUCCESS",
        prescriptionId: data.data.id,
      });
    } catch (err: any) {
      send({
        type: "SAVE_PRESCRIPTION_FAILURE",
        message: err.message || "Network error while saving prescription.",
      });
    }
  }

  // Generate read-only expiring share link
  async function handleCreateShareLink() {
    if (!consultationId) return;
    setIsSharing(true);
    try {
      const res = await fetch(`/api/cases/${consultationId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationHours: 168 }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setShareUrl(data.data.share_url);
      }
    } catch {
      // silently handle
    } finally {
      setIsSharing(false);
    }
  }

  function handleCopyShare() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  }

  function handleResetToNewConsultation() {
    setNarrativeInput("");
    setShareUrl(null);
    setCopiedShare(false);
    setPotencyInput("200C");
    setDosageInput("3 globules once daily at bedtime for 3 days");
    setNotesInput("Advised to avoid coffee and strong aromatics. Review in 14 days.");
    send({ type: "RESET_TO_INTAKE" });
  }

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 md:grid-cols-[220px_1fr] gap-8 px-4 py-8">
      {/* Sidebar: Clinical Stepper */}
      <aside className="border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0 md:pr-6">
        <div className="mb-6">
          <span className="text-xs font-semibold text-accent uppercase tracking-widest">Case Record</span>
          <h2 className="text-sm font-medium text-text-primary mt-1">{patientDisplayName}</h2>
          <p className="text-xs text-text-secondary">Patient #P-1001 &middot; Male, 41y</p>
        </div>
        <Stepper current={current} />
      </aside>

      {/* Main Clinical Stage Panel */}
      <main className="space-y-6">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="rounded-lg border border-danger/60 bg-danger/10 px-4 py-3 text-sm text-danger flex items-start justify-between">
            <div>
              <strong className="font-semibold">Notice:</strong> {errorMessage}
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-4">
              {current === "INTAKE" && (
                <button
                  type="button"
                  onClick={handleSubmitNarrative}
                  className="text-xs underline hover:opacity-80 font-medium"
                >
                  Retry Analysis
                </button>
              )}
              {current === "REVIEW_RUBRICS" && (
                <button
                  type="button"
                  onClick={handleConfirmRubricsAndScore}
                  className="text-xs underline hover:opacity-80 font-medium"
                >
                  Retry Scoring
                </button>
              )}
              {current === "PRESCRIBING" && (
                <button
                  type="button"
                  onClick={handleSavePrescription}
                  className="text-xs underline hover:opacity-80 font-medium"
                >
                  Retry Save
                </button>
              )}
              <button
                type="button"
                onClick={() => send({ type: "CLEAR_ERROR" })}
                className="text-xs hover:opacity-80 text-text-secondary"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* 409 Stale revision banner */}
        {staleServerRevision !== null && (
          <div className="rounded-lg border border-warn/60 bg-warn/10 px-4 py-3 text-sm text-warn">
            <p className="font-semibold">Concurrent Case Modification Detected (Revision {staleServerRevision})</p>
            <p className="text-xs mt-1">
              Another session updated the rubrics for this consultation. Please verify your weights and confirm again to synchronize.
            </p>
          </div>
        )}

        {/* Emergency Red-Flag Banner */}
        {emergencyCheck?.detected && (
          <div className="rounded-lg border border-danger bg-danger/20 p-4 shadow-md">
            <div className="flex items-center gap-2 text-danger font-bold text-sm">
              <span className="text-lg">⚠️</span> {emergencyCheck.category} EMERGENCY PRESENTATION DETECTED
            </div>
            <p className="text-xs text-text-primary mt-1">{emergencyCheck.bannerMessage}</p>
            <p className="text-xs text-text-secondary mt-1">
              Matched symptoms: {emergencyCheck.matchedKeywords.join(", ")}
            </p>
          </div>
        )}

        {/* 1. INTAKE STATE */}
        {current === "INTAKE" && (
          <section className="bg-surface rounded-xl border border-border p-6 shadow-sm space-y-5">
            <div>
              <h1 className="font-display text-2xl text-text-primary">Clinical Intake Narrative</h1>
              <p className="text-sm text-text-secondary mt-1">
                Enter the patient&apos;s symptoms, modalities, cravings, mental state, and clinical observations.
              </p>
            </div>

            <textarea
              rows={8}
              value={narrativeInput}
              onChange={(e) => setNarrativeInput(e.target.value)}
              placeholder="e.g. 41-year-old male with severe anxiety about his health, constantly tidying and fastidious. Worse in cold air, desires warm water to sip frequently. Burning sensation in stomach..."
              className="w-full rounded-lg border border-border bg-bg p-4 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dpdpConsent}
                  onChange={(e) => send({ type: "SET_CONSENT", consent: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-border accent-accent"
                />
                <span className="text-xs text-text-secondary">
                  Patient consent obtained under DPDP rules. Direct identifiers are automatically redacted before analysis.
                </span>
              </label>

              <button
                type="button"
                disabled={!dpdpConsent || !narrativeInput.trim()}
                onClick={handleSubmitNarrative}
                className="shrink-0 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-bg hover:bg-accent-strong disabled:opacity-40 transition-all"
              >
                Extract Symptoms &amp; Rubrics
              </button>
            </div>
          </section>
        )}

        {/* 2. PROCESSING STATE */}
        {current === "PROCESSING" && (
          <section className="bg-surface rounded-xl border border-border p-12 text-center space-y-4">
            <div className="inline-block animate-spin text-3xl text-accent">⚙</div>
            <h2 className="font-display text-xl text-text-primary">Analyzing Consultation Narrative</h2>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              Extracting symptoms, redacting identifiers, running hybrid search over Kent&apos;s Repertory, and performing closed-set rubric selection...
            </p>
          </section>
        )}

        {/* 3. REVIEW_TRANSCRIPT STATE */}
        {current === "REVIEW_TRANSCRIPT" && (
          <section className="bg-surface rounded-xl border border-border p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl text-text-primary">Review &amp; Verify Transcript</h1>
                <p className="text-sm text-text-secondary mt-1">
                  Ensure narrative accuracy. You can refine or edit the text before repertorizing.
                </p>
              </div>
              <button
                onClick={handleResetToNewConsultation}
                className="text-xs text-text-secondary hover:text-text-primary underline"
              >
                Re-enter
              </button>
            </div>

            <textarea
              rows={6}
              value={transcript}
              onChange={(e) => send({ type: "EDIT_TRANSCRIPT", text: e.target.value })}
              className="w-full rounded-lg border border-border bg-bg p-4 text-sm text-text-primary focus:outline-none focus:border-accent"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => send({ type: "CONFIRM_TRANSCRIPT" })}
                className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-bg hover:bg-accent-strong transition"
              >
                Confirm Transcript &amp; Review Rubrics &rarr;
              </button>
            </div>
          </section>
        )}

        {/* 4. REVIEW_RUBRICS STATE */}
        {current === "REVIEW_RUBRICS" && (
          <section className="bg-surface rounded-xl border border-border p-6 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div>
                <h1 className="font-display text-2xl text-text-primary">Review Suggested Rubrics</h1>
                <p className="text-sm text-text-secondary mt-0.5">
                  The AI proposes, the doctor decides. Confirm rubrics and assign clinical weights (1–4).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="rounded-md border border-accent/60 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent hover:text-bg transition"
              >
                + Search Repertory
              </button>
            </div>

            {/* Missing Info / Follow-up Questions */}
            {missingInfo.length > 0 && (
              <div className="rounded-lg border border-border/80 bg-surface-raised p-4 space-y-2">
                <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                  Suggested Follow-up Inquiries
                </span>
                <ul className="list-disc list-inside text-xs text-text-secondary space-y-1">
                  {missingInfo.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rubrics List */}
            <div className="space-y-3">
              {confirmedRubrics.length === 0 ? (
                <p className="text-center py-6 text-sm text-text-secondary">
                  No rubrics currently selected. Click &ldquo;+ Search Repertory&rdquo; to add rubrics manually.
                </p>
              ) : (
                confirmedRubrics.map((rubric) => (
                  <div
                    key={rubric.rubric_id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border/80 bg-surface-raised hover:border-accent/40 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-accent uppercase tracking-wider">
                          {rubric.chapter}
                        </span>
                        <span className="text-xs text-text-secondary/60">&middot; ID #{rubric.rubric_id}</span>
                        {rubric.confidence_score < 0.5 ? (
                          <span className="rounded bg-warn/20 px-2 py-0.5 text-[10px] font-semibold text-warn">
                            Low confidence
                          </span>
                        ) : (
                          <span className="rounded bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent">
                            {(rubric.confidence_score * 100).toFixed(0)}% match
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-text-primary">{rubric.rubric_path}</p>
                      <p className="text-xs text-text-secondary italic">
                        &ldquo;{rubric.symptom_phrase}&rdquo; &mdash; {rubric.reason}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <label className="text-xs text-text-secondary">Weight:</label>
                        <select
                          value={rubric.weight}
                          onChange={(e) =>
                            send({
                              type: "SET_RUBRIC_WEIGHT",
                              rubricId: rubric.rubric_id,
                              weight: Number(e.target.value),
                            })
                          }
                          className="rounded border border-border bg-bg px-2.5 py-1 text-xs font-semibold text-text-primary focus:outline-none focus:border-accent"
                        >
                          <option value={1}>1 (Low)</option>
                          <option value={2}>2 (Medium)</option>
                          <option value={3}>3 (High)</option>
                          <option value={4}>4 (Essential)</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => send({ type: "REMOVE_RUBRIC", rubricId: rubric.rubric_id })}
                        className="text-text-secondary hover:text-danger text-xs px-2 py-1"
                        title="Remove rubric"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                disabled={confirmedRubrics.length === 0}
                onClick={handleConfirmRubricsAndScore}
                className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-bg hover:bg-accent-strong disabled:opacity-40 transition"
              >
                Confirm Rubrics &amp; Calculate Remedies &rarr;
              </button>
            </div>
          </section>
        )}

        {/* 5. SCORING STATE */}
        {current === "SCORING" && (
          <section className="bg-surface rounded-xl border border-border p-12 text-center space-y-4">
            <div className="inline-block animate-pulse text-3xl text-accent">📊</div>
            <h2 className="font-display text-xl text-text-primary">Calculating Repertorization Scores</h2>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              Executing deterministic SQL query over {confirmedRubrics.length} confirmed rubrics using Kent&apos;s Repertory 1897...
            </p>
          </section>
        )}

        {/* 6. REVIEW_MEDICINES STATE */}
        {current === "REVIEW_MEDICINES" && (
          <section className="bg-surface rounded-xl border border-border p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
              <div>
                <h1 className="font-display text-2xl text-text-primary">Ranked Remedies (Repertorization Grid)</h1>
                <p className="text-sm text-text-secondary mt-0.5">
                  Ordered by score DESC, rubrics covered DESC, remedy ID ASC. Click a remedy to prescribe.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center bg-surface-raised rounded-lg border border-border p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode("cards")}
                    className={`rounded-md px-3 py-1 font-semibold transition ${
                      viewMode === "cards"
                        ? "bg-accent text-bg"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("matrix")}
                    className={`rounded-md px-3 py-1 font-semibold transition ${
                      viewMode === "matrix"
                        ? "bg-accent text-bg"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    Matrix View
                  </button>
                </div>

                <button
                  onClick={() => send({ type: "CONFIRM_RUBRICS_START" })}
                  className="text-xs text-accent hover:underline font-medium"
                >
                  &larr; Modify Rubrics
                </button>
              </div>
            </div>

            {viewMode === "matrix" ? (
              <div className="overflow-x-auto rounded-lg border border-border bg-surface-raised max-h-[500px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-surface z-20 shadow-sm">
                    <tr className="border-b border-border text-text-secondary">
                      <th className="p-3 sticky left-0 bg-surface z-30 font-bold min-w-[170px] border-r border-border">
                        Rank &amp; Remedy
                      </th>
                      <th className="p-3 font-bold text-center min-w-[70px] border-r border-border">Score</th>
                      <th className="p-3 font-bold text-center min-w-[90px] border-r border-border">Covered</th>
                      {confirmedRubrics.map((rubric) => (
                        <th
                          key={rubric.rubric_id}
                          className="p-3 font-medium min-w-[150px] max-w-[220px] border-r border-border/60 text-[11px]"
                          title={`${rubric.chapter} > ${rubric.rubric_path}`}
                        >
                          <div className="line-clamp-2 text-text-primary font-semibold">{rubric.rubric_path}</div>
                          <span className="inline-block mt-1 rounded bg-accent/20 px-1.5 py-0.5 text-[9px] font-bold text-accent">
                            Weight: {rubric.weight}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {rankedMedicines.map((remedy, idx) => (
                      <tr
                        key={remedy.medicine_id}
                        onClick={() =>
                          send({
                            type: "CHOOSE_MEDICINE",
                            medicineId: remedy.medicine_id,
                            medicineName: remedy.common_name,
                          })
                        }
                        className="hover:bg-accent/10 cursor-pointer transition-colors group"
                      >
                        <td className="p-3 sticky left-0 bg-surface-raised group-hover:bg-accent/10 z-10 font-medium text-text-primary flex items-center gap-2 border-r border-border">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface border border-border text-[10px] font-bold text-accent shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-semibold">{remedy.common_name}</span>
                        </td>
                        <td className="p-3 text-center font-bold text-accent-strong text-sm border-r border-border">
                          {remedy.score}
                        </td>
                        <td className="p-3 text-center text-text-secondary border-r border-border">
                          {remedy.rubrics_covered} / {confirmedRubrics.length}
                        </td>
                        {confirmedRubrics.map((rubric) => {
                          const contrib = remedy.breakdown?.find((b) => b.rubric_id === rubric.rubric_id);
                          return (
                            <td
                              key={rubric.rubric_id}
                              className="p-3 text-center border-r border-border/60"
                            >
                              {contrib ? (
                                <span
                                  className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-bold ${
                                    contrib.grade >= 3
                                      ? "bg-accent/20 text-accent font-extrabold"
                                      : contrib.grade === 2
                                      ? "bg-warn/20 text-warn"
                                      : "bg-surface text-text-primary border border-border"
                                  }`}
                                  title={`Grade ${contrib.grade} × Weight ${contrib.weight} = ${contrib.subtotal}`}
                                >
                                  Gr.{contrib.grade}
                                  <span className="text-[10px] font-normal opacity-80 ml-1">
                                    (+{contrib.subtotal})
                                  </span>
                                </span>
                              ) : (
                                <span className="text-text-secondary/30">&mdash;</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rankedMedicines.map((remedy, idx) => (
                  <div
                    key={remedy.medicine_id}
                    onClick={() =>
                      send({
                        type: "CHOOSE_MEDICINE",
                        medicineId: remedy.medicine_id,
                        medicineName: remedy.common_name,
                      })
                    }
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-surface-raised hover:border-accent hover:bg-accent/5 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface border border-border text-xs font-bold text-accent">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="font-display font-semibold text-text-primary">{remedy.common_name}</h3>
                        <p className="text-xs text-text-secondary">
                          Covered {remedy.rubrics_covered} of {confirmedRubrics.length} rubrics
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-bold text-accent-strong">{remedy.score}</span>
                      <span className="text-xs text-text-secondary block">total score</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 7. PRESCRIBING STATE */}
        {current === "PRESCRIBING" && (
          <section className="bg-surface rounded-xl border border-border p-6 space-y-6">
            <div>
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">Final Step</span>
              <h1 className="font-display text-2xl text-text-primary mt-1">Prescription Confirmation</h1>
              <p className="text-sm text-text-secondary">
                Selected remedy: <strong className="text-accent">{selectedMedicineName}</strong>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Potency (e.g. 30C, 200C, 1M, Q)
                </label>
                <input
                  type="text"
                  value={potencyInput}
                  onChange={(e) => setPotencyInput(e.target.value)}
                  className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Dosage Instructions
                </label>
                <input
                  type="text"
                  value={dosageInput}
                  onChange={(e) => setDosageInput(e.target.value)}
                  className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Clinical Notes &amp; Regimen
                </label>
                <textarea
                  rows={3}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full rounded-md border border-border bg-bg p-3 text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => send({ type: "CONFIRM_RUBRICS_START" })}
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition"
              >
                Back to Remedies
              </button>
              <button
                type="button"
                onClick={handleSavePrescription}
                disabled={savingPrescription}
                className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-bg hover:bg-accent-strong disabled:opacity-50 transition"
              >
                {savingPrescription ? "Saving..." : "Finalize & Save Prescription"}
              </button>
            </div>
          </section>
        )}

        {/* 8. DONE STATE */}
        {current === "DONE" && (
          <section className="bg-surface rounded-xl border border-accent/40 p-8 text-center space-y-5">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-bg text-2xl font-bold">
              ✓
            </div>
            <div>
              <h1 className="font-display text-2xl text-text-primary">Prescription Saved Successfully</h1>
              <p className="text-sm text-text-secondary mt-1">
                Record ID: <code className="text-accent">{prescriptionId}</code>
              </p>
            </div>

            <div className="max-w-md mx-auto text-left rounded-lg border border-border bg-surface-raised p-4 space-y-2 text-xs">
              <p>
                <strong className="text-text-primary">Remedy:</strong> {selectedMedicineName} {potencyInput}
              </p>
              <p>
                <strong className="text-text-primary">Instructions:</strong> {dosageInput}
              </p>
              <p>
                <strong className="text-text-primary">Notes:</strong> {notesInput}
              </p>
              <p>
                <strong className="text-text-primary">Audit:</strong> Scoring snapshot committed with immutable hash.
              </p>
            </div>

            {/* Read-Only Expiring Share Link Section */}
            <div className="max-w-md mx-auto rounded-lg border border-accent/30 bg-surface-raised p-4 space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-accent uppercase tracking-wider">
                  Read-Only Case Sharing
                </span>
                <span className="text-[10px] text-text-secondary">Auto-expires in 7 days</span>
              </div>
              {shareUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="w-full rounded border border-border bg-bg px-2.5 py-1.5 text-xs text-text-primary select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyShare}
                      className="shrink-0 rounded bg-accent px-3 py-1.5 text-xs font-semibold text-bg hover:bg-accent-strong transition"
                    >
                      {copiedShare ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-[10px] text-text-secondary">
                    Recipients can view the verified prescription, symptoms, and confirmed rubrics securely without needing an account.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isSharing}
                  onClick={handleCreateShareLink}
                  className="w-full rounded-md border border-accent/50 bg-accent/10 px-4 py-2 text-xs font-semibold text-accent hover:bg-accent hover:text-bg transition"
                >
                  {isSharing ? "Generating link..." : "🔗 Generate Expiring Share Link"}
                </button>
              )}
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <a
                href={`/api/cases/${consultationId}/export`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-border bg-surface px-5 py-2 text-xs font-semibold text-text-primary hover:border-accent transition"
              >
                Export Case Report (JSON)
              </a>
              <button
                onClick={handleResetToNewConsultation}
                className="rounded-lg bg-accent px-5 py-2 text-xs font-semibold text-bg hover:bg-accent-strong transition"
              >
                New Consultation
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Repertory Search Drawer/Modal */}
      <RubricSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectRubric={(r) => {
          send({
            type: "ADD_MANUAL_RUBRIC",
            rubricId: r.rubric_id,
            rubricPath: r.rubric_path,
            chapter: r.chapter,
          });
        }}
      />
    </div>
  );
}

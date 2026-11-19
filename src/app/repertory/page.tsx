"use client";

import React, { useState, useEffect } from "react";

interface RubricSource {
  book: string;
  edition: string;
  year?: number;
  page?: string | number;
  licence?: string;
  url?: string;
}

interface RubricItem {
  rubric_id: number;
  rubric_path: string;
  chapter: string;
  rrf_score: number;
  repertory_id?: string;
  sources?: RubricSource[];
}

interface CustomRubricItem {
  id: number;
  doctor_id: string;
  rubric_path: string;
  chapter: string;
  notes?: string;
  contributor: string;
  created_at: string;
}

const KENT_CHAPTERS = [
  "Mind",
  "Vertigo",
  "Head",
  "Eye",
  "Vision",
  "Ear",
  "Hearing",
  "Nose",
  "Face",
  "Mouth",
  "Teeth",
  "Throat",
  "Stomach",
  "Abdomen",
  "Rectum",
  "Stool",
  "Urinary Organs",
  "Genitalia",
  "Larynx & Trachea",
  "Respiration",
  "Cough",
  "Expectoration",
  "Chest",
  "Back",
  "Extremities",
  "Sleep",
  "Chill",
  "Fever",
  "Perspiration",
  "Skin",
  "Generalities",
];

const OPEN_REPERTORIES = [
  { id: "all", name: "All Open Repertories", short: "All Sources", badge: "Multi-Source" },
  { id: "kent_1897", name: "Kent's Repertory (1897)", short: "Kent 1897", badge: "J.T. Kent" },
  { id: "knerr_hering", name: "Knerr's Hering Repertory (1896)", short: "Knerr 1896", badge: "C.B. Knerr" },
  { id: "boericke_rep", name: "Boericke's Pocket Repertory (1927)", short: "Boericke 1927", badge: "W. Boericke" },
  { id: "boenninghausen_rep", name: "Boenninghausen Pocket Book (1846)", short: "Boenninghausen 1846", badge: "C. Boenninghausen" },
];

export default function RepertoryBrowserPage() {
  const [activeTab, setActiveTab] = useState<"repertory" | "custom">("repertory");
  const [selectedRep, setSelectedRep] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<RubricItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Custom Rubrics state
  const [customRubrics, setCustomRubrics] = useState<CustomRubricItem[]>([]);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customPath, setCustomPath] = useState("");
  const [customChapter, setCustomChapter] = useState("Mind");
  const [customNotes, setCustomNotes] = useState("");
  const [customContributor, setCustomContributor] = useState("Verified Doctor Clinical Experience");
  const [savingCustom, setSavingCustom] = useState(false);

  useEffect(() => {
    fetch("/api/rubrics/custom")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.ok) {
          setCustomRubrics(data.data.rubrics || []);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  async function searchRubrics(term: string, repId: string = selectedRep) {
    if (!term.trim()) return;

    setLoading(true);
    setSearchTerm(term);
    try {
      const res = await fetch(`/api/rubrics/search?q=${encodeURIComponent(term)}&repertory_id=${encodeURIComponent(repId)}`);
      const data = await res.json();
      if (data.ok) {
        setResults(data.data.rubrics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    searchRubrics(searchTerm, selectedRep);
  }

  function handleRepertoryChange(repId: string) {
    setSelectedRep(repId);
    if (searchTerm.trim()) {
      searchRubrics(searchTerm, repId);
    }
  }

  async function handleCreateCustomRubric(e: React.FormEvent) {
    e.preventDefault();
    if (!customPath.trim() || !customChapter) return;

    setSavingCustom(true);
    try {
      const res = await fetch("/api/rubrics/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rubric_path: customPath.trim(),
          chapter: customChapter,
          notes: customNotes.trim() || undefined,
          contributor: customContributor.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setCustomRubrics((prev) => [data.data, ...prev]);
        setCustomPath("");
        setCustomNotes("");
        setIsCustomModalOpen(false);
        setActiveTab("custom");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingCustom(false);
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">
            Canonical Open-Source Repertories
          </span>
          <h1 className="font-display text-3xl font-bold text-text-primary mt-1">
            Open Repertory Explorer
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Search across Kent 1897, Knerr&apos;s Hering 1896, Boericke 1927, and Boenninghausen 1846 with verified public domain provenance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCustomModalOpen(true)}
          className="rounded-lg bg-accent px-4 py-2.5 text-xs font-semibold text-bg hover:bg-accent-strong transition shrink-0"
        >
          + Add Custom Rubric
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("repertory")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
            activeTab === "repertory"
              ? "bg-surface border border-accent/40 text-accent"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Open Public Repertories
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("custom")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === "custom"
              ? "bg-surface border border-accent/40 text-accent"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Doctor Custom Rubrics
          <span className="rounded-full bg-accent/20 px-2 py-0.2 text-[10px] font-bold text-accent">
            {customRubrics.length}
          </span>
        </button>
      </div>

      {activeTab === "repertory" ? (
        <>
          {/* Repertory Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-text-secondary text-[11px] font-medium mr-1 shrink-0">Repertory:</span>
            {OPEN_REPERTORIES.map((rep) => (
              <button
                key={rep.id}
                type="button"
                onClick={() => handleRepertoryChange(rep.id)}
                className={`rounded-full px-3 py-1 font-semibold transition shrink-0 flex items-center gap-1.5 ${
                  selectedRep === rep.id
                    ? "bg-accent text-bg shadow-sm"
                    : "border border-border bg-surface text-text-secondary hover:text-text-primary"
                }`}
              >
                <span>{rep.short}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                  selectedRep === rep.id ? "bg-bg/20 text-bg" : "bg-border text-text-secondary"
                }`}>
                  {rep.badge}
                </span>
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by chapter, symptom, or colloquial phrase (e.g. anxiety, sweet tooth, burning feet, headache)..."
              className="flex-1 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={loading || !searchTerm.trim()}
              className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-bg hover:bg-accent-strong disabled:opacity-40 transition"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          {/* Results or Featured Chapters */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-lg text-text-primary">
                {results.length > 0 ? `Results (${results.length})` : "Featured Chapters"}
              </h2>
              {results.length > 0 && (
                <span className="text-xs text-text-secondary">
                  Filtered by: {OPEN_REPERTORIES.find((r) => r.id === selectedRep)?.name}
                </span>
              )}
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.map((r) => {
                  const source = r.sources?.[0];
                  const bookName = source?.book || (
                    r.repertory_id === "knerr_hering" ? "Knerr's Repertory of Hering's Guiding Symptoms" :
                    r.repertory_id === "boericke_rep" ? "Boericke's Pocket Repertory" :
                    r.repertory_id === "boenninghausen_rep" ? "Boenninghausen's Pocket Book" :
                    "Kent's Repertory"
                  );
                  const editionYear = source?.edition || (
                    r.repertory_id === "knerr_hering" ? "1896" :
                    r.repertory_id === "boericke_rep" ? "1927" :
                    r.repertory_id === "boenninghausen_rep" ? "1846" :
                    "1897"
                  );
                  return (
                    <div
                      key={r.rubric_id}
                      className="p-4 rounded-lg border border-border bg-surface hover:border-accent/50 transition-all space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-accent uppercase tracking-wider">{r.chapter}</span>
                          <span className="text-text-secondary font-mono text-[11px]">Rubric #{r.rubric_id}</span>
                        </div>
                        <p className="text-sm font-medium text-text-primary leading-snug">{r.rubric_path}</p>
                      </div>

                      <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-text-secondary flex-wrap gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-accent-strong">{bookName}</span>
                          <span>&middot;</span>
                          <span>{editionYear}</span>
                          {source?.page && (
                            <>
                              <span>&middot;</span>
                              <span>p. {source.page}</span>
                            </>
                          )}
                          <span>&middot;</span>
                          <span className="text-[10px] uppercase tracking-wide text-text-secondary/70">
                            {source?.licence || "Public Domain"}
                          </span>
                        </div>
                        <a
                          href={`/materia-medica?search=${encodeURIComponent(r.chapter)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-accent hover:underline inline-flex items-center gap-0.5"
                          title="Look up remedies for this rubric in Materia Medica"
                        >
                          MM &rarr;
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {["Mind", "Head", "Stomach", "Generalities", "Extremities", "Sleep", "Rectum", "Throat"].map(
                  (chapter) => (
                    <div
                      key={chapter}
                      onClick={() => {
                        searchRubrics(chapter);
                      }}
                      className="p-4 rounded-lg border border-border bg-surface hover:border-accent cursor-pointer transition text-center space-y-1"
                    >
                      <h3 className="font-display font-semibold text-text-primary">{chapter}</h3>
                      <span className="text-xs text-accent">Browse &rarr;</span>
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        </>
      ) : (
        /* Doctor Custom Rubrics Tab */
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold text-lg text-text-primary">
                Clinician-Contributed Rubrics
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Custom rubrics created by doctors for specialized observations not covered in 1897 editions.
              </p>
            </div>
          </div>

          {customRubrics.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-12 text-center space-y-3">
              <p className="text-base font-semibold text-text-primary">No custom rubrics recorded yet.</p>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Add your clinical observations to expand repertorisation capabilities with custom symptom paths.
              </p>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(true)}
                className="mt-2 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-bg hover:bg-accent-strong transition"
              >
                + Add First Custom Rubric
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customRubrics.map((cr) => (
                <div
                  key={cr.id}
                  className="rounded-xl border border-border bg-surface p-5 space-y-2 hover:border-accent/40 transition"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-accent uppercase tracking-wider">{cr.chapter}</span>
                    <span className="text-text-secondary font-mono">Custom ID #{cr.id}</span>
                  </div>
                  <h3 className="font-semibold text-sm text-text-primary">{cr.rubric_path}</h3>
                  {cr.notes && (
                    <p className="text-xs text-text-secondary italic bg-bg/50 p-2 rounded border border-border/50">
                      {cr.notes}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1 border-t border-border/50">
                    <span>Contributor: {cr.contributor}</span>
                    <span>{new Date(cr.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Add Custom Rubric Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                  Repertory Extension
                </span>
                <h3 className="font-display text-xl font-bold text-text-primary mt-0.5">
                  Add Clinician-Observed Rubric
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="rounded-lg p-1.5 text-text-secondary hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomRubric} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Repertory Chapter
                </label>
                <select
                  value={customChapter}
                  onChange={(e) => setCustomChapter(e.target.value)}
                  className="w-full rounded border border-border bg-bg px-3 py-2 text-xs font-semibold text-text-primary focus:outline-none focus:border-accent"
                >
                  {KENT_CHAPTERS.map((ch) => (
                    <option key={ch} value={ch}>
                      {ch}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Rubric Path (Hierarchical)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mind; Anxiety; health, about; family members, regarding"
                  value={customPath}
                  onChange={(e) => setCustomPath(e.target.value)}
                  className="w-full rounded border border-border bg-bg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Clinical Experience / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Document clinical verification, modalities, or case references supporting this rubric..."
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full rounded border border-border bg-bg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Contributor Declaration
                </label>
                <input
                  type="text"
                  required
                  value={customContributor}
                  onChange={(e) => setCustomContributor(e.target.value)}
                  className="w-full rounded border border-border bg-bg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCustom || !customPath.trim()}
                  className="rounded-lg bg-accent px-5 py-2 text-xs font-semibold text-bg hover:bg-accent-strong disabled:opacity-50 transition"
                >
                  {savingCustom ? "Saving..." : "Save Custom Rubric"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

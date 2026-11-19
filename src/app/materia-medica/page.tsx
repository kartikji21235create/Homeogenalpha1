"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface MateriaMedicaPassage {
  book: string;
  author: string;
  edition?: string;
  section: string;
  text: string;
  page?: string;
}

interface MateriaMedicaRecord {
  id: string;
  common_name: string;
  abbreviation: string;
  latin_name: string;
  source_origin: string;
  constitution: string;
  mind: string;
  keynotes: string[];
  modalities: {
    aggravation: string;
    amelioration: string;
  };
  relationships: string;
  cited_passages: MateriaMedicaPassage[];
}

interface DataSourceRecord {
  repertory_id: string;
  source_name: string;
  author?: string;
  edition?: string;
  year?: number;
  type: "repertory" | "materia_medica";
  licence: string;
  source_url?: string;
  licence_note: string;
}

export default function MateriaMedicaPage() {
  const [activeTab, setActiveTab] = useState<"monographs" | "passages" | "sources">("monographs");
  const [remedies, setRemedies] = useState<MateriaMedicaRecord[]>([]);
  const [selectedRemedy, setSelectedRemedy] = useState<MateriaMedicaRecord | null>(null);
  const [sources, setSources] = useState<DataSourceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [passageResults, setPassageResults] = useState<
    Array<{
      remedy_id: string;
      common_name: string;
      abbreviation: string;
      passage: MateriaMedicaPassage;
    }>
  >([]);
  const [searchingPassages, setSearchingPassages] = useState(false);

  useEffect(() => {
    // 1. Fetch Materia Medica remedies
    fetch("/api/mm")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.data.remedies)) {
          // fetch full monographs
          Promise.all(
            data.data.remedies.map((r: any) =>
              fetch(`/api/mm/${r.id}`)
                .then((res) => res.json())
                .then((d) => (d.ok ? d.data : null))
            )
          ).then((fullList) => {
            const valid = fullList.filter(Boolean);
            setRemedies(valid);
            
            // Check URL search parameter
            const params = new URLSearchParams(window.location.search);
            const queryParam = params.get("search")?.trim();
            if (queryParam) {
              const qLower = queryParam.toLowerCase();
              const matchedRemedy = valid.find(
                (r) =>
                  r.common_name.toLowerCase().includes(qLower) ||
                  r.abbreviation.toLowerCase() === qLower ||
                  r.latin_name.toLowerCase().includes(qLower) ||
                  r.id.toLowerCase() === qLower
              );
              if (matchedRemedy) {
                setSelectedRemedy(matchedRemedy);
                setActiveTab("monographs");
              } else {
                setSearchQuery(queryParam);
                setActiveTab("passages");
                searchPassagesQuery(queryParam);
              }
            } else if (valid.length > 0) {
              setSelectedRemedy(valid[0]);
            }
          });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    // 2. Fetch Data Sources
    fetch("/api/sources")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setSources(data.data.sources || []);
      })
      .catch((err) => console.error(err));
  }, []);

  async function searchPassagesQuery(text: string) {
    if (!text.trim()) return;

    setSearchingPassages(true);
    try {
      const res = await fetch(`/api/mm/search?q=${encodeURIComponent(text.trim())}`);
      const data = await res.json();
      if (data.ok) {
        setPassageResults(data.data.passages || []);
        setActiveTab("passages");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingPassages(false);
    }
  }

  async function handleSearchPassages(e: React.FormEvent) {
    e.preventDefault();
    searchPassagesQuery(searchQuery);
  }

  const filteredRemedies = remedies.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.common_name.toLowerCase().includes(q) ||
      r.abbreviation.toLowerCase().includes(q) ||
      r.latin_name.toLowerCase().includes(q) ||
      r.keynotes.some((k) => k.toLowerCase().includes(q))
    );
  });

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">
            Open-Source Homoeopathic Literature &middot; PRD Section 6 &amp; 10
          </span>
          <h1 className="font-display text-3xl font-bold text-text-primary mt-1">
            Materia Medica &amp; Passage Library
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Verified classical homoeopathic remedy monographs with verbatim citations from Boericke, Allen, Kent, and Clarke.
          </p>
        </div>

        <Link
          href="/consultation"
          className="rounded-lg bg-accent px-4 py-2.5 text-xs font-semibold text-bg hover:bg-accent-strong transition shrink-0"
        >
          + Clinical Consultation
        </Link>
      </div>

      {/* Global Search Bar */}
      <form onSubmit={handleSearchPassages} className="flex gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by remedy, keynote, or clinical phrase (e.g. burning pains, midnight, fastidious, consolation)..."
          className="flex-1 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={searchingPassages || !searchQuery.trim()}
          className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-bg hover:bg-accent-strong disabled:opacity-40 transition"
        >
          {searchingPassages ? "Searching..." : "Search Passages"}
        </button>
      </form>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("monographs")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
            activeTab === "monographs"
              ? "bg-surface border border-accent/40 text-accent"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Remedy Monographs ({remedies.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("passages")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition flex items-center gap-1.5 ${
            activeTab === "passages"
              ? "bg-surface border border-accent/40 text-accent"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Cited Passage Search
          {passageResults.length > 0 && (
            <span className="rounded-full bg-accent/20 px-2 py-0.2 text-[10px] font-bold text-accent">
              {passageResults.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("sources")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
            activeTab === "sources"
              ? "bg-surface border border-accent/40 text-accent"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Verified Open Data Sources ({sources.length})
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-text-secondary">
          Loading Materia Medica library...
        </div>
      ) : activeTab === "monographs" ? (
        /* Monographs View: Master-Detail Split */
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
          {/* Remedy Selector List */}
          <div className="space-y-2 max-h-[750px] overflow-y-auto pr-2">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block mb-1">
              Select Polychrest / Remedy
            </span>
            {filteredRemedies.map((rem) => (
              <button
                key={rem.id}
                type="button"
                onClick={() => setSelectedRemedy(rem)}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                  selectedRemedy?.id === rem.id
                    ? "bg-accent/15 border-accent text-accent font-semibold"
                    : "bg-surface border-border text-text-primary hover:border-accent/40"
                }`}
              >
                <div>
                  <p className="text-xs font-semibold">{rem.common_name}</p>
                  <p className="text-[10px] text-text-secondary italic">{rem.latin_name}</p>
                </div>
                <span className="text-[10px] font-mono font-bold text-text-secondary bg-surface-raised px-1.5 py-0.5 rounded border border-border">
                  {rem.abbreviation}
                </span>
              </button>
            ))}
          </div>

          {/* Active Remedy Monograph Card */}
          {selectedRemedy ? (
            <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 space-y-6">
              {/* Monograph Header */}
              <div className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">
                    {selectedRemedy.source_origin}
                  </span>
                  <span className="text-xs font-mono font-semibold text-text-secondary">
                    Abbrev: {selectedRemedy.abbreviation}
                  </span>
                </div>
                <h2 className="font-display text-3xl font-bold text-text-primary mt-1">
                  {selectedRemedy.common_name}
                </h2>
                <p className="text-sm text-text-secondary italic mt-0.5">
                  {selectedRemedy.latin_name}
                </p>
              </div>

              {/* Constitution & Diathesis */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-accent uppercase tracking-wider">
                  Constitution &amp; Diathesis
                </h3>
                <p className="text-xs sm:text-sm text-text-primary leading-relaxed bg-surface-raised p-3.5 rounded-lg border border-border/80">
                  {selectedRemedy.constitution}
                </p>
              </div>

              {/* Mind & Mentals */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-accent uppercase tracking-wider">
                  Mind &amp; Mental Characteristics
                </h3>
                <p className="text-xs sm:text-sm text-text-primary leading-relaxed bg-surface-raised p-3.5 rounded-lg border border-border/80">
                  {selectedRemedy.mind}
                </p>
              </div>

              {/* Keynotes & Guiding Symptoms */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-accent uppercase tracking-wider">
                  Guiding Keynotes
                </h3>
                <ul className="space-y-1.5">
                  {selectedRemedy.keynotes.map((kn, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-text-primary bg-surface-raised p-2.5 rounded-md border border-border/60"
                    >
                      <span className="text-accent font-bold mt-0.5">•</span>
                      <span>{kn}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Modalities: Aggravation & Amelioration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="rounded-lg border border-danger/30 bg-danger/5 p-4 space-y-1">
                  <span className="text-xs font-bold text-danger uppercase tracking-wider">
                    Aggravation (&lt;)
                  </span>
                  <p className="text-xs text-text-primary leading-relaxed">
                    {selectedRemedy.modalities.aggravation}
                  </p>
                </div>

                <div className="rounded-lg border border-accent/40 bg-accent/5 p-4 space-y-1">
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">
                    Amelioration (&gt;)
                  </span>
                  <p className="text-xs text-text-primary leading-relaxed">
                    {selectedRemedy.modalities.amelioration}
                  </p>
                </div>
              </div>

              {/* Relationships */}
              <div className="space-y-1 text-xs">
                <span className="font-semibold text-text-secondary uppercase tracking-wider text-[10px]">
                  Clinical Relationships
                </span>
                <p className="text-text-primary">{selectedRemedy.relationships}</p>
              </div>

              {/* Cited Classical Passages */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-base text-text-primary">
                    Verified Citations &amp; Classical Passages
                  </h3>
                  <span className="text-[10px] text-text-secondary">Open Domain Literature</span>
                </div>

                <div className="space-y-3">
                  {selectedRemedy.cited_passages.map((cp, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-border bg-bg/60 p-4 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-accent">
                          {cp.book} &middot; {cp.author}
                        </span>
                        <span className="text-[10px] text-text-secondary">
                          {cp.edition || "Classical Edition"} &middot; {cp.section}
                        </span>
                      </div>
                      <p className="text-text-primary italic leading-relaxed">
                        &ldquo;{cp.text}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface p-12 text-center text-xs text-text-secondary">
              Select a remedy from the left list to review its classical Materia Medica monograph.
            </div>
          )}
        </div>
      ) : activeTab === "passages" ? (
        /* Passages Search Results */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg text-text-primary">
              Materia Medica Passage Matches
            </h2>
            <span className="text-xs text-text-secondary">
              {passageResults.length} passages found for &ldquo;{searchQuery}&rdquo;
            </span>
          </div>

          {passageResults.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-12 text-center space-y-2">
              <p className="text-base font-semibold text-text-primary">No passages matched query</p>
              <p className="text-xs text-text-secondary max-w-md mx-auto">
                Try searching for clinical symptoms like &ldquo;burning pains&rdquo;, &ldquo;aggravation 4 to 8 pm&rdquo;, &ldquo;thirstless&rdquo;, or remedy names.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {passageResults.map((pr, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border bg-surface p-5 space-y-2 hover:border-accent/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-base text-accent">
                      {pr.common_name} ({pr.abbreviation})
                    </span>
                    <span className="text-xs text-text-secondary">
                      {pr.passage.book} &middot; {pr.passage.author}
                    </span>
                  </div>

                  <p className="text-xs text-text-primary leading-relaxed italic bg-bg/50 p-3 rounded-lg border border-border/50">
                    &ldquo;{pr.passage.text}&rdquo;
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1">
                    <span>Section: {pr.passage.section}</span>
                    <span>{pr.passage.edition || "Classical Edition"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Open Data Sources Transparency Registry */
        <div className="space-y-4">
          <div>
            <h2 className="font-display font-semibold text-xl text-text-primary">
              Data Sources &amp; Provenance Catalog
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Strictly enforces PRD Section 6 Data Policy: Only open-source or public-domain repertory and materia medica works are loaded into Homeogenalpha1.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((src) => (
              <div
                key={src.repertory_id}
                className="rounded-xl border border-border bg-surface p-5 space-y-2.5 hover:border-accent/40 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent uppercase">
                    {src.type.replace("_", " ")}
                  </span>
                  <span className="text-xs font-mono text-text-secondary">
                    {src.year} &middot; {src.edition}
                  </span>
                </div>

                <h3 className="font-display font-bold text-base text-text-primary">
                  {src.source_name}
                </h3>
                <p className="text-xs text-text-secondary">
                  <strong>Author:</strong> {src.author || "Classical Homoeopathic Master"}
                </p>
                <p className="text-xs text-text-secondary leading-relaxed bg-bg/40 p-2.5 rounded border border-border/40">
                  {src.licence_note}
                </p>

                <div className="flex items-center justify-between text-[11px] text-accent pt-1">
                  <span className="capitalize">Licence: {src.licence.replace("_", " ")}</span>
                  {src.source_url && (
                    <a
                      href={src.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:opacity-80"
                    >
                      Archive Link &rarr;
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

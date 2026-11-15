"use client";

import React, { useState } from "react";

interface RubricItem {
  rubric_id: number;
  rubric_path: string;
  chapter: string;
  rrf_score: number;
}

export default function RepertoryBrowserPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<RubricItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/rubrics/search?q=${encodeURIComponent(searchTerm)}`);
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

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div>
        <span className="text-xs font-semibold text-accent uppercase tracking-wider">
          Repertory of the Homoeopathic Materia Medica
        </span>
        <h1 className="font-display text-3xl font-bold text-text-primary mt-1">
          Kent&apos;s Repertory (1897) Explorer
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Explore canonical rubrics, chapter hierarchies, and symptom paths verified under public domain.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by chapter, symptom, or colloquial phrase (e.g. anxiety, sweet tooth, burning feet)..."
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

      <section className="space-y-4">
        <h2 className="font-display font-semibold text-lg text-text-primary">
          {results.length > 0 ? `Results (${results.length})` : "Featured Chapters"}
        </h2>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.map((r) => (
              <div
                key={r.rubric_id}
                className="p-4 rounded-lg border border-border bg-surface hover:border-accent/50 transition-all space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-accent uppercase tracking-wider">{r.chapter}</span>
                  <span className="text-text-secondary">Rubric #{r.rubric_id}</span>
                </div>
                <p className="text-sm font-medium text-text-primary">{r.rubric_path}</p>
                <span className="text-[11px] text-text-secondary block">Kent Rep. 1897 &middot; Public Domain</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["Mind", "Head", "Stomach", "Generalities", "Extremities", "Sleep", "Rectum", "Throat"].map(
              (chapter) => (
                <div
                  key={chapter}
                  onClick={() => {
                    setSearchTerm(chapter);
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
    </main>
  );
}

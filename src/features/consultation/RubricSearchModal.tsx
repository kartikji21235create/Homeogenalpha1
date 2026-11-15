"use client";

import React, { useState, useEffect } from "react";

interface RubricSearchResult {
  rubric_id: number;
  rubric_path: string;
  chapter: string;
  rrf_score: number;
}

interface RubricSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRubric: (rubric: { rubric_id: number; rubric_path: string; chapter: string }) => void;
}

export function RubricSearchModal({ isOpen, onClose, onSelectRubric }: RubricSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RubricSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      return;
    }
  }, [isOpen]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/rubrics/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.ok) {
        setResults(data.data.rubrics);
      }
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-lg max-w-xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h2 className="font-display text-lg text-text-primary">Repertory Search (Kent 1897)</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary text-xl font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symptoms, rubrics or colloquial phrases..."
            className="flex-1 rounded border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="rounded bg-accent px-4 py-2 text-sm font-medium text-bg hover:bg-accent-strong disabled:opacity-40"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        <div className="mt-4 flex-1 overflow-y-auto pr-1">
          {results.length === 0 && !loading && query && (
            <p className="text-center text-sm text-text-secondary py-8">
              No matching rubrics found. Try different keywords.
            </p>
          )}

          <ul className="flex flex-col gap-2">
            {results.map((r) => (
              <li
                key={r.rubric_id}
                className="flex items-center justify-between p-3 rounded border border-border/60 bg-surface-raised hover:border-accent transition-all cursor-pointer"
                onClick={() => {
                  onSelectRubric(r);
                  onClose();
                }}
              >
                <div>
                  <span className="text-xs uppercase font-semibold text-accent tracking-wider">
                    {r.chapter}
                  </span>
                  <p className="text-sm font-medium text-text-primary mt-0.5">{r.rubric_path}</p>
                </div>
                <button
                  type="button"
                  className="rounded border border-accent/60 px-2.5 py-1 text-xs text-accent hover:bg-accent hover:text-bg transition"
                >
                  Add
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

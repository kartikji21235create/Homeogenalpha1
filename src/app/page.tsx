import Link from "next/link";

export default function HomePage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
      {/* Hero Header */}
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="inline-block rounded-full bg-accent/15 border border-accent/30 px-3 py-1 text-xs font-semibold text-accent uppercase tracking-wider">
          Homoeopathic Clinical Decision Support
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-text-primary">
          Deterministic Repertorisation. Zero Hallucination.
        </h1>
        <p className="text-text-secondary text-base leading-relaxed">
          The AI proposes, the doctor disposes. Proposes closed-set rubrics from public-domain repertory data, scores remedies via reproducible SQL, and guarantees row-level privacy.
        </p>

        <div className="flex justify-center gap-4 pt-4">
          <Link
            href="/consultation"
            className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-bg hover:bg-accent-strong shadow-lg shadow-accent/10 transition-all"
          >
            Start New Consultation &rarr;
          </Link>
          <Link
            href="/repertory"
            className="rounded-lg border border-border bg-surface px-6 py-3 text-sm font-medium text-text-primary hover:border-accent transition-all"
          >
            Browse Repertory
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <div className="text-2xl text-accent">🔒</div>
          <h3 className="font-display font-semibold text-lg text-text-primary">Closed-Set Retrieval</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            LLM is constrained strictly to the candidate set retrieved via hybrid search (FTS + 768-dim vector embeddings + RRF). Out-of-set IDs are rejected automatically.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <div className="text-2xl text-accent">📐</div>
          <h3 className="font-display font-semibold text-lg text-text-primary">Deterministic Scoring</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Pure SQL scoring with stable tiebreaker chain: <code>score DESC, rubrics_covered DESC, remedy_id ASC</code>. Every number on screen is 100% reproducible.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <div className="text-2xl text-accent">🛡️</div>
          <h3 className="font-display font-semibold text-lg text-text-primary">DPDP &amp; Clinical Safety</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Consent gate enforced before ingest. Names and contact details are redacted before AI calls. Rule-based emergency detector flags red-flag symptoms.
          </p>
        </div>
      </section>

      {/* Verified Open Datasets */}
      <section className="rounded-xl border border-border bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h2 className="font-display font-semibold text-lg text-text-primary">Loaded Reference Sources</h2>
          <span className="text-xs text-accent font-semibold">100% Licensed &amp; Verified</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-text-secondary border-b border-border">
                <th className="pb-2">Source</th>
                <th className="pb-2">Edition</th>
                <th className="pb-2">License</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-text-primary">
              <tr>
                <td className="py-2.5 font-medium">Kent&apos;s Repertory</td>
                <td className="py-2.5 text-text-secondary">1897, 1st Ed.</td>
                <td className="py-2.5">Public Domain</td>
                <td className="py-2.5 text-accent">Active &middot; 768-dim HNSW</td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium">Indian-English Synonyms</td>
                <td className="py-2.5 text-text-secondary">Clinical v1</td>
                <td className="py-2.5">Open License</td>
                <td className="py-2.5 text-accent">Active &middot; Colloquial Mapping</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

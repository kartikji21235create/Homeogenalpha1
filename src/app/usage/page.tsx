"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface UsageRecord {
  id: string;
  call_type: "EXTRACTION" | "SELECTION" | "SYNONYM_EMBED";
  model_name: string;
  prompt_tokens: number;
  completion_tokens: number;
  credits_consumed: number;
  cost_estimate_usd: number;
  timestamp: string;
}

interface UsageSummary {
  totalCalls: number;
  totalTokens: number;
  totalCredits: number;
  totalCostUsd: number;
  records: UsageRecord[];
}

interface SpendAlarm {
  alarmTriggered: boolean;
  currentSpendUsd: number;
  spendThresholdUsd: number;
  dailyUsageCredits: number;
  dailyCapCredits: number;
  tier: "FREE" | "PRO";
}

export default function UsagePage() {
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [alarm, setAlarm] = useState<SpendAlarm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/usage")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.ok) {
          setSummary(data.data.summary);
          setAlarm(data.data.alarm);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const dailyUsed = alarm?.dailyUsageCredits || 0;
  const dailyCap = alarm?.dailyCapCredits || 100;
  const percentage = Math.min(100, Math.round((dailyUsed / dailyCap) * 100));

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">
            Resource Metering &amp; Spend Controls
          </span>
          <h1 className="font-display text-3xl font-bold text-text-primary mt-1">
            AI Credits &amp; Usage Ledger
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Real-time tracking of Gemini model inference, token consumption, and DPDP-safe synthetic calls.
          </p>
        </div>

        <Link
          href="/consultation"
          className="rounded-lg bg-accent px-4 py-2.5 text-xs font-semibold text-bg hover:bg-accent-strong transition shrink-0"
        >
          + New Consultation
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16 text-text-secondary text-sm">
          Loading AI usage ledger...
        </div>
      ) : (
        <>
          {/* Top Cards: Plan, Meter, and Alarm */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Plan Tier Card */}
            <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                  Active Subscription
                </span>
                <span className="rounded bg-accent/20 px-2 py-0.5 text-xs font-bold text-accent">
                  {alarm?.tier || "PRO"} TIER
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold text-text-primary">
                Clinical Pro Plan
              </h2>
              <ul className="text-xs text-text-secondary space-y-1.5 pt-1">
                <li>✓ 1,000 Monthly AI Credits</li>
                <li>✓ Daily Rate Limit Cap: {dailyCap} credits/day</li>
                <li>✓ PDF &amp; JSON Medical Exports</li>
                <li>✓ Unlimited Kent 1897 Repertorizations</li>
              </ul>
            </div>

            {/* Daily Credit Meter Card */}
            <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                  Daily AI Allowance
                </span>
                <span className="text-xs text-text-secondary">Resets midnight UTC</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold text-text-primary">
                  {dailyUsed}
                </span>
                <span className="text-sm text-text-secondary">/ {dailyCap} credits</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-bg rounded-full h-2.5 overflow-hidden border border-border">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    percentage > 85 ? "bg-danger" : percentage > 60 ? "bg-warn" : "bg-accent"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-[11px] text-text-secondary">
                {dailyCap - dailyUsed} credits remaining today.
              </p>
            </div>

            {/* Spend Alarm Status Card */}
            <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                  Spend Alarm Status
                </span>
                {alarm?.alarmTriggered ? (
                  <span className="rounded bg-danger/20 px-2 py-0.5 text-xs font-bold text-danger">
                    TRIGGERED
                  </span>
                ) : (
                  <span className="rounded bg-accent/20 px-2 py-0.5 text-xs font-bold text-accent">
                    NORMAL (SAFE)
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold text-text-primary">
                  ${(summary?.totalCostUsd || 0).toFixed(4)}
                </span>
                <span className="text-xs text-text-secondary">
                  est. USD / ${alarm?.spendThresholdUsd || 50} limit
                </span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Automated circuit breaker halts further calls if budget threshold or anomalous usage is detected.
              </p>
            </div>
          </div>

          {/* Aggregate Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-lg border border-border bg-surface-raised p-4">
              <span className="text-[10px] font-semibold text-text-secondary uppercase">
                Total Model Calls
              </span>
              <p className="font-display text-xl font-bold text-text-primary mt-1">
                {summary?.totalCalls || 0}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-raised p-4">
              <span className="text-[10px] font-semibold text-text-secondary uppercase">
                Total Tokens Processed
              </span>
              <p className="font-display text-xl font-bold text-text-primary mt-1">
                {(summary?.totalTokens || 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-raised p-4">
              <span className="text-[10px] font-semibold text-text-secondary uppercase">
                Credits Deducted
              </span>
              <p className="font-display text-xl font-bold text-text-primary mt-1">
                {summary?.totalCredits || 0}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-raised p-4">
              <span className="text-[10px] font-semibold text-text-secondary uppercase">
                Default LLM Model
              </span>
              <p className="font-display text-sm font-bold text-accent mt-1.5 truncate">
                gemini-2.0-flash
              </p>
            </div>
          </div>

          {/* Audit Ledger Table */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-text-primary">
                Recent Model Invocations
              </h3>
              <span className="text-xs text-text-secondary">
                Immutable DPDP Audit Trail
              </span>
            </div>

            {(!summary?.records || summary.records.length === 0) ? (
              <div className="rounded-xl border border-border bg-surface p-10 text-center text-xs text-text-secondary">
                No model calls recorded yet in this session. Run a consultation narrative to see live token telemetry.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border bg-surface">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-surface-raised text-text-secondary font-semibold">
                      <th className="p-3">Invocation ID</th>
                      <th className="p-3">Stage / Call Type</th>
                      <th className="p-3">Model</th>
                      <th className="p-3 text-right">Prompt Tokens</th>
                      <th className="p-3 text-right">Completion Tokens</th>
                      <th className="p-3 text-right">Credits</th>
                      <th className="p-3 text-right">Est. Cost (USD)</th>
                      <th className="p-3 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {summary.records.slice().reverse().map((rec) => (
                      <tr key={rec.id} className="hover:bg-accent/5 transition-colors">
                        <td className="p-3 font-mono text-[11px] text-text-secondary">
                          {rec.id.slice(0, 14)}
                        </td>
                        <td className="p-3 font-semibold text-text-primary">
                          <span className="rounded bg-accent/15 px-2 py-0.5 text-[10px] text-accent font-bold">
                            {rec.call_type}
                          </span>
                        </td>
                        <td className="p-3 text-text-secondary">{rec.model_name}</td>
                        <td className="p-3 text-right text-text-primary font-mono">
                          {rec.prompt_tokens.toLocaleString()}
                        </td>
                        <td className="p-3 text-right text-text-primary font-mono">
                          {rec.completion_tokens.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-bold text-accent">
                          {rec.credits_consumed}
                        </td>
                        <td className="p-3 text-right text-text-secondary font-mono">
                          ${rec.cost_estimate_usd.toFixed(5)}
                        </td>
                        <td className="p-3 text-right text-[11px] text-text-secondary">
                          {new Date(rec.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

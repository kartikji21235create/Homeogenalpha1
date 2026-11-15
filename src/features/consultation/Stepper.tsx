"use client";

import React from "react";

const STEPS: { state: string; label: string }[] = [
  { state: "INTAKE", label: "Intake" },
  { state: "PROCESSING", label: "Analysis" },
  { state: "REVIEW_TRANSCRIPT", label: "Transcript" },
  { state: "REVIEW_RUBRICS", label: "Rubrics" },
  { state: "SCORING", label: "Scoring" },
  { state: "REVIEW_MEDICINES", label: "Remedies" },
  { state: "PRESCRIBING", label: "Prescription" },
];

export function Stepper({ current }: { current: string }) {
  const currentIndex = STEPS.findIndex((s) => s.state === current);

  return (
    <nav aria-label="Consultation Progress" className="w-full">
      <ol className="flex flex-col gap-2 py-4">
        {STEPS.map((step, i) => {
          const isDone = currentIndex > i || current === "DONE";
          const isCurrent = step.state === current;

          return (
            <li
              key={step.state}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all ${
                isCurrent
                  ? "bg-surface-raised border border-accent/40 shadow-sm"
                  : isDone
                  ? "opacity-80"
                  : "opacity-40"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  isCurrent
                    ? "bg-accent text-bg"
                    : isDone
                    ? "bg-accent/80 text-bg"
                    : "border border-border text-text-secondary"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </span>
              <span
                className={`text-sm ${
                  isCurrent
                    ? "font-medium text-text-primary"
                    : "text-text-secondary"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

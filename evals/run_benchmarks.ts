/**
 * run_benchmarks.ts — End-to-end multi-metric benchmark runner for Homeogenalpha1.
 * Evaluates:
 *   - Configuration A: Baseline (hybridSearch + Scoring v1)
 *   - Configuration B: Enhanced (Clause Parser + hybridSearch + Scoring v2 Kentian Profile)
 * across 75 dev cases and 30 test cases (105 total).
 */

import * as fs from "fs";
import * as path from "path";
import { runEval, gate, formatReport, EvalCase, Adapters, SplitReport } from "./eval_v2";
import { hybridSearch, StoredRubric, SynonymEntry, generateNormalizedEmbedding } from "../src/lib/retrieval";
import { calculateRepertorizationScore, ConfirmedRubricItem } from "../src/lib/scoring";
import { scoreV2, PROFILE_KENTIAN, ConfirmedRubric as V2ConfirmedRubric, Mapping as V2Mapping } from "../src/lib/scoring_v2";
import { parseClauses, clauseHint } from "../src/lib/ai/clause_parser";

async function main() {
  const seedPath = path.join(__dirname, "../seed/seed_data.json");
  const casesPath = path.join(__dirname, "cases_105.json");

  console.log("Loading seed data and eval dataset...");
  const seed = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
  const casesPayload = JSON.parse(fs.readFileSync(casesPath, "utf-8"));
  const cases: EvalCase[] = casesPayload.cases;

  const remedies = seed.remedies.map((r: any, idx: number) => ({
    id: idx + 1,
    common_name: r.common_name,
    abbreviation: r.abbreviation,
  }));

  const remMap = new Map<string, number>();
  remedies.forEach((r: any) => remMap.set(r.abbreviation.toLowerCase(), r.id));

  const rubricPathLookup = new Map<number, string>();
  const remedyMappings: Array<{ rubric_id: number; medicine_id: number; grade: number }> = [];

  const rubrics: StoredRubric[] = seed.rubrics.map((r: any, idx: number) => {
    const rId = idx + 1;
    rubricPathLookup.set(rId, r.rubric_path);
    for (const m of r.mappings || []) {
      const medId = remMap.get(m.abbrev.toLowerCase());
      if (medId) {
        remedyMappings.push({
          rubric_id: rId,
          medicine_id: medId,
          grade: m.grade,
        });
      }
    }
    return {
      id: rId,
      chapter: r.chapter,
      rubric_path: r.rubric_path,
      embedding: generateNormalizedEmbedding(r.rubric_path, 768),
      repertory_id: r.repertory_id || "kent_1897",
      sources: r.sources,
    };
  });

  const synonyms: SynonymEntry[] = seed.synonyms || [];

  // V2 Mappings
  const v2Mappings: V2Mapping[] = remedyMappings.map((m) => ({
    remedyId: m.medicine_id,
    rubricId: String(m.rubric_id),
    grade: m.grade as any,
  }));

  console.log(`Knowledge Base: ${rubrics.length} rubrics, ${remedies.length} remedies, ${synonyms.length} synonyms.`);
  console.log(`Cases: ${cases.length} (${cases.filter((c) => c.split === "dev").length} dev / ${cases.filter((c) => c.split === "test").length} test)\n`);

  // =========================================================================
  // Configuration A: Baseline (Standard Hybrid Search + Scoring V1)
  // =========================================================================
  const baselineAdapters: Adapters = {
    retrieve(narrative: string) {
      const cands = hybridSearch(narrative, rubrics, synonyms, { limit: 50 });
      return cands.map((c) => String(c.rubric_id));
    },
    select(narrative: string, candidates: string[]) {
      // Select top candidates up to 5
      return candidates.slice(0, 5);
    },
    rank(c: EvalCase, confirmed) {
      const inputItems: ConfirmedRubricItem[] = confirmed.map((cr) => ({
        rubric_id: parseInt(cr.id, 10),
        weight: cr.weight,
      }));
      const ranked = calculateRepertorizationScore(inputItems, remedyMappings, remedies, 20);
      return ranked.map((r) => r.medicine_id);
    },
  };

  // =========================================================================
  // Configuration B: Enhanced (Clause Parser + Fair Coverage Search + Scoring V2)
  // =========================================================================
  const enhancedAdapters: Adapters = {
    retrieve(narrative: string) {
      const clauses = parseClauses(narrative);
      const clauseCandidates: string[][] = [];

      // Pass 1: Full narrative + hint search
      const fullQuery = narrative + "; " + clauses.map(clauseHint).filter(Boolean).join("; ");
      const mainCands = hybridSearch(fullQuery, rubrics, synonyms, { limit: 40 });
      clauseCandidates.push(mainCands.map((c) => String(c.rubric_id)));

      // Pass 2: Per-clause targeted search
      for (const cl of clauses) {
        if (cl.text.length >= 4) {
          const hint = clauseHint(cl);
          const q = cl.text + (hint ? " " + hint : "");
          const subCands = hybridSearch(q, rubrics, synonyms, { limit: 20 });
          clauseCandidates.push(subCands.map((c) => String(c.rubric_id)));
        }
      }

      // Interleave candidates across clauses to guarantee multi-symptom coverage
      const seen = new Set<string>();
      const fused: string[] = [];
      const maxLen = Math.max(...clauseCandidates.map((c) => c.length));

      for (let i = 0; i < maxLen; i++) {
        for (const list of clauseCandidates) {
          if (i < list.length) {
            const id = list[i];
            if (!seen.has(id)) {
              seen.add(id);
              fused.push(id);
              if (fused.length >= 50) break;
            }
          }
        }
        if (fused.length >= 50) break;
      }

      return fused;
    },
    select(narrative: string, candidates: string[]) {
      return candidates.slice(0, 5);
    },
    rank(c: EvalCase, confirmed) {
      const seen = new Set<string>();
      const deduped = confirmed.filter((cr) => {
        if (seen.has(cr.id)) return false;
        seen.add(cr.id);
        return true;
      });
      const v2Confirmed: V2ConfirmedRubric[] = deduped.map((cr) => {
        const rIdNum = parseInt(cr.id, 10);
        const rPath = rubricPathLookup.get(rIdNum) || "";
        const chapter = rPath.split(";")[0]?.trim().toLowerCase() || "";
        const type = chapter === "mind" ? "mental" : chapter === "generalities" ? "general" : "particular";
        return {
          id: cr.id,
          type,
          weight: cr.weight,
        };
      });

      const scored = scoreV2(v2Confirmed, v2Mappings, {
        typeMultiplierPct: PROFILE_KENTIAN,
        limit: 20,
      });

      return scored.map((s) => s.remedyId);
    },
  };

  console.log("================================================================================");
  console.log(" RUNNING BENCHMARK EVALUATION (BASELINE vs ENHANCED)");
  console.log("================================================================================");

  const baselineReports = await runEval(cases, baselineAdapters);
  console.log("--- CONFIGURATION A: BASELINE (HybridSearch + Scoring v1) ---");
  console.log(formatReport(baselineReports));
  console.log();

  const enhancedReports = await runEval(cases, enhancedAdapters);
  console.log("--- CONFIGURATION B: ENHANCED (ClauseParser + Scoring v2 Kentian) ---");
  console.log(formatReport(enhancedReports));
  console.log();

  // Gate Check on Test Split
  const gateResult = gate(
    enhancedReports,
    {
      minCasesTest: 25,
      minRecallAt20: 0.75,
      minSelectionF1: 0.40,
      minRemedyTop5: 0.80,
      maxRegression: 0.05,
    },
    baselineReports
  );

  console.log("================================================================================");
  console.log(` ACCURACY GATE STATUS: ${gateResult.pass ? "PASSED [OK]" : "FAILED [FAIL]"}`);
  if (!gateResult.pass) {
    console.log(" Gate Failures:");
    gateResult.failures.forEach((f) => console.log(`   - ${f}`));
  } else {
    console.log(" All clinical accuracy gates satisfied on held-out test split!");
  }
  console.log("================================================================================");

  // Print Summary Table
  const bDev = baselineReports.find((r) => r.split === "dev")!;
  const bTest = baselineReports.find((r) => r.split === "test")!;
  const eDev = enhancedReports.find((r) => r.split === "dev")!;
  const eTest = enhancedReports.find((r) => r.split === "test")!;

  console.log("\n--- ACCURACY MATRIX SUMMARY ---");
  console.log("| Metric                 | Baseline (Dev) | Enhanced (Dev) | Baseline (Test)| Enhanced (Test)|");
  console.log("|------------------------|----------------|----------------|----------------|----------------|");
  console.log(`| Recall@5               | ${(bDev.recallAt[5] * 100).toFixed(1)}%          | ${(eDev.recallAt[5] * 100).toFixed(1)}%          | ${(bTest.recallAt[5] * 100).toFixed(1)}%          | ${(eTest.recallAt[5] * 100).toFixed(1)}%          |`);
  console.log(`| Recall@10              | ${(bDev.recallAt[10] * 100).toFixed(1)}%          | ${(eDev.recallAt[10] * 100).toFixed(1)}%          | ${(bTest.recallAt[10] * 100).toFixed(1)}%          | ${(eTest.recallAt[10] * 100).toFixed(1)}%          |`);
  console.log(`| Recall@20              | ${(bDev.recallAt[20] * 100).toFixed(1)}%          | ${(eDev.recallAt[20] * 100).toFixed(1)}%          | ${(bTest.recallAt[20] * 100).toFixed(1)}%          | ${(eTest.recallAt[20] * 100).toFixed(1)}%          |`);
  console.log(`| Rubric MRR             | ${bDev.rubricMRR.toFixed(3)}          | ${eDev.rubricMRR.toFixed(3)}          | ${bTest.rubricMRR.toFixed(3)}          | ${eTest.rubricMRR.toFixed(3)}          |`);
  console.log(`| Remedy Top-1           | ${(bDev.remedy.top1 * 100).toFixed(1)}%          | ${(eDev.remedy.top1 * 100).toFixed(1)}%          | ${(bTest.remedy.top1 * 100).toFixed(1)}%          | ${(eTest.remedy.top1 * 100).toFixed(1)}%          |`);
  console.log(`| Remedy Top-3           | ${(bDev.remedy.top3 * 100).toFixed(1)}%          | ${(eDev.remedy.top3 * 100).toFixed(1)}%          | ${(bTest.remedy.top3 * 100).toFixed(1)}%          | ${(eTest.remedy.top3 * 100).toFixed(1)}%          |`);
  console.log(`| Remedy Top-5           | ${(bDev.remedy.top5 * 100).toFixed(1)}%          | ${(eDev.remedy.top5 * 100).toFixed(1)}%          | ${(bTest.remedy.top5 * 100).toFixed(1)}%          | ${(eTest.remedy.top5 * 100).toFixed(1)}%          |`);
  console.log(`| Remedy MRR             | ${bDev.remedy.mrr.toFixed(3)}          | ${eDev.remedy.mrr.toFixed(3)}          | ${bTest.remedy.mrr.toFixed(3)}          | ${eTest.remedy.mrr.toFixed(3)}          |`);
}

main().catch((err) => {
  console.error("Benchmark failed:", err);
  process.exit(1);
});

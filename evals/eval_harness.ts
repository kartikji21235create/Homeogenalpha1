/**
 * Phase 0: Evaluation Harness for Hybrid Retrieval
 * Evaluates Recall@20 on the golden set (PRD Section 15, Problem 6)
 */

import * as fs from "fs";
import * as path from "path";
import { hybridSearch, StoredRubric, SynonymEntry } from "../src/lib/retrieval";
import { generateNormalizedEmbedding } from "../seed/loader";

interface GoldenCase {
  id: string;
  narrative: string;
  clinician_chosen_rubrics: string[];
}

export function runEvalHarness(
  seedDataPath = path.join(__dirname, "../seed/seed_data.json"),
  goldenSetPath = path.join(__dirname, "../seed/golden_set.json")
): {
  totalCases: number;
  totalClinicianRubrics: number;
  recalledRubrics: number;
  recallAt20: number;
  caseReports: {
    caseId: string;
    targetCount: number;
    recalledCount: number;
    caseRecall: number;
  }[];
} {
  const seedData = JSON.parse(fs.readFileSync(seedDataPath, "utf-8"));
  const goldenCases: GoldenCase[] = JSON.parse(fs.readFileSync(goldenSetPath, "utf-8"));

  // Build StoredRubric index
  const rubrics: StoredRubric[] = seedData.rubrics.map((r: any, idx: number) => ({
    id: idx + 1,
    chapter: r.chapter,
    rubric_path: r.rubric_path,
    embedding: generateNormalizedEmbedding(r.rubric_path, 768),
  }));

  const synonyms: SynonymEntry[] = seedData.synonyms || [];

  let totalClinicianRubrics = 0;
  let recalledRubrics = 0;

  const caseReports: {
    caseId: string;
    targetCount: number;
    recalledCount: number;
    caseRecall: number;
  }[] = [];

  for (const c of goldenCases) {
    const candidates = hybridSearch(c.narrative, rubrics, synonyms, { limit: 20 });
    const candidatePaths = new Set(candidates.map((cand) => cand.rubric_path.toLowerCase()));

    let caseHits = 0;
    for (const chosen of c.clinician_chosen_rubrics) {
      totalClinicianRubrics++;
      if (candidatePaths.has(chosen.toLowerCase())) {
        recalledRubrics++;
        caseHits++;
      }
    }

    const caseRecall = caseHits / c.clinician_chosen_rubrics.length;
    caseReports.push({
      caseId: c.id,
      targetCount: c.clinician_chosen_rubrics.length,
      recalledCount: caseHits,
      caseRecall,
    });
  }

  const recallAt20 = totalClinicianRubrics > 0 ? recalledRubrics / totalClinicianRubrics : 0;

  console.log("=================================================");
  console.log(" HOMEOGENALPHA1 — RETRIEVAL EVAL HARNESS (PHASE 0)");
  console.log("=================================================");
  console.log(`Cases Evaluated:           ${goldenCases.length}`);
  console.log(`Clinician Rubrics Target:  ${totalClinicianRubrics}`);
  console.log(`Rubrics in Top 20 Candidates: ${recalledRubrics}`);
  console.log(`Recall@20:                 ${(recallAt20 * 100).toFixed(1)}%`);
  console.log("-------------------------------------------------");
  for (const cr of caseReports) {
    console.log(
      ` Case ${cr.caseId}: ${cr.recalledCount}/${cr.targetCount} recalled (${(cr.caseRecall * 100).toFixed(0)}%)`
    );
  }
  console.log("=================================================");

  return {
    totalCases: goldenCases.length,
    totalClinicianRubrics,
    recalledRubrics,
    recallAt20,
    caseReports,
  };
}

if (require.main === module) {
  runEvalHarness();
}

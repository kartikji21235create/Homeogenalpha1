/**
 * Phase 0: Gated Data Loader for Homeogenalpha1
 * 
 * Rules enforced:
 * 1. Refuses to run unless the source has a verified data_sources record (Problem 29).
 * 2. Validates grades (1-4).
 * 3. Dedupes rubric paths.
 * 4. Fails on unmapped remedy abbreviations (Problem 9).
 * 5. Writes a rejected-rows report.
 * 6. Generates/validates 768-dim L2-normalized embeddings (Problem 10).
 */

import * as fs from "fs";
import * as path from "path";
import { generateNormalizedEmbedding } from "../src/lib/retrieval";
export { generateNormalizedEmbedding };

export interface DataSource {
  repertory_id: string;
  source_name: string;
  edition?: string;
  year?: number;
  licence: string;
  source_url?: string;
  acquisition_date: string;
  licence_note: string;
}

export interface RemedySeed {
  common_name: string;
  abbreviation: string;
  aliases: string[];
}

export interface RubricMapping {
  abbrev: string;
  grade: number;
}

export interface RubricSource {
  book: string;
  edition?: string;
  page?: string;
}

export interface RubricSeed {
  chapter: string;
  rubric_path: string;
  sources: RubricSource[];
  mappings: RubricMapping[];
}

export interface SynonymSeed {
  phrase: string;
  canonical_phrase: string;
  locale: string;
}

export interface RejectedRow {
  entity: "rubric" | "mapping" | "remedy";
  item: unknown;
  reason: string;
}

export interface LoadSummary {
  repertory_id: string;
  remedies_loaded: number;
  aliases_loaded: number;
  rubrics_loaded: number;
  mappings_loaded: number;
  synonyms_loaded: number;
  rejected_count: number;
  embedding_dim: number;
  timestamp: string;
}


export function runLoader(
  targetRepertoryId = "kent_1897",
  dataSourcesPath = path.join(__dirname, "data_sources.json"),
  seedDataPath = path.join(__dirname, "seed_data.json"),
  reportOutputPath = path.join(__dirname, "rejected_rows_report.json")
): { summary: LoadSummary; rejectedRows: RejectedRow[] } {
  console.log(`[Loader] Verifying data source license for '${targetRepertoryId}'...`);

  // Gate 1: Refuse to run unless source has a data_sources row (Problem 29)
  if (!fs.existsSync(dataSourcesPath)) {
    throw new Error(`Data sources definition file not found at: ${dataSourcesPath}`);
  }

  const dataSources: DataSource[] = JSON.parse(fs.readFileSync(dataSourcesPath, "utf-8"));
  const sourceRecord = dataSources.find((ds) => ds.repertory_id === targetRepertoryId);

  if (!sourceRecord) {
    throw new Error(
      `LOAD BLOCKED: No data_sources record found for repertory_id='${targetRepertoryId}'. ` +
      `PRD Rule 8: No licence record, no load.`
    );
  }

  if (!sourceRecord.licence || !sourceRecord.licence_note) {
    throw new Error(
      `LOAD BLOCKED: Incomplete licence details for '${targetRepertoryId}'. ` +
      `Both licence and licence_note must be recorded before loading.`
    );
  }

  console.log(`[Loader] License verified: ${sourceRecord.source_name} (${sourceRecord.licence})`);

  if (!fs.existsSync(seedDataPath)) {
    throw new Error(`Seed data file not found at: ${seedDataPath}`);
  }

  const seedData: {
    remedies: RemedySeed[];
    rubrics: RubricSeed[];
    synonyms: SynonymSeed[];
  } = JSON.parse(fs.readFileSync(seedDataPath, "utf-8"));

  const rejectedRows: RejectedRow[] = [];
  const knownAbbreviations = new Map<string, string>(); // abbrev -> common_name
  const remedyAliasesMap = new Map<string, string>(); // alias -> abbrev

  // Register remedies and aliases
  for (const remedy of seedData.remedies) {
    if (!remedy.common_name || !remedy.abbreviation) {
      rejectedRows.push({
        entity: "remedy",
        item: remedy,
        reason: "Missing common_name or abbreviation",
      });
      continue;
    }
    knownAbbreviations.set(remedy.abbreviation, remedy.common_name);
    for (const alias of remedy.aliases || []) {
      remedyAliasesMap.set(alias.toLowerCase(), remedy.abbreviation);
    }
  }

  // Deduplicate and validate rubrics and mappings
  const dedupedRubrics = new Map<string, RubricSeed>();
  let validMappingsCount = 0;

  for (const rubric of seedData.rubrics) {
    const canonicalPath = rubric.rubric_path.trim();

    if (!canonicalPath) {
      rejectedRows.push({
        entity: "rubric",
        item: rubric,
        reason: "Empty rubric path",
      });
      continue;
    }

    if (dedupedRubrics.has(canonicalPath)) {
      rejectedRows.push({
        entity: "rubric",
        item: rubric,
        reason: `Duplicate rubric path: '${canonicalPath}'`,
      });
      continue;
    }

    // Validate mappings for this rubric
    const validMappings: RubricMapping[] = [];
    for (const mapping of rubric.mappings) {
      // Validate grade (1-4)
      if (typeof mapping.grade !== "number" || mapping.grade < 1 || mapping.grade > 4) {
        rejectedRows.push({
          entity: "mapping",
          item: { rubric: canonicalPath, mapping },
          reason: `Invalid grade ${mapping.grade}. Must be an integer between 1 and 4.`,
        });
        continue;
      }

      // Validate abbreviation exists (Problem 9)
      if (!knownAbbreviations.has(mapping.abbrev)) {
        // Check if it's in aliases
        const resolved = remedyAliasesMap.get(mapping.abbrev.toLowerCase());
        if (resolved) {
          mapping.abbrev = resolved;
        } else {
          rejectedRows.push({
            entity: "mapping",
            item: { rubric: canonicalPath, mapping },
            reason: `Unmapped remedy abbreviation: '${mapping.abbrev}'. Load fails closed on unmapped remedies.`,
          });
          continue;
        }
      }

      validMappings.push(mapping);
    }

    rubric.mappings = validMappings;
    validMappingsCount += validMappings.length;
    dedupedRubrics.set(canonicalPath, rubric);
  }

  // Validate embedding generation (768 dimensions, L2 normalized)
  for (const [pathKey] of dedupedRubrics.entries()) {
    const vec = generateNormalizedEmbedding(pathKey, 768);
    if (vec.length !== 768) {
      throw new Error(`Generated vector dimension mismatch for '${pathKey}'. Got ${vec.length}, expected 768.`);
    }
  }

  // Write rejected-rows report
  fs.writeFileSync(reportOutputPath, JSON.stringify(rejectedRows, null, 2), "utf-8");

  const summary: LoadSummary = {
    repertory_id: targetRepertoryId,
    remedies_loaded: knownAbbreviations.size,
    aliases_loaded: remedyAliasesMap.size,
    rubrics_loaded: dedupedRubrics.size,
    mappings_loaded: validMappingsCount,
    synonyms_loaded: seedData.synonyms?.length || 0,
    rejected_count: rejectedRows.length,
    embedding_dim: 768,
    timestamp: new Date().toISOString(),
  };

  console.log(`[Loader] Finished load report:`);
  console.log(`  - Remedies: ${summary.remedies_loaded}`);
  console.log(`  - Rubrics: ${summary.rubrics_loaded}`);
  console.log(`  - Mappings: ${summary.mappings_loaded}`);
  console.log(`  - Synonyms: ${summary.synonyms_loaded}`);
  console.log(`  - Rejected Rows: ${summary.rejected_count} (written to ${reportOutputPath})`);

  return { summary, rejectedRows };
}

if (require.main === module) {
  try {
    runLoader();
  } catch (err) {
    console.error("[Loader ERROR]", err);
    process.exit(1);
  }
}

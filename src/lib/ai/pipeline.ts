/**
 * Text Analysis Pipeline (Stage B: Extract -> Retrieve -> Select)
 * Enforces PRD v4, Section 8:
 * - AI proposes, doctor decides.
 * - Closed-set rubric selection: hallucinated rubric IDs are structurally rejected.
 * - Negation & modalities are kept as dedicated schema fields.
 * - Temperature 0 on all scoring-adjacent calls.
 * - PII redaction before any outbound LLM call.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { redactIdentifiers, assertNoIdentifiersLeaked } from "./redaction";
import { detectEmergencySigns, EmergencyCheckResult } from "./emergency";
import { hybridSearch, StoredRubric, SynonymEntry, CandidateRubric } from "../retrieval";
import { parseClauses, clauseHint } from "./clause_parser";

export interface ExtractedSymptom {
  id: string; // client/session UUID
  category: "MENTAL_GENERAL" | "PHYSICAL_GENERAL" | "PARTICULAR";
  phrase: string;
  english_translation: string;
  negation: boolean;
  modality_notes: string | null;
  source_span_start: number;
  source_span_end: number;
  confidence_score: number;
  missing_info: string[];
}

export interface SelectedRubric {
  id: string;
  symptom_id: string;
  rubric_id: number;
  rubric_path: string;
  chapter: string;
  confidence_score: number;
  reason: string;
  rank: number;
  verified: boolean;
}

export interface PipelineAnalysisResult {
  transcript: string;
  symptoms: ExtractedSymptom[];
  suggested_rubrics: SelectedRubric[];
  missing_info: string[];
  emergency_check: EmergencyCheckResult;
}

const EXTRACT_SYSTEM_PROMPT = `You are an expert homoeopathic case-taking clinical decision-support AI.
Analyze the consultation narrative and extract distinct homoeopathic symptoms.
For each symptom, record:
1. category: MENTAL_GENERAL, PHYSICAL_GENERAL, or PARTICULAR
2. phrase: the patient's statement as close to verbatim as possible
3. english_translation: precise clinical English translation
4. negation: boolean (true if the patient explicitly denies or lacks this symptom, e.g. "no thirst" -> negation: true)
5. modality_notes: any worse (agg.) or better (amel.) conditions (e.g. "worse in warm room", "better after sleep"). Keep separate from phrase.
6. source_span_start & source_span_end: character start/end index in the transcript text
7. confidence_score: float between 0.0 and 1.0 based on clarity and specificity of the symptom
8. missing_info: list of typical homoeopathic essentials (thermals, thirst, sleep position, time modalities) that were NOT mentioned

CRITICAL RULES:
- Never produce rubric names or rubric IDs here. Extract symptoms only.
- Negation must be a separate boolean, NEVER merged into the phrase text.
- Return output strictly as a JSON object matching this schema:
{
  "symptoms": [
    {
      "category": "MENTAL_GENERAL" | "PHYSICAL_GENERAL" | "PARTICULAR",
      "phrase": string,
      "english_translation": string,
      "negation": boolean,
      "modality_notes": string | null,
      "source_span_start": number,
      "source_span_end": number,
      "confidence_score": number
    }
  ],
  "missing_info": string[]
}`;

export class ClosedSetViolationError extends Error {
  constructor(public invalidIds: number[], message: string) {
    super(message);
    this.name = "ClosedSetViolationError";
  }
}

/**
 * Stage B Step 1: Extract Symptoms from narrative
 */
export async function extractSymptomsWithGemini(
  narrative: string,
  apiKey?: string,
  patientDisplayName?: string | null
): Promise<{ symptoms: ExtractedSymptom[]; missing_info: string[] }> {
  const redacted = redactIdentifiers(narrative, patientDisplayName);
  assertNoIdentifiersLeaked(redacted, patientDisplayName);

  // If no Gemini API key is configured or in mock test mode, use deterministic rule-based extractor
  if (!apiKey || apiKey === "your-gemini-api-key" || apiKey === "mock") {
    return mockRuleBasedExtract(redacted);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.EXTRACTION_MODEL || "gemini-2.0-flash",
    generationConfig: {
      temperature: 0,
      responseMimeType: "application/json",
    },
  });

  const prompt = `${EXTRACT_SYSTEM_PROMPT}\n\nTranscript:\n"""\n${redacted}\n"""`;
  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  try {
    const parsed = JSON.parse(responseText);
    const symptoms: ExtractedSymptom[] = (parsed.symptoms || []).map(
      (s: any, idx: number) => ({
        id: `sym_${Date.now()}_${idx + 1}`,
        category: s.category || "PARTICULAR",
        phrase: s.phrase || "",
        english_translation: s.english_translation || s.phrase || "",
        negation: Boolean(s.negation),
        modality_notes: s.modality_notes || null,
        source_span_start: Number(s.source_span_start) || 0,
        source_span_end: Number(s.source_span_end) || s.phrase?.length || 10,
        confidence_score: Math.min(Math.max(Number(s.confidence_score) || 0.8, 0.0), 1.0),
        missing_info: parsed.missing_info || [],
      })
    );

    return {
      symptoms,
      missing_info: parsed.missing_info || [],
    };
  } catch (err) {
    console.warn("[Pipeline] Failed to parse Gemini extraction JSON, falling back to rule-based parser", err);
    return mockRuleBasedExtract(redacted);
  }
}

/**
 * Stage B Step 3: Select from closed set of candidate rubric IDs
 */
export async function selectRubricsFromCandidates(
  symptom: ExtractedSymptom,
  candidates: CandidateRubric[],
  apiKey?: string
): Promise<SelectedRubric[]> {
  if (candidates.length === 0) return [];

  const candidateIdSet = new Set(candidates.map((c) => c.rubric_id));
  const candidateLookup = new Map(candidates.map((c) => [c.rubric_id, c]));

  // If no Gemini API key or in mock test mode, pick top candidates cleanly
  if (!apiKey || apiKey === "your-gemini-api-key" || apiKey === "mock") {
    return fallbackToTopCandidates(symptom, candidates);
  }

  const candidateListStr = candidates
    .map((c) => `- ID ${c.rubric_id}: ${c.rubric_path} (RRF Score: ${c.rrf_score.toFixed(4)})`)
    .join("\n");

  const prompt = `A homoeopathic patient described this symptom:
Phrase: "${symptom.phrase}"
English: "${symptom.english_translation}"
Category: ${symptom.category}
Negation: ${symptom.negation}
Modality notes: ${symptom.modality_notes || "None"}

You must select the most appropriate homoeopathic rubric(s) from the candidate list below.

CRITICAL RULES:
1. You may ONLY choose IDs from the candidate list. Never invent or suggest any ID outside this list.
2. Return at most 3 selections.
3. For each, return { "rubric_id": number, "confidence": number (0-1), "reason": string }.

Candidates:
${candidateListStr}

Respond strictly in JSON:
{
  "selections": [
    { "rubric_id": number, "confidence": number, "reason": string }
  ]
}`;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.EXTRACTION_MODEL || "gemini-2.0-flash",
    generationConfig: {
      temperature: 0,
      responseMimeType: "application/json",
    },
  });

  // Closed-set validation with 1 retry (Problem 5)
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await model.generateContent(prompt);
      const parsed = JSON.parse(response.response.text());
      const selections: any[] = parsed.selections || [];

      // Validate every returned ID
      const invalidIds: number[] = [];
      const validResults: SelectedRubric[] = [];

      selections.forEach((sel, rankIdx) => {
        const rId = Number(sel.rubric_id);
        if (!candidateIdSet.has(rId)) {
          invalidIds.push(rId);
        } else {
          const cand = candidateLookup.get(rId)!;
          validResults.push({
            id: `sug_${Date.now()}_${rId}`,
            symptom_id: symptom.id,
            rubric_id: rId,
            rubric_path: cand.rubric_path,
            chapter: cand.chapter,
            confidence_score: Math.min(Math.max(Number(sel.confidence) || 0.7, 0.0), 1.0),
            reason: sel.reason || "Matches clinical narrative",
            rank: rankIdx + 1,
            verified: false,
          });
        }
      });

      if (invalidIds.length > 0) {
        console.warn(`[Pipeline] Closed-set violation on attempt ${attempt + 1}: IDs [${invalidIds}] not in candidate set.`);
        if (attempt === 0) {
          continue; // retry once
        }
        // Fall back to top 3 by RRF score marked low-confidence
        return fallbackToTopCandidates(symptom, candidates);
      }

      if (validResults.length > 0) {
        return validResults.slice(0, 3);
      }
    } catch (err) {
      console.warn(`[Pipeline] LLM selection error on attempt ${attempt + 1}:`, err);
    }
  }

  // Fallback to top candidates
  return fallbackToTopCandidates(symptom, candidates);
}

/**
 * Fallback to top 3 candidates by RRF score, marked low confidence (Problem 5)
 */
export function fallbackToTopCandidates(
  symptom: ExtractedSymptom,
  candidates: CandidateRubric[]
): SelectedRubric[] {
  const sorted = [...candidates].sort((a, b) => b.rrf_score - a.rrf_score).slice(0, 3);
  return sorted.map((cand, idx) => ({
    id: `sug_fb_${Date.now()}_${cand.rubric_id}`,
    symptom_id: symptom.id,
    rubric_id: cand.rubric_id,
    rubric_path: cand.rubric_path,
    chapter: cand.chapter,
    confidence_score: idx === 0 ? 0.45 : 0.35, // low confidence badge
    reason: "Low-confidence match: selected by hybrid retrieval score",
    rank: idx + 1,
    verified: false,
  }));
}

/**
 * Deterministic rule-based symptom extraction fallback powered by clause parsing
 */
function mockRuleBasedExtract(text: string): {
  symptoms: ExtractedSymptom[];
  missing_info: string[];
} {
  const symptoms: ExtractedSymptom[] = [];
  const clauses = parseClauses(text);

  clauses.forEach((c, idx) => {
    const phrase = c.text;
    if (phrase.length < 3) return;

    let category: ExtractedSymptom["category"] = "PARTICULAR";
    if (
      /\b(anxious|anxiety|fear|weep|crying|angry|irritab|restless|fastidious|mind|gussa|darr|udasi|chidchidapan|ghabrahat)\b/i.test(
        phrase
      )
    ) {
      category = "MENTAL_GENERAL";
    } else if (
      /\b(warmth|cold|chilly|motion|heat|weather|general|thand|garmi|baarish)\b/i.test(phrase)
    ) {
      category = "PHYSICAL_GENERAL";
    }

    let modalityNotes: string | null = null;
    if (c.modalities.length > 0) {
      modalityNotes = c.modalities
        .map((m) => `${m.direction} from ${m.factor}`)
        .join(", ");
    } else {
      const modMatch = phrase.match(/\b(worse|better|agg|amel|after|from)\s+([a-z0-9\s]+)/i);
      if (modMatch) {
        modalityNotes = modMatch[0];
      }
    }

    if (c.timeOfDay && !modalityNotes?.includes(c.timeOfDay)) {
      modalityNotes = modalityNotes
        ? `${modalityNotes}; at ${c.timeOfDay}`
        : `worse at ${c.timeOfDay}`;
    }

    const startPos = text.indexOf(phrase);
    symptoms.push({
      id: `sym_loc_${idx + 1}`,
      category,
      phrase,
      english_translation: phrase,
      negation: c.negated,
      modality_notes: modalityNotes,
      source_span_start: startPos >= 0 ? startPos : 0,
      source_span_end: startPos >= 0 ? startPos + phrase.length : phrase.length,
      confidence_score: 0.85,
      missing_info: [],
    });
  });

  const missing: string[] = [];
  if (!/\b(thirst|drinks|water|pyaas)\b/i.test(text)) {
    missing.push("Thirst: Is the patient thirsty, thirstless, or wanting small sips?");
  }
  if (!/\b(warmth|cold|chilly|hot|thand|garmi)\b/i.test(text)) {
    missing.push("Thermal state: Is the patient generally chilly or hot-blooded?");
  }
  if (!/\b(sleep|dreams|night|neend|raat)\b/i.test(text)) {
    missing.push("Sleep: Any particular sleep position, insomnia, or restless tossing?");
  }

  return { symptoms, missing_info: missing };
}

/**
 * End-to-End Orchestrator: Execute the complete Analyze pipeline
 */
export async function runConsultationAnalyzePipeline(
  transcript: string,
  rubricsIndex: StoredRubric[],
  synonyms: SynonymEntry[] = [],
  apiKey?: string,
  patientDisplayName?: string | null
): Promise<PipelineAnalysisResult> {
  // 1. Redact direct patient identifiers
  const cleanTranscript = redactIdentifiers(transcript, patientDisplayName);
  assertNoIdentifiersLeaked(cleanTranscript, patientDisplayName);

  // 2. Rule-based emergency presentation check
  const emergencyCheck = detectEmergencySigns(cleanTranscript);

  // 3. Extract symptoms
  const { symptoms, missing_info } = await extractSymptomsWithGemini(
    cleanTranscript,
    apiKey,
    patientDisplayName
  );

  // 4. Retrieve candidates and select rubrics for each symptom
  const allSuggestedRubrics: SelectedRubric[] = [];

  for (const symptom of symptoms) {
    // Hybrid retrieval
    const query = symptom.modality_notes
      ? `${symptom.english_translation} ${symptom.modality_notes}`
      : symptom.english_translation;

    const candidates = hybridSearch(query, rubricsIndex, synonyms, { limit: 20 });
    const selected = await selectRubricsFromCandidates(symptom, candidates, apiKey);

    allSuggestedRubrics.push(...selected);
  }

  return {
    transcript: cleanTranscript,
    symptoms,
    suggested_rubrics: allSuggestedRubrics,
    missing_info,
    emergency_check: emergencyCheck,
  };
}

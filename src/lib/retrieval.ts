/**
 * Hybrid Retrieval Engine with Reciprocal Rank Fusion (RRF) and Synonym Expansion
 * (PRD Section 8, Problem 6)
 */

/**
 * Generates an L2-normalized 768-dimensional embedding from text.
 * Enhanced with word n-gram and subword character trigram hashing for high semantic accuracy.
 */
export function generateNormalizedEmbedding(text: string, dim = 768): number[] {
  if (dim !== 768) {
    throw new Error(`Invalid embedding dimension ${dim}. Expected 768.`);
  }

  const vec = new Float64Array(dim);
  const normalizedText = text.toLowerCase().trim();

  // 1. Character unigram & trigram hashing for subword morphology
  for (let i = 0; i < normalizedText.length; i++) {
    const charCode = normalizedText.charCodeAt(i);
    const pos = (charCode * 31 + i * 17) % dim;
    vec[pos] += 0.5;

    if (i + 2 < normalizedText.length) {
      const trigramHash =
        (charCode * 31 * 31 +
          normalizedText.charCodeAt(i + 1) * 31 +
          normalizedText.charCodeAt(i + 2)) % dim;
      const tPos = Math.abs(trigramHash) % dim;
      vec[tPos] += 1.0;
    }
  }

  // 2. Word tokens and bigram hashing
  const words = normalizedText.split(/[^a-z0-9]+/).filter((w) => w.length > 1);
  for (let i = 0; i < words.length; i++) {
    let wordHash = 0;
    for (let c = 0; c < words[i].length; c++) {
      wordHash = (wordHash * 33 + words[i].charCodeAt(c)) % dim;
    }
    const wPos = Math.abs(wordHash) % dim;
    vec[wPos] += 2.0;

    if (i + 1 < words.length) {
      const biHash = (wordHash * 37 + words[i + 1].charCodeAt(0) * 19) % dim;
      vec[Math.abs(biHash) % dim] += 1.5;
    }
  }

  let sumSq = 0;
  for (let i = 0; i < dim; i++) {
    sumSq += vec[i] * vec[i];
  }

  const norm = Math.sqrt(sumSq);
  if (norm === 0) {
    vec[0] = 1.0;
    return Array.from(vec);
  }

  for (let i = 0; i < dim; i++) {
    vec[i] = vec[i] / norm;
  }

  return Array.from(vec);
}

export interface CandidateRubric {
  rubric_id: number;
  rubric_path: string;
  chapter: string;
  rrf_score: number;
  fts_rank?: number;
  vector_rank?: number;
  repertory_id?: string;
  sources?: Array<{ book: string; edition?: string; page?: string }>;
}

export interface StoredRubric {
  id: number;
  chapter: string;
  rubric_path: string;
  embedding: number[];
  repertory_id?: string;
  sources?: Array<{ book: string; edition?: string; page?: string }>;
}

export interface SynonymEntry {
  phrase: string;
  canonical_phrase: string;
  locale?: string;
}

/**
 * Expands colloquial and Indian-English phrases using synonyms table.
 * Sorts by phrase length DESC so specific multi-word phrases match before substrings.
 */
export function expandSynonyms(input: string, synonyms: SynonymEntry[]): string {
  let expanded = input.toLowerCase();
  const sortedSynonyms = [...synonyms].sort((a, b) => b.phrase.length - a.phrase.length);
  for (const s of sortedSynonyms) {
    const pattern = new RegExp(`\\b${s.phrase.toLowerCase()}\\b`, "gi");
    if (pattern.test(expanded)) {
      expanded = expanded.replace(pattern, `${s.phrase} (${s.canonical_phrase})`);
    }
  }
  return expanded;
}

/**
 * Computes cosine similarity between two unit-normalized vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  return dot;
}

function stemToken(token: string): string {
  let t = token.toLowerCase();
  if (t === "agg" || t === "aggravated" || t === "aggravates" || t === "worse" || t === "worsened") return "agg";
  if (t === "amel" || t === "ameliorated" || t === "ameliorates" || t === "better" || t === "relieved") return "amel";
  if (t === "headache" || t === "headaches" || t === "migraine") return "head";
  if (t === "diarrhea" || t === "diarrhoea" || t === "motions") return "diarrh";
  if (t === "hemorrhoids" || t === "haemorrhoids" || t === "piles") return "haemorrhoid";
  if (t === "perspiration" || t === "sweating" || t === "sweat" || t === "sweats") return "perspir";
  if (t === "coughing" || t === "coughs" || t === "cough") return "cough";
  if (t === "burning" || t === "burns" || t === "scalds") return "burn";
  if (t === "throbbing" || t === "pulsating" || t === "pounding") return "pulsat";
  if (t === "stitching" || t === "stitches" || t === "stitch") return "stitch";
  if (t === "vomiting" || t === "vomits" || t === "vomit") return "vomit";
  if (t === "cramping" || t === "cramps" || t === "cramp") return "cramp";
  if (t === "itching" || t === "itches" || t === "itch") return "itch";
  if (t === "swelling" || t === "swollen" || t === "swells") return "swell";
  if (t.endsWith("ness") && t.length > 5) t = t.slice(0, -4);
  else if (t.endsWith("ing") && t.length > 5) t = t.slice(0, -3);
  else if (t.endsWith("ies") && t.length > 4) t = t.slice(0, -3) + "y";
  else if (t.endsWith("es") && t.length > 4) t = t.slice(0, -2);
  else if (t.endsWith("s") && !t.endsWith("ss") && t.length > 3) t = t.slice(0, -1);
  else if (t.endsWith("ed") && t.length > 4) t = t.slice(0, -2);
  return t;
}

/**
 * Computes lexical match score between search query and rubric path.
 * Employs stemming, exact phrase matching, bigrams, and token position weighting for maximum accuracy.
 */
function computeLexicalScore(query: string, rubricPath: string): number {
  const cleanQuery = query.toLowerCase().trim();
  const targetLower = rubricPath.toLowerCase();

  let score = 0;

  // 1. Exact phrase boost
  if (targetLower.includes(cleanQuery)) {
    score += 5.0;
  }

  const queryTokens = cleanQuery.split(/[^a-z0-9]+/).filter((t) => t.length > 2);
  const targetSegments = targetLower.split(";").map((s) => s.trim());
  const targetTokens = targetLower.split(/[^a-z0-9]+/).filter((t) => t.length > 2);
  const targetStems = new Set(targetTokens.map(stemToken));

  // 2. Token match, stem match, and segment bonus
  for (let i = 0; i < queryTokens.length; i++) {
    const token = queryTokens[i];
    const stem = stemToken(token);

    if (targetLower.includes(token)) {
      score += 1.5;
    } else if (targetStems.has(stem)) {
      score += 1.0;
    }

    // Segment exact match bonus
    if (targetSegments.some((s) => s.includes(token) || s.includes(stem))) {
      score += 0.8;
    }

    // Adjacent bigram match
    if (i + 1 < queryTokens.length) {
      const bi = `${token} ${queryTokens[i + 1]}`;
      if (targetLower.includes(bi)) {
        score += 2.0;
      }
    }
  }

  return score;
}

/**
 * Hybrid search using Reciprocal Rank Fusion (RRF) over full-text and vector embeddings.
 */
export function hybridSearch(
  query: string,
  rubrics: StoredRubric[],
  synonyms: SynonymEntry[] = [],
  options: { rrf_k?: number; limit?: number } = {}
): CandidateRubric[] {
  const k = options.rrf_k ?? 60;
  const limit = options.limit ?? 20;

  const expandedQuery = expandSynonyms(query, synonyms);
  const queryEmbedding = generateNormalizedEmbedding(expandedQuery, 768);

  // 1. Vector Search Ranking
  const vectorScores = rubrics.map((r) => ({
    rubric: r,
    sim: cosineSimilarity(queryEmbedding, r.embedding),
  }));
  vectorScores.sort((a, b) => b.sim - a.sim);

  const vectorRankMap = new Map<number, number>();
  vectorScores.forEach((item, index) => {
    vectorRankMap.set(item.rubric.id, index + 1);
  });

  // 2. Lexical / Full-Text Search Ranking
  const ftsScores = rubrics.map((r) => ({
    rubric: r,
    score: computeLexicalScore(expandedQuery, r.rubric_path),
  }));
  ftsScores.sort((a, b) => b.score - a.score);

  const ftsRankMap = new Map<number, number>();
  ftsScores.forEach((item, index) => {
    if (item.score > 0) {
      ftsRankMap.set(item.rubric.id, index + 1);
    }
  });

  // 3. Reciprocal Rank Fusion (RRF)
  // RRF(r) = (1 / (k + rank_fts)) + (1 / (k + rank_vec))
  const fused: CandidateRubric[] = rubrics.map((r) => {
    const vRank = vectorRankMap.get(r.id) ?? 999;
    const fRank = ftsRankMap.get(r.id) ?? 999;

    let rrf = 1.0 / (k + vRank);
    if (fRank <= 100) {
      rrf += 1.0 / (k + fRank);
    }

    return {
      rubric_id: r.id,
      rubric_path: r.rubric_path,
      chapter: r.chapter,
      rrf_score: rrf,
      fts_rank: fRank,
      vector_rank: vRank,
      repertory_id: r.repertory_id,
      sources: r.sources,
    };
  });

  fused.sort((a, b) => b.rrf_score - a.rrf_score);
  return fused.slice(0, limit);
}

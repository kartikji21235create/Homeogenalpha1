/**
 * Hybrid Retrieval Engine with Reciprocal Rank Fusion (RRF) and Synonym Expansion
 * (PRD Section 8, Problem 6)
 */

/**
 * Generates an L2-normalized 768-dimensional embedding from text.
 */
export function generateNormalizedEmbedding(text: string, dim = 768): number[] {
  if (dim !== 768) {
    throw new Error(`Invalid embedding dimension ${dim}. Expected 768.`);
  }

  const vec = new Float64Array(dim);
  const normalizedText = text.toLowerCase().trim();

  for (let i = 0; i < normalizedText.length; i++) {
    const charCode = normalizedText.charCodeAt(i);
    const pos = (charCode * 31 + i * 17) % dim;
    vec[pos] += 1.0;
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
 */
export function expandSynonyms(input: string, synonyms: SynonymEntry[]): string {
  let expanded = input.toLowerCase();
  for (const s of synonyms) {
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

/**
 * Computes lexical match score between search query and rubric path.
 */
function computeLexicalScore(query: string, rubricPath: string): number {
  const queryTokens = query.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 2);
  const targetLower = rubricPath.toLowerCase();

  let score = 0;
  for (const token of queryTokens) {
    if (targetLower.includes(token)) {
      score += 1.0;
      // bonus if in the same position or exact rubric segment
      const segments = targetLower.split(";").map((s) => s.trim());
      if (segments.some((s) => s.includes(token))) {
        score += 0.5;
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

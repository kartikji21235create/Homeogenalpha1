/**
 * clause_parser.ts — rule-based structuring of a (PII-redacted) narrative BEFORE retrieval.
 *
 * Why: the retrieval + selector stage currently sees raw text, so "no thirst",
 * "right-sided" or "worse from cold" can be matched to the opposite or a
 * side-less rubric. This module extracts those cues deterministically so that
 *   (a) retrieval can add/boost query terms ("cold", "worse"), and
 *   (b) the closed-set selector is told "this clause is NEGATED / RIGHT-sided",
 *   (c) negated clauses can be shown to the doctor as "absent symptom" instead
 *       of being silently mapped to a positive rubric.
 *
 * Limits (documented, not hidden): negation scope = whole clause; "worse, not better"
 * style contrasts are flagged `negated` and should be reviewed by the doctor.
 * Hinglish coverage is a starter set — extend from real doctor query logs.
 */

export type Direction = 'worse' | 'better';
export interface Modality { factor: string; direction: Direction }
export interface ParsedClause {
  text: string;
  negated: boolean;
  side: 'right' | 'left' | null;
  modalities: Modality[];
  timeOfDay: 'morning' | 'forenoon' | 'afternoon' | 'evening' | 'night' | 'midnight' | null;
}

const CLAUSE_SPLIT = /[.;\n]+|\s+(?:but|however|although|lekin|magar|par|parantu)\s+/i;

// word-boundary-safe for Latin; Devanagari handled by plain includes below.
const NEGATION = /\b(?:no|not|without|never|absent|denies|nil|nahi|nahin|nhi|bina)\b|नहीं|नही|बिना/i;

const RIGHT = /\b(?:right|dayein|daayein|dayen|dahine|dahina)\b|दाएं|दायें|दाया|दायाँ|दाहिने/i;
const LEFT = /\b(?:left|bayein|baayein|bayen|baen)\b|बाएं|बायें|बाया|बायाँ/i;

// English cues come BEFORE the factor ("worse from cold"); Hinglish cues come AFTER ("thand se badhta").
const EN_WORSE = /\b(?:worse|worst|aggravated|aggravation|agg|aggr|increases?|<)\b|</gi;
const EN_BETTER = /\b(?:better|relieved|relief|ameliorated|amelioration|amel|improves?|eases?)\b|>/gi;
const HI_WORSE = /badh(?:ta|ti|te)?\b|badh\s*jata|zyada\s*hota|बढ़ता|बढ़ती|बढ़ते/gi;
const HI_BETTER = /aaram|araam|aram|rahat|kam\s*(?:hota|hoti|ho\s*jata)|आराम|राहत/gi;

// canonical factor -> surface forms (lowercase). Longer forms first inside each list.
const FACTORS: Record<string, string[]> = {
  'cold': ['cold air', 'cold weather', 'cold', 'thand', 'thanda', 'सर्दी', 'ठंड', 'ठंडे'],
  'heat/warmth': ['warm room', 'warmth', 'warm', 'heat', 'hot', 'garmi', 'garam', 'गर्मी', 'गरम'],
  'motion': ['motion', 'movement', 'moving', 'walking', 'hilne', 'chalne', 'चलने', 'हिलने'],
  'rest': ['rest', 'lying still', 'sitting'],
  'night': ['at night', 'night', 'raat', 'रात'],
  'morning': ['in the morning', 'morning', 'subah', 'सुबह'],
  'evening': ['in the evening', 'evening', 'shaam', 'शाम'],
  'damp weather': ['damp weather', 'wet weather', 'damp', 'humid', 'rain', 'baarish', 'barish', 'nami', 'बारिश', 'नमी'],
  'open air': ['open air', 'fresh air', 'khuli hawa', 'खुली हवा'],
  'eating': ['after eating', 'after meals', 'eating', 'khane ke baad', 'khane se', 'खाने'],
  'pressure': ['pressure', 'pressing', 'dabane', 'दबाने'],
  'touch': ['touch', 'touching', 'chhune', 'छूने'],
  'lying down': ['lying down', 'lying', 'letne', 'लेटने'],
  'bending': ['bending', 'jhukne', 'झुकने'],
  'cold drinks': ['cold drinks', 'cold water', 'thanda paani', 'thande paani'],
  'thunderstorm': ['thunderstorm', 'thunder'],
};

const TIME: [ParsedClause['timeOfDay'], RegExp][] = [
  ['midnight', /\bmidnight\b|aadhi raat|आधी रात/i],
  ['morning', /\bmorning\b|\bsubah\b|सुबह/i],
  ['forenoon', /\bforenoon\b/i],
  ['afternoon', /\bafternoon\b|\bdopahar\b|दोपहर/i],
  ['evening', /\bevening\b|\bshaam\b|शाम/i],
  ['night', /\bnight\b|\braat\b|रात/i],
];

interface Hit { index: number; value: string }

function findAll(re: RegExp, s: string): Hit[] {
  const out: Hit[] = [];
  const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  let m: RegExpExecArray | null;
  while ((m = g.exec(s)) !== null) {
    out.push({ index: m.index, value: m[0] });
    if (m[0].length === 0) g.lastIndex++;
  }
  return out;
}

function findFactors(s: string): { index: number; factor: string }[] {
  const hits: { index: number; end: number; factor: string }[] = [];
  for (const [factor, forms] of Object.entries(FACTORS)) {
    for (const f of forms) {
      let from = 0;
      for (;;) {
        const i = s.indexOf(f, from);
        if (i < 0) break;
        hits.push({ index: i, end: i + f.length, factor });
        from = i + f.length;
      }
    }
  }
  // drop hits fully contained in a longer hit of the same position span; keep first per factor+index
  hits.sort((a, b) => a.index - b.index || b.end - a.end);
  const kept: typeof hits = [];
  let lastEnd = -1;
  for (const h of hits) {
    if (h.index >= lastEnd) {
      kept.push(h);
      lastEnd = h.end;
    }
  }
  return kept.map((h) => ({ index: h.index, factor: h.factor }));
}

export function parseClauses(narrative: string): ParsedClause[] {
  const clauses = narrative
    .split(CLAUSE_SPLIT)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  return clauses.map((text) => {
    const s = text.toLowerCase();
    const negated = NEGATION.test(s);

    const r = RIGHT.test(s);
    const l = LEFT.test(s);
    const side = r && !l ? 'right' : l && !r ? 'left' : null;

    const enCues: (Hit & { direction: Direction })[] = [
      ...findAll(EN_WORSE, s).map((h) => ({ ...h, direction: 'worse' as Direction })),
      ...findAll(EN_BETTER, s).map((h) => ({ ...h, direction: 'better' as Direction })),
    ].sort((a, b) => a.index - b.index);
    const hiCues: (Hit & { direction: Direction })[] = [
      ...findAll(HI_WORSE, s).map((h) => ({ ...h, direction: 'worse' as Direction })),
      ...findAll(HI_BETTER, s).map((h) => ({ ...h, direction: 'better' as Direction })),
    ].sort((a, b) => a.index - b.index);

    const modalities: Modality[] = [];
    const seen = new Set<string>();
    for (const f of findFactors(s)) {
      // nearest English cue BEFORE the factor, else nearest Hinglish cue AFTER it
      const before = [...enCues].reverse().find((c) => c.index < f.index);
      const after = hiCues.find((c) => c.index > f.index);
      const cue = before ?? after;
      if (!cue) continue;
      const key = `${f.factor}|${cue.direction}`;
      if (seen.has(key)) continue;
      seen.add(key);
      modalities.push({ factor: f.factor, direction: cue.direction });
    }

    const timeOfDay = TIME.find(([, re]) => re.test(s))?.[0] ?? null;
    return { text, negated, side, modalities, timeOfDay };
  });
}

/** Compact hint string appended to the selector prompt / used to boost retrieval. */
export function clauseHint(c: ParsedClause): string {
  const parts: string[] = [];
  if (c.negated) parts.push('NEGATED (symptom is ABSENT)');
  if (c.side) parts.push(`${c.side}-sided`);
  for (const m of c.modalities) parts.push(`${m.direction} from ${m.factor}`);
  if (c.timeOfDay) parts.push(`time: ${c.timeOfDay}`);
  return parts.join('; ');
}

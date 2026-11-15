/**
 * Rule-based Clinical Emergency Presentation Detector (PRD Section 13, Rule 5)
 * Runs outside the LLM to detect red-flag conditions requiring immediate allopathic/emergency referral.
 */

export interface EmergencyCheckResult {
  detected: boolean;
  category?: "CARDIAC" | "STROKE" | "TRAUMA" | "RESPIRATORY_DISTRESS";
  bannerMessage?: string;
  matchedKeywords: string[];
}

const EMERGENCY_RULES = [
  {
    category: "CARDIAC" as const,
    patterns: [
      /\bcrushing\s+(substernal\s+)?chest\s+pain\b/i,
      /\bchest\s+pain\s+(radiating|spreading)\s+to\s+(left\s+)?arm\b/i,
      /\bchest\s+pain\s+(radiating|spreading)\s+to\s+jaw\b/i,
      /\bmyocardial\s+infarction\b/i,
      /\bcardiac\s+arrest\b/i,
      /\bsevere\s+central\s+chest\s+pressure\s+with\s+sweating\b/i,
    ],
    message: "EMERGENCY: Potential acute coronary syndrome / cardiac emergency detected. Immediate hospital emergency referral required.",
  },
  {
    category: "STROKE" as const,
    patterns: [
      /\bsudden\s+weakness\s+(in\s+)?(one|left|right)\s+side\b/i,
      /\bsudden\s+(facial|face)\s+droop\b/i,
      /\bsudden\s+slurred\s+speech\b/i,
      /\bsudden\s+loss\s+of\s+vision\b/i,
      /\bhemiplegia\b/i,
      /\btransient\s+ischemic\s+attack\b/i,
    ],
    message: "EMERGENCY: Potential acute cerebrovascular event / stroke symptoms detected (FAST protocol). Immediate emergency neuro referral required.",
  },
  {
    category: "TRAUMA" as const,
    patterns: [
      /\bsevere\s+head\s+injury\s+with\s+unconsciousness\b/i,
      /\bmassive\s+arterial\s+bleeding\b/i,
      /\bcompound\s+fracture\b/i,
      /\bpenetrating\s+chest\s+wound\b/i,
    ],
    message: "EMERGENCY: Acute severe trauma or life-threatening hemorrhage detected. Immediate trauma center care required.",
  },
  {
    category: "RESPIRATORY_DISTRESS" as const,
    patterns: [
      /\bsevere\s+stridor\s+with\s+cyanosis\b/i,
      /\bacutely\s+gasping\s+for\s+air\s+unable\s+to\s+speak\b/i,
      /\banaphylactic\s+shock\b/i,
    ],
    message: "EMERGENCY: Severe acute respiratory failure or anaphylaxis detected. Immediate emergency intervention required.",
  },
];

export function detectEmergencySigns(narrative: string): EmergencyCheckResult {
  const matchedKeywords: string[] = [];

  for (const rule of EMERGENCY_RULES) {
    for (const pattern of rule.patterns) {
      const match = narrative.match(pattern);
      if (match) {
        matchedKeywords.push(match[0]);
        return {
          detected: true,
          category: rule.category,
          bannerMessage: rule.message,
          matchedKeywords,
        };
      }
    }
  }

  return {
    detected: false,
    matchedKeywords: [],
  };
}

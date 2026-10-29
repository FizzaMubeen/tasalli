// Tasalli — Safety and Crisis Screening System
// Strictly adheres to Rule 2: Safety beats everything.
// Runs before retrieval, stage determination, or LLM generation.

export type RiskLevel = 'none' | 'elevated' | 'imminent';

export interface SafetyCheckResult {
  risk: RiskLevel;
  reason?: string;
  isFiqh: boolean;
  detectedSituationSlug?: string;
}

// Imminent risk patterns (English + Roman Urdu)
export const IMMINENT_KEYWORDS = [
  /\b(kill\s*(myself|me))\b/i,
  /\b(want\s+to\s+die)\b/i,
  /\b(suicide|suicidal)\b/i,
  /\b(end\s+my\s+life)\b/i,
  /\b(want\s+to\s+end\s+it)\b/i,
  /\b(end\s+it\s+all)\b/i,
  /\b(don'?t\s+want\s+to\s+live(\s+anymore)?)\b/i,
  /\b(don'?t\s+want\s+to\s+(be\s+here|exist))\b/i,
  /\b(better\s+off\s+dead)\b/i,
  /\b(wish\s+i\s+(were|was)\s+dead)\b/i,
  /\b(not\s+wanting\s+to\s+live)\b/i,
  /\b(can'?t\s+go\s+on\s+living)\b/i,
  /\b(can'?t\s+keep\s+living)\b/i,
  /\b(hurt\s*myself|self\s*harm|cutting\s*myself)\b/i,
  /\b(overdose|take\s+all\s+my\s+pills)\b/i,
  /\b(no\s+point\s+in\s+living)\b/i,
  /\b(no\s+reason\s+to\s+live)\b/i,
  /\b(i\s+want\s+to\s+disappear\s+forever)\b/i,
  // Roman Urdu patterns
  /\b(mar\s*jana\s*chahta|mar\s*jana\s*chahti)\b/i,
  /\b(zindagi\s*khatam\s*(karna|karni)?)\b/i,
  /\b(khudkushi|khud\s*kushi)\b/i,
  /\b(jeena\s*nahi\s*chahta|jeena\s*nahi\s*chahti)\b/i,
  /\b(apne\s*aap\s*ko\s*khatam)\b/i,
  /\b(mujhe\s+marna\s+hai)\b/i,
  /\b(ab\s+nahi\s+jeena)\b/i,
  /\b(khatam\s*karna\s*(chahta|chahti))\b/i,
  /\b(zindagi\s+se\s+tang\s+aa\s+gaya)\b/i
];

// Elevated risk patterns (severe hopelessness / overwhelmed distress)
export const ELEVATED_KEYWORDS = [
  /\b(hopeless|no\s+hope\s+left)\b/i,
  /\b(can'?t\s+take\s+this\s+pain\s+anymore)\b/i,
  /\b(drowning\s+in\s+sadness)\b/i,
  /\b(so\s+alone\s+and\s+scared)\b/i,
  /\b(everything\s+is\s+ruined)\b/i,
  /\b(nobody\s+cares\s+if\s+i\s+exist)\b/i,
  /\b(giving\s+up\s+on\s+life)\b/i,
  /\b(sab\s*khatam\s*ho\s*gaya)\b/i,
  /\b(bardasht\s*nahi\s*hota)\b/i
];

// Fiqh ruling patterns (divorce, inheritance, halal/haram verdicts, zakat calculations)
export const FIQH_PATTERNS = [
  /\b(is\s+it\s+halal\s+or\s+haram|is\s+this\s+haram|is\s+this\s+halal)\b/i,
  /\b(fatwa|ruling\s+on|sharia\s+ruling)\b/i,
  /\b(talaq|talaaq|divorce\s+procedure|did\s+divorce\s+happen)\b/i,
  /\b(calculate\s+my\s+zakat|zakat\s+percentage|inheritance\s+share|miras)\b/i,
  /\b(does\s+this\s+break\s+my\s+wudu|does\s+this\s+invalidate\s+fast)\b/i
];

/**
 * Perform comprehensive safety screening before any retrieval or response logic
 */
export function checkSafety(userMessage: string): SafetyCheckResult {
  const trimmed = userMessage.trim();

  // 1. Imminent Risk Check (Priority 1 — stops pipeline immediately)
  for (const pattern of IMMINENT_KEYWORDS) {
    if (pattern.test(trimmed)) {
      return {
        risk: 'imminent',
        reason: 'Explicit mention of suicide, self-harm, or ending life.',
        isFiqh: false
      };
    }
  }

  // 2. Fiqh Boundary Check
  let isFiqh = false;
  for (const pattern of FIQH_PATTERNS) {
    if (pattern.test(trimmed)) {
      isFiqh = true;
      break;
    }
  }

  // 3. Elevated Risk Check
  for (const pattern of ELEVATED_KEYWORDS) {
    if (pattern.test(trimmed)) {
      return {
        risk: 'elevated',
        reason: 'Expressions of profound despair or unbearable weight.',
        isFiqh
      };
    }
  }

  return {
    risk: 'none',
    isFiqh
  };
}

import { LIBRARY_MAP } from '../data/library';
import { STORY_MAP, STORY_TOKEN_REGEX } from './storyRetrieval';
import { ValidatorResult } from '../types';

export interface ValidatorLogEntry {
  id: string;
  timestamp: string;
  outcome: 'pass' | 'blocked' | 'trimmed' | 'listen_stripped';
  ruleFailed?: string;
  unknownRefsCount: number;
  retried: boolean;
  citedCount: number;
}

// In-memory audit log for Phase 1 metric tracking (zero unverified citations shown)
export const VALIDATOR_AUDIT_LOG: ValidatorLogEntry[] = [];

// Regex to capture [[cite:ID]] tokens
export const CITE_TOKEN_REGEX = /\[\[cite:([a-zA-Z0-9_\-]+)\]\]/g;
export const HADITH_TOKEN_REGEX = /\[\[hadith:(\d+)\]\]/g;

// Regex for free-text references that should NOT appear in model words
// e.g. Bukhari 6369, Sahih Muslim 918, Surah 94:5-6, 13:28, etc.
export const FREE_TEXT_REF_REGEX = /\b(bukhari|muslim|tirmidhi|abu\s*dawud|nasa'i|ibn\s*majah|muwatta|surah|ayah)\b[\s\S]{0,25}\b\d+(:|\b\d+)?|\b\d{1,3}:\d{1,3}\b/i;

// Regex for Arabic script Unicode ranges
export const ARABIC_SCRIPT_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

// Regex for quoted sayings outside tokens
export const QUOTED_SAYINGS_REGEX = /(the\s+prophet|rasulullah|the\s+messenger|allah|the\s+almighty|god)\s*(صلى\s*الله\s*عليه\s*وسلم|pbuh)?\s*(said|says|spoke|revealed|states)[\s\S]{0,10}["“][^"”]+["”]/i;

// Regex for model-written theological claims / religious assertions outside tokens
export const RELIGIOUS_CLAIMS_REGEX = /\b(allah\s+(has\s+promised|will\s+reward|commands|wants\s+you\s+to|is\s+testing\s+you|forgives\s+all)|prophet\s+(guaranteed|promised|commanded)|in\s+islam\s+it\s+is\s+(forbidden|obligatory|promised)|your\s+sins\s+are\s+forgiven|divine\s+(decree|promise|punishment|reward)|qur'?an\s+(says|promises)|hadith\s+(says|teaches))\b/i;

/**
 * Remove citations from text so we can check remaining text for illicit free-text content
 */
function removeTokens(text: string): string {
  return text.replace(CITE_TOKEN_REGEX, ' ')
    .replace(STORY_TOKEN_REGEX, ' ')
    .replace(HADITH_TOKEN_REGEX, ' ');
}

const NON_NAME_CAPITALIZED_WORDS = new Set([
  'A', 'About', 'After', 'Again', 'All', 'Although', 'And', 'As', 'At', 'Before', 'Because',
  'But', 'By', 'Can', 'Each', 'Even', 'For', 'From', 'He', 'Her', 'Here', 'His', 'How', 'I',
  'If', 'In', 'It', 'Its', 'Later', 'May', 'Maybe', 'Most', 'My', 'No', 'Not', 'Now', 'Of',
  'On', 'Once', 'One', 'Or', 'Our', 'She', 'Since', 'So', 'Some', 'Soon', 'That', 'The',
  'Their', 'Then', 'There', 'They', 'This', 'Those', 'Though', 'Through', 'To', 'Today',
  'Two', 'We', 'What', 'When', 'Where', 'While', 'Who', 'With', 'You', 'Your', 'Prophet'
]);

function findUnallowedNames(text: string, allowedNames: string[]): string[] {
  const allowed = new Set(allowedNames.flatMap(name =>
    name.match(/[\p{L}]+(?:['’][\p{L}]+)?/gu) ?? []
  ).map(name => name.toLocaleLowerCase()));
  const capitalizedWords = text.match(/\b[\p{Lu}][\p{L}]*(?:['’][\p{L}]+)?\b/gu) ?? [];
  return [...new Set(capitalizedWords.filter(name =>
    !NON_NAME_CAPITALIZED_WORDS.has(name) && !allowed.has(name.toLocaleLowerCase())
  ))];
}

/**
 * Validate a model reply against all Phase 1 Citation Validator rules
 */
export function validateReply(
  replyText: string,
  retrievedIds: string[],
  stage: 'listen' | 'respond',
  retrievedStoryIds: string[] = [],
  crisisMode = false,
  retrievedHadithIds: number[] = []
): ValidatorResult {
  const rulesChecked: { rule: string; passed: boolean; details?: string }[] = [];
  let cleanedText = replyText;

  const storyMatches = Array.from(replyText.matchAll(STORY_TOKEN_REGEX));
  const storyIds = storyMatches.map(match => match[1]);
  const hadithMatches = Array.from(replyText.matchAll(HADITH_TOKEN_REGEX));
  const hadithIds = hadithMatches.map(match => Number(match[1]));

  if (hadithIds.length > 0 && (stage === 'listen' || crisisMode)) {
    rulesChecked.push({ rule: 'Hadith Stage', passed: false });
    logValidatorEvent('blocked', 0, 0, false, 'Hadith not allowed in this stage');
    return {
      valid: false,
      reason: 'Hadiths are not allowed in listen or crisis mode',
      citedIds: [],
      storyIds,
      hadithIds,
      rulesChecked
    };
  }
  if (hadithIds.length > 3) {
    rulesChecked.push({ rule: 'Hadith Limit (<=3)', passed: false });
    logValidatorEvent('blocked', 0, 0, false, 'Too many hadiths cited');
    return {
      valid: false,
      reason: 'At most three hadiths may be cited in a reply',
      citedIds: [],
      storyIds,
      hadithIds,
      rulesChecked
    };
  }
  if (hadithIds.some(id => !retrievedHadithIds.includes(id))) {
    rulesChecked.push({ rule: 'Retrieved Hadith Only', passed: false });
    logValidatorEvent('blocked', 0, 0, false, 'Unretrieved hadith cited');
    return {
      valid: false,
      reason: 'Cites a hadith that was not retrieved for this turn',
      citedIds: [],
      storyIds,
      hadithIds,
      rulesChecked
    };
  }

  if (storyIds.length > 0) {
    if (crisisMode || stage === 'listen') {
      rulesChecked.push({ rule: 'Story Stage', passed: false, details: 'Stories are not allowed in listen or crisis mode.' });
      logValidatorEvent('blocked', 0, 0, false, 'Story not allowed in this stage');
      return {
        valid: false,
        reason: 'Stories are not allowed in listen or crisis mode',
        citedIds: [],
        storyIds,
        hadithIds,
        rulesChecked
      };
    }
    if (storyIds.length > 1) {
      rulesChecked.push({ rule: 'Story Limit (<=1)', passed: false, details: 'At most one story may be cited in a reply.' });
      logValidatorEvent('blocked', 0, 0, false, 'Multiple stories cited');
      return {
        valid: false,
        reason: 'At most one story may be cited in a reply',
        citedIds: [],
        storyIds,
        hadithIds,
        rulesChecked
      };
    }

    const story = STORY_MAP.get(storyIds[0]);
    if (!story || story.status !== 'reviewed') {
      rulesChecked.push({ rule: 'Known Reviewed Stories', passed: false });
      logValidatorEvent('blocked', 1, 0, false, 'Unknown or unreviewed story');
      return {
        valid: false,
        reason: `Cites unknown or unreviewed story: ${storyIds[0]}`,
        citedIds: [],
        storyIds,
        hadithIds,
        rulesChecked
      };
    }
    if (!retrievedStoryIds.includes(story.id)) {
      rulesChecked.push({ rule: 'Retrieved Story Only', passed: false });
      logValidatorEvent('blocked', 0, 0, false, 'Unretrieved story cited');
      return {
        valid: false,
        reason: `Story "${story.id}" was not retrieved for this turn`,
        citedIds: [],
        storyIds,
        hadithIds,
        rulesChecked
      };
    }

    const storyBody = removeTokens(replyText);
    const unallowedNames = findUnallowedNames(storyBody, story.allowed_names);
    if (unallowedNames.length > 0) {
      rulesChecked.push({
        rule: 'Story Proper Names',
        passed: false,
        details: `Names not allowed for this story: ${unallowedNames.join(', ')}`
      });
      logValidatorEvent('blocked', 0, 0, false, 'Unallowed story proper name');
      return {
        valid: false,
        reason: `Story contains names not present in its allowed-names list: ${unallowedNames.join(', ')}`,
        citedIds: [],
        storyIds,
        hadithIds,
        rulesChecked
      };
    }
    rulesChecked.push({ rule: 'Story Proper Names', passed: true });
  }

  // Extract all cited IDs
  const matches = Array.from(replyText.matchAll(CITE_TOKEN_REGEX));
  let citedIds = matches.map(m => m[1]);

  // RULE 7: Listen Stage — No citations while stage = listen
  if (stage === 'listen') {
    if (citedIds.length > 0) {
      cleanedText = replyText.replace(CITE_TOKEN_REGEX, '').trim();
      citedIds = [];
      rulesChecked.push({
        rule: 'Listen Stage',
        passed: true,
        details: 'Stripped citations because conversation stage is "listen"'
      });
      logValidatorEvent('listen_stripped', 0, citedIds.length, false);
      return {
        valid: true,
        cleanedText,
        citedIds,
        storyIds,
        hadithIds,
        rulesChecked
      };
    } else {
      rulesChecked.push({ rule: 'Listen Stage', passed: true });
    }
  }

  // RULE 6: Limit — At most 2 citations per reply
  if (citedIds.length > 2) {
    const keepIds = new Set(citedIds.slice(0, 2));
    let count = 0;
    cleanedText = replyText.replace(CITE_TOKEN_REGEX, (match, id) => {
      if (keepIds.has(id) && count < 2) {
        count++;
        return match;
      }
      return '';
    });
    citedIds = citedIds.slice(0, 2);
    rulesChecked.push({
      rule: 'Citation Limit (<=2)',
      passed: true,
      details: 'Trimmed excess citations over 2'
    });
  } else {
    rulesChecked.push({ rule: 'Citation Limit (<=2)', passed: true });
  }

  // RULE 1: Known IDs — Every [[cite:id]] exists in library_texts with status = reviewed
  let unknownRefs = 0;
  for (const id of citedIds) {
    const item = LIBRARY_MAP.get(id);
    if (!item || item.status !== 'reviewed') {
      unknownRefs++;
      rulesChecked.push({
        rule: 'Known Reviewed IDs',
        passed: false,
        details: `ID "${id}" does not exist in library or is not reviewed.`
      });
      logValidatorEvent('blocked', unknownRefs, citedIds.length, false, 'Unknown or unreviewed ID');
      return {
        valid: false,
        reason: `Cites unknown or unreviewed library ID: ${id}`,
        citedIds,
        storyIds,
        hadithIds,
        rulesChecked
      };
    }
  }
  rulesChecked.push({ rule: 'Known Reviewed IDs', passed: true });

  // RULE 2: Retrieved Only — Every cited ID was in this turn's retrieved set
  const retrievedSet = new Set(retrievedIds);
  for (const id of citedIds) {
    if (!retrievedSet.has(id)) {
      rulesChecked.push({
        rule: 'Retrieved Only',
        passed: false,
        details: `Cited ID "${id}" was not in retrieved candidate set for this turn.`
      });
      logValidatorEvent('blocked', unknownRefs, citedIds.length, false, 'Unretrieved ID cited');
      return {
        valid: false,
        reason: `Cites ID "${id}" which was not part of retrieved set`,
        citedIds,
        storyIds,
        hadithIds,
        rulesChecked
      };
    }
  }
  rulesChecked.push({ rule: 'Retrieved Only', passed: true });

  // Text outside tokens for linguistic and source checks
  const textWithoutTokens = removeTokens(cleanedText);

  // RULE 3: No Free-Text References (Bukhari, Muslim, \d+:\d+, etc.) outside tokens
  if (FREE_TEXT_REF_REGEX.test(textWithoutTokens)) {
    const match = textWithoutTokens.match(FREE_TEXT_REF_REGEX);
    rulesChecked.push({
      rule: 'No Free-Text References',
      passed: false,
      details: `Free-text scripture reference detected: "${match ? match[0] : ''}"`
    });
    logValidatorEvent('blocked', unknownRefs, citedIds.length, false, 'Free-text reference detected');
    return {
      valid: false,
      reason: 'Model output contains free-text reference outside [[cite:id]] tokens',
      citedIds,
      storyIds,
      hadithIds,
      rulesChecked
    };
  }
  rulesChecked.push({ rule: 'No Free-Text References', passed: true });

  // RULE 4: No Arabic Script outside tokens
  if (ARABIC_SCRIPT_REGEX.test(textWithoutTokens)) {
    rulesChecked.push({
      rule: 'No Arabic Script in LLM Body',
      passed: false,
      details: 'Arabic characters found outside [[cite:id]] tokens'
    });
    logValidatorEvent('blocked', unknownRefs, citedIds.length, false, 'Arabic characters outside token');
    return {
      valid: false,
      reason: 'Arabic script must only come from database cards, never model text',
      citedIds,
      storyIds,
      hadithIds,
      rulesChecked
    };
  }
  rulesChecked.push({ rule: 'No Arabic Script in LLM Body', passed: true });

  // RULE 5: No Quoted Sayings outside tokens
  if (QUOTED_SAYINGS_REGEX.test(textWithoutTokens)) {
    rulesChecked.push({
      rule: 'No Quoted Sayings',
      passed: false,
      details: 'Quoted hadith or divine speech detected outside citation token'
    });
    logValidatorEvent('blocked', unknownRefs, citedIds.length, false, 'Quoted saying detected');
    return {
      valid: false,
      reason: 'Model may not quote scripture directly; must use [[cite:id]] tokens',
      citedIds,
      storyIds,
      hadithIds,
      rulesChecked
    };
  }
  rulesChecked.push({ rule: 'No Quoted Sayings', passed: true });

  // RULE 6: No Model-Written Religious Claims outside tokens
  if (RELIGIOUS_CLAIMS_REGEX.test(textWithoutTokens)) {
    rulesChecked.push({
      rule: 'No Model-Written Religious Claims',
      passed: false,
      details: 'Direct theological or religious assertion detected in model text'
    });
    logValidatorEvent('blocked', unknownRefs, citedIds.length, false, 'Theological claim detected');
    return {
      valid: false,
      reason: 'Model may not assert theological claims; sacred texts must strictly reside in verified library cards',
      citedIds,
      storyIds,
      hadithIds,
      rulesChecked
    };
  }
  rulesChecked.push({ rule: 'No Model-Written Religious Claims', passed: true });

  // Passed all checks!
  logValidatorEvent('pass', 0, citedIds.length, false);
  return {
    valid: true,
    cleanedText,
    citedIds,
    storyIds,
    hadithIds,
    rulesChecked
  };
}

function logValidatorEvent(
  outcome: 'pass' | 'blocked' | 'trimmed' | 'listen_stripped',
  unknownRefsCount: number,
  citedCount: number,
  retried: boolean,
  ruleFailed?: string
) {
  VALIDATOR_AUDIT_LOG.unshift({
    id: `val-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    outcome,
    unknownRefsCount,
    citedCount,
    retried,
    ruleFailed
  });
  if (VALIDATOR_AUDIT_LOG.length > 50) {
    VALIDATOR_AUDIT_LOG.pop();
  }
}

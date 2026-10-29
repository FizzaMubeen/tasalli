// Tasalli — Hadith Library: verified 500 + curated situation lines, stories and additions
import verifiedRaw from '../../AI Model/hadith-500-tasalli.json';
import curated from '../data/hadith-curated.json';
import { Hadith } from '../types';

export interface LibraryHadith {
  key: string;            // sunnah.com key, e.g. "bukhari:6114" (or "c12" for unverified additions)
  topic: string;
  text: string;
  narrator: string;
  arabic?: string;
  reference: string;
  grade: string;
  url: string;
  situation?: string;     // "When you…" line
  story?: string;         // Background story / context
  verbatim: boolean;      // true = verbatim sunnah.com translation with Arabic
}

export interface HadithTopic {
  name: string;
  icon: string;           // Material Symbols name
  group: 'heart' | 'faith' | 'people' | 'life';
}

// Order and grouping shown on the library home
export const HADITH_TOPICS: HadithTopic[] = [
  { name: 'Worry, anxiety & distress', icon: 'cloud', group: 'heart' },
  { name: 'Patience in trials & hardship', icon: 'hourglass_bottom', group: 'heart' },
  { name: 'Grief, loss & death of loved ones', icon: 'local_florist', group: 'heart' },
  { name: 'Illness & pain', icon: 'healing', group: 'heart' },
  { name: 'Anger & self-control', icon: 'local_fire_department', group: 'heart' },
  { name: 'Envy, hatred & resentment', icon: 'heart_broken', group: 'heart' },
  { name: "Hope in Allah's mercy", icon: 'wb_sunny', group: 'heart' },
  { name: 'Repentance & forgiveness of sins', icon: 'water_drop', group: 'faith' },
  { name: 'Trust in Allah & destiny', icon: 'anchor', group: 'faith' },
  { name: 'Duas for difficult times', icon: 'volunteer_activism', group: 'faith' },
  { name: 'Remembrance of Allah & peace of heart', icon: 'spa', group: 'faith' },
  { name: 'Prayer & worship', icon: 'mosque', group: 'faith' },
  { name: 'Gratitude', icon: 'favorite', group: 'faith' },
  { name: "Learning & the Qur'an", icon: 'menu_book', group: 'faith' },
  { name: 'This world & the hereafter', icon: 'landscape', group: 'faith' },
  { name: 'Parents', icon: 'elderly', group: 'people' },
  { name: 'Marriage & spouse', icon: 'diversity_1', group: 'people' },
  { name: 'Children & family ties', icon: 'family_restroom', group: 'people' },
  { name: 'Brotherhood & friendship', icon: 'handshake', group: 'people' },
  { name: 'Neighbours & guests', icon: 'cottage', group: 'people' },
  { name: 'Kindness, gentleness & mercy to others', icon: 'pets', group: 'people' },
  { name: 'Speech, honesty & the tongue', icon: 'record_voice_over', group: 'people' },
  { name: 'Good character & manners', icon: 'workspace_premium', group: 'people' },
  { name: 'Provision, poverty & contentment', icon: 'savings', group: 'life' },
  { name: 'Debt & financial worries', icon: 'account_balance_wallet', group: 'life' },
  { name: 'Work, earning & effort', icon: 'work', group: 'life' },
  { name: 'Charity & helping others', icon: 'redeem', group: 'life' },
  { name: 'Ease, moderation & small deeds', icon: 'eco', group: 'life' },
  { name: 'Daily routine: sleep, food & morning', icon: 'bedtime', group: 'life' }
];

export const TOPIC_GROUPS: { id: HadithTopic['group']; title: string }[] = [
  { id: 'heart', title: 'What you are feeling' },
  { id: 'faith', title: 'Faith & worship' },
  { id: 'people', title: 'Family & people' },
  { id: 'life', title: 'Work, money & daily life' }
];

interface CuratedExtra { situation?: string; story?: string }
interface CuratedAddition extends CuratedExtra {
  id: string; topic: string; text: string; narrator: string; reference: string; grade: string; url: string;
}
const curatedData = curated as unknown as { overlays: Record<string, CuratedExtra>; additions: CuratedAddition[] };

const keyFromUrl = (url: string) => url.split('/').pop() ?? url;

const verified: LibraryHadith[] = (verifiedRaw as unknown as Hadith[]).map(h => {
  const key = keyFromUrl(h.url);
  const extra = curatedData.overlays[key] ?? {};
  return {
    key,
    topic: h.topic,
    text: h.text,
    narrator: h.narrator,
    arabic: h.arabic || undefined,
    reference: h.reference,
    grade: h.grade,
    url: h.url,
    situation: extra.situation,
    story: extra.story,
    verbatim: true
  };
});

const additions: LibraryHadith[] = curatedData.additions.map(a => ({
  key: a.id,
  topic: a.topic,
  text: a.text,
  narrator: a.narrator,
  reference: a.reference,
  grade: a.grade,
  url: a.url,
  situation: a.situation,
  story: a.story,
  verbatim: false
}));

// Entries with a situation line or story come first within a topic, so the most helpful ones lead.
const rank = (h: LibraryHadith) => (h.situation ? 0 : 1) + (h.verbatim ? 0 : 0.5);

export const LIBRARY_HADITH: LibraryHadith[] = [...verified, ...additions];

export const HADITH_BY_KEY = new Map(LIBRARY_HADITH.map(h => [h.key, h]));

export function hadithForTopic(topic: string): LibraryHadith[] {
  return LIBRARY_HADITH.filter(h => h.topic === topic).sort((a, b) => rank(a) - rank(b));
}

export function topicCount(topic: string): number {
  return LIBRARY_HADITH.reduce((n, h) => n + (h.topic === topic ? 1 : 0), 0);
}

export function searchHadith(query: string): LibraryHadith[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  return LIBRARY_HADITH.filter(h => {
    const hay = `${h.text} ${h.topic} ${h.narrator} ${h.reference} ${h.situation ?? ''} ${h.story ?? ''}`.toLowerCase();
    return terms.every(t => hay.includes(t));
  }).sort((a, b) => rank(a) - rank(b));
}

export function randomHadith(): LibraryHadith {
  const pool = LIBRARY_HADITH.filter(h => h.situation);
  return pool[Math.floor(Math.random() * pool.length)];
}

// Text prepared for reading aloud
function cleanForSpeech(text: string): string {
  return text
    .replace(/\(?ﷺ\)?/g, ', peace be upon him,')
    .replace(/\(\s*\)/g, '')
    .replace(/[“”"]/g, '')
    .replace(/`/g, "'")
    .replace(/\s+,/g, ',')
    .replace(/,\s*([.,;:!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function speakableText(h: LibraryHadith): string {
  const cleaned = cleanForSpeech(h.text);
  const body = /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`;
  const narrator = /^Narrated\s+/i.test(h.narrator)
    ? `Narrated by ${cleanForSpeech(h.narrator.replace(/^Narrated\s+/i, ''))}.`
    : `${cleanForSpeech(h.narrator).replace(/[:,]$/, '')}.`;
  const ref = h.reference
    .replace(/;/g, ', and')
    .replace(/Sahih al-Bukhari/g, 'Sahih Bukhari')
    .replace(/Jami` at-Tirmidhi|Jami' at-Tirmidhi/g, 'Tirmidhi')
    .replace(/Sunan Abi Dawud/g, 'Abu Dawud')
    .replace(/Sunan an-Nasa'i/g, "Nasa'i");
  const intro = h.situation ? `${h.situation}. ` : '';
  return `${intro}${body} ${narrator} Reference: ${ref}.`;
}

// Saved hadith (per device)
const SAVED_KEY = 'tasalli_saved_hadith_v1';
export function getSavedHadith(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
export function setSavedHadith(keys: string[]): void {
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(keys)); } catch { /* storage unavailable */ }
}

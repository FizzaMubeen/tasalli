import { describe, expect, it } from 'vitest';
import verified from '../AI Model/hadith-500-tasalli.json';
import curated from '../src/data/hadith-curated.json';
import {
  HADITH_TOPICS,
  LIBRARY_HADITH,
  hadithForTopic,
  searchHadith,
  speakableText
} from '../src/lib/hadithLibrary';

const keyOf = (url: string) => url.split('/').pop() ?? url;
const verifiedKeys = new Set((verified as { url: string }[]).map(h => keyOf(h.url)));
const data = curated as unknown as {
  overlays: Record<string, { situation?: string; story?: string }>;
  additions: { id: string; topic: string; text: string; narrator: string; reference: string; grade: string; url: string; situation?: string }[];
};

describe('Hadith Library data', () => {
  it('has more than 500 hadith in total', () => {
    expect(LIBRARY_HADITH.length).toBeGreaterThan(500);
  });

  it('only attaches situations and stories to hadith that exist in the verified set', () => {
    for (const key of Object.keys(data.overlays)) expect(verifiedKeys.has(key), key).toBe(true);
  });

  it('does not duplicate a verified hadith as an addition', () => {
    for (const a of data.additions) expect(verifiedKeys.has(keyOf(a.url)), a.url).toBe(false);
  });

  it('gives every addition a reference, grade, sunnah.com link and situation', () => {
    for (const a of data.additions) {
      expect(a.text.length, a.id).toBeGreaterThan(20);
      expect(a.reference, a.id).toMatch(/\d/);
      expect(a.grade, a.id).toMatch(/Sahih|Hasan/);
      expect(a.url, a.id).toMatch(/^https:\/\/sunnah\.com\/[a-z]+:\d+$/);
      expect(a.situation, a.id).toBeTruthy();
    }
  });

  it('places every hadith in a topic shown on the library home', () => {
    const names = new Set(HADITH_TOPICS.map(t => t.name));
    for (const h of LIBRARY_HADITH) expect(names.has(h.topic), `${h.key} → ${h.topic}`).toBe(true);
    for (const t of HADITH_TOPICS) expect(hadithForTopic(t.name).length, t.name).toBeGreaterThan(0);
  });

  it('uses unique keys', () => {
    expect(new Set(LIBRARY_HADITH.map(h => h.key)).size).toBe(LIBRARY_HADITH.length);
  });

  it('finds hadith by word and by reference', () => {
    expect(searchHadith('anger').length).toBeGreaterThan(0);
    expect(searchHadith('Bukhari 6114').some(h => h.reference.includes('6114'))).toBe(true);
  });

  it('prepares readable text for the voice feature', () => {
    for (const h of LIBRARY_HADITH) {
      const s = speakableText(h);
      expect(s).not.toContain('ﷺ');
      expect(s).toContain(`Reference: `);
    }
  });
});

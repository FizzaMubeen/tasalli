import { describe, expect, it } from 'vitest';
import { hadithService as service } from '../server/hadithService.mjs';

describe('hadith service', () => {
  it('loads the JSON once into a searchable 500-entry catalog', () => {
    const patience = service.getByTopic('Patience in trials & hardship');
    expect(patience.length).toBeGreaterThan(0);
    expect(patience.every(hadith => hadith.topic === 'Patience in trials & hardship')).toBe(true);
    expect(service.getByTopic('patience in trials & hardship')).toEqual(patience);
  });

  it('searches text and topic and returns at most five ranked entries', () => {
    const results = service.search('weeping grave patience');
    expect(results.length).toBeGreaterThanOrEqual(3);
    expect(results.length).toBeLessThanOrEqual(5);
    expect(results.some(hadith => hadith.text.toLowerCase().includes('woman'))).toBe(true);
    expect(service.search('   ')).toEqual([]);
  });

  it('detects the emotional topic and retrieves up to three matching hadiths', () => {
    const message = 'I feel worried and anxious about my future.';
    expect(service.detectTopics(message)[0]).toBe('Worry, anxiety & distress');
    const results = service.getRelevant(message, 3);
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(3);
    expect(results.every(hadith => hadith.topic === 'Worry, anxiety & distress')).toBe(true);
  });

  it('returns a random entry from the requested topic or the full catalog', () => {
    const topicHadith = service.getRandom('Gratitude');
    expect(topicHadith?.topic).toBe('Gratitude');
    expect(service.getRandom('not a real topic')).toBeUndefined();
    expect(service.getRandom()?.no).toEqual(expect.any(Number));
  });
});

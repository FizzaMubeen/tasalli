import { describe, expect, it } from 'vitest';
import { validateReply } from '../src/lib/validator';

describe('hadith reply validation', () => {
  it('accepts only hadiths retrieved for this turn', () => {
    expect(validateReply('A hadith for reflection. [[hadith:42]]', [], 'respond', [], false, [42]).valid)
      .toBe(true);
    const unavailable = validateReply('A hadith. [[hadith:99]]', [], 'respond', [], false, [42]);
    expect(unavailable.valid).toBe(false);
    expect(unavailable.reason).toContain('not retrieved');
  });

  it('blocks hadith citations during listen or crisis and limits them to three', () => {
    expect(validateReply('[[hadith:42]]', [], 'listen', [], false, [42]).valid).toBe(false);
    expect(validateReply('[[hadith:42]]', [], 'respond', [], true, [42]).valid).toBe(false);
    expect(validateReply(
      '[[hadith:1]] [[hadith:2]] [[hadith:3]] [[hadith:4]]',
      [],
      'respond',
      [],
      false,
      [1, 2, 3, 4]
    ).valid).toBe(false);
  });
});

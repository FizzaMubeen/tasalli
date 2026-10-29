import { describe, expect, it } from 'vitest';
import { calculatePrayerTimes, formatGregorianDate } from '../src/lib/prayerTimes';

const BERLIN = 'Europe/Berlin';

function nextFajr(referenceTime: string) {
  const now = new Date(referenceTime);
  const times = calculatePrayerTimes(now, 52.52, 13.405, 'MWL', 'standard', BERLIN);
  const fajr = times.find(prayer => prayer.id === 'fajr');
  expect(fajr).toBeDefined();
  expect(fajr?.isNext).toBe(true);
  return { now, fajr: fajr! };
}

describe('next prayer calculation', () => {
  it('formats the localized Gregorian date in weekday, day, month order', () => {
    expect(formatGregorianDate(new Date('2026-10-25T12:00:00Z'), 'en-US', BERLIN))
      .toBe('Sunday, 25 October');
  });

  it('selects tomorrow Fajr after Isha at 21:22', () => {
    const { now, fajr } = nextFajr('2026-10-25T21:22:00+01:00');
    expect(new Intl.DateTimeFormat('en-GB', { timeZone: BERLIN, dateStyle: 'full' }).format(fajr.dateObj))
      .toBe('Monday, 26 October 2026');
    expect(fajr.dateObj.getTime()).toBeGreaterThan(now.getTime());
  });

  it('selects today Fajr at 00:30', () => {
    const { now, fajr } = nextFajr('2026-10-25T00:30:00+02:00');
    expect(new Intl.DateTimeFormat('en-GB', { timeZone: BERLIN, dateStyle: 'full' }).format(fajr.dateObj))
      .toBe('Sunday, 25 October 2026');
    expect(fajr.dateObj.getTime()).toBeGreaterThan(now.getTime());
  });

  it('rolls the next Fajr over the autumn DST transition by calendar date', () => {
    const { now, fajr } = nextFajr('2026-10-24T21:22:00+02:00');
    expect(new Intl.DateTimeFormat('en-GB', { timeZone: BERLIN, dateStyle: 'full' }).format(fajr.dateObj))
      .toBe('Sunday, 25 October 2026');
    expect(fajr.dateObj.getTime() - now.getTime()).toBeGreaterThan(7 * 60 * 60 * 1000);
  });

  it('selects the same summer day Fajr before its time', () => {
    const { now, fajr } = nextFajr('2026-06-21T00:30:00+02:00');
    expect(new Intl.DateTimeFormat('en-GB', { timeZone: BERLIN, dateStyle: 'full' }).format(fajr.dateObj))
      .toBe('Sunday, 21 June 2026');
    expect(fajr.dateObj.getTime()).toBeGreaterThan(now.getTime());
  });
});

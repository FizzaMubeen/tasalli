import { PrayerLogEntry, PrayerName, PrayerTimeItem } from '../types';
import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from 'adhan';

export interface CalculationParams {
  fajrAngle: number;
  ishaAngle: number;
  asrMadhab: 'standard' | 'hanafi';
}

export const CALCULATION_METHODS: Record<string, { name: string; fajrAngle: number; ishaAngle: number }> = {
  MWL: { name: 'Muslim World League (Default)', fajrAngle: 18, ishaAngle: 17 },
  ISNA: { name: 'Islamic Society of North America (ISNA)', fajrAngle: 15, ishaAngle: 15 },
  EGYPT: { name: 'Egyptian General Authority', fajrAngle: 19.5, ishaAngle: 17.5 },
  MAKKAH: { name: 'Umm al-Qura University, Makkah', fajrAngle: 18.5, ishaAngle: 90 },
  KARACHI: { name: 'Univ. of Islamic Sciences, Karachi', fajrAngle: 18, ishaAngle: 18 }
};

const prayerDefinitions: { id: PrayerName; name: string; arabicName: string; key: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' }[] = [
  { id: 'fajr', name: 'Fajr', arabicName: 'الفجر', key: 'fajr' },
  { id: 'dhuhr', name: 'Dhuhr', arabicName: 'الظهر', key: 'dhuhr' },
  { id: 'asr', name: 'Asr', arabicName: 'العصر', key: 'asr' },
  { id: 'maghrib', name: 'Maghrib', arabicName: 'المغرب', key: 'maghrib' },
  { id: 'isha', name: 'Isha', arabicName: 'العشاء', key: 'isha' }
];

export function getTimezoneOffsetHours(date: Date, timeZone = 'Europe/Berlin'): number {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, Number(part.value)]));
  const timezoneDate = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second
  );
  return Math.round((timezoneDate - date.getTime()) / 3_600_000 * 100) / 100;
}

function getCalculationParameters(methodKey: string, asrMadhab: 'standard' | 'hanafi') {
  const methods = {
    MWL: CalculationMethod.MuslimWorldLeague,
    ISNA: CalculationMethod.NorthAmerica,
    EGYPT: CalculationMethod.Egyptian,
    MAKKAH: CalculationMethod.UmmAlQura,
    KARACHI: CalculationMethod.Karachi
  };
  const parameters = (methods[methodKey as keyof typeof methods] || CalculationMethod.MuslimWorldLeague)();
  parameters.madhab = asrMadhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  return parameters;
}

function getCalendarDate(date: Date, timeZone: string): Date {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }).formatToParts(date);
  const year = Number(parts.find(part => part.type === 'year')?.value);
  const month = Number(parts.find(part => part.type === 'month')?.value);
  const day = Number(parts.find(part => part.type === 'day')?.value);
  return new Date(year, month - 1, day, 12);
}

function addCalendarDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, 12);
}

function getAdhanTimes(
  date: Date,
  latitude: number,
  longitude: number,
  methodKey: string,
  asrMadhab: 'standard' | 'hanafi'
) {
  return new PrayerTimes(
    new Coordinates(latitude, longitude),
    date,
    getCalculationParameters(methodKey, asrMadhab)
  );
}

/**
 * Calculate today's prayer times and correctly roll Fajr into tomorrow after Isha.
 */
export function calculatePrayerTimes(
  date: Date = new Date(),
  latitude = 52.52, // Default Berlin coordinates for Europe/Berlin
  longitude = 13.405,
  methodKey = 'MWL',
  asrMadhab: 'standard' | 'hanafi' = 'standard',
  timeZone = 'Europe/Berlin'
): PrayerTimeItem[] {
  const localDate = getCalendarDate(date, timeZone);
  const today = getAdhanTimes(localDate, latitude, longitude, methodKey, asrMadhab);
  const tomorrow = getAdhanTimes(addCalendarDays(localDate, 1), latitude, longitude, methodKey, asrMadhab);
  const availableTimes = [
    ...prayerDefinitions.map(prayer => ({ prayer, dateObj: today[prayer.key] })),
    { prayer: prayerDefinitions[0], dateObj: tomorrow.fajr }
  ];
  const next = availableTimes.find(item => item.dateObj.getTime() > date.getTime())
    || { prayer: prayerDefinitions[0], dateObj: tomorrow.fajr };
  const current = [...availableTimes]
    .reverse()
    .find(item => item.dateObj.getTime() <= date.getTime());
  const todaysPrayerTimes: PrayerTimeItem[] = prayerDefinitions.map(({ id, name, arabicName, key }) => {
    const dateObj = id === 'fajr' && next.dateObj.getTime() === tomorrow.fajr.getTime()
      ? tomorrow.fajr
      : today[key];
    return {
      id,
      name,
      arabicName,
      timeStr: new Intl.DateTimeFormat(undefined, {
        timeZone,
        hour: 'numeric',
        minute: '2-digit'
      }).format(dateObj),
      dateObj,
      isNext: id === next.prayer.id,
      isCurrent: current?.prayer.id === id
    };
  });

  todaysPrayerTimes.splice(1, 0, {
    id: 'sunrise',
    name: 'Sunrise',
    arabicName: 'الشروق',
    timeStr: new Intl.DateTimeFormat(undefined, {
      timeZone,
      hour: 'numeric',
      minute: '2-digit'
    }).format(today.sunrise),
    dateObj: today.sunrise
  });
  return todaysPrayerTimes;
}

/**
 * Derive atmospheric period label dynamically from prayer times (Bug 3 fix)
 */
export function getCurrentPrayerPeriodLabel(prayerTimes: PrayerTimeItem[], now = new Date()): { label: string; icon: string } {
  const fajr = prayerTimes.find(p => p.id === 'fajr');
  const sunrise = prayerTimes.find(p => p.id === 'sunrise');
  const dhuhr = prayerTimes.find(p => p.id === 'dhuhr');
  const asr = prayerTimes.find(p => p.id === 'asr');
  const maghrib = prayerTimes.find(p => p.id === 'maghrib');
  const isha = prayerTimes.find(p => p.id === 'isha');

  if (fajr && sunrise && now >= fajr.dateObj && now < sunrise.dateObj) {
    return { label: 'Fajr Solace', icon: 'wb_twilight' };
  }
  if (sunrise && dhuhr && now >= sunrise.dateObj && now < dhuhr.dateObj) {
    return { label: 'Morning Light', icon: 'wb_sunny' };
  }
  if (dhuhr && asr && now >= dhuhr.dateObj && now < asr.dateObj) {
    return { label: 'Dhuhr Stillness', icon: 'wb_sunny' };
  }
  if (asr && maghrib && now >= asr.dateObj && now < maghrib.dateObj) {
    return { label: 'Asr Reflection', icon: 'wb_twilight' };
  }
  if (maghrib && isha && now >= maghrib.dateObj && now < isha.dateObj) {
    return { label: 'Maghrib Serenity', icon: 'nights_stay' };
  }
  return { label: 'Night Peace', icon: 'nights_stay' };
}

/**
 * Proper Hijri Date formatting with optional ±2 day adjustment (Bug 2 fix)
 */
export function getFormattedHijriDate(date: Date = new Date(), adjustment = 0): {
  day: number;
  monthName: string;
  year: number;
  weekday: string;
  formatted: string;
} {
  const adjusted = new Date(date);
  adjusted.setDate(adjusted.getDate() + Math.max(-2, Math.min(2, adjustment)));
  const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long'
  });
  const parts = formatter.formatToParts(adjusted);
  const day = Number(parts.find(part => part.type === 'day')?.value);
  const monthName = parts.find(part => part.type === 'month')?.value;
  const year = Number(parts.find(part => part.type === 'year')?.value);
  const weekday = parts.find(part => part.type === 'weekday')?.value;
  if (!day || !monthName || !year || !weekday) {
    throw new Error('The device does not provide Umm al-Qura calendar dates.');
  }
  const normalizedMonth = monthName
    .replace('Jumada I', 'Jumada al-Ula')
    .replace('Jumada II', 'Jumada al-Akhirah');

  return {
    day,
    monthName: normalizedMonth,
    year,
    weekday,
    formatted: `${weekday}, ${day} ${normalizedMonth}`
  };
}

export function formatGregorianDate(date: Date, locale = undefined as string | undefined, timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone): string {
  const parts = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.weekday}, ${values.day} ${values.month}`;
}

/**
 * Kind, merciful responses for prayer check-ins (Strictly no streaks, no shame)
 */
export function getPrayerFeedback(status: 'prayed' | 'will_do' | 'not_today', prayerName: string): string {
  switch (status) {
    case 'prayed':
      return `Alhamdulillah. May your ${prayerName} bring tranquility to your chest and be accepted.`;
    case 'will_do':
      return `Take your time. Wudu is a gentle reset for both body and mind.`;
    case 'not_today':
      return `Allah knows the weight of your heart and sees your efforts. Tomorrow is a new morning and His mercy is ever-near.`;
  }
}

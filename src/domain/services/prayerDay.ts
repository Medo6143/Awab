import type { PrayerDay } from '../entities/prayer';
import { AsrSchool, asrSchoolFor, methodForCountry } from '../entities/prayerMethods';

/** What today's times are calculated with: the user's choice, or the country's official method. */
export const prayerQuery = (
  prayerMethod: 'auto' | number,
  asrMethod: 'auto' | 'shafii' | 'hanafi' | undefined,
  countryCode: string | null,
): { method: number; school: AsrSchool } => ({
  method: prayerMethod === 'auto' ? methodForCountry(countryCode) : prayerMethod,
  school: asrSchoolFor(asrMethod, countryCode),
});

/** "dd-mm-yyyy", the form the stored day's gregorian date uses. */
export const dayKey = (now: Date) => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(now.getDate())}-${p(now.getMonth() + 1)}-${now.getFullYear()}`;
};

/**
 * Whether the stored day can be shown as is: it is today, with the same method and Asr school.
 * Times stored before the school was chosen have none, and are fetched again.
 */
export const isStoredDayValid = (stored: PrayerDay | null | undefined, now: Date, query: { method: number; school: AsrSchool }) => {
  if (!stored) return false;
  const school = stored.meta.school === 'HANAFI' ? 1 : stored.meta.school === 'STANDARD' ? 0 : -1;
  return stored.date.gregorian.date === dayKey(now) && stored.meta.method.id === query.method && school === query.school;
};

const WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

/** "الأربعاء · ١٧ جمادى الأولى", the widget's top row (weekday alone without a hijri date). */
export const widgetDateLine = (now: Date, hijri: { day: string | number; month: { ar: string } } | undefined, digits: (s: string) => string) => {
  const day = WEEKDAYS[now.getDay()];
  return hijri ? `${day} · ${digits(String(hijri.day))} ${hijri.month.ar}` : day;
};

/** Arabic name of a prayer or of sunrise, for display. */
export const prayerArName = (name: string) =>
  ({ Fajr: 'الفجر', Sunrise: 'الشروق', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' } as Record<string, string>)[name] ?? name;

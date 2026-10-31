import { parseClock, PRAYER_IDS, PrayerId } from './notifications';

export const PRAYER_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
export type ScheduleName = (typeof PRAYER_ORDER)[number];

/** Today's times as "HH:mm"; extra API fields (Imsak, Midnight...) are allowed and ignored. */
export type PrayerScheduleTimes = Partial<Record<ScheduleName, string>>;

export interface NextPrayer {
  name: ScheduleName;
  time: string;
  /** Minutes until it starts. */
  remaining: number;
}

/**
 * The next entry of today's schedule after `now`, or tomorrow's Fajr when today's are
 * over. Entries that are missing or unreadable are skipped instead of throwing.
 */
export const findNextPrayer = (timings: PrayerScheduleTimes, now: Date): NextPrayer | null => {
  const current = now.getHours() * 60 + now.getMinutes();
  for (const name of PRAYER_ORDER) {
    const time = timings[name];
    const at = parseClock(time);
    if (!time || !at) continue;
    const minutes = at.hours * 60 + at.minutes;
    if (minutes > current) return { name, time, remaining: minutes - current };
  }
  const fajr = parseClock(timings.Fajr);
  if (!fajr || !timings.Fajr) return null;
  return { name: 'Fajr', time: timings.Fajr, remaining: fajr.hours * 60 + fajr.minutes + 1440 - current };
};

export const PRAYER_AR_NAMES: Record<PrayerId, string> = {
  Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء',
};

/** The prayer (of the five) that started within the last `windowMinutes`, if any. */
export const prayerJustStarted = (timings: PrayerScheduleTimes, now: Date, windowMinutes = 3): PrayerId | null => {
  const current = now.getHours() * 60 + now.getMinutes();
  for (const id of PRAYER_IDS) {
    const at = parseClock(timings[id]);
    if (!at) continue;
    const diff = current - (at.hours * 60 + at.minutes);
    if (diff >= 0 && diff <= windowMinutes) return id;
  }
  return null;
};

/**
 * The prayer a notification announces, or null for any other notification. Prayer
 * notifications carry `type: 'prayer'` and `prayerName`; older ones only a title
 * like "صلاة العصر". A typed notification of another kind is never the adhan: the
 * reminder before a prayer is titled "تنبيه: صلاة العصر" and used to start the adhan
 * ten minutes early.
 */
export const prayerFromNotification = (title?: string | null, data?: Record<string, unknown> | null): string | null => {
  const type = data?.type;
  const isPrayer = type === 'prayer' || (type == null && !!title?.includes('صلاة') && !title.includes('تنبيه'));
  if (!isPrayer) return null;
  const fromData = typeof data?.prayerName === 'string' ? data.prayerName : '';
  const fromTitle = (title ?? '').replace(/‏/g, '').replace('صلاة ', '').trim();
  return fromData || fromTitle || 'الصلاة';
};

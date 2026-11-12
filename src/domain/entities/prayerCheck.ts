import { ClockTime, parseClock, PRAYER_IDS, PrayerId } from './notifications';

/**
 * «صليت؟»: a question some minutes after each adhan, answered from the notification.
 * Off until the user says yes to a one-time question (`asked`).
 */
export interface PrayerCheckSettings {
  enabled: boolean;
  /** Minutes after the adhan. */
  delayMinutes: PrayerCheckDelay;
  /** «معذورة»: no questions until this time (ms since epoch); null when not paused. */
  excusedUntil: number | null;
  /** The one-time question was answered (yes or no): never ask again. */
  asked: boolean;
}

export const PRAYER_CHECK_DELAYS = [15, 30, 45] as const;
export type PrayerCheckDelay = (typeof PRAYER_CHECK_DELAYS)[number];

export const DEFAULT_PRAYER_CHECK: PrayerCheckSettings = { enabled: false, delayMinutes: 30, excusedUntil: null, asked: false };

/** «لسه» brings the question back once, this many minutes later. */
export const PRAYER_CHECK_FOLLOW_UP_MIN = 15;
/** «معذورة» turns itself off after this many days, in case it is forgotten. */
export const EXCUSED_DAYS = 7;

/** The task id the prayer has in «العبادات» (ibadaSlice) and in stats. */
export const ibadaPrayerId = (id: PrayerId) => id.toLowerCase();

/** When each prayer's time ends: the question is pointless after it. Isha runs to midnight. */
const ENDS_AT: Record<PrayerId, string | null> = { Fajr: 'Sunrise', Dhuhr: 'Asr', Asr: 'Maghrib', Maghrib: 'Isha', Isha: null };

const toMinutes = ({ hours, minutes }: ClockTime) => hours * 60 + minutes;

export const isExcused = (s: PrayerCheckSettings, now: number) => s.excusedUntil != null && s.excusedUntil > now;

/**
 * The daily time of each prayer's question: the adhan plus the delay, skipped when that
 * falls at or after the end of the prayer's time (the next prayer, sunrise, or midnight).
 * `timings` may carry Sunrise next to the five prayers.
 */
export const prayerCheckTimes = (timings: Partial<Record<string, string>>, delayMinutes: number) =>
  PRAYER_IDS.flatMap((id) => {
    const start = parseClock(timings[id]);
    if (!start) return [];
    const at = toMinutes(start) + delayMinutes;
    const endKey = ENDS_AT[id];
    const end = endKey ? parseClock(timings[endKey]) : null;
    const limit = end ? toMinutes(end) : 24 * 60;
    if (at >= limit) return [];
    return [{ prayerId: id, at: { hours: Math.floor(at / 60), minutes: at % 60 } as ClockTime }];
  });

/** How long ago the adhan was, in the words the notification uses. */
const AGO: Record<number, string> = { 15: 'من ربع ساعة', 30: 'من نص ساعة', 45: 'من ساعة إلا ربع' };
const agoText = (delay: number) => AGO[delay] ?? `من ${delay} دقيقة`;

/** «ل» + «الظهر» is «للظهر». */
const forPrayer = (name: string) => (name.startsWith('ال') ? `لل${name.slice(2)}` : `ل${name}`);

/** The notification's words for one prayer (Egyptian Arabic, gentle, no guilt). */
export const prayerCheckCopy = (prayerName: string, delayMinutes: number) => ({
  title: `صليت ${prayerName}؟`,
  body: `الأذان كان ${agoText(delayMinutes)}`,
  followUpTitle: `لسه فيه وقت ${forPrayer(prayerName)}`,
  followUpBody: 'ربنا يعينك، قوم صلّي وتعالى علّمها',
  prayedLabel: 'صليت',
  laterLabel: 'لسه',
});

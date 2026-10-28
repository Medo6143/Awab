import type { PrayerId } from './notifications';

/**
 * The user's own reminders ("تذكيراتي"): any worship at a clock time or relative to a
 * prayer, on chosen weekdays, as a plain notification or as an alarm with its own screen.
 */
export type ReminderKind = 'qiyam' | 'quran' | 'duha' | 'fasting' | 'kahf' | 'custom';
export type ReminderStyle = 'notification' | 'alarm';
export type ReminderSound = 'recitation' | 'takbir' | 'salawat' | 'system';
export type ReminderArt = 'qiyam' | 'quran' | 'mosque';

export type ReminderTime =
  | { type: 'clock'; hour: number; minute: number }
  /** Minutes before (negative) or after a prayer, e.g. qiyam an hour before fajr. */
  | { type: 'prayer'; prayer: PrayerId; offset: number };

export interface Reminder {
  id: string;
  kind: ReminderKind;
  title: string;
  message: string;
  time: ReminderTime;
  /** Weekdays 0 = Sunday … 6 = Saturday; empty means every day. */
  days: number[];
  style: ReminderStyle;
  sound: ReminderSound;
  art: ReminderArt;
  snoozeMinutes: number;
  enabled: boolean;
}

/** What the alarm screen quotes: a verse (text from the mushaf source) or a graded hadith. */
export type ReminderQuote =
  | { type: 'verse'; surah: number; from: number; to?: number; label: string }
  | { type: 'hadith'; text: string; source: string };

export interface ReminderPreset {
  kind: ReminderKind;
  name: string;
  title: string;
  message: string;
  time: ReminderTime;
  days: number[];
  art: ReminderArt;
  sound: ReminderSound;
  /** The verses recited as the "recitation" sound. */
  recitation?: { surah: number; from: number; to: number };
  quote?: ReminderQuote;
  /** What the main button on the alarm screen says. */
  done: string;
}

export const REMINDER_PRESETS: ReminderPreset[] = [
  {
    kind: 'qiyam', name: 'قيام الليل', title: 'قيام الليل', message: 'قم فصلِّ ركعتين في جوف الليل',
    time: { type: 'prayer', prayer: 'Fajr', offset: -60 }, days: [], art: 'qiyam', sound: 'recitation',
    recitation: { surah: 73, from: 1, to: 4 },
    quote: { type: 'verse', surah: 32, from: 16, label: 'السجدة · ١٦' },
    done: 'قمت، الحمد لله',
  },
  {
    kind: 'quran', name: 'ورد القرآن', title: 'وردك من القرآن', message: 'وقت وردك اليومي',
    time: { type: 'prayer', prayer: 'Isha', offset: 30 }, days: [], art: 'quran', sound: 'recitation',
    recitation: { surah: 73, from: 4, to: 4 },
    quote: { type: 'verse', surah: 73, from: 4, label: 'المزمل · ٤' },
    done: 'افتح المصحف',
  },
  {
    kind: 'duha', name: 'صلاة الضحى', title: 'صلاة الضحى', message: 'ركعتان من الضحى',
    time: { type: 'clock', hour: 9, minute: 0 }, days: [], art: 'mosque', sound: 'takbir',
    quote: { type: 'hadith', text: 'يُصْبِحُ عَلَى كُلِّ سُلَامَى مِنْ أَحَدِكُمْ صَدَقَةٌ … وَيُجْزِئُ مِنْ ذَلِكَ رَكْعَتَانِ يَرْكَعُهُمَا مِنَ الضُّحَى', source: 'صحيح مسلم ٧٢٠' },
    done: 'صلّيت، الحمد لله',
  },
  {
    kind: 'fasting', name: 'صيام الاثنين والخميس', title: 'صيام بكره', message: 'انوِ صيام بكره، وتسحّر فإن في السحور بركة',
    time: { type: 'prayer', prayer: 'Isha', offset: 60 }, days: [0, 3], art: 'mosque', sound: 'takbir',
    quote: { type: 'hadith', text: 'تُعْرَضُ الأَعْمَالُ يَوْمَ الاثْنَيْنِ وَالخَمِيسِ، فَأُحِبُّ أَنْ يُعْرَضَ عَمَلِي وَأَنَا صَائِمٌ', source: 'سنن الترمذي ٧٤٧ · صححه الألباني' },
    done: 'نويت، الحمد لله',
  },
  {
    kind: 'kahf', name: 'سورة الكهف', title: 'سورة الكهف', message: 'اقرأ سورة الكهف يوم الجمعة',
    time: { type: 'clock', hour: 10, minute: 0 }, days: [5], art: 'quran', sound: 'takbir',
    quote: { type: 'hadith', text: 'مَنْ قَرَأَ سُورَةَ الْكَهْفِ فِي يَوْمِ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ', source: 'صحيح الجامع ٦٤٧٠ · صححه الألباني' },
    done: 'افتح المصحف',
  },
  {
    kind: 'custom', name: 'تذكير مخصص', title: '', message: '',
    time: { type: 'clock', hour: 8, minute: 0 }, days: [], art: 'mosque', sound: 'takbir',
    done: 'تمّ بفضل الله',
  },
];

export const presetOf = (kind: ReminderKind) => REMINDER_PRESETS.find((p) => p.kind === kind) ?? REMINDER_PRESETS[REMINDER_PRESETS.length - 1];

export const WEEKDAYS_SHORT = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

export const PRAYER_NAMES_AR: Record<PrayerId, string> = { Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' };

/** The clock time a reminder fires today, or null when its prayer time is unknown. */
export const resolveReminderTime = (t: ReminderTime, timings?: Partial<Record<PrayerId, string>>): { hours: number; minutes: number } | null => {
  if (t.type === 'clock') return { hours: t.hour, minutes: t.minute };
  const m = timings?.[t.prayer]?.match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const total = (((Number(m[1]) * 60 + Number(m[2]) + t.offset) % 1440) + 1440) % 1440;
  return { hours: Math.floor(total / 60), minutes: total % 60 };
};

export const newReminder = (kind: ReminderKind): Reminder => {
  const p = presetOf(kind);
  return {
    id: `${kind}-${Date.now().toString(36)}`, kind, title: p.title, message: p.message, time: p.time, days: p.days,
    style: kind === 'qiyam' || kind === 'quran' ? 'alarm' : 'notification', sound: p.sound, art: p.art, snoozeMinutes: 10, enabled: true,
  };
};

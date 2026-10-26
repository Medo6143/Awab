export type AzanType = 'none' | 'takbir' | 'full';

export interface AzanSettings {
  type: AzanType;
  visualAzanEnabled: boolean;
}

export interface NotificationPrefs {
  prayers: boolean;
  athkar: boolean;
  qiyam: boolean;
  duha: boolean;
  ramadan: boolean;
  dailyReminder: boolean;
  prePrayerReminderEnabled: boolean;
  prePrayerReminderOffset: number; // minutes
  dailyWardEnabled: boolean;
  dailyWardTime: string;           // HH:mm
  encouragementEnabled: boolean;
  encouragementInterval: number;   // hours
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  prayers: true, athkar: true, qiyam: true, duha: true, ramadan: true, dailyReminder: true,
  prePrayerReminderEnabled: true, prePrayerReminderOffset: 10,
  dailyWardEnabled: true, dailyWardTime: '05:00',
  encouragementEnabled: true, encouragementInterval: 3,
};

export const DEFAULT_AZAN_SETTINGS: AzanSettings = { type: 'full', visualAzanEnabled: true };

export type PrayerId = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
export const PRAYER_IDS: PrayerId[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

/** Prayer times as "HH:mm" strings; extra entries such as Sunrise are ignored. */
export type PrayerTimings = Partial<Record<PrayerId, string>>;

export interface ClockTime { hours: number; minutes: number }

/** Reads "HH:mm" (also "HH:mm (EET)"); null for anything else. */
export const parseClock = (value?: string | null): ClockTime | null => {
  const m = value?.match(/(\d{1,2}):(\d{1,2})/);
  if (!m) return null;
  const hours = parseInt(m[1], 10), minutes = parseInt(m[2], 10);
  return hours < 24 && minutes < 60 ? { hours, minutes } : null;
};

/** A clock time moved back by some minutes, wrapping past midnight. */
export const minusMinutes = ({ hours, minutes }: ClockTime, delta: number): ClockTime => {
  const total = (((hours * 60 + minutes - delta) % 1440) + 1440) % 1440;
  return { hours: Math.floor(total / 60), minutes: total % 60 };
};

/** `count` daily slots from `startHour`, `intervalHours` apart, wrapping past midnight. */
export const dailySlots = (count: number, startHour: number, intervalHours: number): ClockTime[] =>
  Array.from({ length: count }, (_, i) => {
    const total = (startHour * 60 + i * intervalHours * 60) % 1440;
    return { hours: Math.floor(total / 60), minutes: total % 60 };
  });

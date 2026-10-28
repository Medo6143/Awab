import { ReminderScheduler, ScheduleContext } from '../../domain/services/Notifications';
import { Reminder, presetOf, resolveReminderTime } from '../../domain/entities/reminders';
import { azanNative } from '../services/nativeModules';
import { expoNotifications, rtl } from './expo';

const SALAWAT = 'sali_ala_nabii.mp3';

/** The native sound spec for a reminder (see ReminderAlarms.java). */
export const reminderSoundSpec = (r: Pick<Reminder, 'kind' | 'sound'>, reciterFolder = 'Alafasy_128kbps') => {
  if (r.sound === 'takbir') return 'raw:takbir';
  if (r.sound === 'salawat') return 'raw:sali_ala_nabii';
  if (r.sound === 'system') return 'system';
  const rec = presetOf(r.kind).recitation ?? { surah: 73, from: 1, to: 4 };
  const urls = [];
  for (let a = rec.from; a <= rec.to; a++) {
    urls.push(`https://everyayah.com/data/${reciterFolder}/${String(rec.surah).padStart(3, '0')}${String(a).padStart(3, '0')}.mp3`);
  }
  return `urls:${urls.join('|')}`;
};

/** The native payload; weekdays become Calendar.DAY_OF_WEEK (Sunday = 1). */
export const reminderPayload = (r: Reminder, at: { hours: number; minutes: number }, reciterFolder?: string) => JSON.stringify({
  id: r.id, title: r.title || presetOf(r.kind).name, body: r.message, hour: at.hours, minute: at.minutes,
  days: r.days.map((d) => d + 1), sound: reminderSoundSpec(r, reciterFolder),
});

/**
 * "تذكيراتي": alarm-style reminders go to the native alarm (full screen, looping sound,
 * snooze); notification-style ones are weekly expo notifications, one per chosen day.
 */
export class CustomReminderScheduler implements ReminderScheduler {
  readonly ids: string[] = [];

  async cancelExtra() {
    try { await azanNative()?.cancelAllReminders?.(); } catch {}
  }

  async schedule({ reminders = [], timings, reciterFolder }: ScheduleContext) {
    const native = azanNative();
    for (const r of reminders) {
      if (!r.enabled) continue;
      const at = resolveReminderTime(r.time, timings);
      if (!at) continue;
      try {
        if (r.style === 'alarm' && native?.scheduleReminder) {
          await native.scheduleReminder(reminderPayload(r, at, reciterFolder));
        } else {
          await this.notify(r, at);
        }
      } catch (e) {
        console.warn('notifications: reminder failed', r.id, e);
      }
    }
  }

  private async notify(r: Reminder, at: { hours: number; minutes: number }) {
    const N = expoNotifications();
    const content = {
      title: rtl(r.title || presetOf(r.kind).name),
      body: rtl(r.message || 'حان موعد تذكيرك'),
      sound: SALAWAT,
      data: { type: 'reminder', id: r.id },
    };
    if (r.days.length === 0) {
      await N.scheduleNotificationAsync({
        identifier: `custom-${r.id}`, content,
        trigger: { type: N.SchedulableTriggerInputTypes.DAILY, hour: at.hours, minute: at.minutes, channelId: 'spiritual' },
      });
      return;
    }
    for (const d of r.days) {
      await N.scheduleNotificationAsync({
        identifier: `custom-${r.id}-${d}`, content,
        // expo weekdays: 1 = Sunday
        trigger: { type: N.SchedulableTriggerInputTypes.WEEKLY, weekday: d + 1, hour: at.hours, minute: at.minutes, channelId: 'spiritual' },
      });
    }
  }
}

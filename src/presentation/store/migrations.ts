import type { MigrationManifest, PersistedState } from 'redux-persist';
import { Reminder, newReminder } from '../../domain/entities/reminders';

type Persisted = PersistedState & {
  settings?: { notificationPrefs?: Record<string, unknown> };
  reminders?: { list?: Reminder[] };
};

/**
 * Store migrations, keyed by the version they bring the persisted state to.
 * Each runs once, on the first launch after an update.
 */
export const migrations: MigrationManifest = {
  /**
   * #18: qiyam al-layl lived in two places, a «تنبيه قيام الليل» toggle (a notification at
   * 02:00 with the salawat sound, on by default) and the «قيام الليل» reminder. The toggle
   * is gone; whoever had it on and no qiyam reminder gets the same thing as a reminder,
   * a plain notification at 02:00, which they can now see and edit in «تذكيراتي».
   */
  7: (state) => {
    const s = state as Persisted;
    const prefs = s.settings?.notificationPrefs;
    if (!prefs) return state;
    const wasOn = prefs.qiyam !== false;
    const { qiyam: _old, ...rest } = prefs;
    const list = s.reminders?.list ?? [];
    const add = wasOn && !list.some((r) => r.kind === 'qiyam');
    const reminder: Reminder = {
      ...newReminder('qiyam'),
      id: 'qiyam-from-settings',
      time: { type: 'clock', hour: 2, minute: 0 },
      style: 'notification',
      sound: 'salawat',
    };
    return {
      ...s,
      settings: { ...s.settings, notificationPrefs: rest },
      reminders: { ...s.reminders, list: add ? [...list, reminder] : list },
    } as PersistedState;
  },
};

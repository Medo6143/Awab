import { ReminderAlarms } from '../../domain/services/ReminderAlarms';
import { Reminder } from '../../domain/entities/reminders';
import { reminderPayload, reminderSoundSpec } from '../notifications/CustomReminderScheduler';
import { azanNative } from './nativeModules';

/** ReminderAlarms on the AzanModule native module (Android); does nothing elsewhere. */
export class NativeReminderAlarms implements ReminderAlarms {
  private get mod() {
    return azanNative();
  }

  async snooze(minutes: number, reminder?: Reminder, at?: { hours: number; minutes: number } | null) {
    try {
      const json = (await this.mod?.getRingingReminder?.()) ?? (reminder && at ? reminderPayload(reminder, at) : null);
      if (json) await this.mod?.snoozeReminder?.(json, minutes);
    } catch {}
  }

  previewSound(reminder: Pick<Reminder, 'kind' | 'sound'>, reciterFolder?: string) {
    try { this.mod?.previewReminderSound?.(reminderSoundSpec(reminder, reciterFolder)); } catch {}
  }
}

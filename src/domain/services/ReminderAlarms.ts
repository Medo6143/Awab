import type { Reminder } from '../entities/reminders';

/** The user's alarm-style reminders as the native alarm rings them (see ReminderAlarms.java). */
export interface ReminderAlarms {
  /**
   * Stops the ringing reminder and rings it again in `minutes`. `reminder` and `at` describe it
   * when the native side no longer knows which one is ringing.
   */
  snooze(minutes: number, reminder?: Reminder, at?: { hours: number; minutes: number } | null): Promise<void>;
  /** Plays a few seconds of a reminder sound, for the sound picker. */
  previewSound(reminder: Pick<Reminder, 'kind' | 'sound'>, reciterFolder?: string): void;
}

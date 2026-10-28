import { AzanSettings, NotificationPrefs, PrayerTimings } from '../entities/notifications';
import type { Reminder } from '../entities/reminders';

export interface ScheduleContext {
  prefs: NotificationPrefs;
  azan: AzanSettings;
  timings: PrayerTimings;
  /** The user's own reminders ("تذكيراتي"). */
  reminders?: Reminder[];
  /** everyayah folder of the chosen reciter, for recitation sounds. */
  reciterFolder?: string;
}

/** One kind of reminder (prayers, athkar, ...). Add a kind by adding a scheduler. */
export interface ReminderScheduler {
  /** Notification identifiers this scheduler may create, so they can be cancelled. */
  readonly ids: readonly string[];
  schedule(ctx: ScheduleContext): Promise<void>;
  /** Anything beyond the ids above (e.g. native alarms). */
  cancelExtra?(): Promise<void>;
}

export interface NotificationPermissions {
  /** Creates channels and asks the user if needed; true when allowed. */
  request(): Promise<boolean>;
  /** Current state without asking. */
  status(): Promise<boolean>;
}

export interface NotificationCenter extends NotificationPermissions {
  init(): void;
  rescheduleAll(ctx: ScheduleContext): Promise<void>;
  cancelAll(): Promise<void>;
  scheduledCount(): Promise<number>;
}

import { ClockTime, PrayerId } from '../entities/notifications';

/** One daily «صليت؟» question, with the words its notification shows. */
export interface PrayerCheckItem {
  prayerId: PrayerId;
  /** Local time of day; repeats daily until rescheduled or cancelled. */
  at: ClockTime;
  title: string;
  body: string;
  /** Shown once, after «لسه». */
  followUpTitle: string;
  followUpBody: string;
  prayedLabel: string;
  laterLabel: string;
}

/** A «صليت» tapped on the notification. `day` is the local date, "YYYY-MM-DD". */
export interface PrayerCheckAnswer {
  prayerId: PrayerId;
  day: string;
}

/**
 * The «صليت؟» questions after each adhan. They outlive the app: the notification and its
 * buttons work while the app is closed, and answers wait here until the app reads them.
 */
export interface PrayerChecks {
  /** Arms these questions, replacing any armed before. */
  schedule(items: PrayerCheckItem[]): Promise<void>;
  cancelAll(): Promise<void>;
  /** Prayers already marked today in the app: their question stays quiet. */
  setDoneToday(prayerIds: PrayerId[]): void;
  /** «صليت» answers given on the notification since the last call (each returned once). */
  takeAnswers(): Promise<PrayerCheckAnswer[]>;
  /** Called when the user answers on a notification while the app is running. */
  onAnswered(listener: () => void): () => void;
}

/** The home-screen prayer widget. */
export interface PrayerWidget {
  update(data: { prayerName: string; prayerTime: string; targetTimeMillis: number; timings?: string }): void;
}

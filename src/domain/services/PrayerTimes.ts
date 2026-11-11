import { Coordinates } from '../entities/types';
import { PrayerDay } from '../entities/prayer';
import { AsrSchool } from '../entities/prayerMethods';

/** Where a day of prayer times comes from. */
export interface PrayerTimesSource {
  /** Today's times at `at` with the given method (AlAdhan id) and Asr school, or null when they could not be fetched. */
  today(at: Coordinates, method: number, school: AsrSchool): Promise<PrayerDay | null>;
}

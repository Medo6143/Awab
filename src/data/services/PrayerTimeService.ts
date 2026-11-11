import { Coordinates } from '../../domain/entities/types';
import { PrayerDay } from '../../domain/entities/prayer';
import { AsrSchool } from '../../domain/entities/prayerMethods';
import { PrayerTimesSource } from '../../domain/services/PrayerTimes';
import { prayerApi } from '../api/clients';

/** PrayerTimesSource on the AlAdhan API. */
export class AladhanPrayerTimes implements PrayerTimesSource {
  async today({ latitude, longitude }: Coordinates, method: number, school: AsrSchool): Promise<PrayerDay | null> {
    try {
      const response = await prayerApi.get(`/timings`, {
        // far north or south, fajr and isha never reach their angles in summer: use the angle-based rule
        params: { latitude, longitude, method, school, ...(Math.abs(latitude) >= 48 && { latitudeAdjustmentMethod: 3 }) },
      });
      return response.data.data as PrayerDay;
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      return null;
    }
  }
}

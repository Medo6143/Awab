import { findNextPrayer, NextPrayer, PrayerScheduleTimes } from '../../domain/entities/prayer';
import { prayerApi } from '../api/clients';

export class PrayerTimeService {
  static async getPrayerTimes(latitude: number, longitude: number, method: number = 4) {
    try {
      const response = await prayerApi.get(`/timings`, {
        params: {
          latitude,
          longitude,
          method,
          school: 1, // Shafi'i/Hanafi choice can be added to settings
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      return null;
    }
  }

  static getNextPrayer(timings: PrayerScheduleTimes, now: Date = new Date()): NextPrayer | null {
    return findNextPrayer(timings, now);
  }
}

import { findNextPrayer, NextPrayer, PrayerScheduleTimes } from '../../domain/entities/prayer';
import { prayerApi } from '../api/clients';

/** Asr juristic method: 0 = Shafi'i/Maliki/Hanbali (shadow = 1x, used in Egypt and most countries), 1 = Hanafi (2x). */
export type AsrSchool = 0 | 1;

// Countries whose official timetables use the Hanafi Asr
const HANAFI_COUNTRIES = ['PK', 'IN', 'BD', 'AF'];

export const asrSchoolFor = (pref: 'auto' | 'shafii' | 'hanafi' | undefined, countryCode: string | null): AsrSchool =>
  pref === 'hanafi' ? 1 : pref === 'shafii' ? 0 : countryCode && HANAFI_COUNTRIES.includes(countryCode) ? 1 : 0;

export class PrayerTimeService {
  static async getPrayerTimes(latitude: number, longitude: number, method: number = 4, school: AsrSchool = 0) {
    try {
      const response = await prayerApi.get(`/timings`, {
        params: { latitude, longitude, method, school },
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

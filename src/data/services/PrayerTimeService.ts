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

  static getNextPrayer(timings: Record<string, string>): { name: string; time: string; remaining: number } {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const prayerOrder = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    
    for (const name of prayerOrder) {
      const timeStr = timings[name];
      const match = timeStr.match(/(\d{1,2}):(\d{1,2})/);
      if (!match) continue;
      
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const prayerMinutes = hours * 60 + minutes;

      if (prayerMinutes > currentMinutes) {
        return { name, time: timings[name], remaining: prayerMinutes - currentMinutes };
      }
    }

    // If all prayers today are passed, next is Fajr tomorrow
    const fajrTime = timings['Fajr'];
    const fajrMatch = fajrTime.match(/(\d{1,2}):(\d{1,2})/);
    const fHours = fajrMatch ? parseInt(fajrMatch[1], 10) : 0;
    const fMinutes = fajrMatch ? parseInt(fajrMatch[2], 10) : 0;
    const prayerMinutes = fHours * 60 + fMinutes + 24 * 60;
    return { name: 'Fajr', time: timings['Fajr'], remaining: prayerMinutes - currentMinutes };
  }
}

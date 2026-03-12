import { prayerApi } from './clients';

export const fetchPrayerTimes = async (city: string, country: string, method: number = 2) => {
  const response = await prayerApi.get(`/timingsByCity`, {
    params: { city, country, method },
  });
  return response.data.data.timings;
};

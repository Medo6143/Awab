import { useState, useEffect } from 'react';
import { useLocation } from './useLocation';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { PrayerTimeService } from '../../data/services/PrayerTimeService';

export const usePrayerTimes = () => {
  const { coords } = useLocation();
  const { calculationMethod } = useSelector((state: RootState) => state.settings);
  const [data, setData] = useState<any>(null);
  const [nextPrayer, setNextPrayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (coords) {
      (async () => {
        const times = await PrayerTimeService.getPrayerTimes(coords.latitude, coords.longitude, calculationMethod);
        if (times) {
          setData(times);
          const next = PrayerTimeService.getNextPrayer(times.timings);
          setNextPrayer(next);
        }
        setLoading(false);
      })();
    }
  }, [coords, calculationMethod]);

  // Update remaining time every minute
  useEffect(() => {
    if (!data) return;
    
    const interval = setInterval(() => {
      const next = PrayerTimeService.getNextPrayer(data.timings);
      setNextPrayer(next);
    }, 60000);

    return () => clearInterval(interval);
  }, [data]);

  const toArName = (name: string) => {
    const map: Record<string, string> = {
      Fajr: 'الفجر',
      Sunrise: 'الشروق',
      Dhuhr: 'الظهر',
      Asr: 'العصر',
      Maghrib: 'المغرب',
      Isha: 'العشاء',
    };
    return map[name] || name;
  };

  return { 
    timings: data?.timings, 
    date: data?.date, 
    nextPrayer: nextPrayer ? { ...nextPrayer, arName: toArName(nextPrayer.name) } : null,
    loading 
  };
};

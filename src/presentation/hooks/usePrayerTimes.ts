import { useState, useEffect } from 'react';
import { NativeModules, Platform } from 'react-native';
import { useLocation } from './useLocation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { PrayerTimeService } from '../../data/services/PrayerTimeService';
import { setPrayerData, setLoading as setPrayerLoading, setFailed as setPrayerFailed } from '../store/slices/prayerSlice';

export const usePrayerTimes = () => {
  const dispatch = useDispatch();
  const { coords, countryCode } = useLocation();
  const { calculationMethod: manualMethod } = useSelector((state: RootState) => state.settings);
  const { cachedData, lastFetchedDate, status } = useSelector((state: RootState) => state.prayer);
  const [nextPrayer, setNextPrayer] = useState<any>(null);

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

  const updateWidget = (next: any) => {
    if (Platform.OS === 'android' && NativeModules.PrayerWidget && next) {
        // next.remaining is in minutes, convert to milliseconds
        const targetTimeMillis = Date.now() + (next.remaining * 60 * 1000);
        
        NativeModules.PrayerWidget.updateWidgetData({
            prayerName: toArName(next.name),
            prayerTime: next.time,
            targetTimeMillis: targetTimeMillis
        });
    }
  };

  useEffect(() => {
    if (coords) {
      (async () => {
        // 1. Determine Calculation Method based on Country
        // 5: Egyptian General Authority of Survey (Egypt)
        // 4: Umm al-Qura University, Makkah (Saudi Arabia)
        // 2: Islamic Society of North America (ISNA) - Fallback or detect
        // 3: Muslim World League (MWL) - Common fallback
        
        let targetMethod = manualMethod;
        
        // Auto-detect if user is in specialized zones to match their local authoritative timing
        if (countryCode === 'EG') {
          targetMethod = 5; // الهيئة المصرية العامة للمساحة
        } else if (countryCode === 'SA') {
          targetMethod = 4; // جامعة أم القرى
        }

        // 2. Check if we already have data for TODAY in cache for THIS method
        const todayStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
        
        if (cachedData && cachedData.date.gregorian.date === todayStr && cachedData.meta.method.id === targetMethod) {
          console.log('usePrayerTimes: Using persistent cached data for', todayStr, 'Method:', targetMethod);
          const next = PrayerTimeService.getNextPrayer(cachedData.timings as any);
          setNextPrayer(next);
          updateWidget(next);
          return;
        }

        console.log('usePrayerTimes: Fetching fresh prayer times for', todayStr, 'Country:', countryCode, 'Method:', targetMethod);
        dispatch(setPrayerLoading());
        const times = await PrayerTimeService.getPrayerTimes(coords.latitude, coords.longitude, targetMethod);
        
        if (times) {
          dispatch(setPrayerData(times));
          const next = PrayerTimeService.getNextPrayer(times.timings as any);
          setNextPrayer(next);
          updateWidget(next);
        } else {
          dispatch(setPrayerFailed());
        }
      })();
    }
  }, [coords, countryCode, manualMethod, dispatch]);

  // Update remaining time for the App UI every minute
  useEffect(() => {
    if (!cachedData) return;
    
    const interval = setInterval(() => {
      const next = PrayerTimeService.getNextPrayer(cachedData.timings as any);
      setNextPrayer((prev: any) => {
        // Only update the Native widget if the prayer has actually changed
        if (!prev || prev.name !== next.name) {
          updateWidget(next);
        }
        return next;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [cachedData]);

  return { 
    timings: cachedData?.timings, 
    date: cachedData?.date, 
    nextPrayer: nextPrayer ? { ...nextPrayer, arName: toArName(nextPrayer.name) } : null,
    loading: status === 'loading'
  };
};

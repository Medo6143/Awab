import { useState, useEffect, useCallback } from 'react';
import { useLocation } from './useLocation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { PrayerTimeService, asrSchoolFor } from '../../data/services/PrayerTimeService';
import { useDependencies } from '../providers/DependencyProvider';
import { NextPrayer } from '../../domain/entities/prayer';

export type NextPrayerView = NextPrayer & { arName: string };
import { setPrayerData, setLoading as setPrayerLoading, setFailed as setPrayerFailed } from '../store/slices/prayerSlice';

export const usePrayerTimes = () => {
  const dispatch = useDispatch();
  const { prayerWidget } = useDependencies();
  const { coords, countryCode, error: locationError } = useLocation();
  const { calculationMethod: manualMethod, asrMethod } = useSelector((state: RootState) => state.settings);
  const { cachedData, lastFetchedDate, status } = useSelector((state: RootState) => state.prayer);
  // stored times show at once; a slow GPS fix only refreshes them later
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(() => (cachedData ? PrayerTimeService.getNextPrayer(cachedData.timings) : null));
  const [retryTick, setRetryTick] = useState(0);

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

  const updateWidget = (next: NextPrayer | null, timings?: Record<string, string>) => {
    if (!next) return;
    prayerWidget.update({
      prayerName: toArName(next.name),
      prayerTime: next.time,
      targetTimeMillis: Date.now() + next.remaining * 60 * 1000, // remaining is in minutes
      // today's times let the widget move to the next prayer and draw its sky on its own
      timings: JSON.stringify(timings ?? {}),
    });
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

        const school = asrSchoolFor(asrMethod, countryCode);

        // 2. Check if we already have data for TODAY in cache for THIS method and Asr school
        // (stored times from before the school was chosen were Hanafi: they refetch)
        const todayStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
        const cachedSchool = cachedData?.meta.school === 'HANAFI' ? 1 : cachedData?.meta.school === 'STANDARD' ? 0 : -1;

        if (cachedData && cachedData.date.gregorian.date === todayStr && cachedData.meta.method.id === targetMethod && cachedSchool === school) {
          console.log('usePrayerTimes: Using persistent cached data for', todayStr, 'Method:', targetMethod);
          const next = PrayerTimeService.getNextPrayer(cachedData.timings);
          setNextPrayer(next);
          updateWidget(next, cachedData.timings as unknown as Record<string, string>);
          return;
        }

        console.log('usePrayerTimes: Fetching fresh prayer times for', todayStr, 'Country:', countryCode, 'Method:', targetMethod);
        dispatch(setPrayerLoading());
        const times = await PrayerTimeService.getPrayerTimes(coords.latitude, coords.longitude, targetMethod, school);
        
        if (times) {
          dispatch(setPrayerData(times));
          const next = PrayerTimeService.getNextPrayer(times.timings);
          setNextPrayer(next);
          updateWidget(next, times.timings as unknown as Record<string, string>);
        } else {
          dispatch(setPrayerFailed());
        }
      })();
    }
  }, [coords, countryCode, manualMethod, asrMethod, dispatch, retryTick]);

  // Update remaining time for the App UI every minute
  useEffect(() => {
    if (!cachedData) return;
    
    const interval = setInterval(() => {
      const next = PrayerTimeService.getNextPrayer(cachedData.timings);
      setNextPrayer((prev) => {
        // Only update the native widget if the prayer has actually changed
        if (!prev || prev.name !== next?.name) {
          updateWidget(next, cachedData.timings as unknown as Record<string, string>);
        }
        return next;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [cachedData]);

  const retry = useCallback(() => {
    dispatch(setPrayerLoading());
    setRetryTick((t) => t + 1);
  }, [dispatch]);

  return { 
    timings: cachedData?.timings, 
    date: cachedData?.date, 
    nextPrayer: (nextPrayer ? { ...nextPrayer, arName: toArName(nextPrayer.name) } : null) as NextPrayerView | null,
    // With stored times there is nothing to wait for. Without them, a location still resolving
    // counts as loading; only a definite location error is "no location".
    loading: !cachedData && (status === 'loading' || (!coords && !locationError) || (!!coords && status !== 'failed')),
    error: status === 'failed',
    hasLocation: !!coords || !locationError,
    retry,
  };
};

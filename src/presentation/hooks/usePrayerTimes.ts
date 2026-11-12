import { useState, useEffect, useCallback } from 'react';
import { useLocation } from './useLocation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useDependencies } from '../providers/DependencyProvider';
import { findNextPrayer, NextPrayer, PrayerScheduleTimes } from '../../domain/entities/prayer';
import { isStoredDayValid, prayerArName, prayerQuery } from '../../domain/services/prayerDay';
import { setPrayerData, setLoading as setPrayerLoading, setFailed as setPrayerFailed } from '../store/slices/prayerSlice';

export type NextPrayerView = NextPrayer & { arName: string };

const nextPrayerIn = (timings: PrayerScheduleTimes) => findNextPrayer(timings, new Date());

/**
 * Today's prayer times for where the phone is, and the next prayer. Fetches only when the stored
 * day is not today's or was calculated another way. The home-screen widget follows them on its
 * own (usePrayerWidgetSync).
 */
export const usePrayerTimes = () => {
  const dispatch = useDispatch();
  const { prayerTimes } = useDependencies();
  // prayer times never use the compass: no heading watcher re-rendering every screen on each tick
  const { coords, countryCode, error: locationError } = useLocation({ watchHeading: false });
  const { prayerMethod = 'auto', asrMethod } = useSelector((state: RootState) => state.settings);
  const { cachedData, status } = useSelector((state: RootState) => state.prayer);
  // stored times show at once; a slow GPS fix only refreshes them later
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(() => (cachedData ? nextPrayerIn(cachedData.timings) : null));
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    if (!coords) return;
    let alive = true;
    (async () => {
      // the country's official method unless the user picked one (prayerMethods.ts)
      const query = prayerQuery(prayerMethod, asrMethod, countryCode);
      if (isStoredDayValid(cachedData, new Date(), query)) {
        setNextPrayer(nextPrayerIn(cachedData!.timings));
        return;
      }
      dispatch(setPrayerLoading());
      const times = await prayerTimes.today(coords, query.method, query.school);
      if (!alive) return;
      if (times) {
        dispatch(setPrayerData(times));
        setNextPrayer(nextPrayerIn(times.timings));
      } else {
        dispatch(setPrayerFailed());
      }
    })();
    return () => { alive = false; };
  }, [coords, countryCode, prayerMethod, asrMethod, dispatch, retryTick]);

  // the time left to the next prayer, every minute
  useEffect(() => {
    if (!cachedData) return;
    setNextPrayer(nextPrayerIn(cachedData.timings));
    const interval = setInterval(() => setNextPrayer(nextPrayerIn(cachedData.timings)), 60000);
    return () => clearInterval(interval);
  }, [cachedData]);

  const retry = useCallback(() => {
    dispatch(setPrayerLoading());
    setRetryTick((t) => t + 1);
  }, [dispatch]);

  return {
    timings: cachedData?.timings,
    date: cachedData?.date,
    nextPrayer: (nextPrayer ? { ...nextPrayer, arName: prayerArName(nextPrayer.name) } : null) as NextPrayerView | null,
    // With stored times there is nothing to wait for. Without them, a location still resolving
    // counts as loading; only a definite location error is "no location".
    loading: !cachedData && (status === 'loading' || (!coords && !locationError) || (!!coords && status !== 'failed')),
    error: status === 'failed',
    hasLocation: !!coords || !locationError,
    coords,
    retry,
  };
};

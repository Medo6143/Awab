import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { RootState } from '../store';
import { toggleTask } from '../store/slices/ibadaSlice';
import { logPrayer } from '../store/slices/statsSlice';
import { toAr } from '../../shared/utils/format';

const PRAYER_TIMES: Record<string, { key: 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'; ar: string }> = {
  fajr: { key: 'Fajr', ar: 'الفجر' },
  dhuhr: { key: 'Dhuhr', ar: 'الظهر' },
  asr: { key: 'Asr', ar: 'العصر' },
  maghrib: { key: 'Maghrib', ar: 'المغرب' },
  isha: { key: 'Isha', ar: 'العشاء' },
};

/** The prayer's time today as "HH:mm" when it hasn't come yet, else null (also for non-prayer tasks). */
export const prayerNotYet = (id: string, timings?: Partial<Record<string, string>> | null, now = new Date()) => {
  const p = PRAYER_TIMES[id];
  const raw = p && timings?.[p.key];
  const m = raw ? /^(\d{1,2}):(\d{2})/.exec(raw) : null;
  if (!m) return null;
  const minutes = Number(m[1]) * 60 + Number(m[2]);
  return now.getHours() * 60 + now.getMinutes() < minutes ? `${m[1].padStart(2, '0')}:${m[2]}` : null;
};

/**
 * Check or uncheck a worship task, and record it in today's stats too, so the prayer
 * page, the ibada page and the stats all agree. A prayer can't be checked before its time.
 */
export const useToggleIbada = () => {
  const dispatch = useDispatch();
  const timings = useSelector((s: RootState) => s.prayer.cachedData?.timings);
  return useCallback((id: string, wasDone: boolean) => {
    const notYet = wasDone ? null : prayerNotYet(id, timings as Partial<Record<string, string>> | undefined);
    if (notYet) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('لم يدخل الوقت بعد', `وقت ${PRAYER_TIMES[id].ar} الساعة ${toAr(notYet)}، علّمها بعد ما تصلّيها.`);
      return;
    }
    Haptics.selectionAsync();
    dispatch(toggleTask(id));
    dispatch(logPrayer({ prayerId: id, isCompleted: !wasDone }));
  }, [dispatch, timings]);
};

import { useCallback, useEffect, useMemo } from 'react';
import { AppState } from 'react-native';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { RootState } from '../store';
import { syncIbadaDailyReset, toggleTask } from '../store/slices/ibadaSlice';
import { logPrayer } from '../store/slices/statsSlice';
import { useDependencies } from '../providers/DependencyProvider';
import { PRAYER_IDS } from '../../domain/entities/notifications';
import { ibadaPrayerId } from '../../domain/entities/prayerCheck';

const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * Keeps «صليت؟» and «العبادات» in step, both ways:
 * - prayers ticked in the app are passed to the native side, so their question stays quiet;
 * - the card is drawn in the app's light or dark theme, not the phone's;
 * - «صليت» tapped on a notification ticks the prayer (on launch, on return to the app, or
 *   right away when the app is running). Only today's answers count, like the ibada list.
 * Rendered once at the app root.
 */
export const usePrayerCheckSync = () => {
  const { prayerChecks } = useDependencies();
  const dispatch = useDispatch();
  const store = useStore<RootState>();
  const tasks = useSelector((s: RootState) => s.ibada.tasks);
  const resetDay = useSelector((s: RootState) => s.ibada.lastResetDate);

  // ticks left over from an earlier day (the list resets lazily) must not silence today
  const doneIds = useMemo(
    () => (resetDay === todayKey() ? PRAYER_IDS.filter((id) => tasks.find((t) => t.id === ibadaPrayerId(id))?.isCompleted) : []),
    [tasks, resetDay],
  );
  useEffect(() => { prayerChecks.setDoneToday(doneIds); }, [prayerChecks, doneIds]);

  const theme = useSelector((s: RootState) => s.settings.theme) ?? 'dark';
  useEffect(() => { prayerChecks.setLook(theme); }, [prayerChecks, theme]);

  const applyAnswers = useCallback(async () => {
    const answers = await prayerChecks.takeAnswers();
    if (answers.length === 0) return;
    dispatch(syncIbadaDailyReset()); // yesterday's ticks must not hide today's answer
    const today = todayKey();
    for (const a of answers) {
      if (a.day !== today) continue;
      const id = ibadaPrayerId(a.prayerId);
      const task = store.getState().ibada.tasks.find((t) => t.id === id);
      if (!task || task.isCompleted) continue;
      dispatch(toggleTask(id));
      dispatch(logPrayer({ prayerId: id, isCompleted: true }));
    }
  }, [prayerChecks, store, dispatch]);

  useEffect(() => {
    applyAnswers();
    const app = AppState.addEventListener('change', (s) => { if (s === 'active') applyAnswers(); });
    const off = prayerChecks.onAnswered(applyAnswers);
    return () => { app.remove(); off(); };
  }, [applyAnswers, prayerChecks]);
};

import { useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useDependencies } from '../providers/DependencyProvider';
import { AzanSettings, DEFAULT_AZAN_SETTINGS, DEFAULT_NOTIFICATION_PREFS } from '../../domain/entities/notifications';
import { RECITER_MAP } from '../../domain/entities/reciters';
import { usePrayerTimes } from './usePrayerTimes';

/**
 * Keeps every scheduled reminder (adhan, athkar, the user's own, «صليت؟») in line with the
 * settings and today's times, rebuilding the schedule only when something it depends on changed.
 *
 * `exactAlarmGranted` (from useExactAlarmAccess): the native adhan needs exact alarms. While it
 * is unknown (null) nothing is scheduled yet; when it turns true the schedule is rebuilt, so
 * prayers that fell back to plain notifications get the native adhan.
 */
export const useNotificationSchedule = (exactAlarmGranted: boolean | null) => {
  const { notifications } = useDependencies();
  const { timings } = usePrayerTimes();
  const { notificationPrefs, notificationsEnabled, azanSettings: rawAzanSettings, selectedReciterId } = useSelector((state: RootState) => state.settings);
  const reminders = useSelector((state: RootState) => state.reminders?.list ?? []);
  const prayerCheck = useSelector((state: RootState) => state.settings.prayerCheck);
  const reciterFolder = RECITER_MAP[selectedReciterId]?.folder;

  const azanSettings = useMemo<AzanSettings>(() => ({ ...DEFAULT_AZAN_SETTINGS, ...rawAzanSettings }), [rawAzanSettings]);
  // persisted state from older versions may lack newer keys
  const safePrefs = useMemo(() => ({ ...DEFAULT_NOTIFICATION_PREFS, ...notificationPrefs }), [notificationPrefs]);

  const lastScheduledRef = useRef<string>('');
  const isSchedulingRef = useRef<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const schedule = async () => {
      if (!timings || exactAlarmGranted === null || isSchedulingRef.current) return;

      const scheduleState = JSON.stringify({ timings, safePrefs, azanSettings, notificationsEnabled, reminders, reciterFolder, exactAlarmGranted, prayerCheck });
      if (scheduleState === lastScheduledRef.current) return;

      isSchedulingRef.current = true;
      try {
        const scheduledCount = await notifications.scheduledCount();

        // right at a prayer time, a schedule already in place is left alone so the adhan
        // about to ring is not cancelled; with nothing scheduled it must be built anyway
        const now = new Date();
        const currentHHmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const isAtPrayerTime = Object.values(timings).some((t) => typeof t === 'string' && t.includes(currentHHmm));
        if (isAtPrayerTime && scheduledCount > 0) return;

        const hasPermission = await notifications.request();
        if (!isMounted) return;

        if (!hasPermission || !notificationsEnabled) {
          await notifications.cancelAll();
          lastScheduledRef.current = scheduleState;
          return;
        }

        await notifications.rescheduleAll({ prefs: safePrefs, azan: azanSettings, timings, reminders, reciterFolder, prayerCheck });
        lastScheduledRef.current = scheduleState;
      } catch (err) {
        console.error('useNotificationSchedule: Error during scheduling:', err);
      } finally {
        isSchedulingRef.current = false;
      }
    };

    // a short delay: the settings and times usually settle in a burst at launch
    const timer = setTimeout(() => { if (isMounted) schedule(); }, 1500);
    return () => { isMounted = false; clearTimeout(timer); };
  }, [timings, safePrefs, notificationsEnabled, azanSettings, reminders, reciterFolder, exactAlarmGranted, prayerCheck, notifications]);
};

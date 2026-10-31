import { useEffect, useMemo, useRef } from 'react';
import { Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { useDependencies } from '../providers/DependencyProvider';
import { AzanSettings, DEFAULT_AZAN_SETTINGS, DEFAULT_NOTIFICATION_PREFS } from '../../domain/entities/notifications';
import { usePrayerTimes } from './usePrayerTimes';
import { showAzanModal, showReminderAlarm } from '../store/slices/uiSlice';
import { RECITER_MAP } from '../../data/services/AudioService';

/** The native alarm opens the app with "reminder:<id>" for the user's own reminders. */
const REMINDER_PREFIX = 'reminder:';
/** A tapped notification older than this no longer starts the adhan on launch. */
const STALE_RESPONSE_MS = 5 * 60 * 1000;
import { AudioService } from '../../data/services/AudioService';
import { PRAYER_AR_NAMES, prayerFromNotification, prayerJustStarted } from '../../domain/entities/prayer';

// We avoid top-level imports of expo-notifications to prevent early JSI binding attempts
const getNotifications = () => require('expo-notifications');

export const useNotifications = () => {
  const dispatch = useDispatch();
  const { notifications, azanAlarms } = useDependencies();
  const { timings } = usePrayerTimes();
  const { notificationPrefs, notificationsEnabled, azanSettings: rawAzanSettings, selectedReciterId } = useSelector((state: RootState) => state.settings);
  const reminders = useSelector((state: RootState) => state.reminders?.list ?? []);
  const reciterFolder = RECITER_MAP[selectedReciterId]?.folder;
  
  const azanSettings = useMemo<AzanSettings>(() => ({ ...DEFAULT_AZAN_SETTINGS, ...rawAzanSettings }), [rawAzanSettings]);
  // persisted state from older versions may lack newer keys
  const safePrefs = useMemo(() => ({ ...DEFAULT_NOTIFICATION_PREFS, ...notificationPrefs }), [notificationPrefs]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScheduledRef = useRef<string>('');
  const isSchedulingRef = useRef<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    // shows the azan screen and plays the adhan unless the user chose silent
    const raiseAzan = (prayerName: string) => {
      dispatch(showAzanModal(prayerName));
      if (azanSettings.type !== 'none') AudioService.playAzan(azanSettings.type);
    };

    const checkInitialNotification = async () => {
      const lastResponse = await getNotifications().getLastNotificationResponseAsync();
      if (!isMounted || !azanSettings.visualAzanEnabled) return;

      // the last response survives restarts: without these checks one tap on a prayer
      // notification started the adhan again on every later launch
      const fresh = lastResponse && Date.now() - (lastResponse.notification.date ?? 0) < STALE_RESPONSE_MS;
      if (lastResponse) getNotifications().clearLastNotificationResponse?.();
      if (lastResponse && fresh) {
        const { title, data } = lastResponse.notification.request.content;
        const prayer = prayerFromNotification(title, data);
        if (prayer) raiseAzan(prayer);
      } else if (!lastResponse && timings) {
        // a full-screen-intent launch often carries no response: fall back to the clock
        const justStarted = prayerJustStarted(timings, new Date());
        if (justStarted) raiseAzan(PRAYER_AR_NAMES[justStarted]);
      }
    };

    const initNotifications = async () => {
      if (!timings || isSchedulingRef.current) {
        if (isSchedulingRef.current) console.log('useNotifications: Scheduling already in progress. Skipping.');
        return;
      }

      const scheduleState = JSON.stringify({ timings, safePrefs, azanSettings, notificationsEnabled, reminders, reciterFolder });
      if (scheduleState === lastScheduledRef.current) {
        console.log('useNotifications: Scheduling state unchanged. Skipping.');
        return;
      }

      isSchedulingRef.current = true;
      try {
        console.log('useNotifications: Attempting init. Enabled:', notificationsEnabled);
        
        const scheduledCount = await notifications.scheduledCount();
        console.log(`useNotifications: Currently scheduled: ${scheduledCount}`);

        const now = new Date();
        const currentHHmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const isAtPrayerTime = Object.values(timings).some((t) => typeof t === 'string' && t.includes(currentHHmm));
        
        // Only block re-scheduling if we already have notifications. 
        // If count is 0, we must schedule even if it's prayer time.
        if (isAtPrayerTime && scheduledCount > 0) {
          console.log('useNotifications: At prayer time with existing schedule. Delaying re-schedule.');
          isSchedulingRef.current = false;
          return;
        }

        const hasPermission = await notifications.request();
        
        if (!isMounted) {
          isSchedulingRef.current = false;
          return;
        }

        if (!hasPermission || !notificationsEnabled) {
          console.log('useNotifications: Cancelling all (Permission or Enabled false)');
          await notifications.cancelAll();
          lastScheduledRef.current = scheduleState;
          isSchedulingRef.current = false;
          return;
        }

        console.log('useNotifications: Re-scheduling all...');
        await notifications.rescheduleAll({ prefs: safePrefs, azan: azanSettings, timings, reminders, reciterFolder });
        
        lastScheduledRef.current = scheduleState;
        
        const finalCount = await notifications.scheduledCount();
        console.log(`useNotifications: Scheduling complete. Total scheduled: ${finalCount}`);
        
      } catch (err) {
        console.error('useNotifications: Error during scheduling:', err);
      } finally {
        isSchedulingRef.current = false;
      }
    };

    checkInitialNotification();

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (isMounted) initNotifications();
    }, 1500);

    const N = getNotifications();
    type Received = { request: { content: { title?: string | null; data?: Record<string, unknown> | null } } };

    const subscription = N.addNotificationReceivedListener((notification: Received) => {
      const { title, data } = notification.request.content;
      const prayer = prayerFromNotification(title, data);
      if (!prayer || azanSettings.type === 'none') return;
      AudioService.playAzan(azanSettings.type);
      if (azanSettings.visualAzanEnabled) dispatch(showAzanModal(prayer));
    });

    const responseSubscription = N.addNotificationResponseReceivedListener((response: { notification: Received }) => {
      const { title, data } = response.notification.request.content;
      const prayer = prayerFromNotification(title, data);
      if (prayer && azanSettings.visualAzanEnabled) raiseAzan(prayer);
    });

    const raiseAlarm = (name: string) => {
      if (name.startsWith(REMINDER_PREFIX)) dispatch(showReminderAlarm(name.slice(REMINDER_PREFIX.length)));
      else if (azanSettings.visualAzanEnabled) dispatch(showAzanModal(name));
    };
    const offAzan = azanAlarms.onTriggered(raiseAlarm);

    // an alarm that fired while the app was closed
    azanAlarms.getPending().then((pending) => { if (pending) raiseAlarm(pending); });

    // after a reboot the alarms could not be re-armed (e.g. exact-alarm permission revoked)
    azanAlarms.didBootRescheduleFail().then((failed) => {
      if (!failed) return;
      Alert.alert(
        'تنبيه: الأذان متوقف',
        'بعد إعادة تشغيل الجهاز لم يتمكن التطبيق من إعادة جدولة الأذان بسبب نقص إذن "المنبهات المجدولة". يرجى فتح إعدادات الأذان ومنح الإذن مجددًا.',
        [{ text: 'حسنًا', onPress: () => azanAlarms.clearBootRescheduleFailed() }],
      );
    });

    return () => { 
      isMounted = false; 
      subscription.remove();
      responseSubscription.remove();
      offAzan();
    };
  }, [timings, safePrefs, notificationsEnabled, azanSettings, reminders, reciterFolder, dispatch, notifications, azanAlarms]);
};

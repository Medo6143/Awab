import { useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { useDependencies } from '../providers/DependencyProvider';
import { AzanSettings, DEFAULT_AZAN_SETTINGS } from '../../domain/entities/notifications';
import { PRAYER_AR_NAMES, prayerFromNotification, prayerJustStarted } from '../../domain/entities/prayer';
import { showAzanModal, showReminderAlarm } from '../store/slices/uiSlice';
import { usePrayerTimes } from './usePrayerTimes';

/** The native alarm opens the app with "reminder:<id>" for the user's own reminders. */
const REMINDER_PREFIX = 'reminder:';
/** A tapped notification older than this no longer starts the adhan on launch. */
const STALE_RESPONSE_MS = 5 * 60 * 1000;

/**
 * Raises the adhan screen (and plays the adhan in the app) or a reminder's screen, whichever
 * way it arrives: the app opened from a notification or by the native alarm, a notification
 * delivered or tapped while the app is open, or an alarm that fired while it was closed.
 */
export const useAzanTriggers = () => {
  const dispatch = useDispatch();
  const { azanAlarms, azanSound, incomingNotifications } = useDependencies();
  const { timings } = usePrayerTimes();
  const rawAzanSettings = useSelector((state: RootState) => state.settings.azanSettings);
  const azanSettings = useMemo<AzanSettings>(() => ({ ...DEFAULT_AZAN_SETTINGS, ...rawAzanSettings }), [rawAzanSettings]);

  useEffect(() => {
    let isMounted = true;

    // shows the azan screen and plays the adhan unless the user chose silent
    const raiseAzan = async (prayerName: string) => {
      dispatch(showAzanModal(prayerName));
      if (azanSettings.type === 'none') return;
      // the native alarm may be the one that opened the app, and is already calling the adhan:
      // a second one from here would play over it
      if ((await azanAlarms.playbackPosition()) != null) return;
      azanSound.play(azanSettings.type);
    };

    // the app was opened by tapping a prayer notification, or by its full-screen intent
    (async () => {
      const last = await incomingNotifications.takeLastTapped();
      if (!isMounted || !azanSettings.visualAzanEnabled) return;
      if (last && Date.now() - last.shownAt < STALE_RESPONSE_MS) {
        const prayer = prayerFromNotification(last.content.title, last.content.data);
        if (prayer) raiseAzan(prayer);
      } else if (!last && timings) {
        // a full-screen-intent launch often carries no response: fall back to the clock, but
        // only while the adhan is still playing, so opening the app after it was stopped does not
        // bring the screen back
        const justStarted = prayerJustStarted(timings, new Date());
        if (justStarted && (await azanAlarms.playbackPosition()) != null && isMounted) {
          raiseAzan(PRAYER_AR_NAMES[justStarted]);
        }
      }
    })();

    const offReceived = incomingNotifications.onReceived(({ title, data }) => {
      const prayer = prayerFromNotification(title, data);
      if (!prayer || azanSettings.type === 'none') return;
      azanSound.play(azanSettings.type);
      if (azanSettings.visualAzanEnabled) dispatch(showAzanModal(prayer));
    });

    const offTapped = incomingNotifications.onTapped(({ title, data }) => {
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
      offReceived();
      offTapped();
      offAzan();
    };
  }, [timings, azanSettings, dispatch, azanAlarms, azanSound, incomingNotifications]);
};

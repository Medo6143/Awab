import { useEffect, useMemo, useRef } from 'react';
import { DeviceEventEmitter, NativeModules, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { NotificationService } from '../../data/services/NotificationService';
import { usePrayerTimes } from './usePrayerTimes';
import { showAzanModal } from '../store/slices/uiSlice';

// We avoid top-level imports of expo-notifications to prevent early JSI binding attempts
const getNotifications = () => require('expo-notifications');

export const useNotifications = () => {
  const dispatch = useDispatch();
  const { timings } = usePrayerTimes();
  const { notificationPrefs, notificationsEnabled, azanSettings: rawAzanSettings } = useSelector((state: RootState) => state.settings);
  
  const azanSettings = useMemo(() => {
    const fallback = { type: 'full', visualAzanEnabled: true };
    return rawAzanSettings ? { ...fallback, ...rawAzanSettings } : fallback;
  }, [rawAzanSettings]);
  
  const safePrefs = useMemo(() => notificationPrefs || {
    prayers: true, athkar: true, qiyam: true, duha: true, ramadan: true, dailyReminder: true
  }, [notificationPrefs]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastScheduledRef = useRef<string>('');
  const isSchedulingRef = useRef<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const checkInitialNotification = async () => {
      const lastResponse = await getNotifications().getLastNotificationResponseAsync();
      const now = new Date();
      const currentHHmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const fiveMinsAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const prevHHmm = `${String(fiveMinsAgo.getHours()).padStart(2, '0')}:${String(fiveMinsAgo.getMinutes()).padStart(2, '0')}`;

      if (lastResponse && isMounted) {
        const { title, data } = lastResponse.notification.request.content;
        console.log('useNotifications: App launched via notification:', title, data);
        const prayerNameFromData = (data as any)?.prayerName;
        
        if (((title as string)?.includes('صلاة') || (data as any)?.type === 'prayer') && azanSettings?.visualAzanEnabled) {
          const prayerName = prayerNameFromData || (title as string)?.replace('صلاة ', '').trim() || 'الصلاة';
          dispatch(showAzanModal(prayerName));
          
          const { AudioService } = require('../../data/services/AudioService');
          AudioService.playAzan(azanSettings?.type || 'full');
        }
      } else if (timings && azanSettings?.visualAzanEnabled) {
        // Handle fullScreenIntent launch (which often carries no 'response' in expo-notifications)
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        
        Object.entries(timings).forEach(([prayerId, time]: [string, any]) => {
          const parsed = NotificationService['parseTime'](time);
          if (!parsed) return;
          
          const prayerMinutes = parsed.hours * 60 + parsed.minutes;
          const diff = nowMinutes - prayerMinutes;
          
          // Trigger if we are within 3 minutes AFTER the prayer time
          if (diff >= 0 && diff <= 3) {
            console.log(`useNotifications: App launched within ${diff}m of prayer ${prayerId}. Triggering Azan.`);
            const arabicNames: any = { Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' };
            dispatch(showAzanModal(arabicNames[prayerId] || prayerId));
            const { AudioService } = require('../../data/services/AudioService');
            AudioService.playAzan(azanSettings?.type || 'full');
          }
        });
      }
    };

    const initNotifications = async () => {
      if (!timings || isSchedulingRef.current) {
        if (isSchedulingRef.current) console.log('useNotifications: Scheduling already in progress. Skipping.');
        return;
      }

      const scheduleState = JSON.stringify({ timings, safePrefs, azanSettings, notificationsEnabled });
      if (scheduleState === lastScheduledRef.current) {
        console.log('useNotifications: Scheduling state unchanged. Skipping.');
        return;
      }

      isSchedulingRef.current = true;
      try {
        console.log('useNotifications: Attempting init. Enabled:', notificationsEnabled);
        
        const scheduledCount = await NotificationService.getScheduledCount();
        console.log(`useNotifications: Currently scheduled: ${scheduledCount}`);

        const now = new Date();
        const currentHHmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const isAtPrayerTime = Object.values(timings).some((t: any) => t.includes(currentHHmm));
        
        // Only block re-scheduling if we already have notifications. 
        // If count is 0, we must schedule even if it's prayer time.
        if (isAtPrayerTime && scheduledCount > 0) {
          console.log('useNotifications: At prayer time with existing schedule. Delaying re-schedule.');
          isSchedulingRef.current = false;
          return;
        }

        const hasPermission = await NotificationService.requestPermissions();
        
        if (!isMounted) {
          isSchedulingRef.current = false;
          return;
        }

        if (!hasPermission || !notificationsEnabled) {
          console.log('useNotifications: Cancelling all (Permission or Enabled false)');
          await NotificationService.cancelAll();
          lastScheduledRef.current = scheduleState;
          isSchedulingRef.current = false;
          return;
        }

        console.log('useNotifications: Re-scheduling all...');
        await NotificationService.cancelAll();
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        await NotificationService.schedulePrayerNotifications(timings as any, { ...safePrefs, azanSettings });
        await NotificationService.scheduleAthkarReminders(safePrefs);
        await NotificationService.scheduleSpiritualReminders(safePrefs);
        await NotificationService.scheduleDailyWard(safePrefs);
        await NotificationService.scheduleEncouragementReminders(safePrefs);
        
        lastScheduledRef.current = scheduleState;
        
        const finalCount = await NotificationService.getScheduledCount();
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

    const subscription = getNotifications().addNotificationReceivedListener((notification: any) => {
      const { title, data } = notification.request.content;
      console.log('useNotifications: Notification received:', title, data);
      
      if ((title?.includes('صلاة') || data?.type === 'prayer') && azanSettings?.type !== 'none') {
        const { AudioService } = require('../../data/services/AudioService');
        AudioService.playAzan(azanSettings?.type || 'full');

        if (azanSettings?.visualAzanEnabled) {
          const prayerName = data?.prayerName || title.replace('صلاة ', '').trim() || 'الصلاة';
          dispatch(showAzanModal(prayerName));
        }
      } 
    });

    const responseSubscription = getNotifications().addNotificationResponseReceivedListener((response: any) => {
      const { title, data } = response.notification.request.content;
      console.log('useNotifications: Notification click response:', title, data);
      
      if (((title as string)?.includes('صلاة') || (data as any)?.type === 'prayer') && azanSettings?.visualAzanEnabled) {
        const prayerName = (data as any)?.prayerName || (title as string)?.replace('صلاة ', '').trim() || 'الصلاة';
        dispatch(showAzanModal(prayerName));
        
        const { AudioService } = require('../../data/services/AudioService');
        AudioService.playAzan(azanSettings?.type || 'full');
      }
    });

    console.log('useNotifications: Subscribing to onAzanTriggered (DeviceEventEmitter)...');
    const azanListener = DeviceEventEmitter.addListener('onAzanTriggered', (event) => {
      console.log('useNotifications: Native Azan event received via DeviceEventEmitter! Data:', event);
      if (azanSettings?.visualAzanEnabled) {
        console.log('useNotifications: Visual Azan is enabled. Dispatching modal for:', event.prayerName);
        dispatch(showAzanModal(event.prayerName || 'الصلاة'));
      } else {
        console.log('useNotifications: Visual Azan is DISABLED in settings. Ignoring event.');
      }
    });

    // Check for pending Azan on start
    if (Platform.OS === 'android' && NativeModules.AzanModule) {
      NativeModules.AzanModule.getPendingAzan().then((pendingPrayer: string | null) => {
        if (pendingPrayer && azanSettings?.visualAzanEnabled) {
          console.log('useNotifications: Found pending Azan on start:', pendingPrayer);
          dispatch(showAzanModal(pendingPrayer));
        }
      });
    }

    return () => { 
      isMounted = false; 
      subscription.remove();
      responseSubscription.remove();
      azanListener.remove();
    };
  }, [timings, safePrefs, notificationsEnabled, azanSettings, dispatch]);
};

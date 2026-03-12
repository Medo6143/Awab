import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import * as Notifications from 'expo-notifications';
import { RootState } from '../store';
import { NotificationService } from '../../data/services/NotificationService';
import { usePrayerTimes } from './usePrayerTimes';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { showAzanModal } from '../store/slices/uiSlice';

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
        
        // Diagnostic: Log current count
        await NotificationService.logScheduledNotifications();

        // Safety: Don't cancel/reschedule if we are exactly at a prayer minute
        const now = new Date();
        const currentHHmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const isAtPrayerTime = Object.values(timings).some((t: any) => t.includes(currentHHmm));
        
        if (isAtPrayerTime) {
          console.log('useNotifications: Currently at prayer time. Delaying re-schedule.');
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

        // Re-schedule everything
        console.log('useNotifications: Re-scheduling all...');
        await NotificationService.cancelAll();
        
        // Wait a bit more for the OS to process cancellation if we are in a heavy state
        await new Promise(resolve => setTimeout(resolve, 200));
        
        await NotificationService.schedulePrayerNotifications(timings, { ...safePrefs, azanSettings });
        await NotificationService.scheduleAthkarReminders(safePrefs);
        await NotificationService.scheduleSpiritualReminders(safePrefs);
        await NotificationService.scheduleDailyWard(safePrefs);
        
        lastScheduledRef.current = scheduleState;
        
        // Diagnostic: Log final count
        const finalCount = await NotificationService.getScheduledCount();
        console.log(`useNotifications: Scheduling complete. Total scheduled: ${finalCount}`);
        
        // Safety: If we are dangerously close to the limit (500), purge all and reset
        if (finalCount > 450) {
          console.warn('useNotifications: Dangerously close to alarm limit! Purging...');
          await NotificationService.purgeAll();
          lastScheduledRef.current = ''; // Force retry on next tick
        }
        
      } catch (err) {
        console.error('useNotifications: Error during scheduling:', err);
      } finally {
        isSchedulingRef.current = false;
      }

      // Check for last notification response (if app was killed)
      const lastResponse = await Notifications.getLastNotificationResponseAsync();
      if (lastResponse && isMounted) {
        const { title, data } = lastResponse.notification.request.content;
        const prayerNameFromData = (data as any)?.prayerName;
        
        if ((title?.includes('صلاة') || (data as any)?.type === 'prayer') && azanSettings?.visualAzanEnabled) {
          const prayerName = prayerNameFromData || title?.replace('صلاة ', '').trim() || 'الصلاة';
          dispatch(showAzanModal(prayerName));
        }
      }
    };

    // Debounce the init call to prevent rapid duplicate scheduling
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (isMounted) initNotifications();
    }, 1500);

    // Foreground Azan Listener
    const subscription = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
      const title = notification.request.content.title;
      console.log('useNotifications: Notification received:', title, 'Settings:', azanSettings);
      
      // Use closure-captured values from this render
      if (title?.includes('صلاة') && azanSettings?.type !== 'none') {
        console.log('useNotifications: Triggering Azan audio/video...');
        const { AudioService } = require('../../data/services/AudioService');
        AudioService.playAzan(azanSettings?.type || 'full');

        if (azanSettings?.visualAzanEnabled) {
          // Extract prayer name from title (e.g., "صلاة الفجر" -> "الفجر")
          const prayerName = title.replace('صلاة ', '').trim();
          dispatch(showAzanModal(prayerName));
        }
      } else {
        console.log('useNotifications: Condition not met for Azan alert.');
      }
    });

    return () => { 
      isMounted = false; 
      subscription.remove();
    };
  }, [timings, safePrefs, notificationsEnabled, azanSettings]);
};

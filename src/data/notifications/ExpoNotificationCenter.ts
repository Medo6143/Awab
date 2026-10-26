import { NotificationCenter, ReminderScheduler, ScheduleContext } from '../../domain/services/Notifications';
import { expoNotifications, initializeChannels, isExpoGo } from './expo';

/**
 * Permissions, channels and the full reschedule cycle. Knows nothing about prayers or
 * athkar: it runs whatever schedulers it was given.
 */
export class ExpoNotificationCenter implements NotificationCenter {
  constructor(private readonly schedulers: readonly ReminderScheduler[]) {}

  init() {
    if (isExpoGo()) return;
    try {
      expoNotifications().setNotificationHandler({
        handleNotification: async () => ({ shouldPlaySound: true, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true }),
      });
    } catch (e) {
      console.warn('notifications: init failed', e);
    }
  }

  async request() {
    try {
      await initializeChannels();
      const N = expoNotifications();
      const { status } = await N.getPermissionsAsync();
      if (status === 'granted') return true;
      return (await N.requestPermissionsAsync()).status === 'granted';
    } catch (e) {
      console.warn('notifications: permission request failed', e);
      return false;
    }
  }

  async status() {
    try {
      return (await expoNotifications().getPermissionsAsync()).status === 'granted';
    } catch {
      return false;
    }
  }

  async cancelAll() {
    const N = expoNotifications();
    try {
      for (const s of this.schedulers) {
        for (const id of s.ids) await N.cancelScheduledNotificationAsync(id).catch(() => {});
        await s.cancelExtra?.();
      }
      await N.cancelAllScheduledNotificationsAsync();
    } catch (e) {
      console.error('notifications: cancel failed', e);
    }
  }

  async rescheduleAll(ctx: ScheduleContext) {
    await this.cancelAll();
    // a short pause lets Android finish removing the old alarms before new ones are set
    await new Promise((r) => setTimeout(r, 300));
    for (const s of this.schedulers) await s.schedule(ctx);
  }

  async scheduledCount() {
    try {
      return (await expoNotifications().getAllScheduledNotificationsAsync()).length;
    } catch {
      return -1;
    }
  }
}

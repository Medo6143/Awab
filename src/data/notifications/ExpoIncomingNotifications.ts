import { IncomingNotifications, NotificationContent } from '../../domain/services/IncomingNotifications';
import { expoNotifications, isExpoGo } from './expo';

type ExpoNotification = { date?: number; request: { content: NotificationContent } };

/** IncomingNotifications on expo-notifications (loaded lazily, see expo.ts). */
export class ExpoIncomingNotifications implements IncomingNotifications {
  async takeLastTapped() {
    if (isExpoGo()) return null;
    try {
      const N = expoNotifications();
      const last: { notification: ExpoNotification } | null = await N.getLastNotificationResponseAsync();
      if (!last) return null;
      N.clearLastNotificationResponse?.();
      const { title, data } = last.notification.request.content;
      return { content: { title, data }, shownAt: last.notification.date ?? 0 };
    } catch {
      return null;
    }
  }

  onReceived(listener: (content: NotificationContent) => void) {
    if (isExpoGo()) return () => {};
    const sub = expoNotifications().addNotificationReceivedListener((n: ExpoNotification) => {
      const { title, data } = n.request.content;
      listener({ title, data });
    });
    return () => sub.remove();
  }

  onTapped(listener: (content: NotificationContent) => void) {
    if (isExpoGo()) return () => {};
    const sub = expoNotifications().addNotificationResponseReceivedListener((r: { notification: ExpoNotification }) => {
      const { title, data } = r.notification.request.content;
      listener({ title, data });
    });
    return () => sub.remove();
  }
}

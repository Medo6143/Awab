import { useAzanTriggers } from './useAzanTriggers';
import { useNotificationSchedule } from './useNotificationSchedule';

/**
 * Everything notification-related the app root needs: the schedule kept up to date
 * (useNotificationSchedule) and the adhan / reminder screens raised when one arrives
 * (useAzanTriggers).
 */
export const useNotifications = (exactAlarmGranted: boolean | null) => {
  useNotificationSchedule(exactAlarmGranted);
  useAzanTriggers();
};

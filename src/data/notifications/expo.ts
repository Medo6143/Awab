import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { ClockTime } from '../../domain/entities/notifications';

// Lazy: importing expo-notifications at module load binds JSI too early on this app.
export const expoNotifications = () => require('expo-notifications');

export const isExpoGo = () => Constants.appOwnership === 'expo';

export type ChannelId = 'azan' | 'spiritual' | 'default';

export interface DailyNotification {
  id: string;
  at: ClockTime;
  channel: ChannelId;
  title: string;
  body: string;
  sound?: string | boolean;
  priority?: 'max' | 'high';
  fullScreen?: boolean;
  data?: Record<string, unknown>;
}

/** Schedules a notification that repeats every day at the given time. */
export const scheduleDaily = async (n: DailyNotification) => {
  const N = expoNotifications();
  await N.scheduleNotificationAsync({
    identifier: n.id,
    content: {
      title: n.title,
      body: n.body,
      ...(n.sound !== undefined && { sound: n.sound }),
      ...(n.priority && { priority: n.priority === 'max' ? N.AndroidNotificationPriority.MAX : N.AndroidNotificationPriority.HIGH }),
      ...(n.fullScreen && { fullScreenIntent: true }),
      ...(n.data && { data: n.data }),
    },
    trigger: { type: N.SchedulableTriggerInputTypes.DAILY, hour: n.at.hours, minute: n.at.minutes, channelId: n.channel },
  });
};

export const initializeChannels = async () => {
  if (isExpoGo() || Platform.OS !== 'android') return;
  const N = expoNotifications();
  try {
    await N.setNotificationChannelAsync('azan', {
      name: 'Azan Notifications',
      importance: N.AndroidImportance.MAX,
      sound: 'azan.mp3',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      lockscreenVisibility: N.AndroidNotificationVisibility.PUBLIC,
      fullScreenIntent: true,
    });
    await N.setNotificationChannelAsync('spiritual', {
      name: 'Spiritual Reminders',
      importance: N.AndroidImportance.HIGH,
      sound: 'sali_ala_nabii.mp3',
      vibrationPattern: [0, 250, 250, 250],
    });
    await N.setNotificationChannelAsync('default', {
      name: 'General Notifications',
      importance: N.AndroidImportance.DEFAULT,
    });
  } catch (e) {
    console.warn('notifications: failed to initialize channels', e);
  }
};

/** Arabic text needs a right-to-left mark first so Android lays it out RTL in the shade. */
export const rtl = (s: string) => `‏${s}`;

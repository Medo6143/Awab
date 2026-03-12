import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static async requestPermissions() {
    console.log('NotificationService: Requesting permissions...');
    try {
      const isExpoGo = Constants.appOwnership === 'expo';
      const isAndroid = Platform.OS === 'android';

      if (isExpoGo && isAndroid) {
        console.info('NotificationService: Running in Expo Go (Android). Standard push notification functionality is limited in SDK 53+. Local notifications should still work.');
      }

      // Initialize Android Channels first
      await this.initializeChannels();

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      console.log('NotificationService: Permission final status:', finalStatus);
      return finalStatus === 'granted';
    } catch (error) {
      console.warn('NotificationService: Failed to request permissions:', error);
      return false;
    }
  }

  static async initializeChannels() {
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('azan', {
          name: 'Azan Notifications',
          importance: Notifications.AndroidImportance.MAX,
          sound: 'azan.mp3',
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          //@ts-ignore
          fullScreenIntent: true,
        });

        await Notifications.setNotificationChannelAsync('spiritual', {
          name: 'Spiritual Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'sali_ala_nabii.mp3',
          vibrationPattern: [0, 250, 250, 250],
        });

        await Notifications.setNotificationChannelAsync('default', {
          name: 'General Notifications',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
        console.log('NotificationService: Android Azan, Spiritual, and default channels initialized.');
      } catch (e) {
        console.warn('NotificationService: Failed to initialize channels:', e);
      }
    }
  }

  static async cancelAll() {
    console.log('NotificationService: Starting full cleanup...');
    try {
      // 1. Cancel by specific IDs we use (Targeted cleanup)
      const idsToCancel = [
        'prayer-Fajr', 'prayer-Dhuhr', 'prayer-Asr', 'prayer-Maghrib', 'prayer-Isha',
        'pre-prayer-Fajr', 'pre-prayer-Dhuhr', 'pre-prayer-Asr', 'pre-prayer-Maghrib', 'pre-prayer-Isha',
        'athkar-morning', 'athkar-evening',
        'spiritual-qiyam', 'spiritual-duha', 'spiritual-ward'
      ];
      
      for (const id of idsToCancel) {
        await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
      }
      
      // 2. Global cancel as fallback
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('NotificationService: Cleanup completed.');
    } catch (e) {
      console.error('NotificationService: Cleanup failed:', e);
    }
  }

  static async purgeAll() {
    console.warn('NotificationService: EMERGENCY PURGE REQUESTED');
    await Notifications.cancelAllScheduledNotificationsAsync();
    const count = await this.getScheduledCount();
    console.log('NotificationService: Post-purge count:', count);
  }

  static async getScheduledCount() {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      return scheduled.length;
    } catch (e) {
      console.error('NotificationService: Failed to get scheduled count:', e);
      return -1;
    }
  }

  static async logScheduledNotifications() {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`NotificationService: Total scheduled notifications: ${scheduled.length}`);
      scheduled.forEach(n => {
        console.log(` - [${n.identifier}] ${n.content.title} (${(n.trigger as any)?.hour}:${(n.trigger as any)?.minute})`);
      });
    } catch (e) {
      console.error('NotificationService: Failed to log scheduled notifications:', e);
    }
  }

  private static parseTime(timeStr: string): { hours: number, minutes: number } | null {
    if (!timeStr) return null;
    // Extract only the digits for HH:mm, ignoring everything else (e.g., "(EEST)")
    const match = timeStr.match(/(\d{1,2}):(\d{1,2})/);
    if (!match) return null;
    
    return {
      hours: parseInt(match[1], 10),
      minutes: parseInt(match[2], 10)
    };
  }

  static async schedulePrayerNotifications(timings: Record<string, string>, prefs: any) {
    if (!prefs || !prefs.prayers) return;

    console.log('NotificationService: Scheduling prayer notifications with timings:', JSON.stringify(timings));

    const prayers = [
      { id: 'Fajr', name: 'الفجر', body: '\u200f🕋 حان الآن وقت صلاة الفجر' },
      { id: 'Dhuhr', name: 'الظهر', body: '\u200f🕋 حان الآن وقت صلاة الظهر' },
      { id: 'Asr', name: 'العصر', body: '\u200f🕋 حان الآن وقت صلاة العصر' },
      { id: 'Maghrib', name: 'المغرب', body: '\u200f🕋 حان الآن وقت صلاة المغرب' },
      { id: 'Isha', name: 'العشاء', body: '\u200f🕋 حان الآن وقت صلاة العشاء' },
    ];

    for (const prayer of prayers) {
      try {
        const timeStr = timings[prayer.id];
        const parsed = this.parseTime(timeStr);
        if (!parsed) {
          console.warn(`NotificationService: Could not parse time for ${prayer.id}: "${timeStr}"`);
          continue;
        }

        const { hours, minutes } = parsed;
        
        // Use azan channel if type is not 'none', otherwise default
        const useAzanSound = prefs?.azanSettings?.type !== 'none'; 
        const channelId = useAzanSound ? 'azan' : 'default';

        console.log(`NotificationService: Scheduling ${prayer.id} at ${hours}:${minutes} on channel ${channelId}`);

        await Notifications.scheduleNotificationAsync({
          identifier: `prayer-${prayer.id}`,
          content: {
            title: `\u200fصلاة ${prayer.name}`,
            body: prayer.body,
            sound: useAzanSound ? 'azan.mp3' : true,
            priority: Notifications.AndroidNotificationPriority.MAX,
            //@ts-ignore
            fullScreenIntent: true,
            data: { prayerName: prayer.name, type: 'prayer' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: hours,
            minute: minutes,
            channelId: channelId,
          } as Notifications.NotificationTriggerInput,
        });

        // Add Pre-Prayer Reminder
        if (prefs?.prePrayerReminderEnabled) {
          const offset = prefs.prePrayerReminderOffset || 10;
          let rHours = hours;
          let rMinutes = minutes - offset;
          
          if (rMinutes < 0) {
            rMinutes += 60;
            rHours = (rHours - 1 + 24) % 24;
          }

          console.log(`NotificationService: Scheduling pre-prayer reminder for ${prayer.id} at ${rHours}:${rMinutes}`);

          await Notifications.scheduleNotificationAsync({
            identifier: `pre-prayer-${prayer.id}`,
            content: {
              title: `\u200fتنبيه: صلاة ${prayer.name}`,
              body: `\u200f⏰ بقيت ${offset} دقائق على صلاة ${prayer.name}.. توضأ واستعد`,
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
              data: { prayerName: prayer.name, type: 'reminder' },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DAILY,
              hour: rHours,
              minute: rMinutes,
              channelId: 'default',
            } as Notifications.NotificationTriggerInput,
          });
        }
      } catch (e) {
        console.error(`NotificationService: Fatal error scheduling ${prayer.id}:`, e);
      }
    }
  }

  static async scheduleAthkarReminders(prefs: any) {
    if (prefs && prefs.athkar) {
      try {
        // Morning Athkar at 7:00 AM
        await Notifications.scheduleNotificationAsync({
          identifier: 'athkar-morning',
          content: {
            title: '\u200fأذكار الصباح',
            body: '\u200f📖 "ألا بذكر الله تطمئن القلوب".. حان وقت أذكار الصباح',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 7, 
            minute: 0,
            channelId: 'default',
          } as Notifications.NotificationTriggerInput,
        });

        // Evening Athkar at 5:00 PM
        await Notifications.scheduleNotificationAsync({
          identifier: 'athkar-evening',
          content: {
            title: '\u200fأذكار المساء',
            body: '\u200f🌙 حان وقت أذكار المساء.. حفظك الله في يومك وليلتك',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 17, 
            minute: 0,
            channelId: 'default',
          } as Notifications.NotificationTriggerInput,
        });
      } catch (e) {
        console.debug('NotificationService: Failed to schedule athkar:', e);
      }
    }
  }

  static async scheduleSpiritualReminders(prefs: any) {
    if (prefs && prefs.qiyam) {
      try {
        // Qiyam at 2:00 AM
        await Notifications.scheduleNotificationAsync({
          identifier: 'spiritual-qiyam',
          content: {
            title: '\u200fرسالة من أوّاب: قيام الليل',
            body: '\u200f🌌 قيام الليل شرف المؤمن.. لا تنسَ نصيبك من صلاة الليل',
            sound: 'sali_ala_nabii.mp3',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 2, 
            minute: 0,
            channelId: 'spiritual',
          } as Notifications.NotificationTriggerInput,
        });
      } catch (e) {
        console.debug('NotificationService: Failed to schedule qiyam:', e);
      }
    }

    if (prefs && prefs.duha) {
      try {
        // Duha at 9:00 AM
        await Notifications.scheduleNotificationAsync({
          identifier: 'spiritual-duha',
          content: {
            title: '\u200fصلاة الضحى',
            body: '\u200f☀️ صلاة الأوابين.. ركعتي الضحى تجزئ عن صدقة كل سلامى من عظامك',
            sound: 'sali_ala_nabii.mp3',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 9, 
            minute: 0,
            channelId: 'spiritual',
          } as Notifications.NotificationTriggerInput,
        });
      } catch (e) {
        console.debug('NotificationService: Failed to schedule duha:', e);
      }
    }
  }

  static async scheduleDailyWard(prefs: any) {
    if (!prefs?.dailyWardEnabled || !prefs?.dailyWardTime) return;

    try {
      const parsed = this.parseTime(prefs.dailyWardTime);
      if (!parsed) return;

      await Notifications.scheduleNotificationAsync({
        identifier: 'spiritual-ward',
        content: {
          title: '\u200fموعد الورد اليومي',
          body: '\u200f📖 حان الآن موعد وردك اليومي.. نصيبك من كتاب الله نجاة لك',
          sound: 'sali_ala_nabii.mp3',
          data: { type: 'ward' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: parsed.hours,
          minute: parsed.minutes,
          channelId: 'spiritual',
        } as Notifications.NotificationTriggerInput,
      });
      console.log(`NotificationService: Daily Ward scheduled at ${prefs.dailyWardTime}`);
    } catch (e) {
      console.error('NotificationService: Failed to schedule Daily Ward:', e);
    }
  }

  static async testNotification() {
    console.log('NotificationService: Starting manual test notification...');
    try {
      // Ensure we have permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('NotificationService: Cannot test notification - Permission Denied');
        return false;
      }

      // Explicitly initialize channels for Android
      await this.initializeChannels();

      console.log('NotificationService: Scheduling immediate test notification...');
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: '\u200fصلاة التجربة',
          body: '\u200fالمهمة تمت بنجاح! الإشعارات والفيديو يعملان بشكل سليم الآن.',
          sound: 'azan.mp3',
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: { prayerName: 'تجربة', type: 'prayer', test: true },
        },
        trigger: null, // Immediate
      });
      
      console.log('NotificationService: Test notification scheduled successfully. ID:', id);
      return true;
    } catch (e) {
      console.error('NotificationService: Fatal error in testNotification:', e);
      return false;
    }
  }
}

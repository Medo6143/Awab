import { Platform } from 'react-native';
import Constants from 'expo-constants';

// We avoid top-level imports of expo-notifications to prevent early JSI binding attempts
const getNotifications = () => require('expo-notifications');

export class NotificationService {
  static init() {
    const isExpoGo = Constants.appOwnership === 'expo';
    if (isExpoGo) {
      console.warn('NotificationService: Skipping setNotificationHandler in Expo Go');
      return;
    }

    try {
      getNotifications().setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    } catch (e) {
      console.warn('NotificationService: init failed', e);
    }
  }

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

      const { status: existingStatus } = await getNotifications().getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await getNotifications().requestPermissionsAsync();
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
    const isExpoGo = Constants.appOwnership === 'expo';
    if (isExpoGo || Platform.OS !== 'android') return;

    try {
      await getNotifications().setNotificationChannelAsync('azan', {
        name: 'Azan Notifications',
        importance: getNotifications().AndroidImportance.MAX,
        sound: 'azan.mp3',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        lockscreenVisibility: getNotifications().AndroidNotificationVisibility.PUBLIC,
        //@ts-ignore
        fullScreenIntent: true,
      });

      await getNotifications().setNotificationChannelAsync('spiritual', {
        name: 'Spiritual Reminders',
        importance: getNotifications().AndroidImportance.HIGH,
        sound: 'sali_ala_nabii.mp3',
        vibrationPattern: [0, 250, 250, 250],
      });

      await getNotifications().setNotificationChannelAsync('default', {
        name: 'General Notifications',
        importance: getNotifications().AndroidImportance.DEFAULT,
      });
      console.log('NotificationService: Android Azan, Spiritual, and default channels initialized.');
    } catch (e) {
      console.warn('NotificationService: Failed to initialize channels:', e);
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
        await getNotifications().cancelScheduledNotificationAsync(id).catch(() => {});
      }

      // Cancel encouragement IDs
      for (let i = 0; i < 10; i++) {
        await getNotifications().cancelScheduledNotificationAsync(`encouragement-${i}`).catch(() => {});
      }
      
      // 2. Global cancel as fallback
      await getNotifications().cancelAllScheduledNotificationsAsync();

      // 3. Cancel Native Azan Alarms
      if (Platform.OS === 'android') {
        const { AzanModule } = require('react-native').NativeModules;
        if (AzanModule) {
          const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
          for (const id of prayers) {
            AzanModule.cancelAzan(id);
          }
        }
      }
      console.log('NotificationService: Cleanup completed.');
    } catch (e) {
      console.error('NotificationService: Cleanup failed:', e);
    }
  }

  static async purgeAll() {
    console.warn('NotificationService: EMERGENCY PURGE REQUESTED');
    await getNotifications().cancelAllScheduledNotificationsAsync();
    const count = await this.getScheduledCount();
    console.log('NotificationService: Post-purge count:', count);
  }

  static async getScheduledCount() {
    try {
      const scheduled = await getNotifications().getAllScheduledNotificationsAsync();
      return scheduled.length;
    } catch (e) {
      console.error('NotificationService: Failed to get scheduled count:', e);
      return -1;
    }
  }

  static async logScheduledNotifications() {
    try {
      const scheduled = await getNotifications().getAllScheduledNotificationsAsync();
      console.log(`NotificationService: Total scheduled notifications: ${scheduled.length}`);
      scheduled.forEach((n: any) => {
        console.log(` - [${n.identifier}] ${n.content.title} (${(n.trigger as any)?.hour}:${(n.trigger as any)?.minute})`);
      });
    } catch (e) {
      console.error('NotificationService: Failed to log scheduled notifications:', e);
    }
  }

  private static parseTime(timeStr: string): { hours: number, minutes: number } | null {
    if (!timeStr) return null;
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
      { id: 'Fajr', name: 'الفجر', body: '\u200f🕌 نداء الحق: صلاة الفجر تناديكم.. الصلاة خير من النوم' },
      { id: 'Dhuhr', name: 'الظهر', body: '\u200f🕌 حان الآن وقت اللقاء بخالقك.. نداء صلاة الظهر' },
      { id: 'Asr', name: 'العصر', body: '\u200f🕌 حافظوا على الصلوات والصلاة الوسطى.. نداء صلاة العصر' },
      { id: 'Maghrib', name: 'المغرب', body: '\u200f🕌 أقبلت نفحات المغرب.. نداء الصلاة' },
      { id: 'Isha', name: 'العشاء', body: '\u200f🕌 اختم يومك ساجداً لله.. نداء صلاة العشاء' },
    ];

    for (const prayer of prayers) {
      try {
        const timeStr = timings[prayer.id];
        const parsed = this.parseTime(timeStr);
        if (!parsed) continue;

        const { hours, minutes } = parsed;
        const azanType = prefs?.azanSettings?.type || 'full';
        const useAzanSound = azanType !== 'none'; 
        const channelId = useAzanSound ? 'azan' : 'default';

        if (useAzanSound && Platform.OS === 'android') {
          // Robust Native Azan
          const { AzanModule } = require('react-native').NativeModules;
          if (AzanModule) {
            console.log(`NotificationService: Scheduling ROBUST Azan for ${prayer.id} at ${hours}:${minutes}`);
            AzanModule.scheduleAzan(prayer.id, prayer.name, hours, minutes, azanType);
          }
        } else {
          // Standard expo-notification fallback
          await getNotifications().scheduleNotificationAsync({
            identifier: `prayer-${prayer.id}`,
            content: {
              title: `\u200fصلاة ${prayer.name}`,
              body: prayer.body,
              sound: true, 
              priority: getNotifications().AndroidNotificationPriority.MAX,
              //@ts-ignore
              fullScreenIntent: true,
              data: { prayerId: prayer.id, type: 'prayer' },
            },
            trigger: {
              type: getNotifications().SchedulableTriggerInputTypes.DAILY,
              hour: hours,
              minute: minutes,
              channelId: channelId,
            },
          });
        }

        if (prefs?.prePrayerReminderEnabled) {
          const offset = prefs.prePrayerReminderOffset || 10;
          let rHours = hours;
          let rMinutes = minutes - offset;
          if (rMinutes < 0) { rMinutes += 60; rHours = (rHours - 1 + 24) % 24; }

          await getNotifications().scheduleNotificationAsync({
            identifier: `pre-prayer-${prayer.id}`,
            content: {
              title: `\u200fتنبيه: صلاة ${prayer.name}`,
              body: `\u200f⏰ بقيت ${offset} دقائق على صلاة ${prayer.name}.. توضأ واستعد`,
              sound: true,
              priority: getNotifications().AndroidNotificationPriority.HIGH,
              data: { prayerName: prayer.name, type: 'reminder' },
            },
            trigger: {
              type: getNotifications().SchedulableTriggerInputTypes.DAILY,
              hour: rHours,
              minute: rMinutes,
              channelId: 'default',
            },
          });
        }
      } catch (e) {
        console.error(`NotificationService: Error scheduling ${prayer.id}:`, e);
      }
    }
  }

  static async scheduleAthkarReminders(prefs: any) {
    if (prefs && prefs.athkar) {
      try {
        await getNotifications().scheduleNotificationAsync({
          identifier: 'athkar-morning',
          content: { title: '\u200fأذكار الصباح', body: '\u200f📖 "ألا بذكر الله تطمئن القلوب".. حان وقت أذكار الصباح' },
          trigger: { type: getNotifications().SchedulableTriggerInputTypes.DAILY, hour: 7, minute: 0, channelId: 'default' },
        });
        await getNotifications().scheduleNotificationAsync({
          identifier: 'athkar-evening',
          content: { title: '\u200fأذكار المساء', body: '\u200f🌙 حان وقت أذكار المساء.. حفظك الله في يومك وليلتك' },
          trigger: { type: getNotifications().SchedulableTriggerInputTypes.DAILY, hour: 17, minute: 0, channelId: 'default' },
        });
      } catch (e) { console.debug('NotificationService: Athkar failure', e); }
    }
  }

  static async scheduleSpiritualReminders(prefs: any) {
    if (prefs && prefs.qiyam) {
      try {
        await getNotifications().scheduleNotificationAsync({
          identifier: 'spiritual-qiyam',
          content: { title: '\u200fرسالة من أوّاب: قيام الليل', body: '\u200f🌌 قيام الليل شرف المؤمن.. لا تنسَ نصيبك من صلاة الليل', sound: 'sali_ala_nabii.mp3' },
          trigger: { type: getNotifications().SchedulableTriggerInputTypes.DAILY, hour: 2, minute: 0, channelId: 'spiritual' },
        });
      } catch (e) {}
    }
    if (prefs && prefs.duha) {
      try {
        await getNotifications().scheduleNotificationAsync({
          identifier: 'spiritual-duha',
          content: { title: '\u200fصلاة الضحى', body: '\u200f☀️ صلاة الأوابين.. ركعتي الضحى تجزئ عن صدقة كل سلامى من عظامك', sound: 'sali_ala_nabii.mp3' },
          trigger: { type: getNotifications().SchedulableTriggerInputTypes.DAILY, hour: 9, minute: 0, channelId: 'spiritual' },
        });
      } catch (e) {}
    }
  }

  static async scheduleDailyWard(prefs: any) {
    if (!prefs?.dailyWardEnabled || !prefs?.dailyWardTime) return;
    try {
      const parsed = this.parseTime(prefs.dailyWardTime);
      if (!parsed) return;
      await getNotifications().scheduleNotificationAsync({
        identifier: 'spiritual-ward',
        content: { 
          title: '\u200fموعد الورد اليومي', 
          body: '\u200f📖 "وَتَرَىٰ كُلَّ أُمَّةٍ جَاثِيَةً كُلُّ أُمَّةٍ تُدْعَىٰ إِلَىٰ كِتَابِهَا".. حان الآن موعد وردك اليومي نورا لقلبك', 
          sound: 'sali_ala_nabii.mp3', 
          data: { type: 'ward' } 
        },
        trigger: { type: getNotifications().SchedulableTriggerInputTypes.DAILY, hour: parsed.hours, minute: parsed.minutes, channelId: 'spiritual' },
      });
    } catch (e) {}
  }

  private static ENCOURAGEMENT_MESSAGES = [
    { title: 'صلِّ على النبي ﷺ', body: 'اللهم صل وسلم وبارك على نبينا محمد.. لا تنس الصلاة عليه في هذه اللحظة ❤️' },
    { title: 'رسالة تشجيع', body: 'جدد نيتك.. "ما تقرب إلي عبدي بشيء أحب إلي مما افترضته عليه".. تقبل الله طاعتك' },
    { title: 'سبحان الله وبحمده', body: '"كلمتان خفيفتان على اللسان، ثقيلتان في الميزان".. سبحان الله وبحمده، سبحان الله العظيم' },
    { title: 'استغفر الله', body: 'طهر لسانك وقلبك بالاستغفار.. أستغفر الله العظيم وأتوب إليه' },
    { title: 'بشرى لك', body: '"من قال سبحان الله وبحمده في يوم مائة مرة حطت خطاياه وإن كانت مثل زبد البحر"' },
    { title: 'تذكير بالهدف', body: 'طريق الجنة يبدأ بخطوة.. اجعل خطواتك اليوم كلها لله' },
    { title: 'لا حول ولا قوة إلا بالله', body: 'كنز من كنوز الجنة.. لا حول ولا قوة إلا بالله العلي العظيم' },
  ];

  static async scheduleEncouragementReminders(prefs: any) {
    if (!prefs?.encouragementEnabled) return;
    try {
      const interval = prefs.encouragementInterval || 3;
      // Schedule 10 daily notifications spaced by interval
      let startHour = 8; // Start at 8 AM
      for (let i = 0; i < 10; i++) {
        const totalMinutes = i * interval * 60;
        const hour = (startHour + Math.floor(totalMinutes / 60)) % 24;
        const minute = totalMinutes % 60;
        
        const msg = this.ENCOURAGEMENT_MESSAGES[i % this.ENCOURAGEMENT_MESSAGES.length];
        
        await getNotifications().scheduleNotificationAsync({
          identifier: `encouragement-${i}`,
          content: { 
            title: `\u200f${msg.title}`, 
            body: `\u200f${msg.body}`, 
            sound: 'sali_ala_nabii.mp3',
            priority: getNotifications().AndroidNotificationPriority.HIGH,
            data: { type: 'encouragement' } 
          },
          trigger: { 
            type: getNotifications().SchedulableTriggerInputTypes.DAILY, 
            hour: hour, 
            minute: minute, 
            channelId: 'spiritual' 
          },
        });
      }
      console.log(`NotificationService: Scheduled 10 encouragement reminders with ${interval}h interval.`);
    } catch (e) {
      console.warn('NotificationService: Failed to schedule encouragement', e);
    }
  }

  static async testNotification() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return false;
      await this.initializeChannels();
      await getNotifications().scheduleNotificationAsync({
        content: {
          title: '\u200fصلاة التجربة',
          body: '\u200fالمهمة تمت بنجاح! الإشعارات والفيديو يعملان بشكل سليم الآن.',
          sound: 'azan.mp3',
          priority: getNotifications().AndroidNotificationPriority.MAX,
          data: { prayerName: 'تجربة', type: 'prayer', test: true },
        },
        trigger: null,
      });
      console.log('NotificationService: Test notification scheduled via expo-notifications');
      return true;
    } catch (e) { return false; }
  }
}

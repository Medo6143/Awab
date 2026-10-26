import { NativeModules, Platform } from 'react-native';
import { ReminderScheduler, ScheduleContext } from '../../domain/services/Notifications';
import { minusMinutes, parseClock, PRAYER_IDS, PrayerId } from '../../domain/entities/notifications';
import { rtl, scheduleDaily } from './expo';

const PRAYERS: Record<PrayerId, { name: string; body: string }> = {
  Fajr: { name: 'الفجر', body: '🕌 نداء الحق: صلاة الفجر تناديكم.. الصلاة خير من النوم' },
  Dhuhr: { name: 'الظهر', body: '🕌 حان الآن وقت اللقاء بخالقك.. نداء صلاة الظهر' },
  Asr: { name: 'العصر', body: '🕌 حافظوا على الصلوات والصلاة الوسطى.. نداء صلاة العصر' },
  Maghrib: { name: 'المغرب', body: '🕌 أقبلت نفحات المغرب.. نداء الصلاة' },
  Isha: { name: 'العشاء', body: '🕌 اختم يومك ساجداً لله.. نداء صلاة العشاء' },
};

/**
 * The five prayers. On Android with sound, the native AzanModule (exact alarm +
 * foreground service, survives Doze and reboot) plays the adhan; expo-notifications is
 * the fallback when that module is missing or refuses, and the path everywhere else.
 * Optionally a reminder some minutes before each prayer.
 */
export class PrayerScheduler implements ReminderScheduler {
  readonly ids = PRAYER_IDS.flatMap((p) => [`prayer-${p}`, `pre-prayer-${p}`]);

  private get azanModule(): any {
    return Platform.OS === 'android' ? NativeModules.AzanModule : undefined;
  }

  async schedule({ prefs, azan, timings }: ScheduleContext) {
    if (!prefs.prayers) return;
    const azanType = azan.type || 'full';
    const withSound = azanType !== 'none';

    for (const id of PRAYER_IDS) {
      const at = parseClock(timings[id]);
      if (!at) continue;
      const { name, body } = PRAYERS[id];
      try {
        const viaExpo = (fallback: boolean) => scheduleDaily({
          id: `prayer-${id}`, at, channel: withSound ? 'azan' : 'default',
          title: rtl(`صلاة ${name}`), body: rtl(body),
          sound: withSound ? 'azan.mp3' : true, priority: 'max', fullScreen: true,
          data: { prayerId: id, prayerName: name, type: 'prayer', fallback },
        });

        if (withSound && Platform.OS === 'android') {
          if (this.azanModule?.scheduleAzan) {
            try {
              await this.azanModule.scheduleAzan(id, name, at.hours, at.minutes, azanType);
            } catch (e) {
              console.error(`notifications: native azan failed for ${id}, using fallback`, e);
              await viaExpo(true);
            }
          } else {
            console.warn('notifications: AzanModule not linked, using expo-notifications');
            await viaExpo(true);
          }
        } else {
          await viaExpo(false);
        }

        if (prefs.prePrayerReminderEnabled) {
          const offset = prefs.prePrayerReminderOffset || 10;
          await scheduleDaily({
            id: `pre-prayer-${id}`, at: minusMinutes(at, offset), channel: 'default',
            title: rtl(`تنبيه: صلاة ${name}`), body: rtl(`⏰ بقيت ${offset} دقائق على صلاة ${name}.. توضأ واستعد`),
            sound: true, priority: 'high', data: { prayerName: name, type: 'reminder' },
          });
        }
      } catch (e) {
        console.error(`notifications: error scheduling ${id}`, e);
      }
    }
  }

  async cancelExtra() {
    const mod = this.azanModule;
    if (mod?.cancelAzan) PRAYER_IDS.forEach((id) => mod.cancelAzan(id));
  }
}

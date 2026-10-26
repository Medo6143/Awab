import { ReminderScheduler, ScheduleContext } from '../../domain/services/Notifications';
import { dailySlots, parseClock } from '../../domain/entities/notifications';
import { rtl, scheduleDaily } from './expo';

const SPIRITUAL_SOUND = 'sali_ala_nabii.mp3';

export class AthkarScheduler implements ReminderScheduler {
  readonly ids = ['athkar-morning', 'athkar-evening'];
  async schedule({ prefs }: ScheduleContext) {
    if (!prefs.athkar) return;
    try {
      await scheduleDaily({ id: 'athkar-morning', at: { hours: 7, minutes: 0 }, channel: 'default',
        title: rtl('أذكار الصباح'), body: rtl('📖 "ألا بذكر الله تطمئن القلوب".. حان وقت أذكار الصباح') });
      await scheduleDaily({ id: 'athkar-evening', at: { hours: 17, minutes: 0 }, channel: 'default',
        title: rtl('أذكار المساء'), body: rtl('🌙 حان وقت أذكار المساء.. حفظك الله في يومك وليلتك') });
    } catch (e) { console.warn('notifications: athkar failed', e); }
  }
}

export class SpiritualScheduler implements ReminderScheduler {
  readonly ids = ['spiritual-qiyam', 'spiritual-duha'];
  async schedule({ prefs }: ScheduleContext) {
    if (prefs.qiyam) {
      await scheduleDaily({ id: 'spiritual-qiyam', at: { hours: 2, minutes: 0 }, channel: 'spiritual', sound: SPIRITUAL_SOUND,
        title: rtl('رسالة من أوّاب: قيام الليل'), body: rtl('🌌 قيام الليل شرف المؤمن.. لا تنسَ نصيبك من صلاة الليل') })
        .catch((e) => console.error('notifications: qiyam failed', e));
    }
    if (prefs.duha) {
      await scheduleDaily({ id: 'spiritual-duha', at: { hours: 9, minutes: 0 }, channel: 'spiritual', sound: SPIRITUAL_SOUND,
        title: rtl('صلاة الضحى'), body: rtl('☀️ صلاة الأوابين.. ركعتي الضحى تجزئ عن صدقة كل سلامى من عظامك') })
        .catch((e) => console.error('notifications: duha failed', e));
    }
  }
}

export class DailyWardScheduler implements ReminderScheduler {
  readonly ids = ['spiritual-ward'];
  async schedule({ prefs }: ScheduleContext) {
    const at = prefs.dailyWardEnabled ? parseClock(prefs.dailyWardTime) : null;
    if (!at) return;
    await scheduleDaily({ id: 'spiritual-ward', at, channel: 'spiritual', sound: SPIRITUAL_SOUND, data: { type: 'ward' },
      title: rtl('موعد الورد اليومي'),
      body: rtl('📖 "وَتَرَىٰ كُلَّ أُمَّةٍ جَاثِيَةً كُلُّ أُمَّةٍ تُدْعَىٰ إِلَىٰ كِتَابِهَا".. حان الآن موعد وردك اليومي نورا لقلبك') })
      .catch((e) => console.error('notifications: daily ward failed', e));
  }
}

const ENCOURAGEMENT = [
  { title: 'صلِّ على النبي ﷺ', body: 'اللهم صل وسلم وبارك على نبينا محمد.. لا تنس الصلاة عليه في هذه اللحظة ❤️' },
  { title: 'رسالة تشجيع', body: 'جدد نيتك.. "ما تقرب إلي عبدي بشيء أحب إلي مما افترضته عليه".. تقبل الله طاعتك' },
  { title: 'سبحان الله وبحمده', body: '"كلمتان خفيفتان على اللسان، ثقيلتان في الميزان".. سبحان الله وبحمده، سبحان الله العظيم' },
  { title: 'استغفر الله', body: 'طهر لسانك وقلبك بالاستغفار.. أستغفر الله العظيم وأتوب إليه' },
  { title: 'بشرى لك', body: '"من قال سبحان الله وبحمده في يوم مائة مرة حطت خطاياه وإن كانت مثل زبد البحر"' },
  { title: 'تذكير بالهدف', body: 'طريق الجنة يبدأ بخطوة.. اجعل خطواتك اليوم كلها لله' },
  { title: 'لا حول ولا قوة إلا بالله', body: 'كنز من كنوز الجنة.. لا حول ولا قوة إلا بالله العلي العظيم' },
];
const ENCOURAGEMENT_COUNT = 10;

/** Ten encouragement messages a day, `encouragementInterval` hours apart from 08:00. */
export class EncouragementScheduler implements ReminderScheduler {
  readonly ids = Array.from({ length: ENCOURAGEMENT_COUNT }, (_, i) => `encouragement-${i}`);
  async schedule({ prefs }: ScheduleContext) {
    if (!prefs.encouragementEnabled) return;
    try {
      const slots = dailySlots(ENCOURAGEMENT_COUNT, 8, prefs.encouragementInterval || 3);
      for (let i = 0; i < slots.length; i++) {
        const msg = ENCOURAGEMENT[i % ENCOURAGEMENT.length];
        await scheduleDaily({ id: `encouragement-${i}`, at: slots[i], channel: 'spiritual', sound: SPIRITUAL_SOUND,
          priority: 'high', data: { type: 'encouragement' }, title: rtl(msg.title), body: rtl(msg.body) });
      }
    } catch (e) { console.warn('notifications: encouragement failed', e); }
  }
}

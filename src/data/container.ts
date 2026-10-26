/**
 * Composition root: the only place that picks concrete classes. Presentation receives
 * these through DependencyProvider and sees only the domain interfaces.
 */
import { quranApi, tafsirApi } from './api/clients';
import { QuranApiRepository, QuranComTafsirRepository } from './repositories/QuranApiRepository';
import { NativeFloatingSebha } from './services/NativeFloatingSebha';
import { ExpoNotificationCenter } from './notifications/ExpoNotificationCenter';
import { PrayerScheduler } from './notifications/PrayerScheduler';
import { AthkarScheduler, DailyWardScheduler, EncouragementScheduler, SpiritualScheduler } from './notifications/ReminderSchedulers';
import { QuranRepository, TafsirRepository } from '../domain/repositories/QuranRepository';
import { FloatingSebha } from '../domain/services/FloatingSebha';
import { NotificationCenter } from '../domain/services/Notifications';

export type AppDependencies = {
  quran: QuranRepository;
  tafsir: TafsirRepository;
  floatingSebha: FloatingSebha;
  notifications: NotificationCenter;
};

export const createDependencies = (): AppDependencies => ({
  quran: new QuranApiRepository(quranApi),
  tafsir: new QuranComTafsirRepository(tafsirApi),
  floatingSebha: new NativeFloatingSebha(),
  // a new reminder kind is one more scheduler here; the center itself does not change
  notifications: new ExpoNotificationCenter([
    new PrayerScheduler(),
    new AthkarScheduler(),
    new SpiritualScheduler(),
    new DailyWardScheduler(),
    new EncouragementScheduler(),
  ]),
});

/** The app's single set of dependencies (also used outside React, e.g. at startup). */
export const appDependencies = createDependencies();

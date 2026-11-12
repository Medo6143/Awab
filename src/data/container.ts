/**
 * Composition root: the only place that picks concrete classes. Presentation receives
 * these through DependencyProvider and sees only the domain interfaces.
 */
import { hadithApi, quranApi, tafsirApi } from './api/clients';
import { HadeethEncRepository } from './repositories/HadeethEncRepository';
import { HadithRepository } from '../domain/entities/hadith';
import { QuranApiRepository, QuranComTafsirRepository } from './repositories/QuranApiRepository';
import { NativeFloatingSebha } from './services/NativeFloatingSebha';
import { NativePrayerWidget } from './services/NativePrayerWidget';
import { NativeAzanAlarms } from './services/NativeAzanAlarms';
import { ExpoNotificationCenter } from './notifications/ExpoNotificationCenter';
import { PrayerScheduler } from './notifications/PrayerScheduler';
import { CustomReminderScheduler } from './notifications/CustomReminderScheduler';
import { AthkarScheduler, DailyWardScheduler, EncouragementScheduler, SpiritualScheduler } from './notifications/ReminderSchedulers';
import { QuranRepository, TafsirRepository } from '../domain/repositories/QuranRepository';
import { FloatingSebha } from '../domain/services/FloatingSebha';
import { NotificationCenter } from '../domain/services/Notifications';
import { PrayerWidget } from '../domain/services/PrayerWidget';
import { AzanAlarms } from '../domain/services/AzanAlarms';
import { LocationProvider } from '../domain/services/Location';
import { MosqueFinder } from '../domain/services/Mosques';
import { ExpoLocationProvider } from './services/LocationService';
import { OsmMosqueFinder } from './services/MosqueService';
import { AzanSound, QuranPlayer } from '../domain/services/Audio';
import { ExpoAudioPlayer } from './services/AudioService';
import { PrayerTimesSource } from '../domain/services/PrayerTimes';
import { AladhanPrayerTimes } from './services/PrayerTimeService';
import { AyahVideoMaker } from '../domain/services/AyahVideo';
import { NativeAyahVideo } from './services/NativeAyahVideo';
import { PrayerChecks } from '../domain/services/PrayerChecks';
import { NativePrayerChecks } from './services/NativePrayerChecks';
import { PrayerCheckScheduler } from './notifications/PrayerCheckScheduler';

export type AppDependencies = {
  quran: QuranRepository;
  tafsir: TafsirRepository;
  hadith: HadithRepository;
  floatingSebha: FloatingSebha;
  notifications: NotificationCenter;
  prayerWidget: PrayerWidget;
  azanAlarms: AzanAlarms;
  location: LocationProvider;
  mosques: MosqueFinder;
  quranPlayer: QuranPlayer;
  azanSound: AzanSound;
  prayerTimes: PrayerTimesSource;
  ayahVideo: AyahVideoMaker;
  prayerChecks: PrayerChecks;
};

export const createDependencies = (): AppDependencies => {
  // one player for both: recitation and the in-app adhan share the same expo-av sound
  const audio = new ExpoAudioPlayer();
  const prayerChecks = new NativePrayerChecks();
  return {
    quran: new QuranApiRepository(quranApi),
    tafsir: new QuranComTafsirRepository(tafsirApi),
    hadith: new HadeethEncRepository(hadithApi),
    floatingSebha: new NativeFloatingSebha(),
    prayerWidget: new NativePrayerWidget(),
    azanAlarms: new NativeAzanAlarms(),
    location: new ExpoLocationProvider(),
    mosques: new OsmMosqueFinder(),
    quranPlayer: audio,
    azanSound: audio,
    prayerTimes: new AladhanPrayerTimes(),
    ayahVideo: new NativeAyahVideo(),
    prayerChecks,
    // a new reminder kind is one more scheduler here; the center itself does not change
    notifications: new ExpoNotificationCenter([
      new PrayerScheduler(),
      new AthkarScheduler(),
      new SpiritualScheduler(),
      new DailyWardScheduler(),
      new EncouragementScheduler(),
      new CustomReminderScheduler(),
      new PrayerCheckScheduler(prayerChecks),
    ]),
  };
};

/** The app's single set of dependencies (also used outside React, e.g. at startup). */
export const appDependencies = createDependencies();

/**
 * Composition root: the only place that picks concrete classes. Presentation receives
 * these through DependencyProvider and sees only the domain interfaces.
 */
import { hadithApi, quranApi, tafsirApi } from './api/clients';
import { HadeethEncRepository } from './repositories/HadeethEncRepository';
import { HadithRepository } from '../domain/repositories/HadithRepository';
import { HadithLibrary } from '../domain/repositories/HadithLibrary';
import { QuranIndex } from '../domain/repositories/QuranIndex';
import { BundledHadithLibrary } from './repositories/BundledHadithLibrary';
import { BundledQuranIndex } from './repositories/BundledQuranIndex';
import { QuranApiRepository, QuranComTafsirRepository } from './repositories/QuranApiRepository';
import { NativeFloatingSebha } from './services/NativeFloatingSebha';
import { NativePrayerWidget } from './services/NativePrayerWidget';
import { NativeAzanAlarms } from './services/NativeAzanAlarms';
import { NativeReminderAlarms } from './services/NativeReminderAlarms';
import { AndroidMicrophone, CtcRecitationRecognizer, OnnxSpeechModel, QuranCdnWordAudio } from './services/TasmeeServices';
import { Microphone, RecitationRecognizer, SpeechModel, WordAudio } from '../domain/services/Tasmee';
import { ExpoNotificationCenter } from './notifications/ExpoNotificationCenter';
import { ExpoIncomingNotifications } from './notifications/ExpoIncomingNotifications';
import { IncomingNotifications } from '../domain/services/IncomingNotifications';
import { PrayerScheduler } from './notifications/PrayerScheduler';
import { CustomReminderScheduler } from './notifications/CustomReminderScheduler';
import { AthkarScheduler, DailyWardScheduler, EncouragementScheduler, SpiritualScheduler } from './notifications/ReminderSchedulers';
import { QuranRepository, TafsirRepository } from '../domain/repositories/QuranRepository';
import { FloatingSebha } from '../domain/services/FloatingSebha';
import { NotificationCenter } from '../domain/services/Notifications';
import { PrayerWidget } from '../domain/services/PrayerWidget';
import { AzanAlarms } from '../domain/services/AzanAlarms';
import { ReminderAlarms } from '../domain/services/ReminderAlarms';
import { LocationProvider } from '../domain/services/Location';
import { ExpoLocationProvider } from './services/LocationService';
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
  hadithLibrary: HadithLibrary;
  quranIndex: QuranIndex;
  floatingSebha: FloatingSebha;
  notifications: NotificationCenter;
  incomingNotifications: IncomingNotifications;
  prayerWidget: PrayerWidget;
  azanAlarms: AzanAlarms;
  reminderAlarms: ReminderAlarms;
  speechModel: SpeechModel;
  microphone: Microphone;
  recitation: RecitationRecognizer;
  wordAudio: WordAudio;
  location: LocationProvider;
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
    hadithLibrary: new BundledHadithLibrary(),
    quranIndex: new BundledQuranIndex(),
    floatingSebha: new NativeFloatingSebha(),
    prayerWidget: new NativePrayerWidget(),
    azanAlarms: new NativeAzanAlarms(),
    reminderAlarms: new NativeReminderAlarms(),
    incomingNotifications: new ExpoIncomingNotifications(),
    speechModel: new OnnxSpeechModel(),
    microphone: new AndroidMicrophone(),
    recitation: new CtcRecitationRecognizer(),
    wordAudio: new QuranCdnWordAudio(),
    location: new ExpoLocationProvider(),
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

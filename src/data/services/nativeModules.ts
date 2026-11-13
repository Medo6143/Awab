import { NativeModules, Platform } from 'react-native';
import type { FloatingSebhaConfig, FloatingSebhaDiagnostics } from '../../domain/services/FloatingSebha';

/**
 * Shapes of the app's own Android native modules (see native/android). Every method is
 * optional because older builds may lack it; callers check before calling.
 */
export interface AzanNativeModule {
  scheduleAzan?(id: string, name: string, hours: number, minutes: number, type: string): Promise<void>;
  cancelAzan?(id: string): void;
  getPendingAzan?(): Promise<string | null>;
  /** ms into the adhan the native service is playing, or -1. */
  getAzanPositionMs?(): Promise<number>;
  stopAzan?(): void;
  /** Moves the ringing alarm's notification from heads-up to the shade. */
  quietNotification?(): void;
  releaseLockScreen?(): void;
  didBootRescheduleFail?(): Promise<boolean>;
  clearBootRescheduleFailedFlag?(): void;
  /** Android 12+: whether exact alarms are allowed; true below that. */
  canScheduleExactAlarms?(): Promise<boolean>;
  /** Opens the «المنبهات والتذكيرات» page for this app. */
  openAlarmSettings?(): void;
  scheduleReminder?(json: string): Promise<void>;
  cancelAllReminders?(): Promise<void>;
  snoozeReminder?(json: string, minutes: number): Promise<void>;
  getRingingReminder?(): Promise<string | null>;
  previewReminderSound?(sound: string): void;
}

/**
 * AyahVideoModule (native/android/java/video): builds the ayah MP4. `spec` is JSON:
 * { video, shade, overlay, pages: [{ image, words: [{ x, y, w, h, ayah, weight }] }], audios: [], out },
 * with plain file paths and boxes in pixels of the 1080×1920 frame.
 */
export interface AyahVideoNativeModule {
  encode?(spec: string): Promise<{ durationMs: number }>;
}

/** PrayerCheckModule (native/android/java/prayercheck): «صليت؟» after each adhan. */
export interface PrayerCheckNativeModule {
  schedule?(json: string): Promise<void>;
  cancelAll?(): Promise<void>;
  setDoneToday?(prayerIds: string[]): void;
  /** Shows the «صليت؟» card once (JSON: title, body, prayedLabel, laterLabel); false if not allowed. */
  preview?(json: string): Promise<boolean>;
  takeAnswers?(): Promise<{ prayerId: string; day: string }[]>;
}

export interface FloatingBubbleNativeModule {
  initialize?(): Promise<void>;
  checkPermission?(): Promise<boolean>;
  requestPermission?(): Promise<void>;
  showFloatingBubble?(x: number, y: number): Promise<void>;
  hideFloatingBubble?(): Promise<void>;
  isBubbleVisible?(): Promise<FloatingSebhaDiagnostics | null>;
  config?(config: FloatingSebhaConfig): void;
  updateTasbeehCount?(count: number): void;
  updateTasbeehLabel?(label: string): void;
  showDhikrReminder?(label: string): void;
  getSavedTasbeehCount?(): Promise<number>;
}

const androidOnly = <T>(name: string): T | undefined =>
  Platform.OS === 'android' ? (NativeModules[name] as T | undefined) : undefined;

export const azanNative = () => androidOnly<AzanNativeModule>('AzanModule');
export const ayahVideoNative = () => androidOnly<AyahVideoNativeModule>('AyahVideo');
export const prayerCheckNative = () => androidOnly<PrayerCheckNativeModule>('PrayerCheck');
export const floatingBubbleNative = () => androidOnly<FloatingBubbleNativeModule>('RNFloatingBubble');

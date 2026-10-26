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
  didBootRescheduleFail?(): Promise<boolean>;
  clearBootRescheduleFailedFlag?(): void;
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
export const floatingBubbleNative = () => androidOnly<FloatingBubbleNativeModule>('RNFloatingBubble');

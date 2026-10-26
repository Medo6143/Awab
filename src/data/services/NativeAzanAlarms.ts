import { DeviceEventEmitter } from 'react-native';
import { azanNative } from './nativeModules';
import { AzanAlarms } from '../../domain/services/AzanAlarms';

/** AzanAlarms backed by the AzanModule native module (Android); inert elsewhere. */
export class NativeAzanAlarms implements AzanAlarms {
  private get mod() {
    return azanNative();
  }

  async getPending() {
    try { return (await this.mod?.getPendingAzan?.()) ?? null; } catch { return null; }
  }

  async didBootRescheduleFail() {
    try { return !!(await this.mod?.didBootRescheduleFail?.()); } catch { return false; }
  }

  clearBootRescheduleFailed() {
    try { this.mod?.clearBootRescheduleFailedFlag?.(); } catch {}
  }

  onTriggered(listener: (prayerName: string) => void) {
    const sub = DeviceEventEmitter.addListener('onAzanTriggered', (e: { prayerName?: string }) => listener(e?.prayerName || 'الصلاة'));
    return () => sub.remove();
  }
}

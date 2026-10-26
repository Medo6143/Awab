import { NativeModules, Platform } from 'react-native';
import { PrayerWidget } from '../../domain/services/PrayerWidget';

/** Android widget via the PrayerWidget native module; a no-op where it does not exist. */
export class NativePrayerWidget implements PrayerWidget {
  update(data: { prayerName: string; prayerTime: string; targetTimeMillis: number }) {
    const mod = Platform.OS === 'android' ? NativeModules.PrayerWidget : undefined;
    try { mod?.updateWidgetData?.(data); } catch (e) { console.warn('PrayerWidget.update failed', e); }
  }
}

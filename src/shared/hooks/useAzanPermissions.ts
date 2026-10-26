import { NativeModules, Platform } from 'react-native';
import { appDependencies } from '../../data/container';

const { notifications } = appDependencies;

const { AzanModule, OemBatteryModule } = NativeModules;

export type ReadinessStatus = 'ok' | 'missing' | 'unknown';
export type ReadinessItem = {
  id: 'notifications' | 'exactAlarm' | 'fullScreen' | 'battery' | 'oem' | 'module';
  label: string;
  hint: string;
  status: ReadinessStatus;
  fix?: () => void | Promise<unknown>;
};

const OEM_VENDORS = ['xiaomi', 'huawei', 'honor', 'oppo', 'vivo', 'samsung', 'realme', 'oneplus'];

/**
 * Everything the adhan needs to actually fire on this phone, as a checklist.
 * Each item knows how to open the matching system page. No alert chains.
 */
export function useAzanPermissions() {
  const checkExactAlarmPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try { return await AzanModule.canScheduleExactAlarms(); } catch { return false; }
  };

  const checkBatteryOptimization = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try { return await OemBatteryModule.isIgnoringBatteryOptimizations(); } catch { return false; }
  };

  const checkOverlayPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try { return await AzanModule.checkOverlayPermission(); } catch { return false; }
  };

  const checkFullScreenIntent = async (): Promise<boolean> => {
    if (Platform.OS !== 'android' || !AzanModule?.canUseFullScreenIntent) return true;
    try { return await AzanModule.canUseFullScreenIntent(); } catch { return true; }
  };

  const getReadiness = async (): Promise<ReadinessItem[]> => {
    if (Platform.OS !== 'android') return [];
    if (!AzanModule?.scheduleAzan) {
      return [{
        id: 'module', label: 'وحدة الأذان غير موجودة', status: 'missing',
        hint: 'هذه النسخة بُنيت بدون الكود الأصلي للأذان. أعد بناء التطبيق.',
      }];
    }

    const [notif, exact, fsi, battery] = await Promise.all([
      notifications.status(),
      checkExactAlarmPermission(),
      checkFullScreenIntent(),
      checkBatteryOptimization(),
    ]);

    const items: ReadinessItem[] = [
      { id: 'notifications', label: 'الإشعارات', hint: 'يظهر إشعار الأذان مع زر الإيقاف', status: notif ? 'ok' : 'missing', fix: () => notifications.request() },
      { id: 'exactAlarm', label: 'المنبهات الدقيقة', hint: 'يرن الأذان في الدقيقة نفسها', status: exact ? 'ok' : 'missing', fix: () => AzanModule.openAlarmSettings() },
      { id: 'fullScreen', label: 'شاشة الأذان فوق القفل', hint: 'أندرويد ١٤ وما بعده يطلب هذا الإذن', status: fsi ? 'ok' : 'missing', fix: () => AzanModule.openFullScreenIntentSettings?.() },
      { id: 'battery', label: 'استثناء من توفير البطارية', hint: 'حتى لا يُقتل المنبه أثناء النوم', status: battery ? 'ok' : 'missing', fix: () => OemBatteryModule.requestIgnoreBatteryOptimizations() },
    ];

    try {
      const manufacturer: string = await OemBatteryModule.getManufacturer();
      if (OEM_VENDORS.includes(manufacturer)) {
        items.push({
          id: 'oem', label: `إعدادات ${manufacturer} الإضافية`, status: 'unknown',
          hint: 'فعّل "التشغيل التلقائي" و"بدون قيود" للتطبيق من إعدادات الجهاز',
          fix: () => OemBatteryModule.openOemBatterySettings?.(),
        });
      }
    } catch {}

    return items;
  };

  const scheduleAzanSafely = async (prayerId: string, prayerName: string, hour: number, minute: number, type: 'full' | 'short' = 'full'): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;
    try { await AzanModule.scheduleAzan(prayerId, prayerName, hour, minute, type); return true; } catch { return false; }
  };

  /** Schedules a test adhan n seconds from now. Resolves false when the exact-alarm permission is missing. */
  const testAzanAfterDelay = async (delaySeconds: number = 30): Promise<boolean> => {
    if (Platform.OS !== 'android' || !AzanModule?.testAzan) return false;
    try { await AzanModule.testAzan(delaySeconds); return true; } catch { return false; }
  };

  return { checkExactAlarmPermission, checkBatteryOptimization, checkOverlayPermission, checkFullScreenIntent, getReadiness, scheduleAzanSafely, testAzanAfterDelay };
}

import { NativeModules, Platform } from 'react-native';
import { appDependencies } from '../../data/container';

const { notifications } = appDependencies;

const { AzanModule, OemBatteryModule } = NativeModules;

export type ReadinessStatus = 'ok' | 'missing' | 'unknown';
export type ReadinessItem = {
  id: 'notifications' | 'exactAlarm' | 'fullScreen' | 'battery' | 'overlay' | 'oem' | 'module' | 'miuiLock' | 'miuiBackground' | 'oemLock';
  label: string;
  hint: string;
  status: ReadinessStatus;
  fix?: () => void | Promise<unknown>;
};

const OEM_VENDORS = ['xiaomi', 'huawei', 'honor', 'oppo', 'vivo', 'samsung', 'realme', 'oneplus'];

/**
 * Makers whose systems add their own "show on lock screen" switch on top of Android's.
 * Xiaomi is checked precisely (MIUI app-ops); these can only be pointed to.
 */
const LOCK_SCREEN_HINTS: Record<string, string> = {
  oppo: 'من إعدادات التطبيق ← الأذونات: فعّل "عرض على شاشة القفل" و"النوافذ العائمة"',
  realme: 'من إعدادات التطبيق ← الأذونات: فعّل "عرض على شاشة القفل" و"النوافذ العائمة"',
  oneplus: 'من إعدادات التطبيق ← الأذونات: فعّل "عرض على شاشة القفل" و"النوافذ العائمة"',
  vivo: 'فعّل "عرض على شاشة القفل" و"النوافذ المنبثقة في الخلفية"',
  huawei: 'من إعدادات التطبيق: فعّل "عرض على شاشة القفل" و"الإشعارات المنبثقة"',
  honor: 'من إعدادات التطبيق: فعّل "عرض على شاشة القفل" و"الإشعارات المنبثقة"',
};

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

    const [notif, exact, fsi, battery, overlay] = await Promise.all([
      notifications.status(),
      checkExactAlarmPermission(),
      checkFullScreenIntent(),
      checkBatteryOptimization(),
      checkOverlayPermission(),
    ]);

    const items: ReadinessItem[] = [
      { id: 'notifications', label: 'الإشعارات', hint: 'يظهر إشعار الأذان مع زر الإيقاف', status: notif ? 'ok' : 'missing', fix: () => notifications.request() },
      { id: 'exactAlarm', label: 'المنبهات الدقيقة', hint: 'يرن الأذان في الدقيقة نفسها', status: exact ? 'ok' : 'missing', fix: () => AzanModule.openAlarmSettings() },
      { id: 'fullScreen', label: 'شاشة الأذان فوق القفل', hint: 'أندرويد ١٤ وما بعده يطلب هذا الإذن', status: fsi ? 'ok' : 'missing', fix: () => AzanModule.openFullScreenIntentSettings?.() },
      { id: 'battery', label: 'استثناء من توفير البطارية', hint: 'حتى لا يُقتل المنبه أثناء النوم', status: battery ? 'ok' : 'missing', fix: () => OemBatteryModule.requestIgnoreBatteryOptimizations() },
      // any phone: an app allowed to draw over others may open its screen from the background
      { id: 'overlay', label: 'الظهور فوق التطبيقات', hint: 'لتفتح شاشة الأذان تلقائيًا والتطبيق مغلق', status: overlay ? 'ok' : 'missing', fix: () => AzanModule.requestOverlayPermission?.() },
    ];

    // Xiaomi/Redmi/POCO: MIUI blocks the adhan screen over the lock screen without these two
    try {
      const miui: { showWhenLocked: ReadinessStatus; backgroundStart: ReadinessStatus } | null =
        await OemBatteryModule.getMiuiLockScreenStatus?.();
      if (miui) {
        const openMiui = () => OemBatteryModule.openLockScreenPermissions?.();
        items.push(
          { id: 'miuiLock', label: 'الظهور على شاشة القفل', hint: 'من "أذونات أخرى": "عرض على شاشة القفل" لتظهر شاشة الأذان والهاتف مقفول', status: miui.showWhenLocked, fix: openMiui },
          { id: 'miuiBackground', label: 'فتح النوافذ من الخلفية', hint: 'من "أذونات أخرى": "فتح نوافذ جديدة أثناء العمل في الخلفية"', status: miui.backgroundStart, fix: openMiui },
        );
      }
    } catch {}

    // other makers with their own lock-screen switches: not readable, so a guided link
    try {
      const manufacturer: string = await OemBatteryModule.getManufacturer();
      const hint = LOCK_SCREEN_HINTS[manufacturer];
      if (hint) {
        items.push({ id: 'oemLock', label: 'الظهور على شاشة القفل', status: 'unknown', hint, fix: () => OemBatteryModule.openLockScreenPermissions?.() });
      }
    } catch {}

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

  return { checkExactAlarmPermission, checkBatteryOptimization, checkOverlayPermission, checkFullScreenIntent, getReadiness, scheduleAzanSafely };
}

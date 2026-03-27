import { NativeModules, Platform, Alert } from 'react-native';

const { AzanModule, OemBatteryModule } = NativeModules;

export function useAzanPermissions() {
  /**
   * Check if EXACT ALARMS are allowed (Android 12+)
   */
  const checkExactAlarmPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      return await AzanModule.canScheduleExactAlarms();
    } catch (e) {
      console.error('Failed to check exact alarm permission', e);
      return false;
    }
  };

  /**
   * Check if battery optimizations are ignored
   */
  const checkBatteryOptimization = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      return await OemBatteryModule.isIgnoringBatteryOptimizations();
    } catch (e) {
      console.error('Failed to check battery optimization', e);
      return false;
    }
  };

  /**
   * Check if floating overlay is allowed (optional but recommended for lock screen)
   */
  const checkOverlayPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      return await AzanModule.checkOverlayPermission();
    } catch (e) {
      console.error('Failed to check overlay permission', e);
      return false;
    }
  };

  /**
   * Run the full setup process.
   * Guides the user through:
   * 1. Exact Alarm (Android 12+)
   * 2. Battery Optimization
   * 3. OEM Battery Killers (Xiaomi/Huawei)
   */
  const requestAllPermissions = async () => {
    if (Platform.OS !== 'android') return true;

    // 1. Exact Alarms
    const hasExactAlarm = await checkExactAlarmPermission();
    if (!hasExactAlarm) {
      Alert.alert(
        'إذن مجدول الصلاة',
        'نحتاج إذن "المنبهات المجدولة" لضمان عمل الأذان في وقته بالضبط.',
        [
          { text: 'إلغاء', style: 'cancel' },
          { text: 'موافق', onPress: () => AzanModule.openAlarmSettings() }
        ]
      );
      return false; // Stop here, requires user context switch
    }

    // 2. Battery Optimization
    const hasBatteryOpt = await checkBatteryOptimization();
    if (!hasBatteryOpt) {
      Alert.alert(
        'تحسين البطارية',
        'يجب استثناء التطبيق من "تحسين البطارية" حتى يعمل الأذان عندما تكون الشاشة مغلقة.',
        [
          { text: 'إلغاء', style: 'cancel' },
          { text: 'موافق', onPress: () => OemBatteryModule.requestIgnoreBatteryOptimizations() }
        ]
      );
      return false;
    }

    // 3. OEM AutoStart (Xiaomi, Huawei, etc)
    const manufacturer = await OemBatteryModule.getManufacturer();
    const needsOemSettings = ['xiaomi', 'huawei', 'honor', 'oppo', 'vivo', 'samsung'].includes(manufacturer);
    
    if (needsOemSettings) {
      Alert.alert(
        'إعدادات الجهاز الإضافية',
        'في أجهزة ' + manufacturer + '، يجب تفعيل عمل التطبيق في الخلفية يدوياً لضمان موثوقية الأذان.',
        [
          { text: 'تخطي', style: 'cancel' },
          { text: 'الذهاب للإعدادت', onPress: () => OemBatteryModule.openOemBatterySettings() }
        ]
      );
    } else {
      Alert.alert('ممتاز!', 'تم تجهيز هاتفك بنجاح لضمان دقة مواعيد الأذان.');
    }

    return true;
  };

  // ──────────────────────────────────────────────────────────────
  // Wrapper for scheduleAzan with Permission Guard
  // ──────────────────────────────────────────────────────────────
  const scheduleAzanSafely = async (
    prayerId: string,
    prayerName: string,
    hour: number,
    minute: number,
    type: 'full' | 'short' = 'full'
  ): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;

    try {
      await AzanModule.scheduleAzan(prayerId, prayerName, hour, minute, type);
      return true;
    } catch (e: any) {
      if (e?.code === 'PERMISSION_DENIED') {
        Alert.alert(
          'خطأ',
          'لا يمكن جدولة الأذان بدون إذن "المنبهات المجدولة". يرجى السماح به من الإعدادات.',
          [
            { text: 'إلغاء', style: 'cancel' },
            { text: 'الإعدادات', onPress: () => AzanModule.openAlarmSettings() }
          ]
        );
      }
      return false;
    }
  };

  /**
   * Schedule a test Azan n seconds from now.
   */
  const testAzanAfterDelay = async (delaySeconds: number = 5): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;

    try {
      await AzanModule.testAzan(delaySeconds);
      return true;
    } catch (e: any) {
      if (e?.code === 'PERMISSION_DENIED') {
        Alert.alert(
          'خطأ',
          'لا يمكن تجربة الأذان بدون إذن "المنبهات المجدولة".',
          [
            { text: 'إلغاء', style: 'cancel' },
            { text: 'الإعدادات', onPress: () => AzanModule.openAlarmSettings() }
          ]
        );
      }
      return false;
    }
  };

  return {
    checkExactAlarmPermission,
    checkBatteryOptimization,
    checkOverlayPermission,
    requestAllPermissions,
    scheduleAzanSafely,
    testAzanAfterDelay,
  };
}

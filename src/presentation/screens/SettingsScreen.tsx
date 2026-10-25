import React from 'react';
import { Text, TouchableOpacity, View, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, BookOpen, MapPin, Info, ChevronLeft } from 'lucide-react-native';
import { RootState } from '../store';
import {
  toggleNotifications, toggleLocation, setTafsirId, setTafsirStyle, setTafsirFontSize,
  setAccentTheme, setReciterId, toggleNotificationCategory, setAzanSettings,
  setPrePrayerReminderOffset, setDailyWardTime, setEncouragementInterval,
} from '../store/slices/settingsSlice';
import { setFloatingScale, setFloatingBubbleColor, toggleFloatingBorder, toggleFloatingReset, setFloatingReminderInterval } from '../store/slices/tasbeehSlice';
import { useAzanPermissions } from '../../shared/hooks/useAzanPermissions';
import { colors, icon } from '../../shared/theme/tokens';

import { Screen, ScreenHeader } from '../components/ui';
import {
  SettingSection, ItemRow, ThemeSelector, ReciterSelector, TafsirSettings,
  NotificationSettings, AzanSelector, FloatingTasbeehSettings, showPermissionAlert,
} from '../components/settings/SettingsComponents';
import { AzanReadinessCard } from '../components/settings/AzanReadinessCard';
import { s } from '../components/settings/SettingsStyles';
import { FloatingTasbeehToggle } from '../components/tasbeeh/FloatingTasbeeh';
import { NotificationService } from '../../data/services/NotificationService';

const SettingsScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { testAzanAfterDelay } = useAzanPermissions();
  const {
    notificationsEnabled, locationEnabled, selectedTafsirId, tafsirStyle, tafsirFontSize,
    accentTheme, selectedReciterId, notificationPrefs, azanSettings: rawAzanSettings,
  } = useSelector((state: RootState) => state.settings);
  const { floatingScale, floatingBubbleColor, floatingShowBorder, floatingShowReset, floatingReminderInterval } = useSelector((state: RootState) => state.tasbeeh);
  const azanSettings = rawAzanSettings || { type: 'full', visualAzanEnabled: true };

  const onToggleCategory = (id: any) => {
    if (typeof id === 'object' && id.id === 'prePrayerReminderOffset') dispatch(setPrePrayerReminderOffset(id.value));
    else if (typeof id === 'object' && id.id === 'dailyWardTime') dispatch(setDailyWardTime(id.value));
    else if (typeof id === 'object' && id.id === 'encouragementInterval') dispatch(setEncouragementInterval(id.value));
    else dispatch(toggleNotificationCategory(id));
  };

  const testAzan = async () => {
    const hasPerm = await NotificationService.requestPermissions();
    if (!hasPerm) { showPermissionAlert(); return; }
    const ok = await testAzanAfterDelay(30);
    Alert.alert(
      ok ? 'بدأت التجربة' : 'تعذّر بدء التجربة',
      ok ? 'سيرفع الأذان بعد ٣٠ ثانية. اقفل الشاشة أو اخرج من التطبيق لتجربة التنبيه الحقيقي.' : 'راجع قائمة "جاهزية الأذان" وأصلح الأذونات الناقصة ثم أعد المحاولة.',
    );
  };

  return (
    <Screen scroll contentStyle={s.content} header={<ScreenHeader title="الإعدادات" subtitle="تخصيص تجربة أوّاب" large onBack={navigation?.canGoBack?.() ? () => navigation.goBack() : undefined} />}>
      <SettingSection title="التنبيهات">
        <ItemRow first icon={Bell} label="التنبيهات العامة" value={notificationsEnabled} isToggle onValueChange={() => dispatch(toggleNotifications())} />
        {notificationsEnabled && <NotificationSettings notificationPrefs={notificationPrefs} onToggleCategory={onToggleCategory} />}
        <ItemRow icon={BookOpen} label="موعد الورد اليومي" value={notificationPrefs?.dailyWardEnabled} isToggle onValueChange={() => dispatch(toggleNotificationCategory('dailyWardEnabled' as any))} />
      </SettingSection>

      <SettingSection title="الأذان">
        <AzanSelector azanSettings={azanSettings} onUpdate={(update: any) => dispatch(setAzanSettings(update))} onTest={testAzan} />
        <ItemRow icon={MapPin} label="مواقيت الصلاة حسب الموقع" value={locationEnabled} isToggle onValueChange={() => dispatch(toggleLocation())} />
      </SettingSection>
      <View style={{ marginTop: 12 }}><AzanReadinessCard /></View>

      <SettingSection title="المسبحة العائمة">
        <View style={{ padding: 4 }}><FloatingTasbeehToggle accentTheme={accentTheme} /></View>
        <FloatingTasbeehSettings
          floatingScale={floatingScale} onUpdateScale={(v: number) => dispatch(setFloatingScale(v))}
          floatingBubbleColor={floatingBubbleColor} onUpdateColor={(c: string) => dispatch(setFloatingBubbleColor(c))}
          floatingShowBorder={floatingShowBorder} onToggleBorder={() => dispatch(toggleFloatingBorder())}
          floatingShowReset={floatingShowReset} onToggleReset={() => dispatch(toggleFloatingReset())}
          floatingReminderInterval={floatingReminderInterval} onUpdateInterval={(m: number) => dispatch(setFloatingReminderInterval(m))}
        />
      </SettingSection>

      <SettingSection title="المظهر">
        <ThemeSelector accentTheme={accentTheme} onSelect={(id: any) => dispatch(setAccentTheme(id))} />
      </SettingSection>

      <SettingSection title="التلاوة">
        <ReciterSelector selectedReciterId={selectedReciterId} onSelect={(id: string) => dispatch(setReciterId(id))} />
      </SettingSection>

      <SettingSection title="المصحف والتفسير">
        <TafsirSettings
          selectedTafsirId={selectedTafsirId} onSelectTafsir={(id: number) => dispatch(setTafsirId(id))}
          tafsirStyle={tafsirStyle} onSelectStyle={(style: any) => dispatch(setTafsirStyle(style))}
          tafsirFontSize={tafsirFontSize} setFontSize={(size: number) => dispatch(setTafsirFontSize(size))}
        />
      </SettingSection>

      <TouchableOpacity style={s.aboutBtn} accessibilityRole="button" onPress={() => Alert.alert('أوّاب', 'تطبيق رفيق المسلم اليومي: مواقيت الصلاة والأذان، المصحف، الأذكار، المسبحة، ورحلة ختم القرآن.')}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Info size={icon.size.md} color={colors.gold} strokeWidth={icon.stroke} />
          <Text style={s.aboutText}>عن التطبيق</Text>
        </View>
        <ChevronLeft size={icon.size.sm} color={colors.textFaint} strokeWidth={icon.stroke} />
      </TouchableOpacity>

      <View style={s.credit}>
        <Text style={s.creditText}>Developed with ❤️ by</Text>
        <Text style={s.creditName}>Mohamed Wael</Text>
      </View>
    </Screen>
  );
};

export default SettingsScreen;

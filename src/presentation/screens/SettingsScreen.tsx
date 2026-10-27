import React from 'react';
import { Text, TouchableOpacity, View, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, MapPin, Info, ChevronLeft, Vibrate, Target } from 'lucide-react-native';
import { ScreenProps } from '../navigation/types';
import { DEFAULT_AZAN_SETTINGS, DEFAULT_NOTIFICATION_PREFS } from '../../domain/entities/notifications';
import { RootState } from '../store';
import {
  toggleNotifications, toggleLocation, setTafsirId, setTafsirStyle, setTafsirFontSize,
  setAccentTheme, setReciterId, toggleNotificationCategory, setAzanSettings,
  setDailyWardTime, setEncouragementInterval, toggleTasbeehHaptics, toggleTasbeehTargetAlert,
} from '../store/slices/settingsSlice';
import { setFloatingScale, setFloatingBubbleColor, toggleFloatingBorder, toggleFloatingReset, setFloatingReminderInterval } from '../store/slices/tasbeehSlice';
import { colors, icon } from '../../shared/theme/tokens';

import { Screen, ScreenHeader } from '../components/ui';
import {
  SettingSection, ItemRow, ThemeSelector, ReciterSelector, TafsirSettings,
  NotificationSettings, AzanSelector, FloatingTasbeehSettings,
} from '../components/settings/SettingsComponents';
import { AzanReadinessCard } from '../components/settings/AzanReadinessCard';
import { s } from '../components/settings/SettingsStyles';
import { FloatingTasbeehToggle } from '../components/tasbeeh/FloatingTasbeeh';

const SettingsScreen = ({ navigation }: Pick<ScreenProps, 'navigation'>) => {
  const dispatch = useDispatch();
  const {
    notificationsEnabled, locationEnabled, selectedTafsirId, tafsirStyle, tafsirFontSize,
    accentTheme, selectedReciterId, notificationPrefs, azanSettings: rawAzanSettings,
    tasbeehHaptics = true, tasbeehTargetAlert = true,
  } = useSelector((state: RootState) => state.settings);
  const { floatingScale, floatingBubbleColor, floatingShowBorder, floatingShowReset, floatingReminderInterval } = useSelector((state: RootState) => state.tasbeeh);
  // persisted state from older versions may lack newer keys
  const azanSettings = { ...DEFAULT_AZAN_SETTINGS, ...rawAzanSettings };
  const prefs = { ...DEFAULT_NOTIFICATION_PREFS, ...notificationPrefs };

  return (
    <Screen scroll contentStyle={s.content} header={<ScreenHeader title="الإعدادات" subtitle="تخصيص تجربة أوّاب" large onBack={navigation?.canGoBack?.() ? () => navigation.goBack() : undefined} />}>
      <SettingSection title="التنبيهات">
        <ItemRow first icon={Bell} label="التنبيهات العامة" value={notificationsEnabled} onValueChange={() => dispatch(toggleNotifications())} />
        {notificationsEnabled && (
          <NotificationSettings
            notificationPrefs={prefs}
            onToggle={(key) => dispatch(toggleNotificationCategory(key))}
            onWardTime={(time) => dispatch(setDailyWardTime(time))}
            onEncouragementInterval={(h) => dispatch(setEncouragementInterval(h))}
          />
        )}
      </SettingSection>

      <SettingSection title="الأذان">
        <AzanSelector azanSettings={azanSettings} onUpdate={(update) => dispatch(setAzanSettings(update))} />
        <ItemRow icon={MapPin} label="مواقيت الصلاة حسب الموقع" value={locationEnabled} onValueChange={() => dispatch(toggleLocation())} />
      </SettingSection>
      <View style={{ marginTop: 12 }}><AzanReadinessCard /></View>

      <SettingSection title="المسبحة">
        <ItemRow first icon={Vibrate} label="اهتزاز مع كل تسبيحة" sub="في المسبحة والمسبحة العائمة" value={tasbeehHaptics} onValueChange={() => dispatch(toggleTasbeehHaptics())} />
        <ItemRow icon={Target} label="تنبيه عند إتمام العدد" sub="اهتزاز مميز عند الوصول للهدف" value={tasbeehTargetAlert} onValueChange={() => dispatch(toggleTasbeehTargetAlert())} />
      </SettingSection>

      <SettingSection title="المسبحة العائمة">
        <View style={{ padding: 4 }}><FloatingTasbeehToggle /></View>
        <FloatingTasbeehSettings
          floatingScale={floatingScale} onUpdateScale={(v: number) => dispatch(setFloatingScale(v))}
          floatingBubbleColor={floatingBubbleColor} onUpdateColor={(c: string) => dispatch(setFloatingBubbleColor(c))}
          floatingShowBorder={floatingShowBorder} onToggleBorder={() => dispatch(toggleFloatingBorder())}
          floatingShowReset={floatingShowReset} onToggleReset={() => dispatch(toggleFloatingReset())}
          floatingReminderInterval={floatingReminderInterval} onUpdateInterval={(m: number) => dispatch(setFloatingReminderInterval(m))}
        />
      </SettingSection>

      <SettingSection title="المظهر">
        <ThemeSelector accentTheme={accentTheme} onSelect={(id) => dispatch(setAccentTheme(id))} />
      </SettingSection>

      <SettingSection title="التلاوة">
        <ReciterSelector selectedReciterId={selectedReciterId} onSelect={(id: string) => dispatch(setReciterId(id))} />
      </SettingSection>

      <SettingSection title="المصحف والتفسير">
        <TafsirSettings
          selectedTafsirId={selectedTafsirId} onSelectTafsir={(id: number) => dispatch(setTafsirId(id))}
          tafsirStyle={tafsirStyle} onSelectStyle={(style) => dispatch(setTafsirStyle(style))}
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

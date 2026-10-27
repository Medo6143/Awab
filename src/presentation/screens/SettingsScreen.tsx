import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, MapPin, Info, ChevronLeft, Vibrate, Target, ShieldCheck } from 'lucide-react-native';
import { ScreenProps } from '../navigation/types';
import { DEFAULT_AZAN_SETTINGS, DEFAULT_NOTIFICATION_PREFS } from '../../domain/entities/notifications';
import { RootState } from '../store';
import {
  toggleNotifications, toggleLocation, setTafsirId, setTafsirStyle, setTafsirFontSize,
  setAccentTheme, setReciterId, toggleNotificationCategory, setAzanSettings,
  setDailyWardTime, setEncouragementInterval, toggleTasbeehHaptics, setAsrMethod, toggleTasbeehTargetAlert,
} from '../store/slices/settingsSlice';
import { setFloatingScale, setFloatingBubbleColor, toggleFloatingBorder, toggleFloatingReset, setFloatingReminderInterval } from '../store/slices/tasbeehSlice';
import { colors, icon } from '../../shared/theme/tokens';

import { IconTile, Screen, ScreenHeader } from '../components/ui';
import {
  SettingSection, ItemRow, ThemeSelector, ReciterSelector, TafsirSettings,
  NotificationSettings, AzanSelector, FloatingTasbeehSettings, AsrMethodSelector,
} from '../components/settings/SettingsComponents';
import { AzanReadinessCard } from '../components/settings/AzanReadinessCard';
import { s } from '../components/settings/SettingsStyles';
import { FloatingTasbeehToggle } from '../components/tasbeeh/FloatingTasbeeh';

const SettingsScreen = ({ navigation }: Pick<ScreenProps, 'navigation'>) => {
  const dispatch = useDispatch();
  const {
    notificationsEnabled, locationEnabled, selectedTafsirId, tafsirStyle, tafsirFontSize,
    accentTheme, selectedReciterId, notificationPrefs, azanSettings: rawAzanSettings,
    tasbeehHaptics = true, tasbeehTargetAlert = true, asrMethod = 'auto',
  } = useSelector((state: RootState) => state.settings);
  const { floatingScale, floatingBubbleColor, floatingShowBorder, floatingShowReset, floatingReminderInterval } = useSelector((state: RootState) => state.tasbeeh);
  // persisted state from older versions may lack newer keys
  const azanSettings = { ...DEFAULT_AZAN_SETTINGS, ...rawAzanSettings };
  const prefs = { ...DEFAULT_NOTIFICATION_PREFS, ...notificationPrefs };

  return (
    <Screen scroll contentStyle={s.content} header={<ScreenHeader title="الإعدادات" subtitle="تخصيص تجربة أوّاب" large onBack={navigation?.canGoBack?.() ? () => navigation.goBack() : undefined} />}>
      <SettingSection title="الصلاة والأذان">
        <AzanSelector azanSettings={azanSettings} onUpdate={(update) => dispatch(setAzanSettings(update))} />
        <ItemRow icon={MapPin} label="مواقيت الصلاة حسب الموقع" value={locationEnabled} onValueChange={() => dispatch(toggleLocation())} />
        <AsrMethodSelector value={asrMethod} onSelect={(v) => dispatch(setAsrMethod(v))} />
      </SettingSection>
      <View style={{ marginTop: 12 }}><AzanReadinessCard /></View>

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

      <SettingSection title="المصحف والتفسير">
        <TafsirSettings
          selectedTafsirId={selectedTafsirId} onSelectTafsir={(id: number) => dispatch(setTafsirId(id))}
          tafsirStyle={tafsirStyle} onSelectStyle={(style) => dispatch(setTafsirStyle(style))}
          tafsirFontSize={tafsirFontSize} setFontSize={(size: number) => dispatch(setTafsirFontSize(size))}
        />
        <ReciterSelector selectedReciterId={selectedReciterId} onSelect={(id: string) => dispatch(setReciterId(id))} />
      </SettingSection>

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

      <SettingSection title="حول التطبيق">
        <NavRow first icon={ShieldCheck} label="الخصوصية" sub="ما يُحفظ، وما يُرسل، والأذونات" onPress={() => navigation.navigate('الخصوصية')} />
        <NavRow icon={Info} label="عن أوّاب" sub="المميزات والمصادر والإصدار" onPress={() => navigation.navigate('عن_التطبيق')} />
      </SettingSection>
    </Screen>
  );
};

/** A row that opens another page. */
const NavRow = ({ icon: Icon, label, sub, onPress, first }: { icon: typeof Info; label: string; sub?: string; onPress: () => void; first?: boolean }) => (
  <View>
    {!first ? <View style={s.itemDivider} /> : null}
    <TouchableOpacity style={s.itemRow} onPress={onPress} accessibilityRole="button" activeOpacity={0.7}>
      <View style={s.itemLeft}>
        <IconTile icon={Icon} />
        <View style={{ flex: 1 }}>
          <Text style={s.itemLabel}>{label}</Text>
          {sub ? <Text style={s.itemSub}>{sub}</Text> : null}
        </View>
      </View>
      <ChevronLeft size={icon.size.sm} color={colors.textFaint} strokeWidth={icon.stroke} />
    </TouchableOpacity>
  </View>
);

export default SettingsScreen;

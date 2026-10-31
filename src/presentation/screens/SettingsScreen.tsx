import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  Bell, MapPin, Info, ChevronLeft, Vibrate, Target, ShieldCheck, Megaphone, BookOpen, CircleDot, Palette, AlarmClock,
} from 'lucide-react-native';
import { StackActions } from '@react-navigation/native';
import { ScreenProps } from '../navigation/types';
import { DEFAULT_AZAN_SETTINGS, DEFAULT_NOTIFICATION_PREFS } from '../../domain/entities/notifications';
import { RootState } from '../store';
import {
  toggleNotifications, toggleLocation, setTafsirId, setTafsirStyle, setTafsirFontSize,
  setAccentTheme, setTheme, setReciterId, toggleNotificationCategory, setAzanSettings,
  setDailyWardTime, setEncouragementInterval, toggleTasbeehHaptics, setAsrMethod, toggleTasbeehTargetAlert, setPrayerMethod,
} from '../store/slices/settingsSlice';
import { setFloatingScale, setFloatingBubbleColor, toggleFloatingBorder, toggleFloatingReset, setFloatingReminderInterval } from '../store/slices/tasbeehSlice';
import { RECITER_MAP } from '../../data/services/AudioService';
import { methodName } from '../../domain/entities/prayerMethods';
import { AZAN_TYPES } from '../components/settings/AzanConstants';
import { colors, icon, radius, space, type, themed } from '../../shared/theme/tokens';
import { toAr } from '../../shared/utils/format';

import { IconTile, Screen, ScreenHeader } from '../components/ui';
import {
  SettingSection, ItemRow, ThemeModeSelector, ThemeSelector, ReciterSelector, TafsirSettings,
  NotificationSettings, AzanSelector, FloatingTasbeehSettings, AsrMethodSelector, PrayerMethodSelector,
} from '../components/settings/SettingsComponents';
import { AzanReadinessCard } from '../components/settings/AzanReadinessCard';
import { s } from '../components/settings/SettingsStyles';
import { FloatingTasbeehToggle } from '../components/tasbeeh/FloatingTasbeeh';

import type { SettingsSection as Section } from '../navigation/types';

const SECTIONS: { id: Section; title: string; icon: typeof Info }[] = [
  { id: 'prayer', title: 'الصلاة والأذان', icon: Megaphone },
  { id: 'alerts', title: 'التنبيهات والتذكيرات', icon: Bell },
  { id: 'quran', title: 'المصحف والتفسير', icon: BookOpen },
  { id: 'tasbeeh', title: 'المسبحة والعائمة', icon: CircleDot },
  { id: 'look', title: 'المظهر', icon: Palette },
];

/**
 * Settings as a hub: a summary of the important state on top, then one row per section,
 * each opening its own page (the same screen with `section`), so no page is a long scroll.
 */
const SettingsScreen = ({ navigation, route }: Pick<ScreenProps<'الإعدادات'>, 'navigation' | 'route'>) => {
  const section = route?.params?.section;
  const back = navigation?.canGoBack?.() ? () => navigation.goBack() : undefined;
  if (section) {
    const meta = SECTIONS.find((x) => x.id === section)!;
    return (
      <Screen scroll contentStyle={s.content} header={<ScreenHeader title={meta.title} onBack={back} />}>
        <SectionBody section={section} navigation={navigation} />
      </Screen>
    );
  }
  return (
    <Screen scroll contentStyle={s.content} header={<ScreenHeader title="الإعدادات" subtitle="تخصيص تجربة أوّاب" large onBack={back} />}>
      <Summary />
      <View style={[s.sectionContent, { marginTop: space[5] }]}>
        {SECTIONS.map((x, i) => (
          <SectionRow key={x.id} first={i === 0} section={x} onPress={() => navigation.dispatch(StackActions.push('الإعدادات', { section: x.id }))} />
        ))}
      </View>
      <View style={[s.sectionContent, { marginTop: space[4] }]}>
        <NavRow first icon={ShieldCheck} label="الخصوصية" sub="ما يُحفظ، وما يُرسل، والأذونات" onPress={() => navigation.navigate('الخصوصية')} />
        <NavRow icon={Info} label="عن أوّاب" sub="المميزات والمصادر والإصدار" onPress={() => navigation.navigate('عن_التطبيق')} />
      </View>
    </Screen>
  );
};

/** A hub row with one line of that section's current state. */
const SectionRow = ({ section, first, onPress }: { section: (typeof SECTIONS)[number]; first: boolean; onPress: () => void }) => (
  <NavRow first={first} icon={section.icon} label={section.title} sub={useSectionHint(section.id)} onPress={onPress} />
);

const useSectionHint = (id: Section) => {
  const st8 = useSelector((st: RootState) => st.settings);
  const tasbeeh = useSelector((st: RootState) => st.tasbeeh);
  const reminders = useSelector((st: RootState) => st.reminders?.list ?? []);
  const azan = { ...DEFAULT_AZAN_SETTINGS, ...st8.azanSettings };
  switch (id) {
    case 'prayer': return AZAN_TYPES.find((t) => t.id === azan.type)?.name ?? '';
    case 'alerts': return `${st8.notificationsEnabled ? 'الإشعارات شغالة' : 'الإشعارات متوقفة'} · ${toAr(reminders.filter((r) => r.enabled).length)} تذكير`;
    case 'quran': return `القارئ: ${RECITER_MAP[st8.selectedReciterId]?.name ?? ''}`;
    case 'tasbeeh': return tasbeeh.floatingReminderInterval ? `تذكير كل ${toAr(tasbeeh.floatingReminderInterval)} دقايق` : 'الاهتزاز والهدف والعائمة';
    case 'look': return `${st8.theme === 'light' ? 'فاتح' : st8.theme === 'system' ? 'حسب الموبايل' : 'داكن'} · ${st8.accentTheme === 'emerald' ? 'زمردي' : st8.accentTheme === 'midnight' ? 'ليلي' : 'ذهبي'}`;
  }
};

/** The few things worth seeing at a glance: azan, alerts, reminders. */
const Summary = () => {
  const { azanSettings, notificationsEnabled } = useSelector((st: RootState) => st.settings);
  const azan = { ...DEFAULT_AZAN_SETTINGS, ...azanSettings };
  const reminders = useSelector((st: RootState) => st.reminders?.list ?? []);
  const items = [
    { label: 'الأذان', value: AZAN_TYPES.find((t) => t.id === azan.type)?.name ?? '' },
    { label: 'الإشعارات', value: notificationsEnabled ? 'شغالة' : 'متوقفة' },
    { label: 'تذكيراتي', value: toAr(reminders.filter((r) => r.enabled).length) },
  ];
  return (
    <View style={st.summary}>
      {items.map((x) => (
        <View key={x.label} style={st.summaryItem}>
          <Text style={st.summaryValue} numberOfLines={1}>{x.value}</Text>
          <Text style={st.summaryLabel}>{x.label}</Text>
        </View>
      ))}
    </View>
  );
};

const SectionBody = ({ section, navigation }: { section: Section; navigation: ScreenProps['navigation'] }) => {
  const dispatch = useDispatch();
  const {
    notificationsEnabled, locationEnabled, selectedTafsirId, tafsirStyle, tafsirFontSize,
    theme, accentTheme, selectedReciterId, notificationPrefs, azanSettings: rawAzanSettings,
    tasbeehHaptics = true, tasbeehTargetAlert = true, asrMethod = 'auto', prayerMethod = 'auto',
  } = useSelector((state: RootState) => state.settings);
  // the method today's times were actually fetched with
  const usedMethod = useSelector((state: RootState) => state.prayer.cachedData?.meta?.method?.id);
  const { floatingScale, floatingBubbleColor, floatingShowBorder, floatingShowReset, floatingReminderInterval } = useSelector((state: RootState) => state.tasbeeh);
  const reminders = useSelector((state: RootState) => state.reminders?.list ?? []);
  // persisted state from older versions may lack newer keys
  const azanSettings = { ...DEFAULT_AZAN_SETTINGS, ...rawAzanSettings };
  const prefs = { ...DEFAULT_NOTIFICATION_PREFS, ...notificationPrefs };

  switch (section) {
    case 'prayer':
      return (
        <>
          <SettingSection title="الأذان">
            <AzanSelector azanSettings={azanSettings} onUpdate={(update) => dispatch(setAzanSettings(update))} />
            <ItemRow icon={MapPin} label="مواقيت الصلاة حسب الموقع" value={locationEnabled} onValueChange={() => dispatch(toggleLocation())} />
            <PrayerMethodSelector value={prayerMethod} auto={usedMethod != null ? methodName(usedMethod) : 'هتظهر بعد تحديد موقعك'} onSelect={(v) => dispatch(setPrayerMethod(v))} />
            <AsrMethodSelector value={asrMethod} onSelect={(v) => dispatch(setAsrMethod(v))} />
          </SettingSection>
          <View style={{ marginTop: 12 }}><AzanReadinessCard /></View>
        </>
      );
    case 'alerts':
      return (
        <>
          <View style={[s.sectionContent, { marginTop: space[4] }]}>
            <NavRow first icon={AlarmClock} label="تذكيراتي" sub={`${toAr(reminders.length)} تذكير · قيام، قرآن، أو أي عبادة`} onPress={() => navigation.navigate('التذكيرات')} />
          </View>
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
        </>
      );
    case 'quran':
      return (
        <SettingSection title="المصحف والتفسير">
          <TafsirSettings
            selectedTafsirId={selectedTafsirId} onSelectTafsir={(id: number) => dispatch(setTafsirId(id))}
            tafsirStyle={tafsirStyle} onSelectStyle={(style) => dispatch(setTafsirStyle(style))}
            tafsirFontSize={tafsirFontSize} setFontSize={(size: number) => dispatch(setTafsirFontSize(size))}
          />
          <ReciterSelector selectedReciterId={selectedReciterId} onSelect={(id: string) => dispatch(setReciterId(id))} />
        </SettingSection>
      );
    case 'tasbeeh':
      return (
        <>
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
        </>
      );
    case 'look':
      return (
        <SettingSection title="لون التطبيق">
          <ThemeModeSelector value={theme ?? 'dark'} onSelect={(m) => dispatch(setTheme(m))} />
          <ThemeSelector accentTheme={accentTheme} onSelect={(id) => dispatch(setAccentTheme(id))} />
        </SettingSection>
      );
  }
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
          {sub ? <Text style={s.itemSub} numberOfLines={1}>{sub}</Text> : null}
        </View>
      </View>
      <ChevronLeft size={icon.size.sm} color={colors.textFaint} strokeWidth={icon.stroke} />
    </TouchableOpacity>
  </View>
);

const st = themed(() => ({
  summary: { flexDirection: 'row', gap: space[2], marginTop: space[2] },
  summaryItem: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.tile, paddingVertical: space[3], paddingHorizontal: space[2], alignItems: 'center' },
  summaryValue: { fontFamily: 'Tajawal_700Bold', fontSize: 15, color: colors.goldText },
  summaryLabel: { ...type.caption, color: colors.textMuted, marginTop: 2 },
}));

export default SettingsScreen;

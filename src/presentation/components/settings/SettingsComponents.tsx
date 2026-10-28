import { PRAYER_METHODS } from '../../../domain/entities/prayerMethods';
import React from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import {
  LucideIcon, Minus, Plus, Check, Palette, UserRound, BookOpen, Layers, Type as TypeIcon,
  BellRing, Clock3, Timer, Volume2, Maximize2, Square, RotateCcw, Hourglass, Moon, Sun, Star, Sparkles, HeartHandshake, Landmark,
} from 'lucide-react-native';
import { s } from './SettingsStyles';
import { TAFSIR_LIST, STYLES_LIST, THEME_LIST } from './SettingsConstants';
import { RECITER_MAP } from '../../../data/services/AudioService';
import { Chip, IconTile, SectionTitle } from '../ui';
import { colors, icon } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';
import { toAr } from '../../../shared/utils/format';
import { AccentKey } from '../../../shared/theme/tokens';
import { AzanSettings, NotificationPrefs } from '../../../domain/entities/notifications';
import { AsrMethod, TafsirStyle } from '../../store/slices/settingsSlice';
import { AZAN_TYPES } from './AzanConstants';

export const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={s.section}>
    <SectionTitle title={title} />
    <View style={s.sectionContent}>{children}</View>
  </View>
);

type RowProps = { icon: LucideIcon; label: string; sub?: string; value: boolean; onValueChange: () => void; first?: boolean };

/** A labelled on/off row. */
export const ItemRow = ({ icon: Icon, label, sub, value, onValueChange, first }: RowProps) => {
  const accent = useAccent();
  return (
    <View>
      {!first ? <View style={s.itemDivider} /> : null}
      <View style={s.itemRow}>
        <View style={s.itemLeft}>
          <IconTile icon={Icon} />
          <View style={{ flex: 1 }}>
            <Text style={s.itemLabel}>{label}</Text>
            {sub ? <Text style={s.itemSub}>{sub}</Text> : null}
          </View>
        </View>
        <Switch value={value} onValueChange={onValueChange} trackColor={{ false: colors.surfaceRaised, true: accent.accent }} thumbColor={colors.text} />
      </View>
    </View>
  );
};

const SubLabel = ({ icon: Icon, text }: { icon: LucideIcon; text: string }) => {
  const accent = useAccent();
  return (
    <View style={s.labelRow}>
      <Icon size={icon.size.sm} color={accent.accent} strokeWidth={icon.stroke} />
      <Text style={s.subLabel}>{text}</Text>
    </View>
  );
};

export const Stepper = ({ value, display, onDec, onInc }: { value: number; display: string; onDec: () => void; onInc: () => void }) => (
  <View style={s.stepper}>
    <TouchableOpacity style={s.stepBtn} onPress={onDec} accessibilityLabel="تقليل"><Minus size={icon.size.md} color={colors.text} strokeWidth={icon.stroke} /></TouchableOpacity>
    <View style={s.stepValue}><Text style={s.stepValueText}>{display}</Text></View>
    <TouchableOpacity style={s.stepBtn} onPress={onInc} accessibilityLabel="زيادة"><Plus size={icon.size.md} color={colors.text} strokeWidth={icon.stroke} /></TouchableOpacity>
  </View>
);

export const ThemeSelector = ({ accentTheme, onSelect }: { accentTheme: AccentKey; onSelect: (id: AccentKey) => void }) => (
  <View style={[s.subSection, { borderTopWidth: 0 }]}>
    <SubLabel icon={Palette} text="لون التمييز" />
    <View style={s.themeGrid}>
      {THEME_LIST.map((t) => {
        const active = accentTheme === t.id;
        return (
          <TouchableOpacity key={t.id} style={[s.themeBtn, active && { backgroundColor: colors.goldSoft }]} onPress={() => onSelect(t.id)} accessibilityRole="radio" accessibilityState={{ selected: active }}>
            <View style={[s.colorCircle, { backgroundColor: t.color }]}>{active ? <Check size={16} color="#fff" style={{ margin: 6 }} /> : null}</View>
            <Text style={[s.themeBtnText, active && { color: colors.text }]}>{t.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

export const ReciterSelector = ({ selectedReciterId, onSelect }: { selectedReciterId: string; onSelect: (id: string) => void }) => {
  const accent = useAccent();
  return (
    <View style={s.subSection}>
      <SubLabel icon={UserRound} text="القارئ المفضل" />
      <View style={s.reciterGrid}>
        {Object.entries(RECITER_MAP).map(([id, r]) => {
          const active = selectedReciterId === id;
          return (
            <TouchableOpacity key={id} style={[s.reciterBtn, active && { backgroundColor: accent.accentSoft }]} onPress={() => onSelect(id)} accessibilityRole="radio" accessibilityState={{ selected: active }}>
              {active ? <Check size={icon.size.md} color={accent.accentText} strokeWidth={icon.stroke} /> : <View style={{ width: icon.size.md }} />}
              <Text style={[s.reciterBtnText, active && { color: accent.accentText, fontFamily: 'Tajawal_700Bold' }]}>{r.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const ASR_METHODS: { id: AsrMethod; name: string }[] = [
  { id: 'auto', name: 'تلقائي' },
  { id: 'shafii', name: 'الجمهور' },
  { id: 'hanafi', name: 'الحنفي' },
];

/** How Asr is timed: by country (Hanafi in Pakistan/India/Bangladesh/Afghanistan), majority, or Hanafi. */
/** The calculation method: automatic by country, or one picked from the official ones. */
export const PrayerMethodSelector = ({ value, auto, onSelect }: { value: 'auto' | number; auto: string; onSelect: (v: 'auto' | number) => void }) => (
  <View style={s.subSection}>
    <SubLabel icon={Clock3} text="طريقة حساب المواقيت" />
    <View style={s.chipsWrap}>
      <Chip label="تلقائي حسب بلدك" size="sm" selected={value === 'auto'} onPress={() => onSelect('auto')} />
      {PRAYER_METHODS.map((m) => <Chip key={m.id} label={m.name} size="sm" selected={value === m.id} onPress={() => onSelect(m.id)} />)}
    </View>
    <Text style={[s.itemSub, { marginTop: 8 }]}>
      {value === 'auto' ? `التلقائي بيستخدم الطريقة الرسمية في بلدك: ${auto}.` : 'غيّرها لو مواقيت مسجدك مختلفة.'}
    </Text>
  </View>
);

export const AsrMethodSelector = ({ value, onSelect }: { value: AsrMethod; onSelect: (v: AsrMethod) => void }) => (
  <View style={s.subSection}>
    <SubLabel icon={Clock3} text="حساب وقت العصر" />
    <View style={s.row}>
      {ASR_METHODS.map((o) => <Chip key={o.id} label={o.name} size="sm" selected={value === o.id} onPress={() => onSelect(o.id)} style={{ flex: 1, justifyContent: 'center' }} />)}
    </View>
    <Text style={[s.itemSub, { marginTop: 8 }]}>
      الجمهور (الشافعي والمالكي والحنبلي) هو المعتمد في معظم الدول. التلقائي يختار الحنفي في باكستان والهند وبنغلاديش وأفغانستان فقط.
    </Text>
  </View>
);

type TafsirSettingsProps = {
  selectedTafsirId: number; onSelectTafsir: (id: number) => void;
  tafsirStyle: TafsirStyle; onSelectStyle: (style: TafsirStyle) => void;
  tafsirFontSize: number; setFontSize: (size: number) => void;
};

export const TafsirSettings = ({ selectedTafsirId, onSelectTafsir, tafsirStyle, onSelectStyle, tafsirFontSize, setFontSize }: TafsirSettingsProps) => (
  <>
    <View style={[s.subSection, { borderTopWidth: 0 }]}>
      <SubLabel icon={BookOpen} text="المفسّر" />
      <View style={s.chipsWrap}>
        {TAFSIR_LIST.map((t) => <Chip key={t.id} label={t.name} size="sm" selected={selectedTafsirId === t.id} onPress={() => onSelectTafsir(t.id)} />)}
      </View>
    </View>
    <View style={s.subSection}>
      <SubLabel icon={Layers} text="نمط العرض" />
      <View style={s.row}>
        {STYLES_LIST.map((item) => <Chip key={item.id} label={item.name} size="sm" selected={tafsirStyle === item.id} onPress={() => onSelectStyle(item.id)} style={{ flex: 1, justifyContent: 'center' }} />)}
      </View>
    </View>
    <View style={s.subSection}>
      <SubLabel icon={TypeIcon} text={`حجم خط التفسير (${toAr(tafsirFontSize)})`} />
      <View style={s.stepper}>
        <TouchableOpacity style={s.stepBtn} onPress={() => setFontSize(Math.max(12, tafsirFontSize - 2))} accessibilityLabel="تصغير الخط"><Minus size={icon.size.md} color={colors.text} strokeWidth={icon.stroke} /></TouchableOpacity>
        <View style={s.fontPreview}><Text style={[s.previewText, { fontSize: tafsirFontSize }]}>نص تجريبي للتفسير</Text></View>
        <TouchableOpacity style={s.stepBtn} onPress={() => setFontSize(Math.min(32, tafsirFontSize + 2))} accessibilityLabel="تكبير الخط"><Plus size={icon.size.md} color={colors.text} strokeWidth={icon.stroke} /></TouchableOpacity>
      </View>
    </View>
  </>
);

type ToggleKey = { [K in keyof NotificationPrefs]: NotificationPrefs[K] extends boolean ? K : never }[keyof NotificationPrefs];

const CATEGORY_ICONS: Partial<Record<ToggleKey, LucideIcon>> = {
  prayers: Landmark, athkar: Moon, qiyam: Star, duha: Sun, dailyWardEnabled: BookOpen,
  encouragementEnabled: HeartHandshake, prePrayerReminderEnabled: Timer, dailyReminder: Sparkles,
};

type NotificationSettingsProps = {
  notificationPrefs: NotificationPrefs;
  onToggle: (key: ToggleKey) => void;
  onWardTime: (time: string) => void;
  onEncouragementInterval: (hours: number) => void;
};

export const NotificationSettings = ({ notificationPrefs, onToggle, onWardTime, onEncouragementInterval }: NotificationSettingsProps) => {
  const categories: { id: ToggleKey; label: string; sub?: string }[] = [
    { id: 'prayers', label: 'مواقيت الصلاة' },
    { id: 'athkar', label: 'أذكار الصباح والمساء' },
    { id: 'qiyam', label: 'تنبيه قيام الليل' },
    { id: 'duha', label: 'تنبيه صلاة الضحى' },
    { id: 'dailyWardEnabled', label: 'موعد الورد اليومي' },
    { id: 'encouragementEnabled', label: 'رسائل تشجيعية', sub: 'بصوت الصلاة على النبي ﷺ' },
    { id: 'prePrayerReminderEnabled', label: 'تذكير ما قبل الصلاة' },
    { id: 'dailyReminder', label: 'تذكير يومي منوّع' },
  ];

  return (
    <View style={s.subSection}>
      <SubLabel icon={BellRing} text="تخصيص التنبيهات" />
      {categories.map((cat, i) => (
        <ItemRow key={cat.id} first={i === 0} icon={CATEGORY_ICONS[cat.id] ?? BellRing} label={cat.label} sub={cat.sub} value={notificationPrefs[cat.id]} onValueChange={() => onToggle(cat.id)} />
      ))}

      {notificationPrefs.dailyWardEnabled && (
        <View style={{ marginTop: 12 }}>
          <SubLabel icon={Clock3} text="توقيت الورد اليومي" />
          <View style={s.chipsWrap}>
            {['01:00', '05:00', '10:00', '16:00', '21:00', '23:00'].map((time) => (
              <Chip key={time} label={toAr(time)} size="sm" selected={notificationPrefs.dailyWardTime === time} onPress={() => onWardTime(time)} />
            ))}
          </View>
        </View>
      )}

      {notificationPrefs.encouragementEnabled && (
        <View style={{ marginTop: 12 }}>
          <SubLabel icon={Hourglass} text="تكرار رسائل التشجيع" />
          <View style={s.chipsWrap}>
            {[1, 2, 3, 4, 6, 8].map((h) => (
              <Chip key={h} label={`كل ${toAr(h)} ${h === 1 ? 'ساعة' : h === 2 ? 'ساعتين' : 'ساعات'}`} size="sm" selected={notificationPrefs.encouragementInterval === h} onPress={() => onEncouragementInterval(h)} />
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export const AzanSelector = ({ azanSettings, onUpdate }: { azanSettings: AzanSettings; onUpdate: (u: Partial<AzanSettings>) => void }) => {
  return (
    <View style={s.subSection}>
      <SubLabel icon={Volume2} text="صوت الأذان" />
      <View style={s.chipsWrap}>
        {AZAN_TYPES.map((t) => <Chip key={t.id} label={t.name} size="sm" selected={azanSettings.type === t.id} onPress={() => onUpdate({ type: t.id })} />)}
      </View>
    </View>
  );
};

export const FloatingTasbeehSettings = ({
  floatingScale, onUpdateScale, floatingBubbleColor, onUpdateColor,
  floatingShowBorder, onToggleBorder, floatingShowReset, onToggleReset,
  floatingReminderInterval, onUpdateInterval,
}: {
  floatingScale: number; onUpdateScale: (v: number) => void;
  floatingBubbleColor: string; onUpdateColor: (c: string) => void;
  floatingShowBorder: boolean; onToggleBorder: () => void;
  floatingShowReset: boolean; onToggleReset: () => void;
  floatingReminderInterval: number; onUpdateInterval: (m: number) => void;
}) => {
  const accent = useAccent();
  const safeScale = typeof floatingScale === 'number' ? floatingScale : 1.0;
  const COLORS = [
    { id: '#FFFFFF', name: 'أبيض' }, { id: '#000000', name: 'أسود' }, { id: '#FF9800', name: 'برتقالي' },
    { id: '#B8860B', name: 'ذهبي' }, { id: '#8B0000', name: 'أحمر داكن' }, { id: '#065f46', name: 'زمردي' }, { id: '#1e1b4b', name: 'ليلي' },
  ];

  return (
    <View style={s.subSection}>
      <SubLabel icon={Maximize2} text={`حجم السبحة (${toAr(Math.round(safeScale * 100))}٪)`} />
      <Stepper value={safeScale} display={`${toAr(safeScale.toFixed(1))}×`} onDec={() => onUpdateScale(Math.max(0.5, Number((safeScale - 0.1).toFixed(1))))} onInc={() => onUpdateScale(Math.min(2.0, Number((safeScale + 0.1).toFixed(1))))} />

      <View style={{ marginTop: 12 }}>
        <ItemRow first icon={Square} label="إظهار إطار للسبحة" value={!!floatingShowBorder} onValueChange={onToggleBorder} />
        <ItemRow icon={RotateCcw} label="إظهار زر التصفير" value={!!floatingShowReset} onValueChange={onToggleReset} />
      </View>

      <View style={{ marginTop: 16 }}>
        <SubLabel icon={Hourglass} text="تذكير تلقائي بالذكر" />
        <Stepper value={floatingReminderInterval} display={`كل ${toAr(floatingReminderInterval)} دقيقة`} onDec={() => onUpdateInterval(Math.max(1, floatingReminderInterval - 1))} onInc={() => onUpdateInterval(Math.min(60, floatingReminderInterval + 1))} />
      </View>

      <View style={{ marginTop: 16 }}>
        <SubLabel icon={Palette} text="لون السبحة العائمة" />
        <View style={s.swatchRow}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => onUpdateColor(c.id)}
              accessibilityLabel={c.name}
              accessibilityRole="radio"
              accessibilityState={{ selected: floatingBubbleColor === c.id }}
              style={[s.swatch, { backgroundColor: c.id }, floatingBubbleColor === c.id && { borderColor: accent.accentText }, (c.id === '#FFFFFF' || c.id === '#000000') && floatingBubbleColor !== c.id && { borderColor: colors.hairline, borderWidth: 1 }]}
            />
          ))}
        </View>
        <Text style={s.hint}>الحجم الافتراضي ١٫٠×، ويمكن التصغير حتى ٠٫٥× أو التكبير حتى ٢٫٠×.</Text>
      </View>
    </View>
  );
};


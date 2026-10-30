import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { EyeOff, Mic, Minus, Plus } from 'lucide-react-native';
import { Chip, PillButton, Sheet } from '../ui';
import { colors, icon, radius, space, type } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';
import { toAr } from '../../../shared/utils/format';
import { TasmeeHelp, minutesLabel } from './tasmeeText';

const pagesLabel = (n: number) => (n === 1 ? 'صفحة واحدة' : n === 2 ? 'صفحتين' : `${toAr(n)} ${n <= 10 ? 'صفحات' : 'صفحة'}`);

export type TasmeeStart = { fromPage: number; toPage: number; help: TasmeeHelp };

type Props = {
  visible: boolean;
  /** e.g. «تسميع سورة القمر» or «تسميع من المصحف» */
  title: string;
  fromPage: number;
  toPage: number;
  /** Bounds of the range: a surah's pages, or the whole mushaf. */
  minPage?: number;
  maxPage?: number;
  /** The open mushaf page, for «الصفحة دي». */
  currentPage?: number;
  /** A line under the title, e.g. «من آية ٣٠». */
  note?: string;
  onClose: () => void;
  onStart: (s: TasmeeStart) => void;
};

const HELP: { id: TasmeeHelp; label: string }[] = [
  { id: 'none', label: 'ولا حاجة' },
  { id: 'firstWord', label: 'أول كلمة' },
  { id: 'firstLetter', label: 'أول حرف' },
];

const MINUTES_PER_PAGE = 3;

/** Stepper for one end of the range; the number itself is the hero. */
const Bound = ({ label, value, onChange, min, max }: { label: string; value: number; onChange: (n: number) => void; min: number; max: number }) => {
  const accent = useAccent();
  const step = (d: number) => {
    const n = Math.min(max, Math.max(min, value + d));
    if (n !== value) { Haptics.selectionAsync(); onChange(n); }
  };
  return (
    <View style={st.bound}>
      <Text style={st.boundLabel}>{label}</Text>
      <View style={st.boundRow}>
        <TouchableOpacity onPress={() => step(-1)} onLongPress={() => step(-10)} style={st.stepBtn} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${label} أقل`}>
          <Minus size={icon.size.sm} color={colors.textSoft} strokeWidth={icon.stroke} />
        </TouchableOpacity>
        <Text style={[st.boundValue, { color: accent.accentText }]}>{toAr(value)}</Text>
        <TouchableOpacity onPress={() => step(1)} onLongPress={() => step(10)} style={st.stepBtn} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${label} أكتر`}>
          <Plus size={icon.size.sm} color={colors.textSoft} strokeWidth={icon.stroke} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * «هتسمّع إيه»: the range, how (self-check now, voice later) and how much help. Opens over
 * the screen it was started from (mushaf, heart), like the mockup.
 */
export const TasmeeSetupSheet = ({ visible, title, fromPage, toPage, minPage = 1, maxPage = 604, currentPage, note, onClose, onStart }: Props) => {
  const accent = useAccent();
  const [from, setFrom] = useState(fromPage);
  const [to, setTo] = useState(toPage);
  const [help, setHelp] = useState<TasmeeHelp>('none');
  const [voiceNote, setVoiceNote] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setFrom(fromPage); setTo(toPage); setVoiceNote(false);
  }, [visible, fromPage, toPage]);

  const count = to - from + 1;
  const preset = (f: number, t: number) => { Haptics.selectionAsync(); setFrom(Math.max(minPage, f)); setTo(Math.min(maxPage, t)); };
  const isRange = (f: number, t: number) => from === f && to === Math.min(maxPage, t);
  const whole = minPage > 1 || maxPage < 604;

  return (
    <Sheet visible={visible} title={title} onClose={onClose}>
      <Text style={st.meta}>{`${pagesLabel(count)} · حوالي ${minutesLabel(count * MINUTES_PER_PAGE, toAr)}${note ? ` · ${note}` : ''}`}</Text>

      <Text style={st.label}>الصفحات</Text>
      <View style={st.bounds}>
        <Bound label="من صفحة" value={from} min={minPage} max={to} onChange={setFrom} />
        <Bound label="لحد صفحة" value={to} min={from} max={maxPage} onChange={setTo} />
      </View>
      <View style={st.chips}>
        {currentPage ? <Chip size="sm" label="الصفحة دي" selected={isRange(currentPage, currentPage)} onPress={() => preset(currentPage, currentPage)} /> : null}
        <Chip size="sm" label="صفحتين" selected={count === 2} onPress={() => preset(from, from + 1)} />
        <Chip size="sm" label="ربع حزب" selected={count === 3 && !whole} onPress={() => preset(from, from + 2)} />
        {whole ? <Chip size="sm" label="السورة كلها" selected={isRange(minPage, maxPage)} onPress={() => preset(minPage, maxPage)} /> : null}
      </View>

      <Text style={st.label}>هتسمّع إزاي</Text>
      <View style={st.seg}>
        <TouchableOpacity style={st.segItem} onPress={() => { Haptics.selectionAsync(); setVoiceNote(true); }} accessibilityRole="button" accessibilityLabel="بصوتي، قريبًا">
          <Mic size={icon.size.sm} color={colors.textMuted} strokeWidth={icon.stroke} />
          <Text style={st.segText}>بصوتي</Text>
          <Text style={st.soon}>قريبًا</Text>
        </TouchableOpacity>
        <View style={[st.segItem, { backgroundColor: accent.accentSoft }]} accessibilityState={{ selected: true }}>
          <EyeOff size={icon.size.sm} color={accent.accentText} strokeWidth={icon.stroke} />
          <Text style={[st.segText, { color: accent.accentText }]}>بنفسي</Text>
        </View>
      </View>
      <Text style={st.note}>
        {voiceNote
          ? 'التسميع بالصوت والتصحيح التلقائي جايين في تحديث قريب، ومن غير إنترنت.'
          : 'الآيات هتتغطّى في الصفحة. قولها من حفظك، واكشفها آية آية، ودوس على أي كلمة غلطت فيها.'}
      </Text>

      <Text style={st.label}>مساعدة</Text>
      <View style={st.chips}>
        {HELP.map((h) => <Chip key={h.id} size="sm" label={h.label} selected={help === h.id} onPress={() => { Haptics.selectionAsync(); setHelp(h.id); }} />)}
      </View>

      <PillButton label="ابدأ التسميع" style={st.start} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onStart({ fromPage: from, toPage: to, help }); }} />
    </Sheet>
  );
};

const st = StyleSheet.create({
  meta: { ...type.caption, color: colors.textMuted },
  label: { ...type.label, color: colors.textMuted, marginTop: space[5], marginBottom: space[2] },
  bounds: { flexDirection: 'row', gap: space[2], marginBottom: space[2] },
  bound: { flex: 1, backgroundColor: colors.surfaceRaised, borderRadius: radius.tile, paddingVertical: space[3], paddingHorizontal: space[3] },
  boundLabel: { ...type.caption, color: colors.textMuted },
  boundRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space[1] },
  boundValue: { ...type.h1, fontFamily: 'Tajawal_800ExtraBold' },
  stepBtn: { width: 32, height: 32, borderRadius: radius.pill, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  seg: { flexDirection: 'row', backgroundColor: colors.surfaceRaised, borderRadius: radius.pill, padding: space[1], gap: space[1] },
  segItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[1], height: 40, borderRadius: radius.pill },
  segText: { ...type.label, color: colors.textMuted },
  soon: { ...type.caption, fontSize: 10, color: colors.textFaint },
  note: { ...type.caption, color: colors.textMuted, marginTop: space[2], lineHeight: 18 },
  start: { marginTop: space[6] },
});

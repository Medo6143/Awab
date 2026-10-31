import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { EyeOff, Mic, Minus, Plus } from 'lucide-react-native';
import { Chip, PillButton, Sheet } from '../ui';
import { colors, icon, radius, space, type } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';
import { toAr } from '../../../shared/utils/format';
import { MODEL_MB, downloadModel, modelPath } from '../../../data/services/RecitationListener';
import { TasmeeHelp, minutesLabel } from './tasmeeText';

const pagesLabel = (n: number) => (n === 1 ? 'صفحة واحدة' : n === 2 ? 'صفحتين' : `${toAr(n)} ${n <= 10 ? 'صفحات' : 'صفحة'}`);

export type TasmeeStart = { fromPage: number; toPage: number; help: TasmeeHelp; voice?: boolean; voiceMode?: 'correct' | 'mark' };

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

const VOICE_MODES: { id: 'mark' | 'correct'; label: string }[] = [
  { id: 'mark', label: 'علّم الغلط بس' },
  { id: 'correct', label: 'وقّفني وقولّي الكلمة' },
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
  const [voice, setVoice] = useState(false);
  const [voiceMode, setVoiceMode] = useState<'mark' | 'correct'>('mark');
  // the speech model is downloaded once, the first time «بصوتي» is chosen
  const [model, setModel] = useState<'checking' | 'missing' | 'downloading' | 'failed' | 'ready'>('checking');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) return;
    setFrom(fromPage); setTo(toPage);
    modelPath().then((p) => setModel((m) => (m === 'downloading' ? m : p ? 'ready' : 'missing')));
  }, [visible, fromPage, toPage]);

  const download = () => {
    Haptics.selectionAsync();
    setModel('downloading');
    setProgress(0);
    downloadModel(setProgress).then(() => setModel('ready'), () => setModel('failed'));
  };

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
        <TouchableOpacity
          style={[st.segItem, voice && { backgroundColor: accent.accentSoft }]}
          onPress={() => { Haptics.selectionAsync(); setVoice(true); }}
          accessibilityRole="button"
          accessibilityState={{ selected: voice }}
        >
          <Mic size={icon.size.sm} color={voice ? accent.accentText : colors.textMuted} strokeWidth={icon.stroke} />
          <Text style={[st.segText, voice && { color: accent.accentText }]}>بصوتي</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[st.segItem, !voice && { backgroundColor: accent.accentSoft }]}
          onPress={() => { Haptics.selectionAsync(); setVoice(false); }}
          accessibilityRole="button"
          accessibilityState={{ selected: !voice }}
        >
          <EyeOff size={icon.size.sm} color={!voice ? accent.accentText : colors.textMuted} strokeWidth={icon.stroke} />
          <Text style={[st.segText, !voice && { color: accent.accentText }]}>بنفسي</Text>
        </TouchableOpacity>
      </View>
      <Text style={st.note}>
        {!voice
          ? 'الآيات هتتغطّى في الصفحة. قولها من حفظك، واكشفها آية آية، ودوس على أي كلمة غلطت فيها.'
          : model === 'ready'
            ? voiceMode === 'mark'
              ? 'اقرأ من حفظك، والكلمات هتنكشف وانت بتقرأ. أي كلمة نقصت أو غلطت فيها هتتعلّم بالأحمر من غير ما يوقّفك.'
              : 'اقرأ من حفظك، ولو غلطت هيوقّفك ويقولّك الكلمة الصح بصوت قارئ، وتعيدها وتكمّل. صوت الكلمة محتاج إنترنت.'
            : model === 'downloading'
              ? `بينزّل ملف الصوت… ${toAr(Math.round(progress * 100))}٪`
              : model === 'failed'
                ? 'التنزيل ما كملش. اتأكد من الإنترنت وجرّب تاني.'
                : `التسميع بالصوت محتاج ملف مرة واحدة (حوالي ${toAr(MODEL_MB)} ميجا)، والأفضل على واي فاي. بعد كده بيشتغل من غير إنترنت.`}
      </Text>
      {voice && (model === 'missing' || model === 'failed') ? (
        <PillButton variant="ghost" size="sm" label={model === 'failed' ? 'جرّب التنزيل تاني' : 'نزّل ملف الصوت'} style={st.download} onPress={download} />
      ) : null}
      {voice && model === 'ready' ? (
        <View style={[st.chips, st.modes]}>
          {VOICE_MODES.map((m) => <Chip key={m.id} size="sm" label={m.label} selected={voiceMode === m.id} onPress={() => { Haptics.selectionAsync(); setVoiceMode(m.id); }} />)}
        </View>
      ) : null}
      {voice && model === 'downloading' ? (
        <View style={st.track}><View style={[st.fill, { width: `${Math.round(progress * 100)}%`, backgroundColor: accent.accent }]} /></View>
      ) : null}

      <Text style={st.label}>مساعدة</Text>
      <View style={st.chips}>
        {HELP.map((h) => <Chip key={h.id} size="sm" label={h.label} selected={help === h.id} onPress={() => { Haptics.selectionAsync(); setHelp(h.id); }} />)}
      </View>

      <PillButton
        label="ابدأ التسميع"
        style={st.start}
        disabled={voice && model !== 'ready'}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onStart({ fromPage: from, toPage: to, help, voice, voiceMode }); }}
      />
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
  download: { marginTop: space[2], alignSelf: 'flex-start' },
  modes: { marginTop: space[2] },
  track: { height: 6, borderRadius: radius.pill, backgroundColor: colors.surfaceRaised, marginTop: space[2], overflow: 'hidden' },
  fill: { height: 6, borderRadius: radius.pill },
  note: { ...type.caption, color: colors.textMuted, marginTop: space[2], lineHeight: 18 },
  start: { marginTop: space[6] },
});

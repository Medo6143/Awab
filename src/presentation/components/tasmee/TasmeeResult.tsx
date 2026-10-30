import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Heart, RotateCcw } from 'lucide-react-native';
import { PillButton, ProgressRing } from '../ui';
import { colors, icon, radius, space, type } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';
import { toAr } from '../../../shared/utils/format';
import { ayahsLabel, minutesLabel } from './tasmeeText';

export type Mistake = { key: number; label: string; words: string[] };

type Props = {
  total: number;
  /** e.g. «صفحة ٥٣٠ – ٥٣١» */
  rangeLabel: string;
  mistakes: Mistake[];
  minutes: number;
  /** Surahs that just became fully memorized (joined the hifz heart). */
  memorized: string[];
  /** e.g. «كمّل صفحة ٥٣٢» */
  nextLabel?: string;
  onRetryMistakes: () => void;
  onContinue?: () => void;
  onDone: () => void;
};

const headline = (ratio: number) =>
  ratio === 1 ? 'ما شاء الله، حافظها' : ratio >= 0.7 ? 'ما شاء الله، قرّبت' : 'كمّل، الحفظ بالتكرار';

/** «خلّصت»: score ring, what to review, and the next step. */
export const TasmeeResult = ({ total, rangeLabel, mistakes, minutes, memorized, nextLabel, onRetryMistakes, onContinue, onDone }: Props) => {
  const accent = useAccent();
  const ok = total - mistakes.length;
  const ratio = total ? ok / total : 0;

  return (
    <ScrollView contentContainerStyle={st.wrap} showsVerticalScrollIndicator={false}>
      <View style={st.hero}>
        <ProgressRing
          progress={ratio}
          size={148}
          stroke={10}
          icon={
            <View style={st.ringInner}>
              <Text style={[st.score, { color: accent.accentText }]}>
                {toAr(ok)}<Text style={st.scoreOf}>{`/${toAr(total)}`}</Text>
              </Text>
              <Text style={st.scoreCaption}>من غير غلط</Text>
            </View>
          }
        />
        <Text style={st.headline}>{headline(ratio)}</Text>
        <Text style={st.sub}>{`${rangeLabel} · ${minutesLabel(Math.max(1, minutes), toAr)}`}</Text>
      </View>

      {memorized.map((name) => (
        <View key={name} style={[st.memorized, { backgroundColor: accent.accentSoft }]}>
          <Heart size={icon.size.md} color={accent.accentText} strokeWidth={icon.stroke} />
          <Text style={[st.memorizedText, { color: accent.accentText }]}>{`سورة ${name} اتضافت لقلب الحفظ`}</Text>
        </View>
      ))}

      {mistakes.length ? (
        <>
          <Text style={st.label}>{`محتاجة مراجعة · ${ayahsLabel(mistakes.length, toAr)}`}</Text>
          {mistakes.map((m) => (
            <View key={m.key} style={st.row}>
              <Text style={st.rowTitle}>{m.label}</Text>
              <Text style={st.rowTag} numberOfLines={1}>{m.words.length ? `«${m.words.slice(0, 2).join('، ')}»${m.words.length > 2 ? '…' : ''}` : 'غلطت فيها'}</Text>
            </View>
          ))}
          <PillButton label={mistakes.length === 1 ? 'سمّع الآية دي تاني' : 'سمّع الآيات دي تاني'} icon={<RotateCcw size={icon.size.md} color={accent.onAccent} strokeWidth={icon.stroke} />} style={st.primary} onPress={onRetryMistakes} />
          {nextLabel && onContinue ? <PillButton variant="ghost" label={nextLabel} style={st.secondary} onPress={onContinue} /> : null}
        </>
      ) : nextLabel && onContinue ? (
        <PillButton label={nextLabel} style={st.primary} onPress={onContinue} />
      ) : null}

      <PillButton variant="ghost" label="رجوع" style={st.secondary} onPress={onDone} />
    </ScrollView>
  );
};

const st = StyleSheet.create({
  wrap: { paddingHorizontal: space[5], paddingBottom: space[10] },
  hero: { alignItems: 'center', paddingTop: space[6], paddingBottom: space[5] },
  ringInner: { alignItems: 'center' },
  score: { fontFamily: 'Tajawal_800ExtraBold', fontSize: 40, lineHeight: 46 },
  scoreOf: { fontFamily: 'Tajawal_700Bold', fontSize: 18, color: colors.textMuted },
  scoreCaption: { ...type.caption, color: colors.textMuted },
  headline: { ...type.h1, color: colors.text, marginTop: space[5] },
  sub: { ...type.caption, color: colors.textMuted, marginTop: space[1] },
  memorized: { flexDirection: 'row', alignItems: 'center', gap: space[2], borderRadius: radius.tile, padding: space[4], marginBottom: space[4] },
  memorizedText: { ...type.bodyMedium, flex: 1 },
  label: { ...type.label, color: colors.textMuted, marginBottom: space[2] },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[3], backgroundColor: colors.surface, borderRadius: radius.tile, paddingHorizontal: space[4], paddingVertical: space[3], marginBottom: space[2] },
  rowTitle: { ...type.bodyMedium, color: colors.text },
  rowTag: { ...type.caption, color: '#ff8a80', backgroundColor: colors.dangerSoft, borderRadius: radius.pill, paddingHorizontal: space[3], paddingVertical: space[1], flexShrink: 1, fontFamily: 'Amiri_400Regular', fontSize: 14 },
  primary: { marginTop: space[4] },
  secondary: { marginTop: space[2] },
});

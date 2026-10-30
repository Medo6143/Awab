import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertCircle, Mic } from 'lucide-react-native';
import { PillButton, ProgressBar, Sheet } from '../ui';
import { colors, icon, radius, space, type } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';
import { SURAH_AYAH_COUNTS, SURAH_NAMES } from '../../../shared/constants/surahs';
import { toAr } from '../../../shared/utils/format';
import type { TasmeeMark } from '../../store/slices/quranSlice';
import { ayahsLabel } from './tasmeeText';

type Props = {
  surah: number | null;
  marks?: Record<number, TasmeeMark>;
  memorized: boolean;
  onClose: () => void;
  onRecite: (from: number, to: number, only?: number[]) => void;
  onChooseRange: (from: number, to: number) => void;
  onToggleMemorized: () => void;
};

const DAY = 24 * 60 * 60 * 1000;
const since = (iso?: string) => {
  if (!iso) return '';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / DAY);
  return days <= 0 ? 'النهارده' : days === 1 ? 'إمبارح' : days === 2 ? 'من يومين' : `من ${toAr(days)} ${days <= 10 ? 'أيام' : 'يوم'}`;
};

/** Hifz mode: tapping a surah shows its recital progress instead of toggling it at once. */
export const HeartSurahSheet = ({ surah, marks, memorized, onClose, onRecite, onChooseRange, onToggleMemorized }: Props) => {
  const accent = useAccent();
  if (!surah) return null;
  const total = SURAH_AYAH_COUNTS[surah - 1];
  const entries = Object.entries(marks ?? {}).map(([a, m]) => ({ ayah: +a, ...m }));
  const okCount = entries.filter((e) => e.ok).length;
  const weak = entries.filter((e) => !e.ok).map((e) => e.ayah).sort((a, b) => a - b);
  const last = entries.reduce<string | undefined>((l, e) => (!l || e.at > l ? e.at : l), undefined);
  const next = Array.from({ length: total }, (_, i) => i + 1).find((a) => !marks?.[a]?.ok);
  const chunk = (from: number) => Math.min(total, from + 9);

  return (
    <Sheet visible title={`سورة ${SURAH_NAMES[surah - 1]}`} onClose={onClose}>
      <Text style={st.meta}>{ayahsLabel(total, toAr)}</Text>
      <ProgressBar progress={okCount / total} style={st.bar} />
      <Text style={st.caption}>
        {entries.length ? `سمّعت ${toAr(okCount)} من ${toAr(total)} من غير غلط · آخر مرة ${since(last)}` : 'لسه ما سمّعتهاش'}
      </Text>

      {weak.length ? (
        <TouchableOpacity style={st.weak} onPress={() => onRecite(weak[0], weak[weak.length - 1], weak)} accessibilityRole="button" activeOpacity={0.85}>
          <AlertCircle size={icon.size.md} color={accent.accentText} strokeWidth={icon.stroke} />
          <Text style={st.weakText}>{`${ayahsLabel(weak.length, toAr)} محتاجة مراجعة`}</Text>
          <Text style={[st.weakAction, { color: accent.accentText }]}>سمّعها</Text>
        </TouchableOpacity>
      ) : null}

      <PillButton
        label={next ? (next === 1 ? 'سمّع السورة' : `كمّل من آية ${toAr(next)}`) : 'راجع السورة'}
        icon={<Mic size={icon.size.md} color={accent.onAccent} strokeWidth={icon.stroke} />}
        style={st.primary}
        onPress={() => (next ? onRecite(next, chunk(next)) : onRecite(1, total))}
      />
      <PillButton variant="ghost" label="اختار المدى" style={st.secondary} onPress={() => onChooseRange(next ?? 1, chunk(next ?? 1))} />
      <TouchableOpacity onPress={onToggleMemorized} style={st.link} accessibilityRole="button">
        <Text style={st.linkText}>{memorized ? 'شيل علامة الحفظ' : 'علّمها محفوظة من غير تسميع'}</Text>
      </TouchableOpacity>
    </Sheet>
  );
};

const st = StyleSheet.create({
  meta: { ...type.caption, color: colors.textMuted },
  bar: { marginTop: space[4] },
  caption: { ...type.caption, color: colors.textMuted, marginTop: space[2] },
  weak: { flexDirection: 'row', alignItems: 'center', gap: space[2], backgroundColor: colors.surfaceRaised, borderRadius: radius.tile, padding: space[4], marginTop: space[4] },
  weakText: { ...type.bodyMedium, color: colors.text, flex: 1 },
  weakAction: { ...type.label },
  primary: { marginTop: space[5] },
  secondary: { marginTop: space[2] },
  link: { alignItems: 'center', paddingVertical: space[4] },
  linkText: { ...type.label, color: colors.textMuted },
});

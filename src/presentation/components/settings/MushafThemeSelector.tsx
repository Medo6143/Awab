import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BookOpenText, Check } from 'lucide-react-native';
import { colors, icon, radius, space, type } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';
import { toAr } from '../../../shared/utils/format';
import { MUSHAF_THEME_LIST, MushafTheme, MushafThemeId } from '../quran/mushafThemes';
import { s } from './SettingsStyles';

/** A small page in the design: its paper, border, surah header and a line of text with a marker. */
const PagePreview = ({ theme }: { theme: MushafTheme }) => {
  const p = theme.palette;
  const border = theme.frame === 'none'
    ? { borderWidth: StyleSheet.hairlineWidth, borderColor: p.frame }
    : theme.frame === 'madani'
      ? { borderWidth: 3, borderColor: p.frame }
      : { borderWidth: 2, borderColor: p.frame, borderStyle: 'solid' as const };
  const header = theme.surahHeader === 'cartouche'
    ? { backgroundColor: p.band, borderWidth: 1, borderColor: p.frameDeep }
    : theme.surahHeader === 'band'
      ? { borderTopWidth: 1, borderBottomWidth: 1, borderColor: p.frame }
      : {};
  return (
    <View style={[st.page, { backgroundColor: p.paper }, border]}>
      <View style={[st.header, header]}>
        <Text allowFontScaling={false} style={[st.headerText, { color: theme.id === 'green' ? p.paper : p.ink }]}>سورة الملك</Text>
      </View>
      <Text allowFontScaling={false} style={[st.text, { color: p.ink, fontFamily: theme.fontFamily }]}>
        تَبَٰرَكَ ٱلَّذِي بِيَدِهِ ٱلۡمُلۡكُ{' '}
        <Text style={{ color: p.marker }}>{'۝' + toAr(1)}</Text>{' '}
        <Text style={{ color: theme.divineNames ? p.divine : p.ink }}>ٱللَّهِ</Text>
      </Text>
    </View>
  );
};

/** Settings → المصحف: the page design, from a row of small previews. */
export const MushafThemeSelector = ({ value, onSelect }: { value: MushafThemeId; onSelect: (id: MushafThemeId) => void }) => {
  const accent = useAccent();
  return (
    <View style={[s.subSection, { borderTopWidth: 0 }]}>
      <View style={st.label}>
        <BookOpenText size={icon.size.sm} color={accent.accentText} strokeWidth={icon.stroke} />
        <Text style={st.labelText}>شكل صفحة المصحف</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.row}>
        {MUSHAF_THEME_LIST.map((t) => {
          const active = value === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => onSelect(t.id)}
              activeOpacity={0.85}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={t.name}
              style={[st.option, active && { borderColor: accent.accent, backgroundColor: accent.accentSoft }]}
            >
              <PagePreview theme={t} />
              <View style={st.nameRow}>
                {active ? <Check size={14} color={accent.accentText} strokeWidth={icon.stroke} /> : null}
                <Text style={[st.name, active && { color: colors.text }]}>{t.name}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const st = StyleSheet.create({
  label: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginBottom: space[3] },
  labelText: { ...type.label, color: colors.textMuted },
  // per-item margins, not gap: a wrapped/scrolling RTL row
  row: { paddingVertical: space[1] },
  option: { alignItems: 'center', padding: space[2], marginHorizontal: space[1], borderRadius: radius.tile, borderWidth: 1.5, borderColor: 'transparent' },
  page: { width: 84, height: 120, borderRadius: 6, padding: 6, gap: 4 },
  header: { borderRadius: 3, paddingVertical: 1, alignItems: 'center' },
  headerText: { fontFamily: 'Amiri_700Bold', fontSize: 9, lineHeight: 15 },
  text: { fontSize: 10, lineHeight: 22, textAlign: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: space[2] },
  name: { ...type.caption, color: colors.textMuted },
});

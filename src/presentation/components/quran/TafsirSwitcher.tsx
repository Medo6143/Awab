import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { RootState } from '../../store';
import { setTafsirFontSize, setTafsirId, setTafsirStyle, TafsirStyle } from '../../store/slices/settingsSlice';
import { MUYASSAR_TAFSIR_ID, STYLES_LIST, TAFSIR_LIST } from '../settings/SettingsConstants';
import { colors, radius, space, themed } from '../../../shared/theme/tokens';
import { toAr } from '../../../shared/utils/format';

/**
 * Source, display style and font size of the tafsir, changed right in the tafsir sheet
 * (same settings as the Settings screen). "بسيط" always reads the short Muyassar tafsir,
 * so choosing another source while it is on switches the style back to "عصري".
 */
export const TafsirSwitcher = () => {
  const dispatch = useDispatch();
  const { selectedTafsirId, tafsirStyle, tafsirFontSize } = useSelector((s: RootState) => s.settings);
  const activeSource = tafsirStyle === 'simple' ? MUYASSAR_TAFSIR_ID : selectedTafsirId;

  const pickSource = (id: number) => {
    Haptics.selectionAsync();
    dispatch(setTafsirId(id));
    if (tafsirStyle === 'simple' && id !== MUYASSAR_TAFSIR_ID) dispatch(setTafsirStyle('modern'));
  };
  const pickStyle = (style: TafsirStyle) => { Haptics.selectionAsync(); dispatch(setTafsirStyle(style)); };
  const font = (d: number) => dispatch(setTafsirFontSize(Math.max(12, Math.min(32, tafsirFontSize + d))));

  return (
    <View style={st.wrap}>
      {/* wraps instead of scrolling: Android mis-measures RTL text in horizontal scroll views */}
      <View style={st.row}>
        {TAFSIR_LIST.map((t) => (
          <Chip key={t.id} label={t.name} on={activeSource === t.id} onPress={() => pickSource(t.id)} />
        ))}
      </View>
      <View style={st.row2}>
        {STYLES_LIST.map((o) => <Chip key={o.id} label={o.name} on={tafsirStyle === o.id} onPress={() => pickStyle(o.id)} />)}
        <View style={st.font}>
          <TouchableOpacity onPress={() => font(-2)} style={st.fontBtn} accessibilityLabel="تصغير خط التفسير" hitSlop={6}><Text style={st.fontTxtSm}>أ-</Text></TouchableOpacity>
          <Text style={st.fontVal}>{toAr(tafsirFontSize)}</Text>
          <TouchableOpacity onPress={() => font(2)} style={st.fontBtn} accessibilityLabel="تكبير خط التفسير" hitSlop={6}><Text style={st.fontTxt}>أ+</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const Chip = ({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={[st.chip, on && st.chipOn]} accessibilityRole="button" accessibilityState={{ selected: on }}>
    <Text style={[st.chipText, on && st.chipTextOn]}>{label}</Text>
  </TouchableOpacity>
);

const st = themed(() => ({
  wrap: { gap: space[2], marginBottom: space[4] },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  row2: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space[2] },
  chip: { borderRadius: radius.pill, paddingHorizontal: space[3], paddingVertical: 6, backgroundColor: colors.paperCard, borderWidth: 1, borderColor: colors.paperBorder },
  chipOn: { backgroundColor: '#8a6d22', borderColor: '#8a6d22' },
  chipText: { fontFamily: 'Tajawal_700Bold', fontSize: 13, color: colors.paperInk },
  chipTextOn: { color: '#fff8e6' },
  font: { flexDirection: 'row', alignItems: 'center', gap: space[1], marginStart: 'auto' },
  fontBtn: { width: 34, height: 30, borderRadius: radius.pill, backgroundColor: colors.paperCard, borderWidth: 1, borderColor: colors.paperBorder, alignItems: 'center', justifyContent: 'center' },
  fontTxt: { fontFamily: 'Tajawal_700Bold', fontSize: 15, color: colors.paperInk },
  fontTxtSm: { fontFamily: 'Tajawal_700Bold', fontSize: 12, color: colors.paperInk },
  fontVal: { fontFamily: 'Tajawal_700Bold', fontSize: 12, color: colors.paperMuted, minWidth: 22, textAlign: 'center' },
}));

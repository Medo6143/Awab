import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { HadithIndexEntry } from '../../../domain/entities/hadith';
import { colors, radius, space, type, themed } from '../../../shared/theme/tokens';

export const GradeChips = ({ grade, attribution }: { grade: string; attribution: string }) => (
  <View style={st.chips}>
    {grade ? <View style={[st.chip, st.gradeChip]}><Text style={[st.chipText, { color: colors.success }]}>{grade}</Text></View> : null}
    {attribution ? <View style={st.chip}><Text style={st.chipText}>{attribution}</Text></View> : null}
  </View>
);

/** One hadith in a list: its key sentence and grade. */
export const HadithRow = ({ entry, onPress }: { entry: HadithIndexEntry; onPress: () => void }) => (
  <TouchableOpacity style={st.row} onPress={onPress} accessibilityRole="button" activeOpacity={0.85}>
    <Text style={st.title} numberOfLines={3}>{entry.title}</Text>
    <GradeChips grade={entry.grade} attribution={entry.attribution} />
  </TouchableOpacity>
);

const st = themed(() => ({
  row: { backgroundColor: colors.surface, borderRadius: radius.card, padding: space[4], marginBottom: space[2] },
  title: { fontFamily: 'Amiri_700Bold', fontSize: 17, lineHeight: 31, color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2], marginTop: space[2] },
  chip: { borderRadius: radius.pill, paddingHorizontal: space[3], paddingVertical: 3, backgroundColor: colors.goldSoft },
  gradeChip: { backgroundColor: colors.successSoft },
  chipText: { ...type.caption, color: colors.gold },
}));

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { HeartMode } from '../../store/slices/quranSlice';
import { colors, radius, space, type } from '../../../shared/theme/tokens';
import { MODE_LABEL } from './khatmaFormat';

const MODES: HeartMode[] = ['reading', 'hifz'];

/** Two-way switch between the reading heart and the memorization heart. */
export const ModeSwitch = ({ mode, onChange, counts }: { mode: HeartMode; onChange: (m: HeartMode) => void; counts?: Record<HeartMode, string> }) => (
  <View style={st.track} accessibilityRole="tablist">
    {MODES.map((m) => {
      const on = m === mode;
      return (
        <TouchableOpacity
          key={m}
          style={[st.seg, on && st.segOn]}
          onPress={() => { if (!on) { Haptics.selectionAsync(); onChange(m); } }}
          accessibilityRole="tab"
          accessibilityState={{ selected: on }}
        >
          <Text style={[st.label, on && st.labelOn]}>{MODE_LABEL[m]}{counts ? ` ${counts[m]}` : ''}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const st = StyleSheet.create({
  track: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.pill, padding: 4, marginHorizontal: 20, marginBottom: space[3] },
  seg: { flex: 1, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: colors.goldSoft },
  label: { ...type.label, fontSize: 14, color: colors.textMuted },
  labelOn: { color: colors.goldText },
});

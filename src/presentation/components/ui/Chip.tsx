import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, radius, space, type } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  style?: object;
};

export const Chip = ({ label, selected, onPress, icon, size = 'md', style }: Props) => {
  const accent = useAccent();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={[
        styles.chip,
        size === 'sm' && styles.chipSm,
        selected && { backgroundColor: accent.accentSoft },
        style,
      ]}
    >
      {icon}
      <Text style={[styles.label, size === 'sm' && styles.labelSm, selected && { color: accent.accentText }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: space[2],
    paddingHorizontal: space[4], paddingVertical: space[3],
    borderRadius: radius.pill, backgroundColor: colors.surfaceRaised,
  },
  chipSm: { paddingHorizontal: space[3], paddingVertical: space[2] },
  label: { ...type.bodyMedium, color: colors.textMuted },
  labelSm: { ...type.label, color: colors.textMuted },
});

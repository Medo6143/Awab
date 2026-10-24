import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, radius, space, type } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  loading?: boolean;
  disabled?: boolean;
  style?: object;
};

export const PillButton = ({ label, onPress, variant = 'primary', icon, size = 'md', loading, disabled, style }: Props) => {
  const accent = useAccent();
  const bg = variant === 'primary' ? accent.accent : variant === 'danger' ? colors.dangerSoft : accent.accentSoft;
  const fg = variant === 'primary' ? accent.onAccent : variant === 'danger' ? '#ff8a80' : accent.accentText;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      accessibilityRole="button"
      style={[styles.btn, size === 'sm' && styles.btnSm, { backgroundColor: bg }, (disabled || loading) && styles.disabled, style]}
    >
      {loading ? <ActivityIndicator color={fg} size="small" /> : icon}
      <Text style={[styles.label, size === 'sm' && styles.labelSm, { color: fg }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2],
    paddingHorizontal: space[5], height: 48, borderRadius: radius.pill,
  },
  btnSm: { height: 36, paddingHorizontal: space[4] },
  label: { ...type.bodyMedium, fontFamily: 'Tajawal_700Bold' },
  labelSm: { ...type.label },
  disabled: { opacity: 0.5 },
});

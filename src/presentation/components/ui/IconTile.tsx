import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors, icon, radius } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';

type Props = { icon: LucideIcon; size?: 'md' | 'lg'; tone?: 'accent' | 'muted' | 'success' | 'danger'; style?: object };

/** The mono-icon square used in grids, settings rows and task rows. */
export const IconTile = ({ icon: Icon, size = 'md', tone = 'accent', style }: Props) => {
  const accent = useAccent();
  const box = size === 'lg' ? 56 : 44;
  const bg = tone === 'accent' ? accent.accentSoft : tone === 'success' ? colors.successSoft : tone === 'danger' ? colors.dangerSoft : colors.surfaceRaised;
  const fg = tone === 'accent' ? accent.accent : tone === 'success' ? colors.success : tone === 'danger' ? '#ff8a80' : colors.textMuted;
  return (
    <View style={[styles.tile, { width: box, height: box, backgroundColor: bg }, style]}>
      <Icon color={fg} size={size === 'lg' ? icon.size.lg : icon.size.md} strokeWidth={icon.stroke} />
    </View>
  );
};

const styles = StyleSheet.create({
  tile: { borderRadius: radius.tile, alignItems: 'center', justifyContent: 'center' },
});

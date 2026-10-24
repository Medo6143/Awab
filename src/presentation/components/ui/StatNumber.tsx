import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, type } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';
import { toAr } from '../../../shared/utils/format';

type Props = {
  value: number | string;
  caption?: string;
  size?: 'display' | 'h1' | 'h2';
  color?: string;
  align?: 'center' | 'right' | 'left';
  style?: object;
};

/** Big number + small muted caption. Digits are converted to Arabic-Indic automatically. */
export const StatNumber = ({ value, caption, size = 'h1', color, align = 'center', style }: Props) => {
  const accent = useAccent();
  const alignItems = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';
  return (
    <View style={[{ alignItems }, style]}>
      <Text style={[type[size], { color: color ?? accent.accentText, textAlign: align }]} numberOfLines={1} adjustsFontSizeToFit>
        {typeof value === 'number' ? toAr(value) : toAr(value)}
      </Text>
      {caption ? <Text style={[styles.caption, { textAlign: align }]}>{caption}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  caption: { ...type.caption, color: colors.textMuted, marginTop: 2 },
});

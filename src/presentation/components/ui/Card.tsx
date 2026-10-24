import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, space } from '../../../shared/theme/tokens';

type Props = {
  children: React.ReactNode;
  raised?: boolean;
  onPress?: () => void;
  padding?: keyof typeof space | 0;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/** Borderless surface. No shadow by design; hierarchy comes from spacing and `raised`. */
export const Card = ({ children, raised, onPress, padding = 4, style, accessibilityLabel }: Props) => {
  const base = [
    styles.card,
    raised && styles.raised,
    { padding: padding === 0 ? 0 : space[padding] },
    style,
  ];
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [base, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={base}>{children}</View>;
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.card },
  raised: { backgroundColor: colors.surfaceRaised },
  pressed: { opacity: 0.85 },
});

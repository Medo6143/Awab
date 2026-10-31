import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import type { IconComponent } from '../icons/IslamicIcons';
import { colors, icon, radius, space, type, themed } from '../../../shared/theme/tokens';
import { PillButton } from './PillButton';

type EmptyProps = { icon?: IconComponent; title: string; message?: string; action?: { label: string; onPress: () => void } };

export const EmptyState = ({ icon: Icon, title, message, action }: EmptyProps) => (
  <View style={styles.wrap} accessibilityRole="summary">
    {Icon ? (
      <View style={styles.iconWrap}><Icon color={colors.gold} size={icon.size.xl} strokeWidth={icon.stroke} /></View>
    ) : null}
    <Text style={styles.title}>{title}</Text>
    {message ? <Text style={styles.message}>{message}</Text> : null}
    {action ? <PillButton label={action.label} onPress={action.onPress} variant="ghost" size="sm" style={styles.action} /> : null}
  </View>
);

export const ErrorState = ({ message, onRetry, compact }: { message: string; onRetry?: () => void; compact?: boolean }) => (
  <View style={[styles.wrap, compact && styles.wrapCompact]} accessibilityRole="alert">
    <View style={[styles.iconWrap, { backgroundColor: colors.dangerSoft }]}>
      <AlertTriangle color={colors.dangerText} size={compact ? icon.size.lg : icon.size.xl} strokeWidth={icon.stroke} />
    </View>
    <Text style={styles.message}>{message}</Text>
    {onRetry ? <PillButton label="إعادة المحاولة" onPress={onRetry} variant="ghost" size="sm" style={styles.action} /> : null}
  </View>
);

/** Pulsing placeholder block. */
export const Skeleton = ({ width = '100%', height = 16, radius: r = radius.field, style }: { width?: number | `${number}%`; height?: number; radius?: number; style?: object }) => {
  const opacity = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View style={[{ width, height, borderRadius: r, backgroundColor: colors.surfaceRaised, opacity }, style]} />;
};

const styles = themed(() => ({
  wrap: { alignItems: 'center', paddingVertical: space[10], paddingHorizontal: space[6], gap: space[2] },
  wrapCompact: { paddingVertical: space[5] },
  iconWrap: { width: 64, height: 64, borderRadius: radius.card, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center', marginBottom: space[2] },
  title: { ...type.h2, color: colors.text, textAlign: 'center' },
  message: { ...type.body, color: colors.textMuted, textAlign: 'center' },
  action: { marginTop: space[3] },
}));

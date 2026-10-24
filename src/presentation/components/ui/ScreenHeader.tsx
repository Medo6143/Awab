import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors, icon, layout, radius, space, type } from '../../../shared/theme/tokens';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  /** Rendered at the far (visual) left in RTL. */
  right?: React.ReactNode;
  large?: boolean;
};

/**
 * Transparent, borderless header. RTL: the back chevron sits on the right and points right.
 * (I18nManager.forceRTL is on; lucide icons are not mirrored, so ChevronRight is "back".)
 */
export const ScreenHeader = ({ title, subtitle, onBack, right, large }: Props) => (
  <View style={[styles.row, large && styles.rowLarge]}>
    <View style={styles.side}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="رجوع" hitSlop={8}>
          <ChevronRight color={colors.gold} size={icon.size.lg} strokeWidth={icon.stroke} />
        </TouchableOpacity>
      ) : null}
    </View>
    <View style={styles.center}>
      <Text style={large ? styles.titleLarge : styles.title} numberOfLines={1}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
    </View>
    <View style={[styles.side, styles.sideEnd]}>{right}</View>
  </View>
);

export const IconButton = ({ children, onPress, label }: { children: React.ReactNode; onPress?: () => void; label?: string }) => (
  <TouchableOpacity onPress={onPress} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel={label} hitSlop={8}>
    {children}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: space[3],
    minHeight: 60,
  },
  rowLarge: { paddingTop: space[4], paddingBottom: space[5] },
  side: { minWidth: 48, flexDirection: 'row', alignItems: 'center' },
  sideEnd: { justifyContent: 'flex-end' },
  center: { flex: 1, alignItems: 'center' },
  title: { ...type.h2, color: colors.text },
  titleLarge: { ...type.h1, color: colors.text },
  subtitle: { ...type.caption, color: colors.textMuted, marginTop: 2 },
  iconBtn: {
    width: 44, height: 44, borderRadius: radius.tile,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
});

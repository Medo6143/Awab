import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, space, type } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';

type Props = { title: string; action?: { label: string; onPress: () => void }; style?: object };

export const SectionTitle = ({ title, action, style }: Props) => {
  const accent = useAccent();
  return (
    <View style={[styles.row, style]}>
      <Text style={styles.title}>{title}</Text>
      {action ? (
        <TouchableOpacity onPress={action.onPress} hitSlop={8} accessibilityRole="button">
          <Text style={[styles.action, { color: accent.accent }]}>{action.label}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: space[6], marginBottom: space[3] },
  title: { ...type.h2, color: colors.text },
  action: { ...type.label },
});

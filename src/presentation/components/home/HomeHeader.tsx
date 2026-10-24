import React from 'react';
import { View, Text } from 'react-native';
import { Settings, Activity, Moon } from 'lucide-react-native';
import { styles } from './HomeStyles';
import { IconButton } from '../ui';
import { colors, icon } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';

interface Props {
  dynamicContent: { title: string; sub: string; isHoliday?: boolean; holidayName?: string };
  hijriDateStr: string;
  onSettingsPress: () => void;
  onStatsPress: () => void;
}

/** Slim, image-free header: greeting, hijri date, two icon actions. */
export const HomeHeader = ({ dynamicContent, hijriDateStr, onSettingsPress, onStatsPress }: Props) => {
  const accent = useAccent();
  return (
    <View style={styles.header}>
      <View style={styles.headerActions}>
        <IconButton onPress={onSettingsPress} label="الإعدادات">
          <Settings color={accent.accent} size={icon.size.md} strokeWidth={icon.stroke} />
        </IconButton>
        <IconButton onPress={onStatsPress} label="الإحصائيات">
          <Activity color={accent.accent} size={icon.size.md} strokeWidth={icon.stroke} />
        </IconButton>
      </View>

      <View style={styles.headerText}>
        <Text style={styles.headerTitle} numberOfLines={1}>{dynamicContent.title}</Text>
        <Text style={styles.headerSub} numberOfLines={1}>{dynamicContent.sub}</Text>
        <View style={styles.hijriRow}>
          {dynamicContent.isHoliday && dynamicContent.holidayName ? (
            <View style={styles.holidayPill}><Text style={styles.holidayText}>{dynamicContent.holidayName}</Text></View>
          ) : null}
          {hijriDateStr ? (
            <>
              <Text style={styles.hijriText}>{hijriDateStr}</Text>
              <Moon size={14} color={colors.gold} strokeWidth={icon.stroke} />
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
};

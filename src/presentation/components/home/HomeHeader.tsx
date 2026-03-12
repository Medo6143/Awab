import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Settings, Activity, Star } from 'lucide-react-native';
import { THEME } from '../../../shared/theme/constants';
import { styles } from './HomeStyles';

interface Props {
  dynamicContent: any;
  hijriDateStr: string;
  accentTheme: string;
  onSettingsPress: () => void;
  onStatsPress: () => void;
}

export const HomeHeader = ({ dynamicContent, hijriDateStr, accentTheme, onSettingsPress, onStatsPress }: Props) => (
  <View style={styles.header}>
    <View>
      <View style={styles.headerTopRow}>
         <Text style={styles.headerTitle}>{dynamicContent.title}</Text>
         {dynamicContent.isHoliday && (
           <View style={styles.holidayBadge}>
             <Star size={12} color="#451a03" fill="#451a03" />
             <Text style={styles.holidayBadgeText}>{dynamicContent.holidayName}</Text>
           </View>
         )}
      </View>
      <Text style={styles.headerSub}>{dynamicContent.sub}</Text>
      {hijriDateStr ? <Text style={styles.hijriDate}>{hijriDateStr}</Text> : null}
    </View>
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <TouchableOpacity onPress={onStatsPress} style={styles.headerSettingsBtn}>
        <Activity color={(THEME.colors as any)[accentTheme] || THEME.colors.primary} size={24} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onSettingsPress} style={styles.headerSettingsBtn}>
        <Settings color={(THEME.colors as any)[accentTheme] || THEME.colors.primary} size={24} />
      </TouchableOpacity>
    </View>
  </View>
);

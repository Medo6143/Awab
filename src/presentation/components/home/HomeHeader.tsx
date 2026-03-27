import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { Settings, Activity, Star, Moon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../../../shared/theme/constants';
import { styles } from './HomeStyles';

interface Props {
  dynamicContent: any;
  hijriDateStr: string;
  accentTheme: string;
  onSettingsPress: () => void;
  onStatsPress: () => void;
}

export const HomeHeader = ({ dynamicContent, hijriDateStr, accentTheme, onSettingsPress, onStatsPress }: Props) => {
  const accentColor = (THEME.colors as any)[accentTheme] || THEME.colors.primary;

  return (
    <View style={styles.header}>
      <ImageBackground 
        source={require('../../../../assets/images/mosque_bg.png')} 
        style={styles.headerBackground}
        imageStyle={{ opacity: 0.35 }}
      >
        <LinearGradient 
          colors={['rgba(12, 8, 5, 0.2)', 'rgba(12, 8, 5, 0.7)', '#0c0805']} 
          locations={[0, 0.6, 1]}
          style={styles.headerGradient}
        >
          {/* Top Bar: App Name + Actions */}
          <View style={styles.headerTopBar}>
            <Text style={styles.headerAppName}>أوّاب</Text>
            <View style={styles.headerActionRow}>
              <TouchableOpacity onPress={onStatsPress} style={styles.headerActionBtn}>
                <Activity color={accentColor} size={20} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onSettingsPress} style={styles.headerActionBtn}>
                <Settings color={accentColor} size={20} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Greeting Area */}
          <View style={styles.headerGreetingArea}>
            <Text style={styles.headerTitle}>{dynamicContent.title}</Text>
            <Text style={styles.headerSub}>{dynamicContent.sub}</Text>

            {dynamicContent.isHoliday && (
              <View style={styles.holidayBadge}>
                <Star size={12} color="#451a03" fill="#451a03" />
                <Text style={styles.holidayBadgeText}>{dynamicContent.holidayName}</Text>
              </View>
            )}

            {hijriDateStr ? (
              <View style={styles.hijriBadge}>
                <Moon size={14} color="#d4af37" />
                <Text style={styles.hijriText}>{hijriDateStr}</Text>
              </View>
            ) : null}
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

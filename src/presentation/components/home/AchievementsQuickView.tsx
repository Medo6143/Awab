import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Star, X } from 'lucide-react-native';
import { styles } from './HomeStyles';
import { THEME } from '../../../shared/theme/constants';
import { Achievement } from '../../store/slices/achievementsSlice';

interface Props {
  badges: Achievement[];
  accentTheme: string;
}

export const AchievementsQuickView = ({ badges, accentTheme }: Props) => (
  <View style={styles.achievementsSection}>
     <Text style={styles.sectionTitle}>أحدث الأوسمة</Text>
     <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsScroll}>
        {badges.slice(0, 3).map((badge) => (
          <View key={badge.id} style={[styles.badgeCard, !badge.isUnlocked && styles.badgeLocked]}>
            <View style={[styles.badgeIconBox, badge.isUnlocked && { backgroundColor: (THEME.colors as any)[accentTheme] + '20' }]}>
              {badge.isUnlocked ? <Star color={(THEME.colors as any)[accentTheme]} size={20} fill={(THEME.colors as any)[accentTheme]} /> : <X color="#64748b" size={20} /> }
            </View>
            <Text style={styles.badgeName}>{badge.title}</Text>
          </View>
        ))}
     </ScrollView>
  </View>
);

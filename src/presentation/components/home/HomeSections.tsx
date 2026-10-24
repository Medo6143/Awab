import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  BookOpen, Compass, HandHeart, HeartPulse, ListChecks, Coins, BarChart3, Settings, LucideIcon,
} from 'lucide-react-native';
import { styles } from './HomeStyles';
import { Card, IconTile, SectionTitle } from '../ui';
import { DAILY_VERSES } from './HomeConstants';

type GridItem = { label: string; route: string; icon: LucideIcon; params?: any };

const GRID: GridItem[] = [
  { label: 'القرآن', route: 'TabQuran', icon: BookOpen },
  { label: 'القبلة', route: 'القبلة', icon: Compass },
  { label: 'الأدعية', route: 'الأدعية', icon: HandHeart },
  { label: 'نور القلب', route: 'نور_القلب', icon: HeartPulse },
  { label: 'العبادات', route: 'العبادات', icon: ListChecks },
  { label: 'الزكاة', route: 'الزكاة', icon: Coins },
  { label: 'الإحصائيات', route: 'الإحصائيات', icon: BarChart3 },
  { label: 'الإعدادات', route: 'الإعدادات', icon: Settings },
];

/** 4-column mono-icon grid. All icons share the accent; identity comes from the glyph. */
export const HomeGrid = ({ onNavigate }: { onNavigate: (route: string, params?: any) => void }) => (
  <View>
    <SectionTitle title="الوصول السريع" />
    <View style={styles.grid}>
      {GRID.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={styles.gridItem}
          onPress={() => onNavigate(item.route, item.params)}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          activeOpacity={0.8}
        >
          <IconTile icon={item.icon} size="lg" />
          <Text style={styles.gridLabel} numberOfLines={1}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

/** One quiet verse card at the bottom of Home; rotates daily. */
export const DailyVerseCard = () => {
  const dayIndex = Math.floor(Date.now() / 86_400_000) % DAILY_VERSES.length;
  const verse = DAILY_VERSES[dayIndex];
  return (
    <View>
      <SectionTitle title="آية وتأمل" />
      <Card padding={5}>
        <View style={styles.verseTag}><Text style={styles.verseTagText}>{verse.tag}</Text></View>
        <Text style={styles.verseText}>{verse.text}</Text>
        <Text style={styles.verseRef}>{verse.ref}</Text>
      </Card>
    </View>
  );
};

import { PlainRoute } from '../../navigation/types';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Settings } from 'lucide-react-native';
import {
  DuaHandsIcon, HeartLightIcon, IconComponent, KaabaIcon, PrayerMatIcon, QuranMessageIcon, QuranStandIcon, ZakatCoinIcon,
} from '../icons/IslamicIcons';
import { styles } from './HomeStyles';
import { Card, IconTile, SectionTitle } from '../ui';
import { DAILY_VERSES } from './HomeConstants';

type GridItem = { label: string; route: PlainRoute; icon: IconComponent };

const GRID: GridItem[] = [
  { label: 'القرآن', route: 'TabQuran', icon: QuranStandIcon },
  { label: 'القبلة', route: 'القبلة', icon: KaabaIcon },
  { label: 'الأدعية', route: 'الأدعية', icon: DuaHandsIcon },
  { label: 'نور القلب', route: 'نور_القلب', icon: HeartLightIcon },
  { label: 'العبادات', route: 'العبادات', icon: PrayerMatIcon },
  { label: 'الزكاة', route: 'الزكاة', icon: ZakatCoinIcon },
  { label: 'رسائل القرآن', route: 'رسائل_القرآن', icon: QuranMessageIcon },
  { label: 'الإعدادات', route: 'الإعدادات', icon: Settings },
];

/** 4-column mono-icon grid. All icons share the accent; identity comes from the glyph. */
export const HomeGrid = ({ onNavigate }: { onNavigate: (route: PlainRoute) => void }) => (
  <View>
    <SectionTitle title="الوصول السريع" />
    <View style={styles.grid}>
      {GRID.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={styles.gridItem}
          onPress={() => onNavigate(item.route)}
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

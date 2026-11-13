import { PlainRoute } from '../../navigation/types';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlarmClock, Headphones, Radio } from 'lucide-react-native';
import {
  DuaHandsIcon, HadithScrollIcon, HeartLightIcon, IconComponent, KaabaIcon, MosqueIcon, PrayerMatIcon, QuranMessageIcon, QuranStandIcon, ZakatCoinIcon,
} from '../icons/IslamicIcons';
import { styles } from './HomeStyles';
import { openMosquesNearby } from '../prayer/MosqueParts';
import { IconTile, SectionTitle } from '../ui';

/** A tile opens a screen (`route`) or, for «المساجد», Google Maps (`maps`). */
type GridItem = { label: string; icon: IconComponent } & ({ route: PlainRoute } | { maps: 'mosques' });

const GRID: GridItem[] = [
  { label: 'القرآن', route: 'TabQuran', icon: QuranStandIcon },
  { label: 'التلاوات', route: 'التلاوات', icon: Headphones },
  { label: 'الإذاعة', route: 'الإذاعة', icon: Radio },
  { label: 'القبلة', route: 'القبلة', icon: KaabaIcon },
  { label: 'الأدعية', route: 'الأدعية', icon: DuaHandsIcon },
  { label: 'نور القلب', route: 'نور_القلب', icon: HeartLightIcon },
  { label: 'العبادات', route: 'العبادات', icon: PrayerMatIcon },
  { label: 'تذكيراتي', route: 'التذكيرات', icon: AlarmClock },
  { label: 'الزكاة', route: 'الزكاة', icon: ZakatCoinIcon },
  { label: 'رسائل القرآن', route: 'رسائل_القرآن', icon: QuranMessageIcon },
  { label: 'الأحاديث', route: 'الأحاديث', icon: HadithScrollIcon },
  { label: 'المساجد', maps: 'mosques', icon: MosqueIcon },
];

/** 4-column mono-icon grid. All icons share the accent; identity comes from the glyph. */
export const HomeGrid = ({ onNavigate, onReport }: { onNavigate: (route: PlainRoute) => void; onReport?: () => void }) => (
  <View>
    <SectionTitle title="الأقسام" action={onReport ? { label: 'التقرير اليومي', onPress: onReport } : undefined} />
    <View style={styles.grid}>
      {GRID.map((item) => (
        <TouchableOpacity
          key={item.label}
          style={styles.gridItem}
          onPress={() => ('route' in item ? onNavigate(item.route) : openMosquesNearby())}
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

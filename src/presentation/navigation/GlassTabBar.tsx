import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CrescentStarIcon, IconComponent, MihrabClockIcon, MosqueIcon, QuranStandIcon, TasbihIcon,
} from '../components/icons/IslamicIcons';
import { colors, isLightTheme, elevation, icon, layout, radius, space, type } from '../../shared/theme/tokens';
import { useAccent } from '../../shared/theme/useAccent';

const ICONS: Record<string, IconComponent> = {
  TabHome: MosqueIcon,
  TabPrayer: MihrabClockIcon,
  TabQuran: QuranStandIcon,
  TabTasbeeh: TasbihIcon,
  TabAthkar: CrescentStarIcon,
};

/**
 * Floating glass tab bar. Active tab = icon + label in an accent pill; inactive = icon only.
 * Real blur on Android needs `experimentalBlurMethod`; if blur is unavailable the overlay
 * alone is opaque enough (`glassOpaque`) so the bar still reads correctly.
 */
export const GlassTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const accent = useAccent();
  // sit above the system navigation bar (3-button nav is ~48dp tall; gesture nav is thin)
  const navBar = useSafeAreaInsets().bottom;
  const focusedOptions = descriptors[state.routes[state.index].key]?.options;
  // the Quran tab hides the bar with tabBarStyle: { display: 'none' }
  if ((focusedOptions?.tabBarStyle as { display?: string } | undefined)?.display === 'none') return null;

  const useBlur = Platform.OS === 'ios' || Platform.OS === 'android';

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: layout.tabBarBottom + navBar }]}>
      <View style={[styles.bar, elevation.floating]}>
        {useBlur ? (
          <BlurView intensity={40} tint={isLightTheme() ? 'light' : 'dark'} experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill} />
        ) : null}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: useBlur ? colors.glass : colors.glassOpaque }]} />

        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = (options.title ?? route.name) as string;
            const focused = state.index === index;
            const Icon = ICONS[route.name] ?? MosqueIcon;

            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={label}
                activeOpacity={0.85}
                style={[styles.item, focused && { backgroundColor: accent.accentSoft }]}
              >
                <Icon color={focused ? accent.accentText : colors.textFaint} size={22} strokeWidth={icon.stroke} />
                {focused ? <Text style={[styles.label, { color: accent.accentText }]} numberOfLines={1}>{label}</Text> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: layout.tabBarBottom, alignItems: 'center' },
  bar: {
    width: '100%', maxWidth: 520,
    marginHorizontal: layout.screenPadding,
    height: layout.tabBarHeight,
    borderRadius: radius.pill,
    overflow: 'hidden',
    alignSelf: 'center',
    left: 0, right: 0,
    marginLeft: layout.screenPadding, marginRight: layout.screenPadding,
  },
  row: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space[2] },
  item: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2],
    height: 48, paddingHorizontal: space[4], borderRadius: radius.pill,
  },
  label: { ...type.label },
});

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList, TabParamList } from './types';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { View } from 'react-native';
import { useAudio } from '../hooks/useAudio';
import { colors } from '../../shared/theme/tokens';
import { GlassTabBar } from './GlassTabBar';

import HomeScreen from '../screens/HomeScreen';
import QuranScreen from '../screens/QuranScreen';
import DuaScreen from '../screens/DuaScreen';
import TasbeehScreen from '../screens/TasbeehScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AthkarScreen from '../screens/AthkarScreen';
import HeartJourneyScreen from '../screens/HeartJourneyScreen';
import KhatmatScreen from '../screens/KhatmatScreen';
import VirtuesScreen from '../screens/VirtuesScreen';
import QuranMessagesScreen from '../screens/QuranMessagesScreen';
import QiblaScreen from '../screens/QiblaScreen';
import PrayerTimesScreen from '../screens/PrayerTimesScreen';
import ZakatScreen from '../screens/ZakatScreen';
import IbadaTodoScreen from '../screens/IbadaTodoScreen';
import PrayerHubScreen from '../screens/PrayerHubScreen';
import StatsScreen from '../screens/StatsScreen';

/**
 * Route names:
 *  - Tabs use stable ids (TabHome…); their Arabic labels live in `options.title`.
 *  - Stack routes keep their Arabic names (used all over the app for navigate()).
 *  - Tasbeeh is a tab now; `navigate('TabTasbeeh')` works from any nested screen.
 */
export type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

const TabNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => <GlassTabBar {...props} />}
    screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}
  >
    <Tab.Screen name="TabHome" component={HomeScreen} options={{ title: 'الرئيسية' }} />
    <Tab.Screen name="TabPrayer" component={PrayerHubScreen} options={{ title: 'الصلاة' }} />
    <Tab.Screen name="TabQuran" component={QuranScreen} options={{ title: 'القرآن', tabBarStyle: { display: 'none' } }} />
    <Tab.Screen name="TabTasbeeh" component={TasbeehScreen} options={{ title: 'المسبحة' }} />
    <Tab.Screen name="TabAthkar" component={AthkarScreen} options={{ title: 'الأذكار' }} />
  </Tab.Navigator>
);

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: { ...DefaultTheme.colors, background: colors.bg, card: colors.bg, text: colors.text, primary: colors.gold, border: 'transparent' },
};

const AppNavigation = () => {
  // Keeps the global audio state in sync with TrackPlayer while any screen is mounted.
  useAudio();

  return (
    <NavigationContainer theme={navTheme}>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bg } }}>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="الأذكار" component={AthkarScreen} />
          <Stack.Screen name="الأدعية" component={DuaScreen} />
          <Stack.Screen name="نور_القلب" component={HeartJourneyScreen} />
          <Stack.Screen name="الختمات" component={KhatmatScreen} />
          <Stack.Screen name="الفضائل" component={VirtuesScreen} />
          <Stack.Screen name="رسائل_القرآن" component={QuranMessagesScreen} />
          <Stack.Screen name="القبلة" component={QiblaScreen} />
          <Stack.Screen name="الصلاة" component={PrayerTimesScreen} />
          <Stack.Screen name="الزكاة" component={ZakatScreen} />
          <Stack.Screen name="العبادات" component={IbadaTodoScreen} />
          <Stack.Screen name="الإعدادات" component={SettingsScreen} />
          <Stack.Screen name="الإحصائيات" component={StatsScreen} />
        </Stack.Navigator>
      </View>
    </NavigationContainer>
  );
};

export default AppNavigation;

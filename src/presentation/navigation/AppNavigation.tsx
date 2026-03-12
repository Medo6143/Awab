import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { View, Platform } from 'react-native';
import { 
  LayoutGrid, BookOpen, CircleDot, Clock, Compass, Mic, CheckSquare, Settings 
} from 'lucide-react-native';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import QuranScreen from '../screens/QuranScreen';
import DuaScreen from '../screens/DuaScreen';
import TasbeehScreen from '../screens/TasbeehScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AthkarScreen from '../screens/AthkarScreen';
import HeartJourneyScreen from '../screens/HeartJourneyScreen';
import QiblaScreen from '../screens/QiblaScreen';
import PrayerTimesScreen from '../screens/PrayerTimesScreen';
import ZakatScreen from '../screens/ZakatScreen';
import IbadaTodoScreen from '../screens/IbadaTodoScreen';
import PrayerHubScreen from '../screens/PrayerHubScreen';
import DhikrHubScreen from '../screens/DhikrHubScreen';
import StatsScreen from '../screens/StatsScreen';
import { THEME } from '../../shared/theme/constants';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        position: 'absolute',
        bottom: 25,
        left: 20,
        right: 20,
        backgroundColor: '#1a140f',
        borderRadius: 25,
        height: 70,
        borderTopWidth: 0,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        paddingTop: 10,
        borderWidth: 1,
        borderColor: '#2b1f15',
      },
      tabBarActiveTintColor: THEME.colors.gold,
      tabBarInactiveTintColor: '#64748b',
      tabBarLabelStyle: {
        fontFamily: 'Tajawal_500Medium',
        fontSize: 11,
        marginTop: -5,
      }
    }}
  >
    <Tab.Screen
      name="الرئيسية"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color, size }: any) => <FontAwesome5 name="home" color={color} size={size} />,
      }}
    />
    <Tab.Screen
      name="القرآن"
      component={QuranScreen}
      options={{
        tabBarIcon: ({ color, size }: any) => <FontAwesome5 name="quran" color={color} size={size} />,
        tabBarStyle: { display: 'none' }
      }}
    />
    <Tab.Screen
      name="الصلاة"
      component={PrayerHubScreen}
      options={{
        tabBarIcon: ({ color, size }: any) => <FontAwesome5 name="mosque" color={color} size={size} />,
      }}
    />
    <Tab.Screen
      name="الذكر"
      component={DhikrHubScreen}
      options={{
        tabBarIcon: ({ color, size }: any) => <FontAwesome5 name="praying-hands" color={color} size={size} />,
      }}
    />
  </Tab.Navigator>
);

const AppNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="الأذكار" component={AthkarScreen} />
        <Stack.Screen name="نور_القلب" component={HeartJourneyScreen} />
        <Stack.Screen name="القبلة" component={QiblaScreen} />
        <Stack.Screen name="الصلاة" component={PrayerTimesScreen} />
        <Stack.Screen name="الزكاة" component={ZakatScreen} />
        <Stack.Screen name="العبادات" component={IbadaTodoScreen} />
        <Stack.Screen name="الإعدادات" component={SettingsScreen} />
        <Stack.Screen name="الإحصائيات" component={StatsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;

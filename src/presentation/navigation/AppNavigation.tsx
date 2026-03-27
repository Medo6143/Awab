import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { View, Platform } from 'react-native';
import { 
  LayoutGrid, BookOpen, CircleDot, Clock, Compass, Mic, CheckSquare, Settings 
} from 'lucide-react-native';
import { FontAwesome5, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useAudio } from '../hooks/useAudio';
import { AudioPlayerBar } from '../components/quran/AudioPlayerBar';
import { RootState } from '../store';
import { useSurahs } from '../hooks/useQuran';

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
        textAlign: 'center',
        writingDirection: 'rtl'
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
        tabBarIcon: ({ color, size }: any) => <MaterialCommunityIcons name="book-open-page-variant" color={color} size={size + 2} />,
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
      name="الأذكار"
      component={AthkarScreen}
      options={{
        tabBarIcon: ({ color, size }: any) => <MaterialCommunityIcons name="star-crescent" color={color} size={size + 2} />,
      }}
    />
  </Tab.Navigator>
);

const AppNavigation = () => {
  const dispatch = useDispatch();
  const { 
    isPlaying, isBuffering, currentSurahId, activeReciter,
    currentPosition, duration, playMode,
    togglePlayback, seekTo, stopPlayback 
  } = useAudio();
  
  const { data: surahsData } = useSurahs();
  const surahsList = (surahsData as any[]) ?? [];

  return (
    <NavigationContainer>
      <View style={{ flex: 1 }}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="الأذكار" component={AthkarScreen} />
          <Stack.Screen name="المسبحة" component={TasbeehScreen} />
          <Stack.Screen name="الأدعية" component={DuaScreen} />
          <Stack.Screen name="نور_القلب" component={HeartJourneyScreen} />
          <Stack.Screen name="القبلة" component={QiblaScreen} />
          <Stack.Screen name="الصلاة" component={PrayerTimesScreen} />
          <Stack.Screen name="الزكاة" component={ZakatScreen} />
          <Stack.Screen name="العبادات" component={IbadaTodoScreen} />
          <Stack.Screen name="الإعدادات" component={SettingsScreen} />
          <Stack.Screen name="الإحصائيات" component={StatsScreen} />
        </Stack.Navigator>

        {/* Global Audio Player Bar - Hidden to rely on system notification only */}
        {/* {playMode === 'surah' && (
          <AudioPlayerBar
            isPlaying={isPlaying}
            isBuffering={isBuffering}
            currentPosition={currentPosition}
            duration={duration}
            onTogglePlayback={togglePlayback}
            onSeek={seekTo}
            onClose={stopPlayback}
            onForward={() => seekTo(currentPosition + 15000)}
            onBackward={() => seekTo(Math.max(0, currentPosition - 15000))}
            surahName={surahsList.find(sur => sur.number === currentSurahId)?.name}
            reciterName={activeReciter?.name}
          />
        )} */}
      </View>
    </NavigationContainer>
  );
};

export default AppNavigation;

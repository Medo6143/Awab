import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sunrise, Compass } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { THEME } from '../../shared/theme/constants';

import PrayerTimesScreen from './PrayerTimesScreen';
import QiblaScreen from './QiblaScreen';
import { s } from '../components/prayer/PrayerHubStyles';

const PrayerHubScreen = ({ route }: any) => {
  const [activeTab, setActiveTab] = useState<'times' | 'qibla'>(route?.params?.screen === 'qibla' ? 'qibla' : 'times');

  React.useEffect(() => {
    if (route?.params?.screen) setActiveTab(route.params.screen);
  }, [route?.params?.screen]);

  const { accentTheme } = useSelector((state: RootState) => state.settings);
  const accentColor = (THEME.colors as any)[accentTheme] || THEME.colors.primary;

  const Tab = ({ id, icon: Icon, label }: any) => (
    <TouchableOpacity style={[s.tab, activeTab === id && s.activeTab]} onPress={() => setActiveTab(id)}>
      <Icon size={20} color={activeTab === id ? accentColor : '#94a3b8'} />
      <Text style={[s.tabLabel, activeTab === id && { color: accentColor }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={s.root}>
      <SafeAreaView style={[s.header, { backgroundColor: '#0c0805' }]}>
        <View style={s.tabContainer}>
          <Tab id="times" icon={Sunrise} label="المواقيت" />
          <Tab id="qibla" icon={Compass} label="القبلة" />
        </View>
      </SafeAreaView>

      <View style={s.content}>
        {activeTab === 'times' ? <PrayerTimesScreen hideHeader /> : <QiblaScreen hideHeader />}
      </View>
    </View>
  );
};

export default PrayerHubScreen;

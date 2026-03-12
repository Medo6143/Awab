import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { THEME } from '../../shared/theme/constants';

import TasbeehScreen from './TasbeehScreen';
import DuaScreen from './DuaScreen';
import AthkarScreen from './AthkarScreen';
import { s } from '../components/dhikr/DhikrHubStyles';

const DhikrHubScreen = ({ route }: any) => {
  const [activeTab, setActiveTab] = useState<'tasbeeh' | 'duas' | 'athkar'>(route?.params?.screen || 'tasbeeh');

  React.useEffect(() => {
    if (route?.params?.screen) setActiveTab(route.params.screen);
  }, [route?.params?.screen]);

  const { accentTheme } = useSelector((state: RootState) => state.settings);
  const accentColor = (THEME.colors as any)[accentTheme] || THEME.colors.primary;

  const Tab = ({ id, icon, label }: any) => (
    <TouchableOpacity style={[s.tab, activeTab === id && s.activeTab]} onPress={() => setActiveTab(id)}>
      <FontAwesome5 name={icon} size={18} color={activeTab === id ? accentColor : '#94a3b8'} />
      <Text style={[s.tabLabel, activeTab === id && { color: accentColor }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={s.root}>
      <SafeAreaView style={[s.header, { backgroundColor: '#0c0805' }]}>
        <View style={s.tabContainer}>
          <Tab id="tasbeeh" icon="braille" label="المسبحة" />
          <Tab id="duas" icon="praying-hands" label="الأدعية" />
          <Tab id="athkar" icon="sun" label="الأذكار" />
        </View>
      </SafeAreaView>

      <View style={s.content}>
        {activeTab === 'tasbeeh' ? <TasbeehScreen hideHeader /> : activeTab === 'duas' ? <DuaScreen hideHeader /> : <AthkarScreen hideHeader />}
      </View>
    </View>
  );
};

export default DhikrHubScreen;

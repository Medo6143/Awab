import { ScreenProps } from '../navigation/types';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KaabaIcon, MihrabClockIcon } from '../components/icons/IslamicIcons';
import { ScreenHeader, Chip } from '../components/ui';
import { colors, icon } from '../../shared/theme/tokens';
import { useAccent } from '../../shared/theme/useAccent';
import { s } from '../components/prayer/PrayerTimesStyles';

import PrayerTimesScreen from './PrayerTimesScreen';
import QiblaScreen from './QiblaScreen';

type Tab = 'times' | 'qibla';

const PrayerHubScreen = ({ route }: Partial<ScreenProps<'TabPrayer'>>) => {
  const [activeTab, setActiveTab] = useState<Tab>(route?.params?.screen === 'qibla' ? 'qibla' : 'times');
  const accent = useAccent();

  useEffect(() => {
    const screen = route?.params?.screen;
    if (screen) setActiveTab(screen);
  }, [route?.params?.screen]);

  const iconColor = (id: Tab) => (activeTab === id ? accent.accentText : colors.textMuted);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="الصلاة" large />
      <View style={s.hubTabs}>
        <Chip
          label="المواقيت"
          selected={activeTab === 'times'}
          onPress={() => setActiveTab('times')}
          icon={<MihrabClockIcon size={icon.size.md} color={iconColor('times')} strokeWidth={icon.stroke} />}
        />
        <Chip
          label="القبلة"
          selected={activeTab === 'qibla'}
          onPress={() => setActiveTab('qibla')}
          icon={<KaabaIcon size={icon.size.md} color={iconColor('qibla')} strokeWidth={icon.stroke} />}
        />
      </View>
      <View style={{ flex: 1 }}>
        {activeTab === 'times' ? <PrayerTimesScreen hideHeader tab /> : <QiblaScreen hideHeader tab />}
      </View>
    </SafeAreaView>
  );
};

export default PrayerHubScreen;

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, ChevronRight } from 'lucide-react-native';
import { usePrayerTimes } from '../hooks/usePrayerTimes';

// Prayer Components & Styles
import { PrayerCountdown, PrayerTimeRow, ImsakiyaCTA } from '../components/prayer/PrayerTimesComponents';
import { s } from '../components/prayer/PrayerTimesStyles';

const PrayerTimesScreen = ({ navigation, hideHeader }: any) => {
  const { timings, date, nextPrayer, loading } = usePrayerTimes();

  if (loading) {
    return (
      <View style={[s.root, s.center]}>
        <ActivityIndicator color="#fcd34d" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0c0805' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {!hideHeader && (
          <View style={s.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}><ChevronRight color="#fcd34d" size={24} /></TouchableOpacity>
            <Text style={s.headerTitle}>مواقيت الصلاة</Text>
            <TouchableOpacity style={s.backBtn}><MapPin color="#fcd34d" size={20} /></TouchableOpacity>
          </View>
        )}

        <PrayerCountdown nextPrayer={nextPrayer} date={date} />

        <View style={s.listContainer}>
          {timings && Object.entries(timings)
            .filter(([k]) => !['Imsak', 'Midnight', 'Firstthird', 'Lastthird'].includes(k))
            .map(([name, time]) => (
              <PrayerTimeRow key={name} name={name} time={time as string} isActive={nextPrayer?.name === name} />
            ))}
        </View>

        <ImsakiyaCTA />
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrayerTimesScreen;

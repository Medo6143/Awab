import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Bell, Clock } from 'lucide-react-native';
import { s } from './PrayerTimesStyles';
import { formatRemaining, toAr, PRAYER_NAME_MAP } from './PrayerTimesConstants';

export const PrayerCountdown = ({ nextPrayer, date }: any) => (
  <View style={s.countdownContainer}>
    <LinearGradient colors={['#1e293b', '#0c0805']} style={s.glassCard}>
      <Text style={s.nextLabel}>الصلاة القادمة: {nextPrayer?.arName}</Text>
      <Text style={s.remainingTime}>{formatRemaining(nextPrayer?.remaining || 0)}</Text>
      <View style={s.dateRow}>
        <Calendar size={16} color="#94a3b8" />
        <Text style={s.dateText}>{date?.hijri?.day} {date?.hijri?.month?.ar} {date?.hijri?.year} هـ</Text>
      </View>
    </LinearGradient>
  </View>
);

export const PrayerTimeRow = ({ name, time, isActive }: any) => (
  <View style={[s.timeRow, isActive && s.activeRow]}>
    <View style={s.timeInfo}>
      <Text style={[s.timeName, isActive && s.activeText]}>{PRAYER_NAME_MAP[name] || name}</Text>
      <Text style={s.timeValue}>{toAr(time)}</Text>
    </View>
    <TouchableOpacity>
      <Bell size={20} color={isActive ? '#fcd34d' : '#475569'} />
    </TouchableOpacity>
  </View>
);

export const ImsakiyaCTA = () => (
  <TouchableOpacity style={s.imsakiyaBtn}>
    <LinearGradient
      colors={['#B8860B', '#8B4513']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={s.imsakiyaGradient}
    >
      <Clock color="#fff" size={20} />
      <Text style={s.imsakiyaBtnText}>عرض إمساكية الشهر الكاملة</Text>
    </LinearGradient>
  </TouchableOpacity>
);

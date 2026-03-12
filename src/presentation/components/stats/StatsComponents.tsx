import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp } from 'lucide-react-native';
import { s } from './StatsStyles';

const toAr = (n: number | string) => n.toLocaleString('ar-EG');

export const PremiumStatCard = ({ icon, label, value, percentage, color }: any) => (
  <View style={s.premiumCard}>
    <View style={s.pCardHeader}>
       <View style={[s.pCardIcon, { backgroundColor: color + '15' }]}>{icon}</View>
       <Text style={[s.pCardVal, { color }]}>{value}</Text>
    </View>
    <Text style={s.pCardLab}>{label}</Text>
    <View style={s.pCardProgressBg}>
       <View style={[s.pCardProgressFill, { width: `${percentage}%`, backgroundColor: color }]} />
    </View>
  </View>
);

export const HeroStatsCard = ({ accentColor, label, value, comparison }: any) => (
  <LinearGradient
    colors={[accentColor, accentColor + '70', '#1a140f']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={s.heroCard}
  >
    <View style={s.heroContent}>
      <View style={s.heroTextSide}>
        <Text style={s.heroLabel}>{label}</Text>
        <Text style={s.heroValue}>{toAr(value)}</Text>
        <View style={s.insightBadge}>
           <TrendingUp size={14} color="#000" />
           <Text style={s.insightText}>{comparison}</Text>
        </View>
      </View>
    </View>
  </LinearGradient>
);

export const WeeklyActivityChart = ({ chartData, maxDhikr, accentColor }: any) => (
  <View style={s.sectionGlass}>
     <View style={s.sectionHeader}>
        <View style={[s.headerDot, { backgroundColor: accentColor }]} />
        <Text style={s.sectionTitle}>مؤشر النشاط الأسبوعي</Text>
     </View>
     <View style={s.chartContainer}>
        {chartData.map((val: number, i: number) => (
          <View key={i} style={s.barWrapper}>
            <View style={s.barBackground}>
              <LinearGradient
                colors={[accentColor, accentColor + '40']}
                style={[s.barFill, { height: `${(val / maxDhikr) * 100}%` }]}
              />
            </View>
            <Text style={s.barLabel}>{['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'][new Date(Date.now() - (6-i)*86400000).getDay()]}</Text>
          </View>
        ))}
     </View>
  </View>
);

export const DhikrBreakdownChart = ({ details, accentColor }: any) => {
  const data = Object.entries(details || {})
    .sort((a: any, b: any) => b[1] - a[1]);
  
  const total = data.reduce((acc, curr: any) => acc + curr[1], 0);
  const max = Math.max(...data.map((d: any) => d[1]), 1);

  if (data.length === 0) return (
     <View style={s.sectionGlass}>
        <View style={s.sectionHeader}>
           <View style={[s.headerDot, { backgroundColor: accentColor }]} />
           <Text style={s.sectionTitle}>تفاصيل الأذكار</Text>
        </View>
        <Text style={{ fontFamily: 'Tajawal_400Regular', color: '#64748b', textAlign: 'center' }}>لا يوجد بيانات مسجلة بعد</Text>
     </View>
  );

  return (
    <View style={s.sectionGlass}>
      <View style={s.sectionHeader}>
         <View style={[s.headerDot, { backgroundColor: accentColor }]} />
         <Text style={s.sectionTitle}>تفاصيل الأذكار</Text>
      </View>
      <View style={s.dhikrChartContainer}>
        {data.map(([name, count]: any) => (
          <View key={name} style={s.dhikrBarRow}>
             <Text style={s.dhikrBarLabel} numberOfLines={1}>{name}</Text>
             <View style={s.dhikrBarTrack}>
                <LinearGradient 
                  colors={[accentColor, accentColor + '40']} 
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={[s.dhikrBarFill, { width: `${(count / max) * 100}%` }]} 
                />
             </View>
             <Text style={s.dhikrBarValue}>{toAr(count)}</Text>
          </View>
        ))}
      </View>
      <View style={s.legendRow}>
         <Text style={s.legendText}>إجمالي التسبيح: {toAr(total)}</Text>
      </View>
    </View>
  );
};

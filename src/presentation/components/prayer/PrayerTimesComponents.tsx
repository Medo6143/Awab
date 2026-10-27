import React from 'react';
import { View, Text } from 'react-native';
import { Calendar, Bell, BellOff } from 'lucide-react-native';
import { s } from './PrayerTimesStyles';
import { toAr, PRAYER_NAME_MAP } from './PrayerTimesConstants';
import { Card, StatNumber, Skeleton } from '../ui';
import { colors, icon } from '../../../shared/theme/tokens';
import { AsrIcon, DhuhrIcon, FajrIcon, IconComponent, IshaIcon, MaghribIcon, SunriseIcon } from '../icons/IslamicIcons';

const PRAYER_ICONS: Record<string, IconComponent> = {
  Fajr: FajrIcon, Sunrise: SunriseIcon, Dhuhr: DhuhrIcon, Asr: AsrIcon, Maghrib: MaghribIcon, Isha: IshaIcon,
};
import { useAccent } from '../../../shared/theme/useAccent';
import { formatCountdown } from '../../../shared/utils/format';

import { NextPrayerView } from '../../hooks/usePrayerTimes';
import { PrayerDate } from '../../store/slices/prayerSlice';

type NextPrayer = NextPrayerView | null;

export const PrayerCountdown = ({ nextPrayer, date }: { nextPrayer: NextPrayer; date?: PrayerDate }) => {
  const hijri = date?.hijri;
  const isTomorrow = !!nextPrayer && nextPrayer.remaining < 0;
  return (
    <Card padding={0}>
      <View style={s.hero}>
        <Text style={s.heroEyebrow}>الصلاة القادمة</Text>
        <Text style={s.heroName}>{nextPrayer?.arName ?? '—'}</Text>
        <StatNumber
          value={nextPrayer ? (isTomorrow ? 'غداً' : formatCountdown(nextPrayer.remaining)) : '—'}
          caption={nextPrayer ? `تبدأ ${toAr(nextPrayer.time)}` : undefined}
          size="display"
          align="start"
          color={colors.goldText}
        />
        {hijri ? (
          <View style={s.heroDateRow}>
            <Calendar size={icon.size.sm} color={colors.textMuted} strokeWidth={icon.stroke} />
            <Text style={s.heroDate}>{hijri.day} {hijri.month?.ar} {hijri.year} هـ</Text>
          </View>
        ) : null}
      </View>
    </Card>
  );
};

export const PrayerTimeRow = ({ name, time, isActive, notify }: { name: string; time: string; isActive: boolean; notify: boolean }) => {
  const accent = useAccent();
  const BellIcon = notify ? Bell : BellOff;
  const PrayerIcon = PRAYER_ICONS[name];
  return (
    <View style={[s.row, isActive && s.rowActive]} accessibilityLabel={`${PRAYER_NAME_MAP[name] || name} ${time}`}>
      <View style={s.rowRight}>
        {PrayerIcon ? (
          <View style={[s.prayerIcon, isActive && { backgroundColor: accent.accentSoft }]}>
            <PrayerIcon size={22} color={isActive ? accent.accent : colors.textMuted} />
          </View>
        ) : (
          <View style={[s.dot, isActive && { backgroundColor: accent.accent }]} />
        )}
        <Text style={[s.rowName, isActive && s.rowNameActive]}>{PRAYER_NAME_MAP[name] || name}</Text>
        {isActive ? <View style={s.nowPill}><Text style={s.nowPillText}>القادمة</Text></View> : null}
      </View>
      <View style={s.rowLeft}>
        <Text style={[s.rowTime, isActive && s.rowTimeActive]}>{toAr(time)}</Text>
        <BellIcon size={icon.size.sm} color={notify ? (isActive ? accent.accent : colors.textFaint) : colors.textFaint} strokeWidth={icon.stroke} />
      </View>
    </View>
  );
};

export const PrayerListSkeleton = () => (
  <View style={s.list}>
    {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={64} radius={20} />)}
  </View>
);

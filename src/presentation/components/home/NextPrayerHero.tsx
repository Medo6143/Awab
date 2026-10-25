import React from 'react';
import { ImageBackground, Text, TouchableOpacity, View } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { styles } from './HomeStyles';
import { StatNumber, ErrorState, EmptyState, Skeleton } from '../ui';
import { colors, icon } from '../../../shared/theme/tokens';
import { formatCountdown, toAr } from '../../../shared/utils/format';

type NextPrayer = { name: string; arName: string; time: string; remaining: number } | null;

type Props = {
  nextPrayer: NextPrayer;
  loading: boolean;
  error: boolean;
  hasLocation: boolean;
  onRetry: () => void;
  onPress?: () => void;
  onLocate?: () => void;
};

const bg = require('../../../../assets/images/mosque_bg.png');

/** The one hero element on Home: mosque image, big countdown, next prayer name + time. */
export const NextPrayerHero = ({ nextPrayer, loading, error, hasLocation, onRetry, onPress, onLocate }: Props) => {
  let body: React.ReactNode;

  if (!hasLocation && !loading) {
    body = (
      <View style={styles.heroStateWrap}>
        <EmptyState icon={MapPin} title="حدّد موقعك" message="نحتاج الموقع لحساب مواقيت الصلاة" action={onLocate ? { label: 'تفعيل الموقع', onPress: onLocate } : undefined} />
      </View>
    );
  } else if (error) {
    body = (
      <View style={styles.heroStateWrap}>
        <ErrorState compact message="تعذّر تحميل مواقيت الصلاة" onRetry={onRetry} />
      </View>
    );
  } else if (loading || !nextPrayer) {
    body = (
      <View style={styles.heroBody}>
        <View style={styles.heroTopRow}>
          <Skeleton width={110} height={14} />
          <Skeleton width={64} height={26} radius={999} />
        </View>
        <View style={styles.heroBottom}>
          <Skeleton width={160} height={44} />
          <Skeleton width={120} height={14} style={{ marginTop: 10 }} />
        </View>
      </View>
    );
  } else {
    const isTomorrow = nextPrayer.remaining < 0;
    body = (
      <View style={styles.heroBody}>
        <View style={styles.heroTopRow}>
          <Text style={styles.heroEyebrow}>الصلاة القادمة</Text>
          <View style={styles.heroTimePill}><Text style={styles.heroTimeText}>{toAr(nextPrayer.time)}</Text></View>
        </View>
        <View style={styles.heroBottom}>
          <Text style={styles.heroPrayerName}>{nextPrayer.arName}</Text>
          <StatNumber value={isTomorrow ? 'غداً' : formatCountdown(nextPrayer.remaining)} size="display" align="start" color={colors.goldText} />
          <Text style={styles.heroCaption}>{isTomorrow ? 'انتهت صلوات اليوم' : 'الوقت المتبقي'}</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.92} onPress={onPress} disabled={!onPress} accessibilityRole="button" accessibilityLabel="مواقيت الصلاة">
      <View style={styles.hero}>
        <ImageBackground source={bg} style={styles.heroImage} imageStyle={{ opacity: 0.35 }} resizeMode="cover" />
        <View style={styles.heroOverlay} />
        {body}
      </View>
    </TouchableOpacity>
  );
};

export const heroIconStroke = icon.stroke;

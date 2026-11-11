import React from 'react';
import { Alert, Linking, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, MapPin, Navigation2 } from 'lucide-react-native';
import { AppNavigation } from '../../navigation/types';
import { Mosque } from '../../../domain/services/Mosques';
import { useDependencies } from '../../providers/DependencyProvider';
import { Coordinates } from '../../../domain/entities/types';
import { bearingDeg, walkMinutes } from '../../../domain/services/geo';
import { useHeading } from '../../hooks/useLocation';
import { useNearbyMosques } from '../../hooks/useNearbyMosques';
import { PillButton, Skeleton } from '../ui';
import { toAr } from '../../../shared/utils/format';
import { colors, icon, radius, space, type, themed } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';

/** Opens a map link, and says so when the phone has nothing that can open it. */
export const openInMaps = (url: string) =>
  Linking.openURL(url).catch(() => Alert.alert('تعذّر فتح الخرائط', 'مفيش تطبيق خرائط أو متصفح يفتح الرابط ده.'));

/** «٣٥٠ متر» under a kilometre, «١٫٢ كم» above. */
export const distanceLabel = (m: number) => {
  const metres = Math.max(10, Math.round(m / 10) * 10); // round first: 997 m reads «١٫٠ كم», not «١٠٠٠ متر»
  return metres < 1000 ? `${toAr(metres)} متر` : `${toAr((m / 1000).toFixed(1)).replace('.', '٫')} كم`;
};

/** An arrow that points at the mosque as the phone turns (bearing minus the compass heading).
 *  With no compass reading (`heading` null) it shows a plain pin instead of a wrong direction. */
export const DirectionArrow = ({ from, to, heading, size = 56, strong }: { from: Coordinates; to: Coordinates; heading: number | null; size?: number; strong?: boolean }) => (
  <View style={[st.arrowRing, { width: size, height: size, borderRadius: size / 2 }, strong && st.arrowRingStrong]}>
    {heading == null ? (
      <MapPin size={size * 0.42} color={strong ? colors.gold : colors.textMuted} strokeWidth={icon.stroke} />
    ) : (
      <View style={{ transform: [{ rotate: `${bearingDeg(from, to) - heading}deg` }] }}>
        <Navigation2 size={size * 0.46} color={strong ? colors.gold : colors.textMuted} fill={strong ? colors.gold : 'transparent'} strokeWidth={icon.stroke} />
      </View>
    )}
  </View>
);

/**
 * «أقرب مسجد» on the prayer screen: the nearest mosque from OpenStreetMap, how far it is on
 * foot, an arrow toward it, walking directions, and the full list.
 */
export const NearestMosqueCard = ({ coords }: { coords: Coordinates | null }) => {
  const navigation = useNavigation<AppNavigation>();
  const accent = useAccent();
  const { mosques: finder } = useDependencies();
  // the position comes from the prayer screen's own lookup; only the compass is watched here
  const { heading: rawHeading, hasHeading } = useHeading();
  const heading = hasHeading ? rawHeading : null;
  const { mosques, error, loading, retry } = useNearbyMosques(coords);
  if (!coords) return null; // no location: the prayer screen already asks for it

  const head = <Text style={st.label}>أقرب مسجد</Text>;
  if (loading && !mosques) return <View style={st.card}>{head}<Skeleton height={22} width="60%" style={{ marginTop: space[2] }} /><Skeleton height={14} width="40%" style={{ marginTop: space[2] }} /></View>;
  if (error) {
    return (
      <View style={st.card}>
        {head}
        <Text style={st.sub}>تعذّر البحث عن المساجد. تأكد من الإنترنت.</Text>
        <PillButton label="حاول تاني" size="sm" variant="ghost" onPress={retry} style={{ alignSelf: 'flex-start', marginTop: space[2] }} />
      </View>
    );
  }
  const near = mosques?.[0];
  if (!near) {
    return (
      <TouchableOpacity style={st.card} activeOpacity={0.85} onPress={() => navigation.navigate('المساجد')} accessibilityRole="button">
        {head}
        <Text style={st.sub}>مفيش مساجد متسجلة قريب منك. دوّر في الخرائط</Text>
      </TouchableOpacity>
    );
  }
  return (
    <View style={[st.card, st.cardStrong]}>
      <View style={st.row}>
        <View style={{ flex: 1 }}>
          {head}
          <Text style={st.name} numberOfLines={1}>{near.name}</Text>
          <Text style={st.meta}>{distanceLabel(near.meters)} · {toAr(walkMinutes(near.meters))} دقايق مشي</Text>
        </View>
        <DirectionArrow from={coords} to={near.coords} heading={heading} strong />
      </View>
      <View style={[st.row, { marginTop: space[3] }]}>
        <PillButton label="وديني" size="sm" icon={<MapPin size={icon.size.sm} color={accent.onAccent} strokeWidth={icon.stroke} />} onPress={() => openInMaps(finder.walkingDirectionsUrl(near))} style={{ flex: 1 }} />
        <PillButton label="كل المساجد" size="sm" variant="ghost" onPress={() => navigation.navigate('المساجد')} style={{ flex: 1 }} />
      </View>
    </View>
  );
};

/** One mosque in the full list. */
export const MosqueRow = ({ mosque, from, heading, first, onPress }: { mosque: Mosque; from: Coordinates; heading: number | null; first?: boolean; onPress: () => void }) => (
  <TouchableOpacity style={[st.item, first && st.cardStrong]} activeOpacity={0.8} onPress={onPress} accessibilityRole="button"
    accessibilityLabel={`${mosque.name}، ${distanceLabel(mosque.meters)}`}>
    <View style={{ flex: 1 }}>
      <Text style={st.itemName} numberOfLines={1}>{mosque.name}</Text>
      <Text style={first ? st.meta : st.sub}>{distanceLabel(mosque.meters)} · {toAr(walkMinutes(mosque.meters))} د مشي</Text>
    </View>
    <DirectionArrow from={from} to={mosque.coords} heading={heading} size={40} strong={first} />
    <ChevronLeft size={icon.size.sm} color={colors.textFaint} strokeWidth={icon.stroke} />
  </TouchableOpacity>
);

const st = themed(() => ({
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radius.card, padding: space[4], marginTop: space[3] },
  cardStrong: { backgroundColor: colors.surfaceRaised, borderColor: colors.goldLine },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  label: { ...type.caption, color: colors.textMuted },
  name: { ...type.h2, color: colors.text, marginTop: 2 },
  meta: { ...type.caption, color: colors.goldText, marginTop: 2 },
  sub: { ...type.caption, color: colors.textMuted, marginTop: 4 },
  arrowRing: { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.cardBorder },
  arrowRingStrong: { borderColor: colors.goldLine, backgroundColor: colors.goldSoft },
  item: { flexDirection: 'row', alignItems: 'center', gap: space[3], backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder,
    borderRadius: radius.card, paddingHorizontal: space[4], paddingVertical: space[3], marginBottom: space[2] },
  itemName: { ...type.bodyMedium, color: colors.text },
}));

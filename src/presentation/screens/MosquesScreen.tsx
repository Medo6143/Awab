import React from 'react';
import { Text, View } from 'react-native';
import { MapPin, RefreshCw, Search } from 'lucide-react-native';
import { ScreenProps } from '../navigation/types';
import { EmptyState, ErrorState, IconButton, PillButton, Screen, ScreenHeader, Skeleton } from '../components/ui';
import { MosqueRow, openInMaps } from '../components/prayer/MosqueParts';
import { useLocation } from '../hooks/useLocation';
import { useNearbyMosques } from '../hooks/useNearbyMosques';
import { useDependencies } from '../providers/DependencyProvider';
import { MOSQUE_RADIUS_M } from '../../domain/services/Mosques';
import { toAr } from '../../shared/utils/format';
import { colors, icon, space, type, themed } from '../../shared/theme/tokens';

const SHOWN = 10;

/** The mosques within 3 km, nearest first; tapping one opens walking directions. */
const MosquesScreen = ({ navigation }: Pick<ScreenProps, 'navigation'>) => {
  const { coords, heading: rawHeading, hasHeading, error: locationError } = useLocation();
  const heading = hasHeading ? rawHeading : null;
  const { mosques, error, loading, retry } = useNearbyMosques(coords);
  const { mosques: finder } = useDependencies();

  let body: React.ReactNode;
  if (!coords && locationError) body = <EmptyState icon={MapPin} title="حدّد موقعك" message="نحتاج الموقع عشان نلاقي المساجد اللي حواليك" />;
  else if (error) body = <ErrorState message="تعذّر البحث عن المساجد. تأكد من الاتصال بالإنترنت." onRetry={retry} />;
  else if (!coords || (loading && !mosques)) body = <View style={{ gap: space[2] }}>{[0, 1, 2, 3].map((k) => <Skeleton key={k} height={64} radius={20} />)}</View>;
  else body = (
    <>
      {mosques?.length ? mosques.slice(0, SHOWN).map((m, i) => <MosqueRow key={m.id} mosque={m} from={coords} heading={heading} first={i === 0} onPress={() => openInMaps(finder.walkingDirectionsUrl(m))} />)
        : <Text style={st.note}>مفيش مساجد متسجلة في حدود {toAr(MOSQUE_RADIUS_M / 1000)} كيلو منك.</Text>}
      <Text style={st.note}>المساجد من OpenStreetMap، وممكن يكون فيه مساجد أو زوايا مش متسجلة.</Text>
      <PillButton label="دوّر في خرائط جوجل" variant="ghost" icon={<Search size={icon.size.sm} color={colors.goldText} strokeWidth={icon.stroke} />}
        onPress={() => openInMaps(finder.mapSearchUrl(coords))} style={{ marginTop: space[2] }} />
    </>
  );

  return (
    <Screen scroll header={
      <ScreenHeader title="أقرب المساجد" onBack={() => navigation.goBack()}
        right={coords ? <IconButton onPress={retry} label="تحديث"><RefreshCw size={icon.size.md} color={colors.textMuted} strokeWidth={icon.stroke} /></IconButton> : null} />
    }>
      {body}
    </Screen>
  );
};

const st = themed(() => ({
  note: { ...type.caption, color: colors.textMuted, textAlign: 'center', marginTop: space[3] },
}));

export default MosquesScreen;

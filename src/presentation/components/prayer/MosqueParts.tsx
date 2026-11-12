import React from 'react';
import { Alert, Linking, Text, TouchableOpacity, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { MosqueIcon } from '../icons/IslamicIcons';
import { IconTile } from '../ui';
import { Coordinates } from '../../../domain/entities/types';
import { mosqueSearchUrl } from '../../../domain/services/Mosques';
import { colors, icon, radius, space, type, themed } from '../../../shared/theme/tokens';

/** Opens Google Maps on the mosques around `at` (or around the phone when unknown). */
export const openMosquesNearby = (at?: Coordinates | null) =>
  Linking.openURL(mosqueSearchUrl(at)).catch(() =>
    Alert.alert('تعذّر فتح الخرائط', 'مفيش تطبيق خرائط أو متصفح يفتح الرابط ده.'));

/** «أقرب مسجد» on the prayer screen: one tap opens Google Maps on the mosques around you. */
export const NearestMosqueCard = ({ coords }: { coords: Coordinates | null }) => (
  <TouchableOpacity
    style={st.card}
    activeOpacity={0.85}
    onPress={() => openMosquesNearby(coords)}
    accessibilityRole="button"
    accessibilityLabel="أقرب مسجد، يفتح خرائط جوجل"
  >
    <IconTile icon={MosqueIcon} />
    <View style={{ flex: 1 }}>
      <Text style={st.title}>أقرب مسجد</Text>
      <Text style={st.sub}>افتح خرائط جوجل على المساجد اللي حواليك</Text>
    </View>
    <ChevronLeft size={icon.size.md} color={colors.textFaint} strokeWidth={icon.stroke} />
  </TouchableOpacity>
);

const st = themed(() => ({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: space[3],
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radius.card,
    padding: space[4], marginTop: space[3],
  },
  title: { ...type.bodyMedium, color: colors.text },
  sub: { ...type.caption, color: colors.textMuted, marginTop: 2 },
}));

import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, themed } from '../../../shared/theme/tokens';
import { useShareCardSize } from './ImageShareModal';
import { layoutAyahCard } from './ayahCardLayout';
import { useShareTextMax } from './storyThemes';

const LOGO = require('../../../../assets/icon.png');

/** 9:16 story card for a dua: brand, the dua in Amiri, its source. */
export const DuaShareCard = ({ text, source }: { text: string; source: string }) => {
  const { w, h } = useShareCardSize();
  const maxU = useShareTextMax('classic');
  const u = w / 100;
  const body = text.trim();
  const { ayahSize } = layoutAyahCard(body.length, 0, w, h, maxU);

  return (
    <View style={[st.card, { width: w, height: h, padding: 7 * u }]}>
      <View style={[st.frame, { top: 3.5 * u, left: 3.5 * u, right: 3.5 * u, bottom: 3.5 * u, borderRadius: 4 * u }]} />

      <View style={[st.brand, { gap: 2.4 * u }]}>
        <Image source={LOGO} style={{ width: 11 * u, height: 11 * u, borderRadius: 2.6 * u }} />
        <View>
          <Text allowFontScaling={false} style={[st.brandName, { fontSize: 5 * u }]}>أوّاب</Text>
          <Text allowFontScaling={false} style={[st.brandSub, { fontSize: 2.8 * u }]}>رفيقك اليومي مع القرآن</Text>
        </View>
      </View>

      <View style={st.middle}>
        <Text allowFontScaling={false} style={[st.label, { fontSize: 4.2 * u, marginBottom: 4 * u }]}>دعاء</Text>
        <Text allowFontScaling={false} style={[st.body, { fontSize: ayahSize, lineHeight: ayahSize * 1.9 }]}>{body}</Text>
        {source ? <Text allowFontScaling={false} style={[st.source, { fontSize: 3.6 * u, marginTop: 4 * u }]}>{source}</Text> : null}
      </View>

      <Text allowFontScaling={false} style={[st.footer, { fontSize: 3 * u }]}>شاركها من تطبيق أوّاب</Text>
    </View>
  );
};

const st = themed(() => ({
  card: { backgroundColor: colors.bg, justifyContent: 'space-between', direction: 'rtl' },
  frame: { position: 'absolute', borderWidth: 1.2, borderColor: colors.goldLine },
  brand: { flexDirection: 'row', alignItems: 'center' },
  brandName: { fontFamily: 'Tajawal_800ExtraBold', color: colors.gold },
  brandSub: { fontFamily: 'Tajawal_500Medium', color: colors.textMuted },
  middle: { flex: 1, justifyContent: 'center', overflow: 'hidden' },
  label: { fontFamily: 'Tajawal_700Bold', color: colors.gold, textAlign: 'center' },
  body: { fontFamily: 'Amiri_700Bold', color: colors.text, textAlign: 'center' },
  source: { fontFamily: 'Tajawal_500Medium', color: colors.textMuted, textAlign: 'center' },
  footer: { fontFamily: 'Tajawal_500Medium', color: colors.textFaint, textAlign: 'center' },
}));

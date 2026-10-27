import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { toAr } from '../../../shared/utils/format';
import { colors } from '../../../shared/theme/tokens';
import { useShareCardSize } from './ImageShareModal';
import { layoutAyahCard } from './ayahCardLayout';
import { useShareTextMax } from './storyThemes';

const LOGO = require('../../../../assets/icon.png');

type Props = { ayahText: string; surahName: string; ayahNumber: number; tafsirName?: string; tafsirExcerpt?: string };

/**
 * 9:16 story card: brand on top, the ayah in Amiri, then a short tafsir excerpt when it
 * fits. Everything is sized from the card width (u = 1% of it) so it lays out the same
 * on every screen density.
 */
export const AyahShareCard = ({ ayahText, surahName, ayahNumber, tafsirName, tafsirExcerpt }: Props) => {
  const { w, h } = useShareCardSize();
  const maxU = useShareTextMax('classic');
  const u = w / 100;
  const text = ayahText.trim();
  const { ayahSize, showTafsir, exSize } = layoutAyahCard(text.length, tafsirExcerpt?.length ?? 0, w, h, maxU);

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
        <Text allowFontScaling={false} style={[st.surah, { fontSize: 4.2 * u, marginBottom: 4 * u }]}>{surahName} · الآية {toAr(ayahNumber)}</Text>
        <Text allowFontScaling={false} style={[st.ayah, { fontSize: ayahSize, lineHeight: ayahSize * 1.9 }]}>
          ﴿ {text} ﴾
        </Text>

        {showTafsir && tafsirExcerpt ? (
          <View style={[st.tafsirBox, { marginTop: 6 * u, padding: 4.4 * u, borderRadius: 3.6 * u }]}>
            <Text allowFontScaling={false} style={[st.tafsirLabel, { fontSize: 3.2 * u, marginBottom: 1.6 * u }]}>{tafsirName || 'التفسير'}</Text>
            <Text allowFontScaling={false} style={[st.tafsirText, { fontSize: exSize, lineHeight: exSize * 1.75 }]}>{tafsirExcerpt}</Text>
          </View>
        ) : null}
      </View>

      <Text allowFontScaling={false} style={[st.footer, { fontSize: 3 * u }]}>شاركها من تطبيق أوّاب</Text>
    </View>
  );
};

const st = StyleSheet.create({
  // explicit: the share preview wraps cards in an LTR container for positioning
  card: { backgroundColor: colors.bg, justifyContent: 'space-between', direction: 'rtl' },
  frame: { position: 'absolute', borderWidth: 1.2, borderColor: colors.goldLine },
  brand: { flexDirection: 'row', alignItems: 'center' },
  brandName: { fontFamily: 'Tajawal_800ExtraBold', color: colors.gold },
  brandSub: { fontFamily: 'Tajawal_500Medium', color: colors.textMuted },
  middle: { flex: 1, justifyContent: 'center', overflow: 'hidden' },
  surah: { fontFamily: 'Tajawal_700Bold', color: colors.gold, textAlign: 'center' },
  ayah: { fontFamily: 'Amiri_700Bold', color: colors.text, textAlign: 'center' },
  tafsirBox: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.goldLineSoft },
  tafsirLabel: { fontFamily: 'Tajawal_700Bold', color: colors.gold },
  tafsirText: { fontFamily: 'Tajawal_400Regular', color: colors.textSoft, textAlign: 'justify' },
  footer: { fontFamily: 'Tajawal_500Medium', color: colors.textFaint, textAlign: 'center' },
});

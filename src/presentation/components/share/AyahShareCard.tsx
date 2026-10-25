import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { toAr } from '../../../shared/utils/format';
import { shareCardSize } from './ImageShareModal';

const LOGO = require('../../../../assets/icon.png');

type Props = { ayahText: string; surahName: string; ayahNumber: number; tafsirName?: string; tafsirExcerpt?: string };

/**
 * 9:16 story card: brand on top, the ayah in Amiri, then a short tafsir excerpt.
 * Everything is sized from the card width (u = 1% of it) so it lays out the same on
 * every screen density.
 */
export const AyahShareCard = ({ ayahText, surahName, ayahNumber, tafsirName, tafsirExcerpt }: Props) => {
  const { w, h } = shareCardSize();
  const u = w / 100;
  const len = ayahText.length;
  const ayahSize = (len > 420 ? 4.6 : len > 260 ? 5.4 : len > 150 ? 6.4 : len > 80 ? 7.4 : 8.4) * u;
  const exLen = tafsirExcerpt?.length ?? 0;
  const exSize = (exLen > 260 ? 3.5 : 3.9) * u;

  return (
    <View style={[st.card, { width: w, height: h, padding: 7 * u }]}>
      <View style={[st.frame, { top: 3.5 * u, left: 3.5 * u, right: 3.5 * u, bottom: 3.5 * u, borderRadius: 4 * u }]} />

      <View style={[st.brand, { gap: 2.4 * u }]}>
        <Image source={LOGO} style={{ width: 11 * u, height: 11 * u, borderRadius: 2.6 * u }} />
        <View>
          <Text style={[st.brandName, { fontSize: 5 * u }]}>أوّاب</Text>
          <Text style={[st.brandSub, { fontSize: 2.8 * u }]}>رفيقك اليومي مع القرآن</Text>
        </View>
      </View>

      <View style={st.middle}>
        <Text style={[st.surah, { fontSize: 4.2 * u, marginBottom: 4 * u }]}>{surahName} · الآية {toAr(ayahNumber)}</Text>
        <Text style={[st.ayah, { fontSize: ayahSize, lineHeight: ayahSize * 1.9 }]}>
          ﴿ {ayahText.trim()} ﴾
        </Text>

        {tafsirExcerpt ? (
          <View style={[st.tafsirBox, { marginTop: 6 * u, padding: 4.4 * u, borderRadius: 3.6 * u }]}>
            <Text style={[st.tafsirLabel, { fontSize: 3.2 * u, marginBottom: 1.6 * u }]}>{tafsirName || 'التفسير'}</Text>
            <Text style={[st.tafsirText, { fontSize: exSize, lineHeight: exSize * 1.75 }]}>{tafsirExcerpt}</Text>
          </View>
        ) : null}
      </View>

      <Text style={[st.footer, { fontSize: 3 * u }]}>شاركها من تطبيق أوّاب</Text>
    </View>
  );
};

const GOLD = '#d4af37';
const st = StyleSheet.create({
  card: { backgroundColor: '#0e0a07', justifyContent: 'space-between' },
  frame: { position: 'absolute', borderWidth: 1.2, borderColor: 'rgba(212,175,55,0.45)' },
  brand: { flexDirection: 'row', alignItems: 'center' },
  brandName: { fontFamily: 'Tajawal_800ExtraBold', color: GOLD },
  brandSub: { fontFamily: 'Tajawal_500Medium', color: '#a89f93' },
  middle: { flex: 1, justifyContent: 'center' },
  surah: { fontFamily: 'Tajawal_700Bold', color: GOLD, textAlign: 'center' },
  ayah: { fontFamily: 'Amiri_700Bold', color: '#f5efe6', textAlign: 'center' },
  tafsirBox: { backgroundColor: '#1a140f', borderWidth: 1, borderColor: 'rgba(212,175,55,0.22)' },
  tafsirLabel: { fontFamily: 'Tajawal_700Bold', color: GOLD },
  tafsirText: { fontFamily: 'Tajawal_400Regular', color: '#d9d0c3', textAlign: 'justify' },
  footer: { fontFamily: 'Tajawal_500Medium', color: '#6b6259', textAlign: 'center' },
});

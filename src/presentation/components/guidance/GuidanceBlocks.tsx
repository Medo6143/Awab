import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronLeft, Share2 } from 'lucide-react-native';
import type { IconComponent } from '../icons/IslamicIcons';
import type { Hadith, Supplication, VerseRef } from '../../../domain/entities/guidance';
import { SURAH_NAMES } from '../../../shared/constants/surahs';
import { toAr } from '../../../shared/utils/format';
import { colors, radius, space, type } from '../../../shared/theme/tokens';
import { useVerseTafsir, useVerseText } from '../../hooks/useGuidance';

export const verseLabel = (r: VerseRef) =>
  `سورة ${SURAH_NAMES[r.surah - 1]} · ${toAr(r.from)}${r.to && r.to !== r.from ? `–${toAr(r.to)}` : ''}`;

/** "بِسْمِ… ﴿١﴾ … ﴿٢﴾": the verses joined with their numbers, as in the mushaf. */
const joinVerses = (texts: string[], from: number) =>
  texts.map((t, i) => `${t} ﴿${toAr(from + i)}﴾`).join(' ');

/** Tappable card at the top of a list that opens a virtues page. */
export const VirtueBanner = ({ title, sub, icon: Icon, onPress }: { title: string; sub: string; icon: IconComponent; onPress: () => void }) => (
  <TouchableOpacity style={st.banner} onPress={onPress} accessibilityRole="button" accessibilityLabel={title} activeOpacity={0.85}>
    <View style={st.bannerIcon}><Icon size={22} color={colors.gold} /></View>
    <View style={{ flex: 1 }}>
      <Text style={st.bannerTitle}>{title}</Text>
      <Text style={st.bannerSub} numberOfLines={2}>{sub}</Text>
    </View>
    <ChevronLeft size={18} color={colors.textFaint} />
  </TouchableOpacity>
);

export const SectionHeading = ({ title, sub }: { title: string; sub?: string }) => (
  <View style={st.heading}>
    <View style={st.headingBar} />
    <View style={{ flex: 1 }}>
      <Text style={st.headingTitle}>{title}</Text>
      {sub ? <Text style={st.headingSub}>{sub}</Text> : null}
    </View>
  </View>
);

/** A verse from its reference, with al-Sa'di's tafsir underneath when asked. */
export const VerseCard = ({ verse, withTafsir, onShare }: { verse: VerseRef; withTafsir?: boolean; onShare?: (p: { text: string; excerpt: string }) => void }) => {
  const { texts, offline, loading } = useVerseText(verse);
  const tafsir = useVerseTafsir(verse, !!withTafsir);
  const [more, setMore] = useState(false);
  const text = joinVerses(texts, verse.from);

  return (
    <View style={st.verseCard}>
      {loading ? <ActivityIndicator color={colors.gold} /> : (
        <Text style={st.verseText}>{text}</Text>
      )}
      <Text style={st.verseRef}>{verseLabel(verse)}{offline ? ' · نص بدون تشكيل (لا يوجد اتصال)' : ''}</Text>

      {withTafsir ? (
        <View style={st.tafsirBox}>
          <Text style={st.tafsirName}>تفسير السعدي</Text>
          {tafsir.loading ? <ActivityIndicator size="small" color={colors.gold} /> : tafsir.error ? (
            <Text style={st.tafsirText}>تعذّر تحميل التفسير. تأكد من الاتصال بالإنترنت.</Text>
          ) : (
            <>
              <Text style={st.tafsirText}>{more ? tafsir.full : tafsir.excerpt}</Text>
              {tafsir.full.length > tafsir.excerpt.length + 10 ? (
                <TouchableOpacity onPress={() => setMore((m) => !m)} accessibilityRole="button" hitSlop={8}>
                  <Text style={st.more}>{more ? 'عرض أقل' : 'اقرأ المزيد'}</Text>
                </TouchableOpacity>
              ) : null}
            </>
          )}
        </View>
      ) : null}

      {onShare && texts.length ? (
        <TouchableOpacity style={st.shareBtn} onPress={() => onShare({ text: texts.join(' '), excerpt: tafsir.excerpt })} accessibilityRole="button">
          <Share2 size={16} color={colors.gold} />
          <Text style={st.more}>مشاركة كصورة</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export const HadithCard = ({ hadith }: { hadith: Hadith }) => (
  <View style={st.hadithCard}>
    <Text style={st.hadithLead}>{hadith.lead ?? 'قال رسول الله ﷺ'}</Text>
    <Text style={st.hadithText}>{hadith.text}</Text>
    <Text style={st.hadithSource}>{hadith.source}</Text>
  </View>
);

export const SupplicationCard = ({ dua, title = 'دعاء' }: { dua: Supplication; title?: string }) => (
  <View style={st.duaCard}>
    <Text style={st.duaTitle}>{title}</Text>
    <Text style={st.duaText}>{dua.text}</Text>
    <Text style={st.hadithSource}>{dua.source}</Text>
  </View>
);

const st = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: space[3], backgroundColor: colors.goldSoft, borderRadius: radius.card, padding: space[4], marginBottom: space[3] },
  bannerIcon: { width: 44, height: 44, borderRadius: radius.tile, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  bannerTitle: { ...type.bodyMedium, fontFamily: 'Tajawal_700Bold', color: colors.text },
  bannerSub: { ...type.caption, color: colors.textMuted, marginTop: 2 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: space[3], marginTop: space[6], marginBottom: space[3] },
  headingBar: { width: 4, height: 22, borderRadius: 2, backgroundColor: colors.gold },
  headingTitle: { ...type.h2, color: colors.text },
  headingSub: { ...type.caption, color: colors.textMuted, marginTop: 2 },

  verseCard: { backgroundColor: colors.surface, borderRadius: radius.card, padding: space[4], marginBottom: space[3], borderWidth: 1, borderColor: colors.goldLineSoft },
  verseText: { fontFamily: 'Amiri_700Bold', fontSize: 21, lineHeight: 42, color: colors.text, textAlign: 'center' },
  verseRef: { ...type.caption, color: colors.gold, textAlign: 'center', marginTop: space[2] },
  tafsirBox: { marginTop: space[4], paddingTop: space[3], borderTopWidth: 1, borderTopColor: colors.goldLineSoft },
  tafsirName: { ...type.label, color: colors.gold, marginBottom: space[1] },
  tafsirText: { ...type.body, color: colors.textSoft, lineHeight: 26 },
  more: { ...type.label, color: colors.gold, marginTop: space[2] },
  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2], marginTop: space[2] },

  hadithCard: { backgroundColor: colors.surface, borderRadius: radius.card, padding: space[4], marginBottom: space[3], borderStartWidth: 3, borderStartColor: colors.gold },
  hadithLead: { ...type.caption, color: colors.gold, marginBottom: space[1] },
  hadithText: { fontFamily: 'Amiri_400Regular', fontSize: 18, lineHeight: 34, color: colors.text },
  hadithSource: { ...type.caption, color: colors.textMuted, marginTop: space[2] },

  duaCard: { backgroundColor: colors.goldSoft, borderRadius: radius.card, padding: space[4], marginBottom: space[3] },
  duaTitle: { ...type.label, color: colors.gold, marginBottom: space[1] },
  duaText: { fontFamily: 'Amiri_700Bold', fontSize: 19, lineHeight: 36, color: colors.text, textAlign: 'center' },
});

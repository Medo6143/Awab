import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { Card, SectionTitle } from '../ui';
import { QURAN_MESSAGES } from '../../../domain/entities/quranMessages';
import type { HadithIndexEntry } from '../../../domain/entities/hadith';
import { hadithOfTheDay } from '../../../data/hadith/hadithLibrary';
import { useVerseText } from '../../hooks/useGuidance';
import { verseLabel } from '../guidance/GuidanceBlocks';
import { colors, radius, space, type } from '../../../shared/theme/tokens';

const dayNumber = () => {
  const d = new Date();
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
};

/**
 * "رسالة اليوم" on home: a verse from one of the Quran messages (a different state and
 * verse each day, text from the mushaf source) and the hadith of the day.
 */
export const DailyMessageCard = ({ onOpenMessage, onOpenHadith }: { onOpenMessage: (mood: string) => void; onOpenHadith: (id: number) => void }) => {
  const day = dayNumber();
  const mood = QURAN_MESSAGES[day % QURAN_MESSAGES.length];
  const verse = mood.verses[Math.floor(day / QURAN_MESSAGES.length) % mood.verses.length];
  const { texts, loading } = useVerseText(verse);
  const [hadith, setHadith] = useState<HadithIndexEntry | null>(null);

  // the hadith index is ~2 MB: build it after the home screen has painted
  useEffect(() => {
    const t = setTimeout(() => setHadith(hadithOfTheDay()), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <View>
      <SectionTitle title="رسالة اليوم" />
      <Card padding={5}>
        <TouchableOpacity onPress={() => onOpenMessage(mood.id)} activeOpacity={0.85} accessibilityRole="button">
          <View style={st.tag}><Text style={st.tagText}>{mood.name}</Text></View>
          {loading ? <ActivityIndicator color={colors.gold} /> : <Text style={st.verse} numberOfLines={5}>﴿ {texts.join(' ')} ﴾</Text>}
          <Text style={st.ref}>{verseLabel(verse)}</Text>
          <View style={st.more}><Text style={st.moreText}>اقرأ الرسالة كاملة</Text><ChevronLeft size={14} color={colors.gold} /></View>
        </TouchableOpacity>

        {hadith ? (
          <TouchableOpacity style={st.hadith} onPress={() => onOpenHadith(hadith.id)} activeOpacity={0.85} accessibilityRole="button">
            <Text style={st.hadithLabel}>حديث اليوم · {hadith.grade}</Text>
            <Text style={st.hadithText} numberOfLines={3}>«{hadith.title}»</Text>
          </TouchableOpacity>
        ) : null}
      </Card>
    </View>
  );
};

const st = StyleSheet.create({
  tag: { alignSelf: 'flex-start', backgroundColor: colors.goldSoft, borderRadius: radius.pill, paddingHorizontal: space[3], paddingVertical: 3, marginBottom: space[3] },
  tagText: { ...type.caption, color: colors.gold },
  verse: { fontFamily: 'Amiri_700Bold', fontSize: 20, lineHeight: 38, color: colors.text, textAlign: 'center' },
  ref: { ...type.caption, color: colors.gold, textAlign: 'center', marginTop: space[2] },
  more: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: space[3] },
  moreText: { ...type.label, color: colors.gold },
  hadith: { marginTop: space[4], paddingTop: space[4], borderTopWidth: 1, borderTopColor: colors.hairline },
  hadithLabel: { ...type.label, color: colors.gold },
  hadithText: { fontFamily: 'Amiri_400Regular', fontSize: 17, lineHeight: 32, color: colors.textSoft, marginTop: space[1] },
});

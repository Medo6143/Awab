import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, RefreshCw, Shuffle } from 'lucide-react-native';
import { Card, SectionTitle } from '../ui';
import { QURAN_MESSAGES } from '../../../domain/entities/quranMessages';
import type { HadithIndexEntry } from '../../../domain/entities/hadith';
import { randomHadith } from '../../../data/hadith/hadithLibrary';
import { useVerseText } from '../../hooks/useGuidance';
import { verseLabel } from '../guidance/GuidanceBlocks';
import { colors, radius, space, type } from '../../../shared/theme/tokens';

/** Every (state, verse) pair across the Quran messages, as [moodIndex, verseIndex]. */
const ALL_VERSES = QURAN_MESSAGES.flatMap((m, i) => m.verses.map((_, j) => [i, j] as const));

/**
 * "رسالة لك" on home: a verse from one of the Quran messages (text from the mushaf source)
 * and a hadith, drawn at random each time the app opens; "رسالة تانية", "آية تانية" and "حديث تاني" draw
 * new ones at random, as many times as the reader likes.
 */
export const DailyMessageCard = ({ onOpenMessage, onOpenHadith }: { onOpenMessage: (mood: string) => void; onOpenHadith: (id: number) => void }) => {
  // a fresh verse every time the app opens, not the same one all day
  const [pick, setPick] = useState<readonly [number, number]>(() => ALL_VERSES[Math.floor(Math.random() * ALL_VERSES.length)]);
  const mood = QURAN_MESSAGES[pick[0]];
  const verse = mood.verses[pick[1]];
  const { texts, loading } = useVerseText(verse);
  const [hadith, setHadith] = useState<HadithIndexEntry | null>(null);

  // the hadith index is ~2 MB: build it after the home screen has painted
  useEffect(() => {
    const t = setTimeout(() => setHadith(randomHadith()), 600);
    return () => clearTimeout(t);
  }, []);

  const otherVerse = () => {
    let next = pick;
    while (ALL_VERSES.length > 1 && next[0] === pick[0] && next[1] === pick[1]) next = ALL_VERSES[Math.floor(Math.random() * ALL_VERSES.length)];
    setPick(next);
  };
  const otherHadith = () => setHadith(randomHadith(hadith?.id));
  const shuffle = () => { Haptics.selectionAsync(); otherVerse(); otherHadith(); };

  return (
    <View>
      <SectionTitle title="رسالة لك" />
      <Card padding={5}>
        <TouchableOpacity onPress={() => onOpenMessage(mood.id)} activeOpacity={0.85} accessibilityRole="button">
          <View style={st.tag}><Text style={st.tagText}>{mood.name}</Text></View>
          {loading ? <ActivityIndicator color={colors.gold} /> : <Text style={st.verse} numberOfLines={5}>﴿ {texts.join(' ')} ﴾</Text>}
          <Text style={st.ref}>{verseLabel(verse)}</Text>
          <View style={st.more}><Text style={st.moreText}>اقرأ الرسالة كاملة</Text><ChevronLeft size={14} color={colors.gold} /></View>
        </TouchableOpacity>

        {hadith ? (
          <TouchableOpacity style={st.hadith} onPress={() => onOpenHadith(hadith.id)} activeOpacity={0.85} accessibilityRole="button">
            <Text style={st.hadithLabel}>حديث · {hadith.grade}</Text>
            <Text style={st.hadithText} numberOfLines={3}>«{hadith.title}»</Text>
          </TouchableOpacity>
        ) : null}

        <View style={st.actions}>
          <TouchableOpacity style={st.main} onPress={shuffle} accessibilityRole="button" activeOpacity={0.85}>
            <Shuffle size={16} color={colors.onGold} /><Text style={st.mainText}>رسالة تانية</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.small} onPress={() => { Haptics.selectionAsync(); otherVerse(); }} accessibilityRole="button">
            <RefreshCw size={14} color={colors.goldText} /><Text style={st.smallText}>آية</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.small} onPress={() => { Haptics.selectionAsync(); otherHadith(); }} accessibilityRole="button">
            <RefreshCw size={14} color={colors.goldText} /><Text style={st.smallText}>حديث</Text>
          </TouchableOpacity>
        </View>
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
  actions: { flexDirection: 'row', gap: space[2], marginTop: space[4] },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: radius.pill, backgroundColor: colors.gold },
  mainText: { ...type.label, color: colors.onGold },
  small: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 40, paddingHorizontal: space[3], borderRadius: radius.pill, backgroundColor: colors.goldSoft },
  smallText: { ...type.label, color: colors.goldText },
});

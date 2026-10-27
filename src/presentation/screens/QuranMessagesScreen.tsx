import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { ScreenProps } from '../navigation/types';
import { Screen, ScreenHeader } from '../components/ui';
import { HadithCard, SectionHeading, SupplicationCard, VerseCard } from '../components/guidance/GuidanceBlocks';
import { ImageShareModal } from '../components/share/ImageShareModal';
import { AyahShare } from '../components/share/StoryCard';
import { ShareStylePicker } from '../components/share/ShareStylePicker';
import { QURAN_MESSAGES, QuranMessage } from '../../domain/entities/quranMessages';
import { SURAH_NAMES } from '../../shared/constants/surahs';
import { toAr } from '../../shared/utils/format';
import { colors, icon, radius, space, type } from '../../shared/theme/tokens';

type Shared = { text: string; excerpt: string; surah: number; ayah: number };

/**
 * "رسائل من القرآن": the user picks what they are going through, then reads a gentle
 * word, a verse with al-Sa'di's tafsir (another verse on demand), authentic hadiths,
 * a supplication and practical advice for that state.
 */
const QuranMessagesScreen = ({ navigation }: Pick<ScreenProps, 'navigation'>) => {
  const [mood, setMood] = useState<QuranMessage | null>(null);
  const [verseIdx, setVerseIdx] = useState(0);
  const [shared, setShared] = useState<Shared | null>(null);

  const open = (m: QuranMessage) => { setMood(m); setVerseIdx(0); };

  if (!mood) {
    return (
      <Screen scroll header={<ScreenHeader title="رسائل من القرآن" subtitle="بماذا تشعر الآن؟" onBack={() => navigation.goBack()} />}>
        <Text style={st.lead}>اختر ما تمرّ به، وستجد رسالة من كتاب الله وسنّة نبيه ﷺ تواسيك وتعينك.</Text>
        <View style={st.grid}>
          {QURAN_MESSAGES.map((m) => {
            const Icon = m.icon;
            return (
              <TouchableOpacity key={m.id} style={st.moodCard} onPress={() => open(m)} accessibilityRole="button" accessibilityLabel={m.name} activeOpacity={0.85}>
                <View style={st.moodIcon}><Icon size={icon.size.lg} color={colors.gold} strokeWidth={icon.stroke} /></View>
                <Text style={st.moodName}>{m.name}</Text>
                <Text style={st.moodHint} numberOfLines={2}>{m.hint}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Screen>
    );
  }

  const verse = mood.verses[verseIdx % mood.verses.length];

  return (
    <Screen scroll header={<ScreenHeader title={mood.name} subtitle="رسالة من القرآن" onBack={() => setMood(null)} />}>
      <View style={st.comfort}>
        <Text style={st.comfortText}>{mood.comfort}</Text>
      </View>

      <SectionHeading title="آية لك" sub={`${toAr(verseIdx % mood.verses.length + 1)} من ${toAr(mood.verses.length)}`} />
      <VerseCard
        key={`${verse.surah}:${verse.from}`}
        verse={verse}
        withTafsir
        onShare={({ text, excerpt }) => setShared({ text, excerpt, surah: verse.surah, ayah: verse.from })}
      />
      {mood.verses.length > 1 ? (
        <TouchableOpacity style={st.another} onPress={() => setVerseIdx((i) => i + 1)} accessibilityRole="button">
          <RefreshCw size={icon.size.sm} color={colors.gold} strokeWidth={icon.stroke} />
          <Text style={st.anotherText}>آية أخرى</Text>
        </TouchableOpacity>
      ) : null}

      <SectionHeading title="من هدي النبي ﷺ" />
      {mood.hadiths.map((h) => <HadithCard key={h.source + h.text.slice(0, 12)} hadith={h} />)}

      <SectionHeading title="ادعُ بهذا" />
      {mood.duas.map((d) => <SupplicationCard key={d.source + d.text.slice(0, 12)} dua={d} title="دعاء" />)}

      <SectionHeading title="نصائح تعينك" />
      {mood.tips.map((t) => (
        <View key={t} style={st.tip}>
          <View style={st.tipDot} />
          <Text style={st.tipText}>{t}</Text>
        </View>
      ))}
      {mood.care ? <Text style={st.care}>{mood.care}</Text> : null}

      <ImageShareModal visible={!!shared} title="مشاركة الآية كصورة" onClose={() => setShared(null)} toolbar={<ShareStylePicker />}>
        {shared ? (
          <AyahShare
            ayahText={shared.text}
            surahName={`سورة ${SURAH_NAMES[shared.surah - 1]}`}
            ayahNumber={shared.ayah}
            tafsirName="تفسير السعدي"
            tafsirExcerpt={shared.excerpt}
          />
        ) : null}
      </ImageShareModal>
    </Screen>
  );
};

const st = StyleSheet.create({
  lead: { ...type.body, color: colors.textSoft, lineHeight: 26, marginBottom: space[4] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3] },
  moodCard: { width: '47%', flexGrow: 1, backgroundColor: colors.surface, borderRadius: radius.card, padding: space[4], gap: space[2] },
  moodIcon: { width: 44, height: 44, borderRadius: radius.tile, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  moodName: { ...type.bodyMedium, fontFamily: 'Tajawal_700Bold', fontSize: 16, color: colors.text },
  moodHint: { ...type.caption, color: colors.textMuted },

  comfort: { backgroundColor: colors.goldSoft, borderRadius: radius.card, padding: space[4] },
  comfortText: { ...type.body, color: colors.text, lineHeight: 27 },
  another: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2], alignSelf: 'center', paddingVertical: space[2], paddingHorizontal: space[4], borderRadius: radius.pill, backgroundColor: colors.surface },
  anotherText: { ...type.label, color: colors.gold },

  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3], marginBottom: space[3] },
  tipDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.gold, marginTop: 9 },
  tipText: { ...type.body, color: colors.textSoft, lineHeight: 25, flex: 1 },
  care: { ...type.caption, color: colors.textMuted, lineHeight: 20, marginTop: space[4], padding: space[3], borderRadius: radius.field, backgroundColor: colors.surface },
});

export default QuranMessagesScreen;

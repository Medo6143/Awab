import React, { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useDispatch, useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react-native';
import { ScreenProps } from '../navigation/types';
import { RootState } from '../store';
import { toggleLikedCard } from '../store/slices/favoritesSlice';
import { Screen, ScreenHeader } from '../components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HadithCard, SupplicationCard, VerseCard } from '../components/guidance/GuidanceBlocks';
import { ImageShareModal } from '../components/share/ImageShareModal';
import { AyahShare, DuaShare } from '../components/share/StoryCard';
import { ShareStylePicker } from '../components/share/ShareStylePicker';
import { useAudio } from '../hooks/useAudio';
import { QURAN_MESSAGES, QuranMessage } from '../../domain/entities/quranMessages';
import type { Hadith, Supplication, VerseRef } from '../../domain/entities/guidance';
import { SURAH_NAMES } from '../../shared/constants/surahs';
import { toAr } from '../../shared/utils/format';
import { colors, icon, radius, space, type } from '../../shared/theme/tokens';

type Card =
  | { kind: 'comfort'; label: string }
  | { kind: 'verse'; label: string; verse: VerseRef }
  | { kind: 'hadith'; label: string; hadith: Hadith }
  | { kind: 'dua'; label: string; dua: Supplication }
  | { kind: 'tips'; label: string };

type Share =
  | { kind: 'ayah'; text: string; excerpt: string; surah: number; ayah: number }
  | { kind: 'text'; text: string; source: string };

/** The message for one state, as a deck: a word, each verse, each hadith, the dua, then steps. */
const deckFor = (m: QuranMessage): Card[] => [
  { kind: 'comfort', label: 'كلمة لك' },
  ...m.verses.map((verse) => ({ kind: 'verse' as const, label: 'آية لك', verse })),
  ...m.hadiths.map((hadith) => ({ kind: 'hadith' as const, label: 'من هدي النبي ﷺ', hadith })),
  ...m.duas.map((dua) => ({ kind: 'dua' as const, label: 'ادعُ بهذا', dua })),
  { kind: 'tips', label: 'خطوات تعينك' },
];

/**
 * "رسائل من القرآن": pick what you are going through, then swipe through cards: a gentle
 * word, verses (listen + al-Sa'di's tafsir), verified hadiths with their explanation, a
 * dua and practical steps. Every card can be liked and shared as an image.
 */
const QuranMessagesScreen = ({ navigation, route }: ScreenProps<'رسائل_القرآن'>) => {
  const dispatch = useDispatch();
  const liked = useSelector((s: RootState) => s.favorites?.messageCards ?? []);
  const { playAyah, playSequence } = useAudio();
  const [mood, setMood] = useState<QuranMessage | null>(() => QURAN_MESSAGES.find((m) => m.id === route.params?.mood) ?? null);
  const [page, setPage] = useState(0);
  const [shared, setShared] = useState<Share | null>(null);
  const pager = useRef<PagerView>(null);
  const navBar = useSafeAreaInsets().bottom;
  const deck = useMemo(() => (mood ? deckFor(mood) : []), [mood]);

  const open = (m: QuranMessage) => { setMood(m); setPage(0); };
  const listen = (v: VerseRef) => {
    const to = v.to ?? v.from;
    if (to === v.from) playAyah(v.surah, v.from, SURAH_NAMES[v.surah - 1]);
    else playSequence(Array.from({ length: to - v.from + 1 }, (_, i) => ({ surahId: v.surah, ayahNumber: v.from + i })), `سورة ${SURAH_NAMES[v.surah - 1]}`);
  };
  const go = (d: number) => pager.current?.setPage(Math.max(0, Math.min(deck.length - 1, page + d)));

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

  const cardId = (i: number) => `${mood.id}:${i}`;

  return (
    <Screen header={<ScreenHeader title={mood.name} subtitle="رسالة من القرآن" onBack={() => (route.params?.mood ? navigation.goBack() : setMood(null))} />} padded={false}>
      <View style={st.dots}>
        {deck.map((c, i) => <View key={i} style={[st.dot, i === page && st.dotOn]} />)}
      </View>

      {/* pinned RTL like the mushaf: swipe right for the next card */}
      <PagerView ref={pager} style={{ flex: 1 }} initialPage={0} layoutDirection="rtl" onPageSelected={(e) => setPage(e.nativeEvent.position)}>
        {deck.map((card, i) => (
          <View key={i} style={st.page}>
            <ScrollView contentContainerStyle={st.cardScroll} showsVerticalScrollIndicator={false}>
              <View style={st.cardHead}>
                <Text style={st.cardLabel}>{card.label}</Text>
                <TouchableOpacity onPress={() => { Haptics.selectionAsync(); dispatch(toggleLikedCard(cardId(i))); }} hitSlop={10} accessibilityRole="button" accessibilityLabel="أعجبتني">
                  <Heart size={icon.size.md} color={colors.gold} fill={liked.includes(cardId(i)) ? colors.gold : 'transparent'} />
                </TouchableOpacity>
              </View>

              {card.kind === 'comfort' ? (
                <View style={st.comfort}><Text style={st.comfortText}>{mood.comfort}</Text></View>
              ) : card.kind === 'verse' ? (
                <VerseCard
                  verse={card.verse}
                  withTafsir
                  onListen={() => listen(card.verse)}
                  onShare={({ text, excerpt }) => setShared({ kind: 'ayah', text, excerpt, surah: card.verse.surah, ayah: card.verse.from })}
                />
              ) : card.kind === 'hadith' ? (
                <HadithCard hadith={card.hadith} onShare={() => setShared({ kind: 'text', text: card.hadith.text, source: card.hadith.source })} />
              ) : card.kind === 'dua' ? (
                <SupplicationCard dua={card.dua} onShare={() => setShared({ kind: 'text', text: card.dua.text, source: card.dua.source })} />
              ) : (
                <View>
                  {mood.tips.map((t) => (
                    <View key={t} style={st.tip}>
                      <View style={st.tipDot} />
                      <Text style={st.tipText}>{t}</Text>
                    </View>
                  ))}
                  {mood.care ? <Text style={st.care}>{mood.care}</Text> : null}
                </View>
              )}
            </ScrollView>
          </View>
        ))}
      </PagerView>

      <View style={[st.nav, { paddingBottom: space[3] + navBar }]}>
        <TouchableOpacity style={[st.navBtn, page === 0 && st.navOff]} onPress={() => go(-1)} disabled={page === 0} accessibilityLabel="السابق">
          <ChevronRight size={icon.size.md} color={colors.gold} />
          <Text style={st.navText}>السابق</Text>
        </TouchableOpacity>
        <Text style={st.navCount}>{toAr(page + 1)} / {toAr(deck.length)}</Text>
        <TouchableOpacity style={[st.navBtn, page === deck.length - 1 && st.navOff]} onPress={() => go(1)} disabled={page === deck.length - 1} accessibilityLabel="التالي">
          <Text style={st.navText}>التالي</Text>
          <ChevronLeft size={icon.size.md} color={colors.gold} />
        </TouchableOpacity>
      </View>

      <ImageShareModal visible={!!shared} title="مشاركة كصورة" onClose={() => setShared(null)} toolbar={<ShareStylePicker />}>
        {shared?.kind === 'ayah' ? (
          <AyahShare ayahText={shared.text} surahName={`سورة ${SURAH_NAMES[shared.surah - 1]}`} ayahNumber={shared.ayah} tafsirName="تفسير السعدي" tafsirExcerpt={shared.excerpt} />
        ) : shared ? (
          <DuaShare text={shared.text} source={shared.source} />
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

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, paddingVertical: space[2] },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.surfaceRaised },
  dotOn: { width: 18, backgroundColor: colors.gold },
  page: { flex: 1, paddingHorizontal: 20 },
  cardScroll: { paddingBottom: space[6] },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space[3] },
  cardLabel: { ...type.h2, color: colors.text },
  comfort: { backgroundColor: colors.goldSoft, borderRadius: radius.card, padding: space[5] },
  comfortText: { fontFamily: 'Tajawal_500Medium', fontSize: 18, color: colors.text, lineHeight: 32 },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3], marginBottom: space[3] },
  tipDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.gold, marginTop: 9 },
  tipText: { ...type.body, color: colors.textSoft, lineHeight: 25, flex: 1 },
  care: { ...type.caption, color: colors.textMuted, lineHeight: 20, marginTop: space[4], padding: space[3], borderRadius: radius.field, backgroundColor: colors.surface },

  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: space[3] },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: space[1], backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: space[4], paddingVertical: space[2] },
  navOff: { opacity: 0.4 },
  navText: { ...type.label, color: colors.gold },
  navCount: { ...type.caption, color: colors.textMuted },
});

export default QuranMessagesScreen;

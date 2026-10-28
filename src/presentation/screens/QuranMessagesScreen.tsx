import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { Heart, Shuffle } from 'lucide-react-native';
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
import type { VerseRef } from '../../domain/entities/guidance';
import { SURAH_NAMES } from '../../shared/constants/surahs';
import { toAr } from '../../shared/utils/format';
import { colors, icon, radius, space, type } from '../../shared/theme/tokens';

type Share =
  | { kind: 'ayah'; text: string; excerpt: string; surah: number; ayah: number }
  | { kind: 'text'; text: string; source: string };

const shuffled = (n: number) => {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

/**
 * The order the state's verses, hadiths and duas come in: shuffled once when the state is
 * opened, then message n takes item n of each list, so nothing repeats until a list runs out.
 */
type Order = { verses: number[]; hadiths: number[]; duas: number[]; n: number };
const orderFor = (m: QuranMessage): Order => ({ verses: shuffled(m.verses.length), hadiths: shuffled(m.hadiths.length), duas: shuffled(m.duas.length), n: 0 });
const at = <T,>(list: readonly T[], order: number[], n: number): T | undefined => (list.length ? list[order[n % order.length]] : undefined);

/**
 * "رسائل من القرآن": pick what you are going through and get one message: a gentle word, a
 * verse (listen + al-Sa'di's tafsir), a verified hadith, a dua and practical steps.
 * "رسالة تانية" replaces it with the next one. Each part can be liked and shared as an image.
 */
const QuranMessagesScreen = ({ navigation, route }: ScreenProps<'رسائل_القرآن'>) => {
  const dispatch = useDispatch();
  const liked = useSelector((s: RootState) => s.favorites?.messageCards ?? []);
  const { playAyah, playSequence } = useAudio();
  const [mood, setMood] = useState<QuranMessage | null>(() => QURAN_MESSAGES.find((m) => m.id === route.params?.mood) ?? null);
  const [order, setOrder] = useState<Order | null>(() => (mood ? orderFor(mood) : null));
  const [shared, setShared] = useState<Share | null>(null);
  const scroll = useRef<ScrollView>(null);
  const bottom = useSafeAreaInsets().bottom;

  const open = (m: QuranMessage) => { setMood(m); setOrder(orderFor(m)); };
  const surprise = () => { Haptics.selectionAsync(); open(QURAN_MESSAGES[Math.floor(Math.random() * QURAN_MESSAGES.length)]); };
  const another = () => {
    Haptics.selectionAsync();
    setOrder((o) => (o ? { ...o, n: o.n + 1 } : o));
    scroll.current?.scrollTo({ y: 0, animated: false });
  };
  const listen = (v: VerseRef) => {
    const to = v.to ?? v.from;
    if (to === v.from) playAyah(v.surah, v.from, SURAH_NAMES[v.surah - 1]);
    else playSequence(Array.from({ length: to - v.from + 1 }, (_, i) => ({ surahId: v.surah, ayahNumber: v.from + i })), `سورة ${SURAH_NAMES[v.surah - 1]}`);
  };

  if (!mood || !order) {
    return (
      <Screen scroll header={<ScreenHeader title="رسائل من القرآن" subtitle="بماذا تشعر الآن؟" onBack={() => navigation.goBack()} />}>
        <Text style={st.lead}>اختر ما تمرّ به، وستجد رسالة من كتاب الله وسنّة نبيه ﷺ تواسيك وتعينك.</Text>
        <TouchableOpacity style={st.surprise} onPress={surprise} accessibilityRole="button" activeOpacity={0.85}>
          <Shuffle size={icon.size.md} color={colors.onGold} />
          <Text style={st.surpriseText}>فاجئني برسالة</Text>
        </TouchableOpacity>
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

  const verse = at(mood.verses, order.verses, order.n);
  const hadith = at(mood.hadiths, order.hadiths, order.n);
  const dua = at(mood.duas, order.duas, order.n);
  const total = Math.max(mood.verses.length, mood.hadiths.length, 1);

  const Like = ({ id }: { id: string }) => {
    const key = `${mood.id}:${id}`;
    return (
      <TouchableOpacity onPress={() => { Haptics.selectionAsync(); dispatch(toggleLikedCard(key)); }} hitSlop={10} accessibilityRole="button" accessibilityLabel="أعجبتني">
        <Heart size={icon.size.md} color={colors.gold} fill={liked.includes(key) ? colors.gold : 'transparent'} />
      </TouchableOpacity>
    );
  };
  const Head = ({ label, id }: { label: string; id: string }) => (
    <View style={st.cardHead}><Text style={st.cardLabel}>{label}</Text><Like id={id} /></View>
  );

  return (
    <Screen header={<ScreenHeader title={mood.name} subtitle={`رسالة ${toAr((order.n % total) + 1)} من ${toAr(total)}`} onBack={() => (route.params?.mood ? navigation.goBack() : setMood(null))} />} padded={false}>
      <ScrollView ref={scroll} contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
        <View style={st.comfort}><Text style={st.comfortText}>{mood.comfort}</Text></View>

        {verse ? (
          <View style={st.block}>
            <Head label="آية لك" id={`v:${verse.surah}:${verse.from}`} />
            <VerseCard
              key={`${verse.surah}:${verse.from}`}
              verse={verse}
              withTafsir
              onListen={() => listen(verse)}
              onShare={({ text, excerpt }) => setShared({ kind: 'ayah', text, excerpt, surah: verse.surah, ayah: verse.from })}
            />
          </View>
        ) : null}

        {hadith ? (
          <View style={st.block}>
            <Head label="من هدي النبي ﷺ" id={`h:${hadith.source}`} />
            <HadithCard hadith={hadith} onShare={() => setShared({ kind: 'text', text: hadith.text, source: hadith.source })} />
          </View>
        ) : null}

        {dua ? (
          <View style={st.block}>
            <Head label="ادعُ بهذا" id={`d:${dua.source}`} />
            <SupplicationCard dua={dua} onShare={() => setShared({ kind: 'text', text: dua.text, source: dua.source })} />
          </View>
        ) : null}

        <View style={st.block}>
          <Text style={st.cardLabel}>خطوات تعينك</Text>
          {mood.tips.map((t) => (
            <View key={t} style={st.tip}>
              <View style={st.tipDot} />
              <Text style={st.tipText}>{t}</Text>
            </View>
          ))}
          {mood.care ? <Text style={st.care}>{mood.care}</Text> : null}
        </View>
      </ScrollView>

      <View style={[st.footer, { paddingBottom: space[3] + bottom }]}>
        <TouchableOpacity style={st.another} onPress={another} accessibilityRole="button" activeOpacity={0.85}>
          <Shuffle size={icon.size.md} color={colors.onGold} />
          <Text style={st.surpriseText}>رسالة تانية</Text>
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
  surprise: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2], height: 48, borderRadius: radius.pill, backgroundColor: colors.gold, marginVertical: space[4] },
  surpriseText: { ...type.bodyMedium, fontFamily: 'Tajawal_700Bold', color: colors.onGold },
  moodCard: { width: '47%', flexGrow: 1, backgroundColor: colors.surface, borderRadius: radius.card, padding: space[4], gap: space[2] },
  moodIcon: { width: 44, height: 44, borderRadius: radius.tile, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  moodName: { ...type.bodyMedium, fontFamily: 'Tajawal_700Bold', fontSize: 16, color: colors.text },
  moodHint: { ...type.caption, color: colors.textMuted },

  scroll: { paddingHorizontal: 20, paddingBottom: space[6] },
  block: { marginTop: space[6] },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space[3] },
  cardLabel: { ...type.h2, color: colors.text, marginBottom: space[2] },
  comfort: { backgroundColor: colors.goldSoft, borderRadius: radius.card, padding: space[5], marginTop: space[2] },
  comfortText: { fontFamily: 'Tajawal_500Medium', fontSize: 17, color: colors.text, lineHeight: 30 },
  tip: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3], marginBottom: space[3] },
  tipDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.gold, marginTop: 9 },
  tipText: { ...type.body, color: colors.textSoft, lineHeight: 25, flex: 1 },
  care: { ...type.caption, color: colors.textMuted, lineHeight: 20, marginTop: space[4], padding: space[3], borderRadius: radius.field, backgroundColor: colors.surface },

  footer: { paddingHorizontal: 20, paddingTop: space[3], borderTopWidth: 1, borderTopColor: colors.hairline, backgroundColor: colors.bg },
  another: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2], height: 52, borderRadius: radius.pill, backgroundColor: colors.gold },
});

export default QuranMessagesScreen;

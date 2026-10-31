import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Copy, Share2, Star } from 'lucide-react-native';
import { ScreenProps } from '../navigation/types';
import { RootState } from '../store';
import { toggleFavoriteHadith } from '../store/slices/favoritesSlice';
import { ErrorState, PillButton, Screen, ScreenHeader } from '../components/ui';
import { GradeChips } from '../components/hadith/HadithRow';
import { SectionHeading } from '../components/guidance/GuidanceBlocks';
import { ImageShareModal } from '../components/share/ImageShareModal';
import { HadithShare } from '../components/share/StoryCard';
import { ShareStylePicker } from '../components/share/ShareStylePicker';
import { useDependencies } from '../providers/DependencyProvider';
import { hadithEntry } from '../../data/hadith/hadithLibrary';
import type { HadithDetail } from '../../domain/entities/hadith';
import { colors, icon, radius, space, type, themed } from '../../shared/theme/tokens';

/** One hadith: text with its narrator, grade, explanation, benefits and word meanings. */
const HadithDetailScreen = ({ navigation, route }: ScreenProps<'الحديث'>) => {
  const id = route.params.id;
  const { hadith } = useDependencies();
  const dispatch = useDispatch();
  const saved = useSelector((s: RootState) => (s.favorites?.hadiths ?? []).includes(id));
  const entry = hadithEntry(id);
  const [state, setState] = useState<{ data?: HadithDetail; error: boolean }>({ error: false });
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => {
    setState({ error: false });
    hadith.getHadith(id).then((data) => setState({ data, error: false })).catch(() => setState({ error: true }));
  }, [hadith, id]);
  useEffect(load, [load]);

  const d = state.data;
  const copy = async () => {
    if (!d) return;
    await Clipboard.setStringAsync(`${d.intro} ${d.text}\n[${d.grade} · ${d.attribution}]`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Screen scroll header={<ScreenHeader title="حديث شريف" onBack={() => navigation.goBack()} />}>
      {!d && !state.error ? (
        <View style={st.loading}>
          {entry ? <Text style={st.preview}>«{entry.title}»</Text> : null}
          <ActivityIndicator color={colors.gold} style={{ marginTop: space[4] }} />
        </View>
      ) : state.error ? (
        <View>
          {entry ? <Text style={st.preview}>«{entry.title}»</Text> : null}
          <ErrorState message="تعذّر تحميل الحديث وشرحه. تأكد من الاتصال بالإنترنت." onRetry={load} />
        </View>
      ) : d ? (
        <>
          <View style={st.card}>
            {d.intro ? <Text style={st.intro}>{d.intro}</Text> : null}
            <Text style={st.text}>{d.text}</Text>
            <GradeChips grade={d.grade} attribution={d.attribution} />
          </View>

          <View style={st.actions}>
            <PillButton label="مشاركة كصورة" size="sm" onPress={() => setSharing(true)} icon={<Share2 size={icon.size.sm} color={colors.onGold} />} />
            <PillButton label={copied ? 'تم النسخ' : 'نسخ'} size="sm" variant="ghost" onPress={copy} icon={<Copy size={icon.size.sm} color={colors.gold} />} />
            <PillButton label={saved ? 'محفوظ' : 'حفظ'} size="sm" variant="ghost" onPress={() => { Haptics.selectionAsync(); dispatch(toggleFavoriteHadith(id)); }} icon={<Star size={icon.size.sm} color={colors.gold} fill={saved ? colors.gold : 'transparent'} />} />
          </View>

          {d.explanation ? (
            <>
              <SectionHeading title="الشرح" />
              <Text style={st.body}>{d.explanation}</Text>
            </>
          ) : null}

          {d.benefits.length ? (
            <>
              <SectionHeading title="من فوائد الحديث" />
              {d.benefits.map((b) => (
                <View key={b} style={st.bullet}>
                  <View style={st.dot} />
                  <Text style={[st.body, { flex: 1 }]}>{b}</Text>
                </View>
              ))}
            </>
          ) : null}

          {d.words.length ? (
            <>
              <SectionHeading title="معاني الكلمات" />
              {d.words.map((w) => (
                <View key={w.word} style={st.word}>
                  <Text style={st.wordTerm}>{w.word}</Text>
                  <Text style={st.wordMeaning}>{w.meaning}</Text>
                </View>
              ))}
            </>
          ) : null}

          {d.reference ? (
            <>
              <SectionHeading title="المراجع" />
              <Text style={st.ref}>{d.reference}</Text>
            </>
          ) : null}
          <Text style={st.source}>المصدر: موسوعة الأحاديث النبوية (HadeethEnc.com)</Text>

          <ImageShareModal visible={sharing} title="مشاركة الحديث كصورة" onClose={() => setSharing(false)} toolbar={<ShareStylePicker />}>
            <HadithShare text={d.text} grade={d.grade} attribution={d.attribution} explanation={d.explanation} />
          </ImageShareModal>
        </>
      ) : null}
    </Screen>
  );
};

const st = themed(() => ({
  loading: { paddingTop: space[4] },
  preview: { fontFamily: 'Amiri_700Bold', fontSize: 19, lineHeight: 36, color: colors.textSoft, textAlign: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, padding: space[4], borderWidth: 1, borderColor: colors.goldLineSoft },
  intro: { ...type.body, color: colors.textMuted, marginBottom: space[2] },
  text: { fontFamily: 'Amiri_700Bold', fontSize: 21, lineHeight: 42, color: colors.text },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2], marginTop: space[3] },
  body: { ...type.body, color: colors.textSoft, lineHeight: 27 },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', gap: space[3], marginBottom: space[2] },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.gold, marginTop: 10 },
  word: { backgroundColor: colors.surface, borderRadius: radius.field, padding: space[3], marginBottom: space[2] },
  wordTerm: { ...type.label, color: colors.gold },
  wordMeaning: { ...type.body, color: colors.textSoft, marginTop: 2 },
  ref: { ...type.caption, color: colors.textMuted, lineHeight: 20 },
  source: { ...type.caption, color: colors.textFaint, textAlign: 'center', marginTop: space[6] },
}));

export default HadithDetailScreen;

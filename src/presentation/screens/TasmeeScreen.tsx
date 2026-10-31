import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, Eye, Lightbulb, Mic, RotateCcw, Square, Volume2, X } from 'lucide-react-native';
import { ScreenProps, TasmeeParams } from '../navigation/types';
import { Screen, ScreenHeader, IconButton, PillButton, ErrorState } from '../components/ui';
import { useAudio } from '../hooks/useAudio';
import { useMushafPage } from '../hooks/useQuran';
import { recordTasmee } from '../store/slices/quranSlice';
import { RootState } from '../store';
import { SURAH_AYAH_COUNTS, SURAH_NAMES } from '../../shared/constants/surahs';
import { toAr } from '../../shared/utils/format';
import { colors, icon, radius, space, type, themed } from '../../shared/theme/tokens';
import { useAccent } from '../../shared/theme/useAccent';
import { surahPageRange } from '../../data/quran/ayahSearch';
import { useVoiceTasmee } from '../hooks/useVoiceTasmee';
import { GeometricFrame } from '../components/quran/MushafOrnaments';
import { s as q } from '../components/quran/QuranStyles';
import { Ayah, mushafAyahText } from '../components/quran/QuranConstants';
import { AyahState, TasmeePage } from '../components/tasmee/TasmeePage';
import { TasmeeResult, Mistake } from '../components/tasmee/TasmeeResult';
import { ayahsLabel, splitWords } from '../components/tasmee/tasmeeText';

type Result = { surah: number; ayah: number; page: number; ok: boolean; words: string[] };

const LAST_PAGE = 604;
const pagesLabel = (from: number, to: number) => (from === to ? `صفحة ${toAr(from)}` : `صفحة ${toAr(from)} – ${toAr(to)}`);

/**
 * Tasmee on the mushaf page itself. The ayahs being recited are covered by paper strips in
 * their exact place; «اكشف الآية» uncovers the next one, and tapping a word marks it wrong.
 * Ayahs left unmarked count as correct, so there is no grading step per ayah. In voice mode
 * the reciter just recites: the offline speech model follows along and uncovers the words as
 * they are said, ayah after ayah, and on a skipped or wrong word marks it and says it aloud.
 */
const TasmeeScreen = ({ navigation, route }: ScreenProps<'التسميع'>) => {
  const dispatch = useDispatch();
  const accent = useAccent();
  const { playAyah } = useAudio();
  const tasmee = useSelector((s: RootState) => s.quran.tasmee);
  const memorizedBefore = useSelector((s: RootState) => s.quran.memorizedSurahs ?? []);

  const [cfg, setCfg] = useState<TasmeeParams>(route.params);
  const help = cfg.help ?? 'none';
  const [page, setPage] = useState(cfg.fromPage);
  const { ayahs, loading, error, retry } = useMushafPage(page);

  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [marked, setMarked] = useState<Record<number, number[]>>({});
  const [shown, setShown] = useState(0);
  const [results, setResults] = useState<Record<number, Result>>({});
  const [done, setDone] = useState<{ memorized: string[] } | null>(null);
  const startedAt = useRef(Date.now());
  const scroll = useRef<ScrollView>(null);


  const inSession = useCallback((a: Ayah) =>
    !!mushafAyahText(a)
    && (!cfg.surah || a.surah.number === cfg.surah)
    && (!cfg.startAyah || a.number >= cfg.startAyah)
    && (!cfg.only || cfg.only.includes(a.number)), [cfg]);

  const session = useMemo(() => ayahs.filter(inSession), [ayahs, inSession]);
  const current = session.find((a) => !revealed.has(a.number));
  const pageDone = !loading && !error && session.length > 0 && !current;
  const pageMistakes = session.filter((a) => marked[a.number]?.length);

  const stateOf = useCallback((a: Ayah): AyahState =>
    !inSession(a) ? 'outside' : revealed.has(a.number) ? 'revealed' : a.number === current?.number ? 'current' : 'hidden',
  [inSession, revealed, current]);

  const voice = useVoiceTasmee(!!cfg.voice && !done, cfg.voiceMode ?? 'mark', session, revealed, {
    onHeard: (a, count) => { if (a.number === current?.number) setShown(count); },
    onAyahDone: (a) => { setRevealed((r) => new Set(r).add(a.number)); setShown(0); },
    onMistake: (a, words) => {
      setMarked((m) => ({ ...m, [a.number]: [...new Set([...(m[a.number] ?? []), ...words])].sort((x, y) => x - y) }));
      // the wrong word shows (in red) while the rest of the ayah stays covered
      if (a.number === current?.number) setShown((n) => Math.max(n, Math.max(...words, -1) + 1));
    },
  });
  const listening = voice.state === 'listening' || voice.state === 'correcting' || voice.state === 'repeating';

  const finish = (all: Record<number, Result>) => {
    const list = Object.values(all);
    const bySurah = new Map<number, { ayah: number; ok: boolean }[]>();
    list.forEach((r) => bySurah.set(r.surah, [...(bySurah.get(r.surah) ?? []), { ayah: r.ayah, ok: r.ok }]));
    const memorized: string[] = [];
    bySurah.forEach((res, surah) => {
      const total = SURAH_AYAH_COUNTS[surah - 1];
      dispatch(recordTasmee({ surah, total, results: res }));
      // same rule as the reducer: the surah joins the heart once every ayah has passed
      const after: Record<number, boolean> = Object.fromEntries(Object.entries(tasmee?.[surah] ?? {}).map(([k, m]) => [k, m.ok]));
      res.forEach((r) => { after[r.ayah] = r.ok; });
      if (!memorizedBefore.includes(surah) && Array.from({ length: total }, (_, i) => after[i + 1]).every(Boolean)) memorized.push(SURAH_NAMES[surah - 1]);
    });
    Haptics.notificationAsync(list.every((r) => r.ok) ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning);
    setResults(all);
    setDone({ memorized });
  };

  // a page with nothing to recite (e.g. another surah's page) is skipped
  useEffect(() => {
    if (done || loading || error || !ayahs.length || session.length) return;
    if (page < cfg.toPage) setPage(page + 1);
    else finish(results);
  }, [done, loading, error, ayahs, session.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const revealCurrent = () => {
    if (!current) return;
    Haptics.selectionAsync();
    setRevealed((r) => new Set(r).add(current.number));
    setShown(0);
  };
  const revealPage = () => {
    Haptics.selectionAsync();
    setRevealed((r) => { const n = new Set(r); session.forEach((a) => n.add(a.number)); return n; });
    setShown(0);
  };
  const hint = () => {
    if (!current) return;
    const count = splitWords(mushafAyahText(current)).length;
    Haptics.selectionAsync();
    if (shown + 1 >= count) revealCurrent();
    else setShown(shown + 1);
  };
  const toggleWord = (a: Ayah, w: number) => {
    if (!revealed.has(a.number)) return;
    Haptics.selectionAsync();
    setMarked((m) => {
      const list = m[a.number] ?? [];
      return { ...m, [a.number]: list.includes(w) ? list.filter((x) => x !== w) : [...list, w].sort((x, y) => x - y) };
    });
  };

  /** Results so far plus this page as it stands (the latest attempt wins). */
  const withPage = () => {
    const out = { ...results };
    for (const a of session) {
      const words = splitWords(mushafAyahText(a));
      const m = marked[a.number] ?? [];
      out[a.number] = { surah: a.surah.number, ayah: a.numberInSurah, page: a.page, ok: m.length === 0, words: m.map((i) => words[i]) };
    }
    return out;
  };

  const retryPage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRevealed((r) => { const n = new Set(r); pageMistakes.forEach((a) => n.delete(a.number)); return n; });
    setMarked((m) => { const n = { ...m }; pageMistakes.forEach((a) => delete n[a.number]); return n; });
    scroll.current?.scrollTo({ y: 0, animated: true });
  };

  const nextPage = () => {
    const all = withPage();
    setResults(all);
    setRevealed(new Set());
    setMarked({});
    setShown(0);
    if (page < cfg.toPage) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPage(page + 1);
      scroll.current?.scrollTo({ y: 0, animated: false });
    } else finish(all);
  };

  const restart = (next: TasmeeParams) => {
    setCfg(next);
    setPage(next.fromPage);
    setRevealed(new Set());
    setMarked({});
    setShown(0);
    setResults({});
    setDone(null);
    startedAt.current = Date.now();
  };

  const leave = () => {
    if (done || (revealed.size === 0 && page === cfg.fromPage)) { navigation.goBack(); return; }
    Alert.alert('توقف التسميع؟', 'اللي سمّعته لحد دلوقتي مش هيتسجّل.', [
      { text: 'كمّل', style: 'cancel' },
      { text: 'خروج', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  const close = <IconButton onPress={leave} label="إغلاق"><X size={icon.size.lg} color={colors.gold} strokeWidth={icon.stroke} /></IconButton>;
  const pageCount = cfg.toPage - cfg.fromPage + 1;

  if (done) {
    const list = Object.entries(results).map(([n, r]) => ({ n: +n, ...r }));
    const wrong = list.filter((r) => !r.ok).sort((x, y) => x.n - y.n);
    const mistakes: Mistake[] = wrong.map((r) => ({ key: r.n, label: `${SURAH_NAMES[r.surah - 1]} ${toAr(r.ayah)}`, words: r.words }));
    // continuing stays inside the chosen surah when there is one
    const lastPage = cfg.surah ? surahPageRange(cfg.surah).to : LAST_PAGE;
    const next = cfg.only || cfg.toPage >= lastPage ? undefined : { from: cfg.toPage + 1, to: Math.min(lastPage, cfg.toPage + pageCount) };
    return (
      <Screen header={<ScreenHeader title="خلّصت التسميع" right={close} />} padded={false}>
        <TasmeeResult
          total={list.length}
          rangeLabel={pagesLabel(cfg.fromPage, cfg.toPage)}
          mistakes={mistakes}
          minutes={Math.round((Date.now() - startedAt.current) / 60000)}
          memorized={done.memorized}
          nextLabel={next ? `كمّل ${pagesLabel(next.from, next.to)}` : undefined}
          onRetryMistakes={() => restart({
            ...cfg,
            fromPage: Math.min(...wrong.map((r) => r.page)),
            toPage: Math.max(...wrong.map((r) => r.page)),
            only: wrong.map((r) => r.n),
            startAyah: undefined,
          })}
          onContinue={next ? () => restart({ ...cfg, fromPage: next.from, toPage: next.to, startAyah: undefined, only: undefined }) : undefined}
          onDone={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  const doneOnPage = session.filter((a) => revealed.has(a.number)).length;
  const subtitle = session.length
    ? `${toAr(doneOnPage)} من ${ayahsLabel(session.length, toAr)}${pageCount > 1 ? ` · صفحة ${toAr(page - cfg.fromPage + 1)} من ${toAr(pageCount)}` : ''}`
    : undefined;

  return (
    <Screen header={<ScreenHeader title={`تسميع · صفحة ${toAr(page)}`} subtitle={subtitle} right={close} />} padded={false}>
      <View style={st.pageWrap}>
        <View style={q.paperCard}>
        <GeometricFrame paper={colors.paper}>
          <View style={st.flex}>
            <View style={q.pageHeader}>
              <Text style={q.pageHeaderText}>{ayahs[0]?.surah.name ?? ''}</Text>
              <Text style={q.pageHeaderText}>{ayahs[0]?.juz ? `الجزء ${toAr(ayahs[0].juz)}` : ''}</Text>
            </View>
            <ScrollView ref={scroll} contentContainerStyle={q.ayahList} showsVerticalScrollIndicator={false}>
              {loading ? (
                <View style={q.centerLoader}><ActivityIndicator size="large" color={colors.gold} /></View>
              ) : error ? (
                <ErrorState message="تعذّر تحميل الصفحة. اتأكد من الإنترنت." onRetry={retry} compact />
              ) : (
                <TasmeePage ayahs={ayahs} stateOf={stateOf} shown={shown} help={help} marked={marked} onWordPress={toggleWord} />
              )}
            </ScrollView>
          </View>
        </GeometricFrame>
        </View>
      </View>

      {pageDone ? (
        <View style={st.summary}>
          <View style={st.summaryHead}>
            <Text style={st.summaryTitle}>خلّصت الصفحة</Text>
            <Text style={[st.summaryScore, { color: accent.accentText }]}>
              {toAr(session.length - pageMistakes.length)}<Text style={st.summaryOf}>{`/${toAr(session.length)}`}</Text>
            </Text>
          </View>
          <Text style={st.summarySub}>
            {pageMistakes.length
              ? `غلطت في ${pageMistakes.length === 1 ? 'آية' : ayahsLabel(pageMistakes.length, toAr)}: ${pageMistakes.map((a) => toAr(a.numberInSurah)).join(' و')}`
              : 'ما شاء الله، من غير ولا غلطة'}
          </Text>
          <View style={st.row}>
            {pageMistakes.length ? (
              <PillButton variant="ghost" size="sm" label="سمّع الغلط تاني" icon={<RotateCcw size={icon.size.sm} color={accent.accentText} strokeWidth={icon.stroke} />} style={st.flex} onPress={retryPage} />
            ) : null}
            <PillButton
              size="sm"
              label={page < cfg.toPage ? 'الصفحة الجاية' : 'النتيجة'}
              icon={page < cfg.toPage ? <ChevronLeft size={icon.size.sm} color={accent.onAccent} strokeWidth={2} /> : undefined}
              style={st.grow}
              onPress={nextPage}
            />
          </View>
        </View>
      ) : cfg.voice ? (
        <View style={st.bar}>
          <Text style={st.guide}>
            {voice.state === 'loading' ? 'بيجهّز التسميع بالصوت…'
              : voice.state === 'error' ? 'ملف الصوت مش جاهز. نزّله تاني من «بصوتي» في إعداد التسميع.'
              : voice.state === 'noMic' ? 'محتاج إذن المايك عشان يسمعك. اسمح له من إعدادات الموبايل.'
              : voice.state === 'correcting' ? 'اسمع الكلمة الصح…'
              : voice.state === 'repeating' ? `قول «${voice.repeat ?? 'الكلمة'}» تاني، وكمّل بعدها`
              : voice.state === 'listening' ? 'بسمعك… كمّل قراءة'
              : Object.values(marked).some((m) => m.length) ? 'لو كلمة اتعلّمت وانت قلتها صح، دوس عليها'
              : 'دوس «سمّع» واقرأ من حفظك، والآيات هتنكشف وانت بتقرأ'}
          </Text>
          <View style={st.row}>
            <PillButton variant="ghost" size="sm" label="تلميح" icon={<Lightbulb size={icon.size.sm} color={accent.accentText} strokeWidth={icon.stroke} />} style={st.flex} onPress={hint} disabled={!current || listening} />
            <PillButton
              size="sm"
              label={listening ? 'وقّف' : 'سمّع'}
              icon={listening
                ? <Square size={icon.size.sm} color={accent.onAccent} strokeWidth={icon.stroke} fill={accent.onAccent} />
                : <Mic size={icon.size.sm} color={accent.onAccent} strokeWidth={icon.stroke} />}
              style={st.grow}
              loading={voice.state === 'loading'}
              onPress={listening ? voice.stop : voice.start}
              disabled={!current || voice.state === 'error'}
            />
          </View>
          <TouchableOpacity onPress={revealCurrent} disabled={!current} style={st.revealAll} accessibilityRole="button">
            <Text style={st.revealAllText}>اكشف الآية من غير تسميع</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={st.bar}>
          <Text style={st.guide}>
            {Object.values(marked).some((m) => m.length)
              ? 'دوس على الكلمة تاني عشان تشيل العلامة'
              : revealed.size ? 'دوس على أي كلمة غلطت فيها' : 'قول الآية المتعلّمة من حفظك، وبعدين اكشفها'}
          </Text>
          <View style={st.row}>
            <PillButton variant="ghost" size="sm" label="تلميح" icon={<Lightbulb size={icon.size.sm} color={accent.accentText} strokeWidth={icon.stroke} />} style={st.flex} onPress={hint} disabled={!current} />
            <PillButton variant="ghost" size="sm" label="الشيخ" icon={<Volume2 size={icon.size.sm} color={accent.accentText} strokeWidth={icon.stroke} />} style={st.flex} onPress={() => current && playAyah(current.surah.number, current.numberInSurah, current.surah.name)} disabled={!current} />
            <PillButton size="sm" label="اكشف الآية" icon={<Eye size={icon.size.sm} color={accent.onAccent} strokeWidth={icon.stroke} />} style={st.grow} onPress={revealCurrent} disabled={!current} />
          </View>
          <TouchableOpacity onPress={revealPage} disabled={!current} style={st.revealAll} accessibilityRole="button">
            <Text style={st.revealAllText}>اكشف الصفحة كلها</Text>
          </TouchableOpacity>
        </View>
      )}
    </Screen>
  );
};

const st = themed(() => ({
  flex: { flex: 1 },
  grow: { flex: 1.5 },
  pageWrap: { flex: 1, padding: space[2] },
  bar: { paddingHorizontal: space[4], paddingTop: space[2], paddingBottom: space[5], gap: space[2] },
  guide: { ...type.caption, color: colors.textMuted, textAlign: 'center' },
  row: { flexDirection: 'row', gap: space[2] },
  revealAll: { alignItems: 'center', paddingVertical: space[1] },
  revealAllText: { ...type.caption, color: colors.textMuted },
  summary: { marginHorizontal: space[4], marginBottom: space[5], backgroundColor: colors.surface, borderRadius: radius.card, padding: space[4], gap: space[2] },
  summaryHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryTitle: { ...type.h2, color: colors.text },
  summaryScore: { fontFamily: 'Tajawal_800ExtraBold', fontSize: 28, lineHeight: 34 },
  summaryOf: { fontFamily: 'Tajawal_700Bold', fontSize: 14, color: colors.textMuted },
  summarySub: { ...type.caption, color: colors.textMuted },
}));

export default TasmeeScreen;

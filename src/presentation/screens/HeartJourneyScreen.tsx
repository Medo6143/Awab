import { ScreenProps } from '../navigation/types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated } from 'react-native';
import { Screen } from '../components/ui';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { toggleSurahCompleted, setCompletedSurahs, finishKhatma, finishedCount, HeartMode } from '../store/slices/quranSlice';
import * as Haptics from 'expo-haptics';

// Heart Components & Constants
import { HeartViewer } from '../components/heart/HeartViewer';
import { ImageShareModal } from '../components/share/ImageShareModal';
import { HeartShareCard } from '../components/share/HeartShareCard';
import { HeartZoomModal } from '../components/heart/HeartZoomModal';
import { SurahChecklist } from '../components/heart/SurahChecklist';
import { HeartJourneyHeader, HeartNarrative } from '../components/heart/HeartJourneyHeader';
import { JuzSelectionModal, BulkMarkModal } from '../components/heart/HeartModals';
import { JUZ_SURAH_RANGES, toAr } from '../components/heart/HeartJourneyConstants';
import { ModeSwitch } from '../components/heart/ModeSwitch';
import { HeartSurahSheet } from '../components/tasmee/HeartSurahSheet';
import { TasmeeSetupSheet, TasmeeStart } from '../components/tasmee/TasmeeSetupSheet';
import { ayahRef, surahPageRange } from '../../data/quran/ayahSearch';
import { SURAH_NAMES } from '../../shared/constants/surahs';
import { TasmeeParams } from '../navigation/types';

const EMPTY: number[] = [];

const HeartJourneyScreen = ({ navigation }: Pick<ScreenProps, 'navigation'>) => {
  const dispatch = useDispatch();
  const [mode, setMode] = useState<HeartMode>('reading');
  const completedSurahs = useSelector((state: RootState) =>
    (mode === 'reading' ? state.quran.completedSurahs : state.quran.memorizedSurahs) ?? EMPTY);
  const khatmaCount = useSelector((state: RootState) => finishedCount(state.quran, mode));
  const startedAt = useSelector((state: RootState) => state.quran.khatmaStartedAt?.[mode]);

  const [showJuzModal, setShowJuzModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [showShare, setShowShare] = useState(false);
  // hifz mode: the tapped surah's recital sheet, then optionally the range picker
  const [hifzSurah, setHifzSurah] = useState<number | null>(null);
  const [rangeFor, setRangeFor] = useState<{ surah: number; fromPage: number; toPage: number } | null>(null);
  const hifzMarks = useSelector((state: RootState) => (hifzSurah ? state.quran.tasmee?.[hifzSurah] : undefined));

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Overall khatma progress drives how high the heart fills red (like a tank).
  const heartProgress = completedSurahs.length / 114;

  const handleToggle = useCallback((id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch(toggleSurahCompleted({ mode, id }));
  }, [dispatch, mode]);

  // reading: a tap marks the surah. hifz: a tap opens its recital sheet (memorizing is earned)
  const handleSurahPress = useCallback((id: number) => {
    if (mode === 'reading') { handleToggle(id); return; }
    Haptics.selectionAsync();
    if (showZoom) { setShowZoom(false); setTimeout(() => setHifzSurah(id), 300); }
    else setHifzSurah(id);
  }, [mode, handleToggle, showZoom]);

  const startTasmee = (t: TasmeeParams) => {
    setHifzSurah(null);
    setRangeFor(null);
    navigation.navigate('التسميع', t);
  };

  /** Ayahs from..to of a surah as the mushaf pages they sit on; only that surah is recited. */
  const reciteAyahs = (surah: number, from: number, to: number, only?: number[]) => {
    const a = ayahRef(surah, from);
    const b = ayahRef(surah, to);
    if (!a || !b) return;
    startTasmee({
      fromPage: a.page, toPage: b.page, surah, help: 'none',
      startAyah: only ? undefined : a.number,
      only: only?.map((n) => ayahRef(surah, n)?.number ?? 0).filter(Boolean),
    });
  };

  const openZoom = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowZoom(true);
  }, []);

  const markUntilSurah = (surahId: number) => {
    const list = Array.from({ length: surahId }, (_, i) => i + 1);
    dispatch(setCompletedSurahs({ mode, ids: list }));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowBulkModal(false);
  };

  const markJuz = (juzIndex: number) => {
    const start = JUZ_SURAH_RANGES[juzIndex][0];
    const end = JUZ_SURAH_RANGES[juzIndex][1];
    const newCompleted = new Set(completedSurahs);
    for (let i = start; i <= end; i++) newCompleted.add(i);
    dispatch(setCompletedSurahs({ mode, ids: Array.from(newCompleted) }));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowJuzModal(false);
  };

  const confirmReset = () => {
    if (!completedSurahs.length) return;
    Alert.alert(
      'تصفير القلب',
      `سيتم مسح علامات ${toAr(completedSurahs.length)} سورة ويعود القلب فارغاً. لا يمكن التراجع عن ذلك.`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تصفير', style: 'destructive', onPress: () => { dispatch(setCompletedSurahs({ mode, ids: [] })); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } },
      ],
    );
  };

  const handleFinishKhatma = () => {
    if (completedSurahs.length < 114) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    dispatch(finishKhatma(mode));
    navigation.navigate('الختمات', { mode });
  };

  return (
    <Screen scroll padded={false} header={<HeartJourneyHeader onBack={() => navigation.goBack()} completedCount={completedSurahs.length} />}>
        <ModeSwitch mode={mode} onChange={setMode} />
        <HeartViewer
          pulseAnim={pulseAnim}
          completedSurahs={completedSurahs}
          progress={heartProgress}
          onToggleSurah={handleSurahPress}
          onOpenFullscreen={openZoom}
          onDownload={() => setShowShare(true)}
          onReset={confirmReset}
        />

        <HeartNarrative
          mode={mode}
          khatmaCount={khatmaCount}
          completedCount={completedSurahs.length}
          startedAt={startedAt}
          onShowJuz={() => setShowJuzModal(true)}
          onShowBulk={() => setShowBulkModal(true)}
          onFinish={handleFinishKhatma}
          onShowLog={() => navigation.navigate('الختمات', { mode })}
        />

        <SurahChecklist completedSurahs={completedSurahs} onToggle={handleSurahPress} />

      <JuzSelectionModal visible={showJuzModal} onClose={() => setShowJuzModal(false)} onSelectJuz={markJuz} />
      <BulkMarkModal visible={showBulkModal} onClose={() => setShowBulkModal(false)} onSelectSurah={markUntilSurah} />
      <HeartZoomModal
        visible={showZoom}
        onClose={() => setShowZoom(false)}
        completedSurahs={completedSurahs}
        progress={heartProgress}
        onToggleSurah={handleSurahPress}
      />
      <HeartSurahSheet
        surah={hifzSurah}
        marks={hifzMarks}
        memorized={!!hifzSurah && completedSurahs.includes(hifzSurah)}
        onClose={() => setHifzSurah(null)}
        onRecite={(from, to, only) => hifzSurah && reciteAyahs(hifzSurah, from, to, only)}
        onChooseRange={(from) => {
          const surah = hifzSurah;
          setHifzSurah(null);
          const page = surah ? ayahRef(surah, from)?.page : undefined;
          if (surah && page) setTimeout(() => setRangeFor({ surah, fromPage: page, toPage: page }), 300);
        }}
        onToggleMemorized={() => { if (hifzSurah) handleToggle(hifzSurah); setHifzSurah(null); }}
      />
      {rangeFor ? (
        <TasmeeSetupSheet
          visible
          title={`تسميع سورة ${SURAH_NAMES[rangeFor.surah - 1]}`}
          fromPage={rangeFor.fromPage}
          toPage={rangeFor.toPage}
          minPage={surahPageRange(rangeFor.surah).from}
          maxPage={surahPageRange(rangeFor.surah).to}
          onClose={() => setRangeFor(null)}
          onStart={(t: TasmeeStart) => startTasmee({ ...t, surah: rangeFor.surah })}
        />
      ) : null}
      <ImageShareModal visible={showShare} title="صورة القلب" onClose={() => setShowShare(false)}>
        <HeartShareCard completedSurahs={completedSurahs} mode={mode} number={khatmaCount + 1} startedAt={startedAt ?? null} />
      </ImageShareModal>
    </Screen>
  );
};

export default HeartJourneyScreen;

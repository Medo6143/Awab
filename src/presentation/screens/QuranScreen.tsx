import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import { colors } from '../../shared/theme/tokens';
import { useDispatch, useSelector } from 'react-redux';
import { Bookmark, BookOpen, ChevronLeft, ChevronRight, Play, Pause, Settings, Home } from 'lucide-react-native';
import { useAudio } from '../hooks/useAudio';
import { RootState } from '../store';
import { setCurrentPage, togglePageBookmark, toggleBookmark } from '../store/slices/quranSlice';
import { logQuranPage } from '../store/slices/statsSlice';
import { useSurahs } from '../hooks/useQuran';

// Quran Components & Constants
import { MushafPageContent } from '../components/quran/MushafPageContent';
import { TafsirBottomSheet } from '../components/quran/TafsirBottomSheet';
import { SurahPickerModal } from '../components/quran/SurahPickerModal';
import { ReciterPickerModal } from '../components/quran/ReciterPickerModal';
import { BookmarksModal } from '../components/quran/BookmarksModal';
import { TAFSIR_LIST } from '../components/settings/SettingsConstants';
import { s } from '../components/quran/QuranStyles';
import { 
    TOTAL_PAGES, JUZ_PAGES, toAr, 
    pageCache, Ayah, SurahMeta, H 
} from '../components/quran/QuranConstants';

const QuranScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  
  const currentPage = useSelector((state: RootState) => (state as any).quran?.currentPage ?? 1);
  const bookmarkedPages = useSelector((state: RootState) => (state as any).quran?.bookmarkedPages ?? []);
  const bookmarks = useSelector((state: RootState) => (state as any).quran?.bookmarks ?? []);
  
  const { selectedTafsirId, tafsirStyle, tafsirFontSize } = useSelector((state: RootState) => state.settings);

  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
  const [tafsir, setTafsir] = useState<string | null>(null);
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [tafsirError, setTafsirError] = useState(false);
  const tafsirRequest = useRef(0); // ignore answers for an ayah the user already left
  const [showSurahPicker, setShowSurahPicker] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedAyah, setHighlightedAyah] = useState<number | null>(null);
  const [pickerTab, setPickerTab] = useState<'surah' | 'juz' | 'audio'>('surah');
  const [showReciterPicker, setShowReciterPicker] = useState(false);

  const pagerRef = useRef<PagerView>(null);
  const isTransitioning = useRef(false);

  const { 
    isPlaying, isBuffering, currentSurahId, activeReciter,
    playSurah, playAyah, playSequence, togglePlayback, changeReciter 
  } = useAudio();

  const bottomSheetAnim = useRef(new Animated.Value(H)).current;
  const { data: surahsData, isLoading: surahsLoading, isError: surahsError, refetch: refetchSurahs } = useSurahs() as any;
  
  const surahsList = (surahsData as SurahMeta[] | undefined) ?? [];
  const filteredSurahs = surahsList.filter(s =>
    (s.name ?? '').includes(searchQuery) ||
    (s.englishName ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(s.number).includes(searchQuery)
  );

  const onPageSelected = useCallback((e: any) => {
    const newPos = e.nativeEvent.position; // 0=prev, 1=current, 2=next
    if (newPos === 1 || isTransitioning.current) return;
    
    isTransitioning.current = true;
    const newPage = newPos === 2
      ? Math.min(currentPage + 1, TOTAL_PAGES)
      : Math.max(currentPage - 1, 1);
    
    if (newPage !== currentPage) {
      dispatch(setCurrentPage(newPage));
      dispatch(logQuranPage(newPage));
    }

    setTimeout(() => {
      pagerRef.current?.setPageWithoutAnimation(1);
      isTransitioning.current = false;
    }, 50);
  }, [currentPage, dispatch]);

  useEffect(() => {
    pagerRef.current?.setPageWithoutAnimation(1);
  }, [currentPage]);

  const getTafsir = async (ayah: Ayah) => {
    setSelectedAyah(ayah);
    setHighlightedAyah(ayah.number);
    openBottomSheet();
    loadTafsir(ayah);
  };

  // The error is its own state: it must never end up as tafsir text (the share image
  // uses the tafsir as its excerpt).
  const loadTafsir = async (ayah: Ayah) => {
    const req = ++tafsirRequest.current;
    setTafsirLoading(true);
    setTafsirError(false);
    setTafsir(null);
    try {
      const res = await fetch(
        `https://api.quran.com/api/v4/tafsirs/${selectedTafsirId}/by_ayah/${ayah.surah.number}:${ayah.numberInSurah}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const html: unknown = data?.tafsir?.text;
      if (typeof html !== 'string' || !html.trim()) throw new Error('empty tafsir');
      if (req === tafsirRequest.current) setTafsir(html);
    } catch {
      if (req === tafsirRequest.current) setTafsirError(true);
    } finally {
      if (req === tafsirRequest.current) setTafsirLoading(false);
    }
  };

  const openBottomSheet = () => {
    // the sheet is already bottom-aligned at 85% height; any extra offset pushes its toolbar off-screen
    Animated.spring(bottomSheetAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 9,
    }).start();
  };

  const closeBottomSheet = () => {
    Animated.timing(bottomSheetAnim, {
      toValue: H,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setSelectedAyah(null);
      setHighlightedAyah(null);
    });
  };

  const handleSurahSelect = async (surahNumber: number) => {
    setShowSurahPicker(false);
    setSearchQuery('');
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
      const json = await res.json();
      const firstPage: number = json?.data?.ayahs?.[0]?.page;
      if (firstPage) dispatch(setCurrentPage(firstPage));
    } catch {}
  };

  const handleReciterChange = (id: string) => {
    changeReciter(id);
    setShowReciterPicker(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Top Navigation Bar */}
      <View style={s.topBar}>
        <View style={s.topActions}>
          <TouchableOpacity onPress={() => navigation.navigate('TabHome')} style={s.iconBtn}>
            <Home size={21} color={colors.gold} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowBookmarks(true)} style={s.iconBtn}>
            <Bookmark size={21} color={colors.gold} fill={bookmarkedPages.length > 0 ? colors.gold : 'none'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('الإعدادات')} style={s.iconBtn}>
            <Settings size={21} color={colors.gold} />
          </TouchableOpacity>
        </View>
        <Text style={s.topTitle}>المصحف الشريف</Text>
        <View style={s.topActions}>
          <TouchableOpacity 
            onPress={async () => {
              if (isPlaying) {
                await togglePlayback();
              } else {
                const itemsToPlay = pageCache.get(currentPage)?.map(a => ({
                  surahId: a.surah.number,
                  ayahNumber: a.numberInSurah
                })) ?? [];
                if (itemsToPlay.length > 0) {
                  const sName = itemsToPlay[0].surahId ? surahsList.find(s => s.number === itemsToPlay[0].surahId)?.name : '';
                  await playSequence(itemsToPlay, sName ? `صفحة ${currentPage} - ${sName}` : `صفحة ${currentPage}`);
                }
              }
            }} 
            style={s.iconBtn}
          >
            {isBuffering ? (
              <ActivityIndicator size="small" color={colors.gold} />
            ) : isPlaying ? (
              <Pause size={21} color={colors.gold} fill={colors.gold} />
            ) : (
              <Play size={21} color={colors.gold} fill={colors.gold} />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowSurahPicker(true)} style={s.iconBtn}>
            <BookOpen size={21} color={colors.gold} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mushaf Pager View */}
      <PagerView
        ref={pagerRef}
        style={s.mushafOuter}
        initialPage={1}
        onPageSelected={onPageSelected}
        orientation="horizontal"
        overdrag={false}
      >
        {[Math.max(1, currentPage - 1), currentPage, Math.min(TOTAL_PAGES, currentPage + 1)].map((pageNum, idx) => (
          <View key={`pager-index-${idx}`} style={{ flex: 1, padding: 8 }}>
            <View style={s.frameGoldLayer}>
              <View style={s.frameCreamLayer}>
                <MushafPageContent
                  pageNum={pageNum}
                  isCurrentPage={pageNum === currentPage}
                  bookmarks={bookmarks}
                  highlightedAyah={highlightedAyah}
                  isBookmarked={bookmarkedPages.includes(pageNum)}
                  onToggleBookmark={() => dispatch(togglePageBookmark(pageNum))}
                  onAyahPress={getTafsir}
                  onAyahLongPress={(a: Ayah) => playAyah(a.surah.number, a.numberInSurah)}
                />
              </View>
            </View>
          </View>
        ))}
      </PagerView>

      {/* Footer Navigation */}
      <View style={s.ornateFooter}>
        <TouchableOpacity
          onPress={() => currentPage > 1 && dispatch(setCurrentPage(currentPage - 1))}
          style={[s.navBtn, currentPage <= 1 && s.btnDisabled]}
          disabled={currentPage <= 1}
        >
          <ChevronRight size={22} color={colors.text} />
          <Text style={s.navBtnText}>السابقة</Text>
        </TouchableOpacity>

        <View style={s.pageIndicator}>
          <Text style={s.pageIndicatorText}>{toAr(currentPage)}</Text>
        </View>

        <TouchableOpacity
          onPress={() => currentPage < TOTAL_PAGES && dispatch(setCurrentPage(currentPage + 1))}
          style={[s.navBtn, currentPage >= TOTAL_PAGES && s.btnDisabled]}
          disabled={currentPage >= TOTAL_PAGES}
        >
          <Text style={s.navBtnText}>التالية</Text>
          <ChevronLeft size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Modals & Bottom Sheets */}
      <TafsirBottomSheet
        visible={!!selectedAyah}
        selectedAyah={selectedAyah}
        tafsir={tafsir}
        tafsirName={TAFSIR_LIST.find((t) => t.id === selectedTafsirId)?.name}
        tafsirLoading={tafsirLoading}
        tafsirError={tafsirError}
        onRetryTafsir={() => selectedAyah && loadTafsir(selectedAyah)}
        tafsirStyle={tafsirStyle}
        tafsirFontSize={tafsirFontSize}
        bottomSheetAnim={bottomSheetAnim}
        bookmarks={bookmarks}
        onClose={closeBottomSheet}
        onToggleBookmark={() => selectedAyah && dispatch(toggleBookmark(selectedAyah.number))}
        onPlayAyah={playAyah}
      />

      <SurahPickerModal
        visible={showSurahPicker}
        onClose={() => setShowSurahPicker(false)}
        pickerTab={pickerTab}
        setPickerTab={setPickerTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredSurahs={filteredSurahs}
        surahsLoading={surahsLoading}
        surahsError={!!surahsError}
        onRetrySurahs={() => refetchSurahs?.()}
        onSurahSelect={handleSurahSelect}
        onJuzSelect={(n) => {
            dispatch(setCurrentPage(JUZ_PAGES[n-1]));
            setShowSurahPicker(false);
        }}
        activeReciter={activeReciter}
        currentSurahId={currentSurahId}
        isPlaying={isPlaying}
        isBuffering={isBuffering}
        onPlaySurah={(id: number, name: string) => { playSurah(id, name); }}
        togglePlayback={togglePlayback}
        onShowReciterPicker={() => setShowReciterPicker(true)}
        surahsList={surahsList}
      />

      <ReciterPickerModal
        visible={showReciterPicker}
        onClose={() => setShowReciterPicker(false)}
        activeReciter={activeReciter}
        onReciterChange={handleReciterChange}
      />

      <BookmarksModal
        visible={showBookmarks}
        onClose={() => setShowBookmarks(false)}
        bookmarkedPages={bookmarkedPages}
        onPageSelect={(p) => {
            dispatch(setCurrentPage(p));
            setShowBookmarks(false);
        }}
      />
    </SafeAreaView>
  );
};

export default QuranScreen;

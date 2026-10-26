import { ScreenProps } from '../navigation/types';
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
import { useSurahs, useTafsir } from '../hooks/useQuran';
import { useDependencies } from '../providers/DependencyProvider';

// Quran Components & Constants
import { MushafPageContent } from '../components/quran/MushafPageContent';
import { GeometricFrame, StarBadge } from '../components/quran/MushafOrnaments';
import { TafsirBottomSheet } from '../components/quran/TafsirBottomSheet';
import { PickerTab, SurahPickerModal } from '../components/quran/SurahPickerModal';
import { SURAH_START_PAGE } from '../../domain/entities/surahPages';
import type { AyahHit } from '../../data/quran/ayahSearch';
import { ReciterPickerModal } from '../components/quran/ReciterPickerModal';
import { BookmarksModal } from '../components/quran/BookmarksModal';
import { MUYASSAR_TAFSIR_ID, TAFSIR_LIST } from '../components/settings/SettingsConstants';
import { s } from '../components/quran/QuranStyles';
import { 
    TOTAL_PAGES, JUZ_PAGES, toAr, 
    Ayah, SurahMeta, H 
} from '../components/quran/QuranConstants';

const QuranScreen = ({ navigation }: Pick<ScreenProps, 'navigation'>) => {
  const dispatch = useDispatch();
  
  const currentPage = useSelector((state: RootState) => state.quran.currentPage ?? 1);
  const bookmarkedPages = useSelector((state: RootState) => state.quran.bookmarkedPages ?? []);
  const bookmarks = useSelector((state: RootState) => state.quran.bookmarks ?? []);
  
  const { selectedTafsirId, tafsirStyle, tafsirFontSize } = useSelector((state: RootState) => state.settings);

  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
  // "بسيط" means short: it always reads the concise Muyassar tafsir, whatever source is chosen
  const tafsirId = tafsirStyle === 'simple' ? MUYASSAR_TAFSIR_ID : selectedTafsirId;
  const tafsir = useTafsir(tafsirId);
  const { quran } = useDependencies();
  const [showSurahPicker, setShowSurahPicker] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedAyah, setHighlightedAyah] = useState<number | null>(null);
  const [pickerTab, setPickerTab] = useState<PickerTab>('surah');
  const [showReciterPicker, setShowReciterPicker] = useState(false);

  const pagerRef = useRef<PagerView>(null);
  const isTransitioning = useRef(false);

  const { 
    isPlaying, isBuffering, currentSurahId, activeReciter,
    playSurah, playAyah, playSequence, togglePlayback, changeReciter 
  } = useAudio();

  const bottomSheetAnim = useRef(new Animated.Value(H)).current;
  const { data: surahsData, isLoading: surahsLoading, isError: surahsError, refetch: refetchSurahs } = useSurahs();
  
  const surahsList = (surahsData as SurahMeta[] | undefined) ?? [];
  const filteredSurahs = surahsList.filter(s =>
    (s.name ?? '').includes(searchQuery) ||
    (s.englishName ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(s.number).includes(searchQuery)
  );

  const onPageSelected = useCallback((e: { nativeEvent: { position: number } }) => {
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

  const getTafsir = (ayah: Ayah) => {
    setSelectedAyah(ayah);
    setHighlightedAyah(ayah.number);
    openBottomSheet();
    tafsir.load({ surah: ayah.surah.number, ayah: ayah.numberInSurah });
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
    tafsir.cancel(); // drop any tafsir still loading for the sheet being closed
    Animated.timing(bottomSheetAnim, {
      toValue: H,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setSelectedAyah(null);
      setHighlightedAyah(null);
    });
  };

  const handleSurahSelect = (surahNumber: number) => {
    setShowSurahPicker(false);
    setSearchQuery('');
    dispatch(setCurrentPage(SURAH_START_PAGE[surahNumber - 1] ?? 1));
  };

  // open the page of a searched ayah and mark the ayah on it for a few seconds
  const searchHighlight = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const handleAyahSelect = (hit: AyahHit) => {
    setShowSurahPicker(false);
    dispatch(setCurrentPage(hit.page));
    setHighlightedAyah(hit.number);
    clearTimeout(searchHighlight.current);
    searchHighlight.current = setTimeout(() => setHighlightedAyah((h) => (h === hit.number ? null : h)), 4000);
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
                const itemsToPlay = quran.peekPage(currentPage)?.map(a => ({
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
        // pinned: by default it follows I18nManager.isRTL, which is still false on the first
        // launch after install (forceRTL needs a restart), and the swipe ran backwards
        layoutDirection="rtl"
        overdrag={false}
      >
        {[Math.max(1, currentPage - 1), currentPage, Math.min(TOTAL_PAGES, currentPage + 1)].map((pageNum, idx) => (
          <View key={`pager-index-${idx}`} style={{ flex: 1, padding: 8 }}>
            <View style={s.paperCard}>
              <GeometricFrame paper={colors.paper}>
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
              </GeometricFrame>
            </View>
          </View>
        ))}
      </PagerView>

      {/* Footer Navigation */}
      <View style={s.ornateFooter}>
        <TouchableOpacity
          onPress={() => currentPage > 1 && dispatch(setCurrentPage(currentPage - 1))}
          style={[s.navArrow, currentPage <= 1 && s.btnDisabled]}
          disabled={currentPage <= 1}
          accessibilityRole="button"
          accessibilityLabel="الصفحة السابقة"
        >
          <ChevronRight size={22} color={colors.gold} />
        </TouchableOpacity>

        <StarBadge label={toAr(currentPage)} size={46} color={colors.goldDeep} textColor={colors.goldText} />

        <TouchableOpacity
          onPress={() => currentPage < TOTAL_PAGES && dispatch(setCurrentPage(currentPage + 1))}
          style={[s.navArrow, currentPage >= TOTAL_PAGES && s.btnDisabled]}
          disabled={currentPage >= TOTAL_PAGES}
          accessibilityRole="button"
          accessibilityLabel="الصفحة التالية"
        >
          <ChevronLeft size={22} color={colors.gold} />
        </TouchableOpacity>
      </View>

      {/* Modals & Bottom Sheets */}
      <TafsirBottomSheet
        visible={!!selectedAyah}
        selectedAyah={selectedAyah}
        tafsir={tafsir.html}
        tafsirName={TAFSIR_LIST.find((t) => t.id === tafsirId)?.name}
        tafsirLoading={tafsir.loading}
        tafsirError={tafsir.error}
        onRetryTafsir={tafsir.retry}
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
        onAyahSelect={handleAyahSelect}
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

import type { Reciter } from '../../../domain/entities/reciters';
import React from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Search, BookOpen, ChevronLeft } from 'lucide-react-native';
import { ErrorState, EmptyState, ScreenHeader, Segmented } from '../ui';
import { colors, font, icon, radius, space, themed, type } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';
import { StarBadge } from './MushafOrnaments';
import { s } from './QuranStyles';
import { toAr, SurahMeta, JUZ_PAGES } from './QuranConstants';
import { RecitationList } from './RecitationList';
import { SURAH_START_JUZ, SURAH_START_PAGE } from '../../../domain/entities/surahPages';
import type { AyahHit } from '../../../domain/repositories/QuranIndex';
import { AyahSearchPanel } from './AyahSearchPanel';

export type PickerTab = 'surah' | 'ayah' | 'juz' | 'audio';

interface Props {
  visible: boolean;
  onClose: () => void;
  pickerTab: PickerTab;
  setPickerTab: (t: PickerTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredSurahs: SurahMeta[];
  surahsLoading: boolean;
  surahsError?: boolean;
  onRetrySurahs?: () => void;
  onSurahSelect: (n: number) => void;
  onJuzSelect: (n: number) => void;
  onAyahSelect: (hit: AyahHit) => void;
  activeReciter?: Reciter;
  currentSurahId: number | null;
  isPlaying: boolean;
  isBuffering: boolean;
  onPlaySurah: (n: number, name: string) => void;
  togglePlayback: () => void;
  onShowReciterPicker: () => void;
  surahsList: SurahMeta[];
  /** The page the mushaf is open on, for «كمّل القراية». */
  currentPage: number;
}

const TABS: { value: PickerTab; label: string }[] = [
  { value: 'surah', label: 'السور' },
  { value: 'ayah', label: 'الآيات' },
  { value: 'juz', label: 'الأجزاء' },
  { value: 'audio', label: 'تلاوة' },
];

/** «سُورَةُ ٱلْبَقَرَةِ» → «ٱلْبَقَرَةِ»: the list already says these are surahs. */
const bareName = (name: string) => name.replace(/^سُورَةُ\s+/, '');

/** The surah a mushaf page belongs to (the last one starting on or before it). */
const surahOfPage = (page: number) => {
  let n = 1;
  for (let i = 0; i < SURAH_START_PAGE.length && SURAH_START_PAGE[i] <= page; i++) n = i + 1;
  return n;
};

/** One surah: its number in a star, the name in the mushaf's script, and where it starts. */
const SurahRow = ({ item, onPress }: { item: SurahMeta; onPress: () => void }) => {
  const accent = useAccent();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={st.row} accessibilityRole="button">
      <StarBadge label={toAr(item.number)} size={40} color={accent.accent} textColor={colors.text} />
      <View style={st.rowText}>
        <Text style={st.rowName} numberOfLines={1}>{bareName(item.name)}</Text>
        <Text style={st.rowSub}>
          {item.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} · {toAr(item.numberOfAyahs)} {item.numberOfAyahs <= 10 ? 'آيات' : 'آية'}
        </Text>
      </View>
      <Text style={st.rowPage}>ص {toAr(SURAH_START_PAGE[item.number - 1])}</Text>
    </TouchableOpacity>
  );
};

export const SurahPickerModal = ({
  visible, onClose, pickerTab, setPickerTab, searchQuery, setSearchQuery,
  filteredSurahs, surahsLoading, surahsError, onRetrySurahs, onSurahSelect, onJuzSelect, onAyahSelect,
  activeReciter, currentSurahId, isPlaying, isBuffering, onPlaySurah, togglePlayback,
  onShowReciterPicker, surahsList, currentPage
}: Props) => {
  const accent = useAccent();
  const here = surahsList[surahOfPage(currentPage) - 1];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader
          title="فهرس القرآن"
          right={<TouchableOpacity onPress={onClose} style={s.iconBtn} accessibilityLabel="إغلاق"><X size={22} color={colors.text} /></TouchableOpacity>}
        />

        {pickerTab === 'surah' && here && !searchQuery ? (
          <TouchableOpacity onPress={onClose} activeOpacity={0.85} style={[st.resume, { backgroundColor: accent.accentSoft }]} accessibilityRole="button">
            <View style={st.flex}>
              <Text style={[st.resumeKicker, { color: accent.accent }]}>كمّل القراية</Text>
              <Text style={st.resumeTitle} numberOfLines={1}>{bareName(here.name)} · صفحة {toAr(currentPage)}</Text>
            </View>
            <View style={[st.resumeGo, { backgroundColor: accent.accent }]}>
              <ChevronLeft size={icon.size.md} color={accent.onAccent} strokeWidth={icon.stroke} />
            </View>
          </TouchableOpacity>
        ) : null}

        <View style={st.searchWrap}>
          <Search size={18} color={colors.textMuted} strokeWidth={icon.stroke} />
          <TextInput
            style={st.searchInput}
            placeholder="ابحث باسم السورة أو رقمها"
            value={searchQuery}
            onChangeText={(q) => { setSearchQuery(q); if (pickerTab !== 'surah') setPickerTab('surah'); }}
            textAlign="right"
            placeholderTextColor={colors.textFaint}
          />
        </View>

        <Segmented options={TABS} value={pickerTab} onChange={setPickerTab} style={st.tabs} />

        {pickerTab === 'surah' ? (
          <>
            {surahsLoading ? <ActivityIndicator size="large" color={colors.gold} style={{ marginTop: 40 }} /> : surahsError ? (
              <ErrorState message="تعذّر تحميل فهرس السور" onRetry={onRetrySurahs} />
            ) : (
              <FlatList
                key="surah-list"
                data={filteredSurahs}
                keyExtractor={(item) => String(item.number)}
                ListEmptyComponent={<EmptyState icon={BookOpen} title="لا توجد نتائج" message="جرّب اسماً آخر أو رقم السورة" />}
                ItemSeparatorComponent={() => <View style={st.sep} />}
                contentContainerStyle={st.listPad}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => <SurahRow item={item} onPress={() => onSurahSelect(item.number)} />}
              />
            )}
          </>
        ) : pickerTab === 'ayah' ? (
          <AyahSearchPanel surahs={surahsList} onSelect={onAyahSelect} />
        ) : pickerTab === 'juz' ? (
          <FlatList
            key="juz-list"
            data={Array.from({ length: 30 }, (_, i) => i + 1)}
            keyExtractor={i => String(i)}
            numColumns={3}
            contentContainerStyle={{ padding: 15 }}
            renderItem={({ item }) => (
              <TouchableOpacity 
                onPress={() => onJuzSelect(item)}
                style={s.juzBox}
              >
                <Text style={s.juzBoxTitle}>الجزء</Text>
                <Text style={s.juzBoxNum}>{toAr(item)}</Text>
                <Text style={s.juzBoxPage}>صفحة {toAr(JUZ_PAGES[item-1])}</Text>
              </TouchableOpacity>
            )}
          />
        ) : (
          <RecitationList
            reciterName={activeReciter?.name}
            onChangeReciter={onShowReciterPicker}
            currentSurahId={currentSurahId}
            isPlaying={isPlaying}
            isBuffering={isBuffering}
            onPressSurah={(n, name) => (currentSurahId === n ? togglePlayback() : onPlaySurah(n, name))}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const st = themed(() => ({
  flex: { flex: 1 },
  resume: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: space[5], marginBottom: space[3],
    borderRadius: radius.card, paddingVertical: space[3], paddingHorizontal: space[4],
  },
  resumeKicker: { ...type.caption },
  resumeTitle: { fontFamily: font.quran, fontSize: 20, lineHeight: 32, color: colors.text },
  resumeGo: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, marginHorizontal: space[5],
    marginBottom: space[3], borderRadius: radius.pill, paddingHorizontal: space[4], height: 46,
  },
  searchInput: { flex: 1, ...type.body, color: colors.text, paddingVertical: 0, marginStart: space[2] },
  tabs: { marginHorizontal: space[5], marginBottom: space[2] },
  listPad: { paddingBottom: space[8] },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space[5], paddingVertical: space[3] },
  rowText: { flex: 1, marginHorizontal: space[4] },
  rowName: { fontFamily: font.quran, fontSize: 21, lineHeight: 34, color: colors.text },
  rowSub: { ...type.caption, color: colors.textMuted },
  rowPage: { ...type.caption, color: colors.textFaint },
  sep: { height: 1, backgroundColor: colors.hairline, marginStart: space[5] + 40 + space[4], marginEnd: space[5] },
}));

import type { Reciter } from '../../../data/services/AudioService';
import React from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Search, Play, Pause, User, BookOpen, Star } from 'lucide-react-native';
import { Chip, ErrorState, EmptyState, ScreenHeader } from '../ui';
import { colors } from '../../../shared/theme/tokens';
import { s } from './QuranStyles';
import { toAr, SurahMeta, JUZ_PAGES } from './QuranConstants';
import { RECITER_MAP } from '../../../data/services/AudioService';
import { SURAH_START_JUZ, SURAH_START_PAGE } from '../../../domain/entities/surahPages';
import type { AyahHit } from '../../../data/quran/ayahSearch';
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
}

export const SurahPickerModal = ({
  visible, onClose, pickerTab, setPickerTab, searchQuery, setSearchQuery,
  filteredSurahs, surahsLoading, surahsError, onRetrySurahs, onSurahSelect, onJuzSelect, onAyahSelect,
  activeReciter, currentSurahId, isPlaying, isBuffering, onPlaySurah, togglePlayback,
  onShowReciterPicker, surahsList
}: Props) => {

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader
          title="فهرس القرآن"
          right={<TouchableOpacity onPress={onClose} style={s.iconBtn} accessibilityLabel="إغلاق"><X size={22} color={colors.text} /></TouchableOpacity>}
        />

        <View style={s.pickerTabs}>
          <Chip label="السور" selected={pickerTab === 'surah'} onPress={() => setPickerTab('surah')} />
          <Chip label="الآيات" selected={pickerTab === 'ayah'} onPress={() => setPickerTab('ayah')} />
          <Chip label="الأجزاء" selected={pickerTab === 'juz'} onPress={() => setPickerTab('juz')} />
          <Chip label="تلاوة كاملة" selected={pickerTab === 'audio'} onPress={() => setPickerTab('audio')} />
        </View>

        {pickerTab === 'surah' ? (
          <>
            <View style={s.searchFieldWrap}>
              <Search size={18} color={colors.textMuted} />
              <TextInput 
                style={s.searchInput} 
                placeholder="ابحث باسم السورة..." 
                value={searchQuery} 
                onChangeText={setSearchQuery} 
                textAlign="right" 
                placeholderTextColor={colors.textFaint}
              />
            </View>
            {surahsLoading ? <ActivityIndicator size="large" color={colors.gold} style={{ marginTop: 40 }} /> : surahsError ? (
              <ErrorState message="تعذّر تحميل فهرس السور" onRetry={onRetrySurahs} />
            ) : (
              <FlatList
                key="surah-list"
                data={filteredSurahs}
                keyExtractor={(item) => String(item.number)}
                ListEmptyComponent={<EmptyState icon={BookOpen} title="لا توجد نتائج" message="جرّب اسماً آخر أو رقم السورة" />}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => onSurahSelect(item.number)} style={s.surahEntry}>
                    <View style={s.surahNumHex}><Text style={s.surahNumHexText}>{toAr(item.number)}</Text></View>
                    <View style={s.surahTextSection}>
                      <View style={s.surahRowTop}>
                        <Text style={s.surahEntryName}>{item.name}</Text>
                        {item.revelationType && (
                          <View style={[s.revBadge, item.revelationType === 'Meccan' ? s.meccanBg : s.medinanBg]}>
                            <Text style={s.revText}>{item.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</Text>
                          </View>
                        )}
                      </View>
                      <View style={s.surahMetaRow}>
                        <Text style={s.surahEntrySub}>{toAr(item.numberOfAyahs)} آية</Text>
                        <View style={s.vDivider} />
                        <Text style={s.surahEntrySub}>الجزء {toAr(SURAH_START_JUZ[item.number - 1])}</Text>
                        <View style={s.vDivider} />
                        <Text style={s.surahEntrySub}>صفحة {toAr(SURAH_START_PAGE[item.number - 1])}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
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
          <>
            <View style={s.reciterHeader}>
              <View style={s.reciterInfo}>
                <Text style={s.reciterLabel}>القارئ الحالي:</Text>
                <Text style={s.reciterActiveName}>{activeReciter?.name}</Text>
              </View>
              <TouchableOpacity onPress={onShowReciterPicker} style={s.changeReciterBtn}>
                <User size={18} color={colors.goldText} />
                <Text style={s.changeReciterText}>تغيير القارئ</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              key="audio-list"
              data={surahsList}
              keyExtractor={(item) => String(item.number)}
              renderItem={({ item }) => (
                <TouchableOpacity 
                   onPress={() => {
                     if (currentSurahId === item.number) {
                       togglePlayback();
                     } else {
                       onPlaySurah(item.number, item.name || '');
                     }
                   }} 
                   style={[s.surahEntry, currentSurahId === item.number && s.surahEntryActive]}
                >
                  <View style={s.surahNumHex}>
                    {currentSurahId === item.number && isPlaying ? (
                      <Pause size={18} color={colors.goldText} fill={colors.goldText} />
                    ) : (
                      <Play size={18} color={colors.goldText} fill={colors.goldText} />
                    )}
                  </View>
                  <View style={s.surahTextSection}>
                    <Text style={s.surahEntryName}>{item.name}</Text>
                    <Text style={s.surahEntrySub}>تلاوة كاملة لـ {item.englishName}</Text>
                  </View>
                  {currentSurahId === item.number && isBuffering && (
                    <ActivityIndicator size="small" color={colors.goldText} />
                  )}
                </TouchableOpacity>
              )}
            />
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
};

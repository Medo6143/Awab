import React from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Search, Play, Pause, User, Star } from 'lucide-react-native';
import { s } from './QuranStyles';
import { toAr, SurahMeta, JUZ_PAGES } from './QuranConstants';
import { RECITER_MAP } from '../../../data/services/AudioService';

interface Props {
  visible: boolean;
  onClose: () => void;
  pickerTab: 'surah' | 'juz' | 'audio';
  setPickerTab: (t: 'surah' | 'juz' | 'audio') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredSurahs: SurahMeta[];
  surahsLoading: boolean;
  onSurahSelect: (n: number) => void;
  onJuzSelect: (n: number) => void;
  activeReciter: any;
  currentSurahId: number | null;
  isPlaying: boolean;
  isBuffering: boolean;
  onPlaySurah: (n: number) => void;
  onShowReciterPicker: () => void;
  surahsList: SurahMeta[];
}

export const SurahPickerModal = ({
  visible, onClose, pickerTab, setPickerTab, searchQuery, setSearchQuery,
  filteredSurahs, surahsLoading, onSurahSelect, onJuzSelect,
  activeReciter, currentSurahId, isPlaying, isBuffering, onPlaySurah,
  onShowReciterPicker, surahsList
}: Props) => {

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0c0805' }}>
        <View style={s.modalHead}>
          <TouchableOpacity onPress={onClose}><X size={26} color="#fcd34d" /></TouchableOpacity>
          <Text style={s.modalHeadTitle}>فهرس القرآن</Text>
          <View style={{ width: 26 }} />
        </View>
        
        <View style={s.pickerTabs}>
          <TouchableOpacity onPress={() => setPickerTab('surah')} style={[s.pickerTab, pickerTab === 'surah' && s.pickerTabActive]}>
            <Text style={[s.tabLabel, pickerTab === 'surah' && s.tabLabelActive]}>السور</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPickerTab('juz')} style={[s.pickerTab, pickerTab === 'juz' && s.pickerTabActive]}>
            <Text style={[s.tabLabel, pickerTab === 'juz' && s.tabLabelActive]}>الأجزاء</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPickerTab('audio')} style={[s.pickerTab, pickerTab === 'audio' && s.pickerTabActive]}>
            <Text style={[s.tabLabel, pickerTab === 'audio' && s.tabLabelActive]}>تلاوة كاملة</Text>
          </TouchableOpacity>
        </View>

        {pickerTab === 'surah' ? (
          <>
            <View style={s.searchFieldWrap}>
              <Search size={20} color="#d4af37" />
              <TextInput 
                style={s.searchInput} 
                placeholder="ابحث باسم السورة..." 
                value={searchQuery} 
                onChangeText={setSearchQuery} 
                textAlign="right" 
                placeholderTextColor="#94a3b8" 
              />
            </View>
            {surahsLoading ? <ActivityIndicator size="large" color="#fcd34d" /> : (
              <FlatList
                key="surah-list"
                data={filteredSurahs}
                keyExtractor={(item) => String(item.number)}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => onSurahSelect(item.number)} style={s.surahEntry}>
                    <View style={s.surahNumHex}><Text style={s.surahNumHexText}>{item.number}</Text></View>
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
                        <Text style={s.surahEntrySub}>الجزء {toAr(Math.ceil(item.number / 3.8))} </Text>
                        <View style={s.vDivider} />
                        <Text style={s.surahEntrySub}>صفحة {toAr(item.number * 5)}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </>
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
                <User size={18} color="#fcd34d" />
                <Text style={s.changeReciterText}>تغيير القارئ</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              key="audio-list"
              data={surahsList}
              keyExtractor={(item) => String(item.number)}
              renderItem={({ item }) => (
                <TouchableOpacity 
                   onPress={() => onPlaySurah(item.number)} 
                   style={[s.surahEntry, currentSurahId === item.number && { borderColor: '#fcd34d', backgroundColor: '#2b1f15' }]}
                >
                  <View style={s.surahNumHex}>
                    {currentSurahId === item.number && isPlaying ? (
                      <Pause size={18} color="#fcd34d" fill="#fcd34d" />
                    ) : (
                      <Play size={18} color="#fcd34d" fill="#fcd34d" />
                    )}
                  </View>
                  <View style={s.surahTextSection}>
                    <Text style={s.surahEntryName}>{item.name}</Text>
                    <Text style={s.surahEntrySub}>تلاوة كاملة لـ {item.englishName}</Text>
                  </View>
                  {currentSurahId === item.number && isBuffering && (
                    <ActivityIndicator size="small" color="#fcd34d" />
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

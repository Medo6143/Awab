import React from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Pause, Play, User } from 'lucide-react-native';
import { s } from './QuranStyles';
import { colors } from '../../../shared/theme/tokens';
import { toAr } from '../../../shared/utils/format';
import { SURAH_AYAH_COUNTS, SURAH_NAMES } from '../../../shared/constants/surahs';
import { ayahsLabel } from '../tasmee/tasmeeText';

type Props = {
  reciterName?: string;
  onChangeReciter: () => void;
  currentSurahId: number | null;
  isPlaying: boolean;
  isBuffering: boolean;
  /** Plays the surah, or pauses/resumes it when it is the current one. */
  onPressSurah: (surah: number, name: string) => void;
  /** Room below the last row (e.g. for a player bar). */
  bottomInset?: number;
};

const SURAHS = SURAH_NAMES.map((name, i) => ({ number: i + 1, name, ayahs: SURAH_AYAH_COUNTS[i] }));

/**
 * The 114 surahs for full recitation, with the chosen reciter on top. Used by the mushaf
 * index and the «التلاوات» screen; both drive the one shared player (useAudio).
 * Built from the bundled surah list, so it shows without a network request.
 */
export const RecitationList = ({ reciterName, onChangeReciter, currentSurahId, isPlaying, isBuffering, onPressSurah, bottomInset = 0 }: Props) => (
  <FlatList
    data={SURAHS}
    keyExtractor={(item) => String(item.number)}
    contentContainerStyle={{ paddingBottom: bottomInset }}
    ListHeaderComponent={
      <View style={s.reciterHeader}>
        <View style={s.reciterInfo}>
          <Text style={s.reciterLabel}>القارئ</Text>
          <Text style={s.reciterActiveName}>{reciterName}</Text>
        </View>
        <TouchableOpacity onPress={onChangeReciter} style={s.changeReciterBtn} accessibilityRole="button">
          <User size={18} color={colors.goldText} />
          <Text style={s.changeReciterText}>تغيير القارئ</Text>
        </TouchableOpacity>
      </View>
    }
    renderItem={({ item }) => {
      const current = currentSurahId === item.number;
      return (
        <TouchableOpacity
          onPress={() => onPressSurah(item.number, item.name)}
          style={[s.surahEntry, current && s.surahEntryActive]}
          accessibilityRole="button"
          accessibilityLabel={`${current && isPlaying ? 'إيقاف' : 'تشغيل'} سورة ${item.name}`}
        >
          <View style={s.surahNumHex}>
            {current && isPlaying ? (
              <Pause size={18} color={colors.goldText} fill={colors.goldText} />
            ) : (
              <Play size={18} color={colors.goldText} fill={colors.goldText} />
            )}
          </View>
          <View style={s.surahTextSection}>
            <Text style={s.surahEntryName}>{`سورة ${item.name}`}</Text>
            <Text style={s.surahEntrySub}>{`${toAr(item.number)} · ${ayahsLabel(item.ayahs, toAr)}`}</Text>
          </View>
          {current && isBuffering ? <ActivityIndicator size="small" color={colors.goldText} /> : null}
        </TouchableOpacity>
      );
    }}
  />
);

import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pause, Play, Radio, Search } from 'lucide-react-native';
import { ScreenProps } from '../navigation/types';
import { ErrorState, Screen, ScreenHeader, SectionTitle, Skeleton } from '../components/ui';
import { NOW_PLAYING_BAR_H, NowPlayingBar } from '../components/quran/NowPlayingBar';
import { s as qs } from '../components/quran/QuranStyles';
import { useAudio } from '../hooks/useAudio';
import { useRadioStations } from '../hooks/useRadioStations';
import { FEATURED_STATIONS, RadioStation, searchStations } from '../../domain/entities/radio';
import { toAr } from '../../shared/utils/format';
import { colors, icon, radius, space, type, themed } from '../../shared/theme/tokens';
import { useAccent } from '../../shared/theme/useAccent';

/**
 * «الإذاعة»: the Cairo and Saudi Quran radios on top, then mp3quran's live stations (reciters
 * around the clock, tafsir, ruqyah) with a search. Same player as recitations (useAudio), so
 * one thing plays at a time, in the background, with the media notification.
 */
const RadioScreen = ({ navigation }: Pick<ScreenProps, 'navigation'>) => {
  const accent = useAccent();
  const bottom = useSafeAreaInsets().bottom;
  const [query, setQuery] = useState('');
  const { stations, loading, error, retry } = useRadioStations();
  const { playMode, liveStation, isPlaying, isBuffering, playLive, togglePlayback, stopPlayback } = useAudio();
  const current = playMode === 'live' ? liveStation : null;
  const list = useMemo(() => searchStations(stations ?? [], query), [stations, query]);

  const press = (station: RadioStation) => (current?.url === station.url ? togglePlayback() : playLive(station));
  const stateOf = (station: RadioStation) => (current?.url === station.url ? (isBuffering ? 'loading' : isPlaying ? 'playing' : 'paused') : 'idle');

  const header = (
    <View>
      {FEATURED_STATIONS.map((station, i) => {
        const state = stateOf(station);
        return (
          <TouchableOpacity
            key={station.id}
            style={[st.featured, i === 0 && { borderColor: colors.goldLine, backgroundColor: colors.surfaceRaised }]}
            onPress={() => press(station)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`${state === 'playing' ? 'إيقاف' : 'تشغيل'} ${station.name}`}
          >
            <View style={[st.featuredIcon, { backgroundColor: accent.accentSoft }]}>
              <Radio size={icon.size.lg} color={accent.accentText} strokeWidth={icon.stroke} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.featuredName}>{station.name}</Text>
              <View style={st.liveRow}>
                <View style={[st.dot, { backgroundColor: colors.dangerText }]} />
                <Text style={st.featuredSub}>{state === 'playing' ? 'شغّالة دلوقتي' : station.subtitle}</Text>
              </View>
            </View>
            <PlayGlyph state={state} color={accent.onAccent} bg={accent.accent} />
          </TouchableOpacity>
        );
      })}
      <Text style={st.note}>البث المباشر بيستهلك حوالي ٣٠ ميجا في الساعة.</Text>

      <SectionTitle title="إذاعات القرّاء والتفسير" />
      <View style={[qs.searchFieldWrap, { marginHorizontal: 0 }]}>
        <Search size={18} color={colors.textMuted} />
        <TextInput
          style={qs.searchInput}
          placeholder="دوّر باسم القارئ أو الإذاعة"
          value={query}
          onChangeText={setQuery}
          textAlign="right"
          placeholderTextColor={colors.textFaint}
        />
      </View>
      {loading ? (
        <View>{[0, 1, 2].map((k) => <Skeleton key={k} height={56} radius={radius.card} style={{ marginBottom: space[2] }} />)}</View>
      ) : error ? (
        <ErrorState compact message="تعذّر تحميل قايمة الإذاعات. اتأكد من النت." onRetry={retry} />
      ) : list.length === 0 ? (
        <Text style={st.note}>مفيش إذاعة بالاسم ده.</Text>
      ) : (
        <Text style={st.count}>{`${toAr(list.length)} إذاعة`}</Text>
      )}
    </View>
  );

  return (
    <Screen padded={false} header={<ScreenHeader title="الإذاعة" subtitle="إذاعة القرآن الكريم وإذاعات القرّاء مباشر" onBack={() => navigation.goBack()} />}>
      <FlatList
        data={loading || error ? [] : list}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: space[5], paddingBottom: (current ? NOW_PLAYING_BAR_H + space[3] : 0) + space[8] + bottom }}
        renderItem={({ item }) => {
          const state = stateOf(item);
          return (
            <TouchableOpacity
              style={[st.row, state !== 'idle' && { backgroundColor: colors.surfaceRaised }]}
              onPress={() => press(item)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`${state === 'playing' ? 'إيقاف' : 'تشغيل'} ${item.name}`}
            >
              <Text style={st.rowName} numberOfLines={1}>{item.name}</Text>
              <PlayGlyph state={state} color={accent.accentText} bg={accent.accentSoft} small />
            </TouchableOpacity>
          );
        }}
      />

      {current ? (
        <NowPlayingBar title={current.name} live isPlaying={isPlaying} isBuffering={isBuffering} onToggle={togglePlayback} onStop={stopPlayback} />
      ) : null}
    </Screen>
  );
};

/** The play / pause / loading circle at the end of a station. */
const PlayGlyph = ({ state, color, bg, small }: { state: string; color: string; bg: string; small?: boolean }) => {
  const size = small ? 36 : 44;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      {state === 'loading' ? (
        <ActivityIndicator size="small" color={color} />
      ) : state === 'playing' ? (
        <Pause size={small ? icon.size.sm : icon.size.md} color={color} fill={color} />
      ) : (
        <Play size={small ? icon.size.sm : icon.size.md} color={color} fill={color} />
      )}
    </View>
  );
};

const st = themed(() => ({
  featured: {
    flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[4], marginBottom: space[3],
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radius.card,
  },
  featuredIcon: { width: 48, height: 48, borderRadius: radius.tile, alignItems: 'center', justifyContent: 'center' },
  featuredName: { ...type.bodyMedium, color: colors.text },
  liveRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  dot: { width: 6, height: 6, borderRadius: 3, marginEnd: 6 },
  featuredSub: { ...type.caption, color: colors.textMuted },
  note: { ...type.caption, color: colors.textMuted, marginBottom: space[4] },
  count: { ...type.caption, color: colors.textMuted, marginBottom: space[2] },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: space[3], paddingHorizontal: space[4],
    backgroundColor: colors.surface, borderRadius: radius.card, marginBottom: space[2],
  },
  rowName: { ...type.bodyMedium, color: colors.text, flex: 1 },
}));

export default RadioScreen;

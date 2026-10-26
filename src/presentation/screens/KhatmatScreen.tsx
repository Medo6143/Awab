import React, { useMemo, useRef, useState } from 'react';
import { Animated, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { ChevronLeft, HeartPulse } from 'lucide-react-native';
import { ScreenProps } from '../navigation/types';
import { RootState } from '../store';
import { finishedCount, HeartMode, Khatma } from '../store/slices/quranSlice';
import { EmptyState, ScreenHeader } from '../components/ui';
import { AnatomicalHeart } from '../components/heart/AnatomicalHeart';
import { ModeSwitch } from '../components/heart/ModeSwitch';
import { ALL_SURAHS, daysBetween, daysLabel, formatDate, khatmaTitle, MODE_NOUN } from '../components/heart/khatmaFormat';
import { ImageShareModal } from '../components/share/ImageShareModal';
import { HeartShareCard } from '../components/share/HeartShareCard';
import { toAr } from '../../shared/utils/format';
import { colors, icon, radius, space, type } from '../../shared/theme/tokens';

const EMPTY: Khatma[] = [];

/** Log of finished khatmat, one list per heart (reading / memorization). Tap a row to share its heart. */
const KhatmatScreen = ({ navigation, route }: ScreenProps<'الختمات'>) => {
  const [mode, setMode] = useState<HeartMode>(route.params?.mode ?? 'reading');
  const quran = useSelector((s: RootState) => s.quran);
  const all = quran.khatmat ?? EMPTY;
  const still = useRef(new Animated.Value(1)).current;
  const [shared, setShared] = useState<Khatma | null>(null);

  const list = useMemo(() => all.filter((k) => k.mode === mode).sort((a, b) => b.number - a.number), [all, mode]);
  const counts = { reading: toAr(finishedCount(quran, 'reading')), hifz: toAr(finishedCount(quran, 'hifz')) };
  // reading khatmat counted before the log existed have no record
  const unlogged = finishedCount(quran, mode) - list.length;

  return (
    <SafeAreaView edges={['top']} style={st.root}>
      <ScreenHeader title="سجل الختمات" onBack={() => navigation.goBack()} />
      <ModeSwitch mode={mode} onChange={setMode} counts={counts} />

      <FlatList
        data={list}
        keyExtractor={(k) => k.id}
        contentContainerStyle={st.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={st.row} onPress={() => setShared(item)} accessibilityRole="button" accessibilityLabel={`${khatmaTitle(item.number)}، مشاركة صورة القلب`}>
            <AnatomicalHeart pulseAnim={still} completedSurahs={ALL_SURAHS} progress={1} size={56} labels={false} />
            <View style={st.rowText}>
              <Text style={st.title}>{khatmaTitle(item.number)}</Text>
              <Text style={st.dates}>
                {item.startedAt ? `${formatDate(item.startedAt)} ← ${formatDate(item.finishedAt)}` : `اكتملت ${formatDate(item.finishedAt)}`}
              </Text>
              {item.startedAt ? <Text style={st.days}>{daysLabel(daysBetween(item.startedAt, item.finishedAt))}</Text> : null}
            </View>
            <ChevronLeft size={icon.size.md} color={colors.textFaint} strokeWidth={icon.stroke} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={unlogged > 0 ? null : (
          <EmptyState
            icon={HeartPulse}
            title={mode === 'reading' ? 'لم تكتمل ختمة قراءة بعد' : 'لم تكتمل ختمة حفظ بعد'}
            message="عند إتمام الختمة يُحفظ قلبها هنا مع تاريخ البداية والنهاية"
          />
        )}
        ListFooterComponent={unlogged > 0 ? (
          <Text style={st.note}>
            {unlogged === 1 ? 'ختمة سابقة' : `${toAr(unlogged)} ختمات سابقة`} قبل بدء السجل، بدون تواريخ
          </Text>
        ) : list.length ? <Text style={st.note}>اضغط على الختمة لمشاركة صورة قلبها</Text> : null}
      />

      <ImageShareModal visible={!!shared} title="صورة الختمة" onClose={() => setShared(null)}>
        {shared ? (
          <HeartShareCard completedSurahs={ALL_SURAHS} mode={shared.mode} number={shared.number} startedAt={shared.startedAt} finishedAt={shared.finishedAt} />
        ) : null}
      </ImageShareModal>
    </SafeAreaView>
  );
};

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  list: { paddingHorizontal: 20, paddingBottom: space[10], flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[4], backgroundColor: colors.surface, borderRadius: radius.card, padding: space[3], marginBottom: space[2] },
  rowText: { flex: 1 },
  title: { ...type.bodyMedium, fontFamily: 'Tajawal_700Bold', fontSize: 16, color: colors.text },
  dates: { ...type.caption, color: colors.textMuted, marginTop: 2 },
  days: { ...type.caption, color: colors.gold, marginTop: 2 },
  note: { ...type.caption, color: colors.textMuted, textAlign: 'center', marginTop: space[3] },
});

export default KhatmatScreen;

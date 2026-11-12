import React, { useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Bookmark, BookOpen } from 'lucide-react-native';
import { s } from './QuranStyles';
import { colors, space, type, themed } from '../../../shared/theme/tokens';
import { toAr } from './QuranConstants';
import { SURAH_NAMES } from '../../../shared/constants/surahs';
import type { AyahHit } from '../../../domain/repositories/QuranIndex';
import { useDependencies } from '../../providers/DependencyProvider';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Saved ayahs, by global number (1..6236). */
  bookmarkedAyahs: number[];
  bookmarkedPages: number[];
  onAyahSelect: (hit: AyahHit) => void;
  onPageSelect: (p: number) => void;
}

type Row = { kind: 'ayah'; hit: AyahHit } | { kind: 'page'; page: number };

/** Saved ayahs (from the tafsir sheet) and saved pages; a tap opens the place in the mushaf. */
export const BookmarksModal = ({ visible, onClose, bookmarkedAyahs, bookmarkedPages, onAyahSelect, onPageSelect }: Props) => {
  const { quranIndex } = useDependencies();
  const sections = useMemo(() => {
    if (!visible) return [];
    const ayahs = bookmarkedAyahs
      .map((n) => quranIndex.ayahByNumber(n))
      .filter((h): h is AyahHit => !!h)
      .sort((a, b) => a.number - b.number)
      .map((hit): Row => ({ kind: 'ayah', hit }));
    const pages = [...bookmarkedPages].sort((a, b) => a - b).map((page): Row => ({ kind: 'page', page }));
    return [
      ...(ayahs.length ? [{ title: 'آيات محفوظة', data: ayahs }] : []),
      ...(pages.length ? [{ title: 'صفحات محفوظة', data: pages }] : []),
    ];
  }, [visible, bookmarkedAyahs, bookmarkedPages]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={s.modalHead}>
          <TouchableOpacity onPress={onClose} accessibilityLabel="إغلاق"><X size={26} color={colors.goldText} /></TouchableOpacity>
          <Text style={s.modalHeadTitle}>المحفوظات</Text>
          <View style={{ width: 26 }} />
        </View>
        <SectionList
          sections={sections}
          keyExtractor={(r) => (r.kind === 'ayah' ? `a${r.hit.number}` : `p${r.page}`)}
          renderSectionHeader={({ section }) => <Text style={st.sectionTitle}>{section.title}</Text>}
          stickySectionHeadersEnabled={false}
          renderItem={({ item }) =>
            item.kind === 'ayah' ? (
              <TouchableOpacity onPress={() => onAyahSelect(item.hit)} style={s.bookmarkRow} accessibilityRole="button">
                <BookOpen size={22} color={colors.goldText} />
                <View style={{ flex: 1 }}>
                  <Text style={s.bookmarkRowLabel}>{`${SURAH_NAMES[item.hit.surah - 1]} · آية ${toAr(item.hit.ayah)}`}</Text>
                  <Text style={st.snippet} numberOfLines={2}>{item.hit.text}</Text>
                  <Text style={st.meta}>{`صفحة ${toAr(item.hit.page)}`}</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => onPageSelect(item.page)} style={s.bookmarkRow} accessibilityRole="button">
                <Bookmark size={22} color={colors.goldText} fill={colors.goldText} />
                <Text style={s.bookmarkRowLabel}>صفحة {toAr(item.page)}</Text>
              </TouchableOpacity>
            )
          }
          ListEmptyComponent={
            <Text style={s.emptyBoxText}>
              {'لسه ما حفظتش آيات ولا صفحات.\nدوس على أي آية في المصحف واختار «حفظ»، أو علّم الصفحة من العلامة اللي فوق.'}
            </Text>
          }
        />
      </SafeAreaView>
    </Modal>
  );
};

const st = themed(() => ({
  sectionTitle: { ...type.label, color: colors.textMuted, marginHorizontal: space[5], marginTop: space[4], marginBottom: space[2] },
  snippet: { fontFamily: 'Amiri_400Regular', fontSize: 16, lineHeight: 28, color: colors.textSoft, marginTop: space[1] },
  meta: { ...type.caption, color: colors.textMuted, marginTop: 2 },
}));

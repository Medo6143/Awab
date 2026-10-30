import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { colors } from '../../../shared/theme/tokens';
import { Bookmark } from 'lucide-react-native';
import { toAr, Ayah, mushafAyahText } from './QuranConstants';
import { useMushafPage } from '../../hooks/useQuran';
import { s } from './QuranStyles';

interface Props {
  pageNum: number;
  isCurrentPage: boolean;
  bookmarks: number[];
  highlightedAyah: number | null;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onAyahPress: (a: Ayah) => void;
  onAyahLongPress: (a: Ayah) => void;
}

export const MushafPageContent = React.memo(({ 
  pageNum, isCurrentPage, bookmarks, highlightedAyah, isBookmarked,
  onToggleBookmark, onAyahPress, onAyahLongPress
}: Props) => {
  const { ayahs, loading, error, retry } = useMushafPage(pageNum);
  const scrollRef = useRef<ScrollView>(null);

  // The pager reuses this component for the "current" slot, so without this the
  // scroll offset of the previous page carries over to the next one.
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [pageNum]);

  const surahGroups = useMemo(() => {
    const groups: { surahNum: number; surahName: string; ayahs: Ayah[] }[] = [];
    ayahs.forEach(a => {
      const last = groups[groups.length - 1];
      if (!last || last.surahNum !== a.surah?.number) {
        groups.push({ surahNum: a.surah?.number, surahName: a.surah?.name, ayahs: [a] });
      } else { last.ayahs.push(a); }
    });
    return groups;
  }, [ayahs]);
  const juz = ayahs[0]?.juz;

  return (
    <View style={{ flex: 1 }}>
      <View style={s.pageHeader}>
        <Text style={s.pageHeaderText}>{surahGroups[0]?.surahName ?? ''}</Text>
        <TouchableOpacity onPress={onToggleBookmark} hitSlop={10} accessibilityRole="button" accessibilityLabel={isBookmarked ? 'إزالة العلامة' : 'وضع علامة على الصفحة'}>
          <Bookmark size={18} color={colors.goldDeep} fill={isBookmarked ? colors.goldDeep : 'none'} />
        </TouchableOpacity>
        <Text style={s.pageHeaderText}>{juz ? `الجزء ${toAr(juz)}` : ''}</Text>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={s.ayahList} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={s.centerLoader}>
            <ActivityIndicator size="large" color={colors.gold} />
            <Text style={s.loaderSub}>يتم جلب الآيات...</Text>
          </View>
        ) : error ? (
          <View style={s.pageError}>
            <AlertTriangle size={32} color={colors.goldDeep} style={{ alignSelf: 'center' }} />
            <Text style={s.pageErrorText}>تعذّر تحميل الصفحة. تأكد من الاتصال بالإنترنت.</Text>
            <TouchableOpacity style={s.pageRetryBtn} onPress={retry} accessibilityRole="button">
              <Text style={s.pageRetryText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        ) : (
          surahGroups.map(group => (
            <View key={group.surahNum} style={s.surahGroup}>
              {group.ayahs[0]?.numberInSurah === 1 && (
                <View style={s.surahBand}>
                  <View style={s.surahBandRule} />
                  <View style={s.surahBandPill}>
                    <Text style={s.surahBandTitle}>{group.surahName}</Text>
                  </View>
                  <View style={s.surahBandRule} />
                </View>
              )}

              {group.surahNum !== 9 && group.ayahs[0]?.numberInSurah === 1 && (
                <View style={s.basmalaContainer}>
                  <Text style={s.mushafBasmala}>بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</Text>
                </View>
              )}

              <Text style={s.textFlow}>
                {group.ayahs.map(a => {
                   const text = mushafAyahText(a);

                   // If after cleaning, text is empty (common in Fatiha Ayah 1), 
                   // we still want to show the marker OR skip if it's Fatiha and we have a header
                   if (!text && a.surah.number !== 1) return null; 

                   return (
                    <Text
                      key={a.number}
                      onPress={() => isCurrentPage && onAyahPress(a)}
                      onLongPress={() => isCurrentPage && onAyahLongPress(a)}
                      style={[s.singleAyah, highlightedAyah === a.number && s.highlightedText]}
                    >
                      {text}
                      {/* Plain text, not an inline View: Android mispositions inline Views in RTL
                          text, so the marker landed on the last word. Amiri renders U+06DD followed
                          by Arabic-Indic digits as one enclosed ayah number. */}
                      {" "}
                      <Text style={s.ayaEnd}>{"۝" + toAr(a.numberInSurah)}</Text>
                      {" "}
                    </Text>
                   );
                })}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
});

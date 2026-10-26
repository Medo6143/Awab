import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { colors } from '../../../shared/theme/tokens';
import { Bookmark } from 'lucide-react-native';
import { toAr, Ayah } from './QuranConstants';
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

  return (
    <View style={{ flex: 1 }}>
      <View style={s.ornateHeader}>
        <View style={s.headerCornerLeft} />
        <View style={s.headerCenterInfo}>
          <View style={s.ornateLine} />
          <Text style={s.headerPageText}>{toAr(pageNum)}</Text>
          <View style={s.ornateLine} />
        </View>
        <TouchableOpacity onPress={onToggleBookmark} style={s.headerBookmark}>
          <Bookmark size={22} color={colors.paperInk} fill={isBookmarked ? colors.paperInk : 'none'} />
        </TouchableOpacity>
        <View style={s.headerCornerRight} />
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
              <View style={s.goldBanner}>
                <View style={s.bannerPatternLeft} />
                <Text style={s.goldBannerTitle}>{group.surahName}</Text>
                <View style={s.bannerPatternRight} />
              </View>

              {group.surahNum !== 9 && group.ayahs[0]?.numberInSurah === 1 && (
                <View style={s.basmalaContainer}>
                  <Text style={s.mushafBasmala}>بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</Text>
                </View>
              )}

              <Text style={s.textFlow}>
                {group.ayahs.map(a => {
                   let text = a.text.trim();
                   
                   // Robust Basmala removal for Ayah 1
                   if (a.numberInSurah === 1 && a.surah.number !== 9) {
                     const basmalaPatterns = [
                       "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
                       "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ",
                       "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ"
                     ];
                     
                     // If it's Surah 1 and the text IS the basmala, we just clear it or keep only the difference
                     // In Fatiha, Ayah 1 IS Basmala. The user wants it as a header.
                     for (const pattern of basmalaPatterns) {
                       if (text.startsWith(pattern)) {
                         text = text.replace(pattern, "").trim();
                         break;
                       }
                     }
                   }

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

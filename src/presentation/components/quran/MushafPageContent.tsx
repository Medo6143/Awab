import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Bookmark } from 'lucide-react-native';
import { toAr, Ayah, mushafAyahText } from './QuranConstants';
import { useMushafPage } from '../../hooks/useQuran';
import { s } from './QuranStyles';
import { useMushafFontScale, useMushafTheme } from './mushafThemes';
import { SurahHeader } from './MushafOrnaments';
import { divineRuns } from '../../../domain/services/mushafText';

interface Props {
  pageNum: number;
  isCurrentPage: boolean;
  bookmarks: number[];
  highlightedAyah: number | null;
  /** An ayah to bring into view (a search result); the page opens scrolled to it. */
  revealAyah?: number | null;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onAyahPress: (a: Ayah) => void;
  onAyahLongPress: (a: Ayah) => void;
}

export const MushafPageContent = React.memo(({ 
  pageNum, isCurrentPage, bookmarks, highlightedAyah, revealAyah, isBookmarked,
  onToggleBookmark, onAyahPress, onAyahLongPress
}: Props) => {
  const { ayahs, loading, error, retry } = useMushafPage(pageNum);
  const theme = useMushafTheme();
  const scale = useMushafFontScale();
  const p = theme.palette;
  // the name of Allah in the design's own colour (Madani); other designs keep one ink
  const ink = (text: string, key: string) => (theme.divineNames
    ? divineRuns(text).map((r, i) => (r.divine ? <Text key={`${key}-${i}`} style={{ color: p.divine }}>{r.text}</Text> : r.text))
    : text);
  const scrollRef = useRef<ScrollView>(null);
  const viewport = useRef(0);
  const groupBox = useRef<Record<number, { y: number; h: number }>>({});

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

  // a searched ayah further down the page is scrolled into view. The ayahs share one flowing
  // Text, which cannot be measured per ayah, so its place is estimated from the letters before
  // it in its surah's block
  useEffect(() => {
    if (!isCurrentPage || !revealAyah || loading) return;
    const t = setTimeout(() => {
      const group = surahGroups.find((g) => g.ayahs.some((a) => a.number === revealAyah));
      const box = group && groupBox.current[group.surahNum];
      if (!group || !box) return;
      const lengths = group.ayahs.map((a) => mushafAyahText(a).length + 4);
      const before = lengths.slice(0, group.ayahs.findIndex((a) => a.number === revealAyah)).reduce((x, y) => x + y, 0);
      const total = lengths.reduce((x, y) => x + y, 0) || 1;
      const y = box.y + box.h * (before / total) - viewport.current * 0.3;
      scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: true });
    }, 150);
    return () => clearTimeout(t);
  }, [isCurrentPage, revealAyah, loading, surahGroups]);

  return (
    <View style={{ flex: 1 }}>
      <View style={s.pageHeader}>
        <Text style={[s.pageHeaderText, { color: p.muted }]}>{surahGroups[0]?.surahName ?? ''}</Text>
        <TouchableOpacity onPress={onToggleBookmark} hitSlop={10} accessibilityRole="button" accessibilityLabel={isBookmarked ? 'إزالة العلامة' : 'وضع علامة على الصفحة'}>
          <Bookmark size={18} color={p.marker} fill={isBookmarked ? p.marker : 'none'} />
        </TouchableOpacity>
        <Text style={[s.pageHeaderText, { color: p.muted }]}>{juz ? `الجزء ${toAr(juz)}` : ''}</Text>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={s.ayahList} showsVerticalScrollIndicator={false} onLayout={(e) => { viewport.current = e.nativeEvent.layout.height; }}>
        {loading ? (
          <View style={s.centerLoader}>
            <ActivityIndicator size="large" color={p.frame} />
            <Text style={[s.loaderSub, { color: p.muted }]}>يتم جلب الآيات...</Text>
          </View>
        ) : error ? (
          <View style={s.pageError}>
            <AlertTriangle size={32} color={p.marker} style={{ alignSelf: 'center' }} />
            <Text style={[s.pageErrorText, { color: p.ink }]}>تعذّر تحميل الصفحة. تأكد من الاتصال بالإنترنت.</Text>
            <TouchableOpacity style={s.pageRetryBtn} onPress={retry} accessibilityRole="button">
              <Text style={s.pageRetryText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        ) : (
          surahGroups.map(group => (
            <View
              key={group.surahNum}
              style={s.surahGroup}
              onLayout={(e) => { groupBox.current[group.surahNum] = { y: e.nativeEvent.layout.y, h: e.nativeEvent.layout.height }; }}
            >
              {group.ayahs[0]?.numberInSurah === 1 && (
                <SurahHeader theme={theme} name={group.surahName} number={group.surahNum} />
              )}

              {group.surahNum !== 9 && group.ayahs[0]?.numberInSurah === 1 && (
                <View style={s.basmalaContainer}>
                  <Text style={[s.mushafBasmala, { color: p.ink, fontFamily: theme.fontFamily, fontSize: 32 * scale, lineHeight: 52 * scale }]}>{ink('بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ', 'b')}</Text>
                </View>
              )}

              <Text style={[s.textFlow, { color: p.ink, fontFamily: theme.fontFamily, fontSize: theme.fontSize * scale, lineHeight: theme.lineHeight * scale, textAlign: theme.textAlign }]}>
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
                      style={[s.singleAyah, highlightedAyah === a.number && [s.highlightedText, { backgroundColor: p.highlight }]]}
                    >
                      {ink(text, String(a.number))}
                      {/* Plain text, not an inline View: Android mispositions inline Views in RTL
                          text, so the marker landed on the last word. Amiri renders U+06DD followed
                          by Arabic-Indic digits as one enclosed ayah number. */}
                      {" "}
                      <Text style={[s.ayaEnd, { color: p.marker }]}>{"۝" + toAr(a.numberInSurah)}</Text>
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

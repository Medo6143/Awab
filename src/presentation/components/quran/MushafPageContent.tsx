import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Bookmark } from 'lucide-react-native';
import { pageCache, toAr, TOTAL_PAGES, Ayah } from './QuranConstants';
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
  const [ayahs, setAyahs] = useState<Ayah[]>(pageCache.get(pageNum) ?? []);
  const [loading, setLoading] = useState(!pageCache.has(pageNum));
  const [prevPageNum, setPrevPageNum] = useState(pageNum);

  if (prevPageNum !== pageNum) {
    setPrevPageNum(pageNum);
    const cached = pageCache.get(pageNum);
    if (cached) {
      setAyahs(cached);
      setLoading(false);
    } else {
      setAyahs([]);
      setLoading(true);
    }
  }

  const prefetch = useCallback((pn: number) => {
    if (pn < 1 || pn > TOTAL_PAGES || pageCache.has(pn)) return;
    fetch(`https://api.alquran.cloud/v1/page/${pn}/quran-uthmani`)
      .then(r => r.json())
      .then(json => {
        const data = json?.data?.ayahs ?? [];
        if (data.length) pageCache.set(pn, data);
      }).catch(() => {});
  }, []);

  useEffect(() => {
    if (pageCache.has(pageNum)) {
      setAyahs(pageCache.get(pageNum)!);
      setLoading(false);
      prefetch(pageNum + 1);
      prefetch(pageNum - 1);
      return;
    }
    setLoading(true);
    fetch(`https://api.alquran.cloud/v1/page/${pageNum}/quran-uthmani`)
      .then(r => r.json())
      .then(json => {
        const data = json?.data?.ayahs ?? [];
        pageCache.set(pageNum, data);
        setAyahs(data);
        setLoading(false);
        prefetch(pageNum + 1);
        prefetch(pageNum - 1);
      })
      .catch(() => setLoading(false));
  }, [pageNum, prefetch]);

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
          <Bookmark size={22} color={isBookmarked ? '#78350f' : '#d4af37'} fill={isBookmarked ? '#78350f' : 'none'} />
        </TouchableOpacity>
        <View style={s.headerCornerRight} />
      </View>

      <ScrollView contentContainerStyle={s.ayahList} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={s.centerLoader}>
            <ActivityIndicator size="large" color="#d4af37" />
            <Text style={s.loaderSub}>يتم جلب الآيات...</Text>
          </View>
        ) : (
          surahGroups.map(group => (
            <View key={group.surahNum} style={s.surahGroup}>
              <View style={s.goldBanner}>
                <View style={s.bannerPatternLeft} />
                <Text style={s.goldBannerTitle}>{group.surahName}</Text>
                <View style={s.bannerPatternRight} />
              </View>

              {group.surahNum !== 1 && group.surahNum !== 9 && group.ayahs[0]?.numberInSurah === 1 && (
                <View style={s.basmalaContainer}>
                  <Text style={s.mushafBasmala}>بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</Text>
                </View>
              )}

              <Text style={s.textFlow}>
                {group.ayahs.map(a => {
                   let text = a.text.trim();
                   if (a.numberInSurah === 1 && a.surah.number !== 1 && a.surah.number !== 9) {
                     const b1 = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
                     const b2 = "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ";
                     if (text.startsWith(b1)) text = text.replace(b1, "").trim();
                     else if (text.startsWith(b2)) text = text.replace(b2, "").trim();
                   }
                   return (
                    <Text
                      key={a.number}
                      onPress={() => isCurrentPage && onAyahPress(a)}
                      onLongPress={() => isCurrentPage && onAyahLongPress(a)}
                      style={[s.singleAyah, highlightedAyah === a.number && s.highlightedText]}
                    >
                      {text}
                      {" "}
                      <View style={s.ayaMarkContainer}>
                         <Text style={s.ayaOrnament}>۝</Text>
                         <Text style={s.ayaMarkNumber}>{toAr(a.numberInSurah)}</Text>
                      </View>
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

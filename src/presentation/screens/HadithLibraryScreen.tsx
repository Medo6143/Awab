import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackActions } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { ChevronLeft, Search, Star, X } from 'lucide-react-native';
import { ScreenProps } from '../navigation/types';
import { RootState } from '../store';
import { EmptyState, ScreenHeader, useBottomInset } from '../components/ui';
import { GradeChips, HadithRow } from '../components/hadith/HadithRow';
import {
  hadithCategories, hadithCategory, hadithCount, hadithEntry, hadithOfTheDay, hadithsIn, searchHadiths, warmHadithIndex,
} from '../../data/hadith/hadithLibrary';
import type { HadithIndexEntry } from '../../domain/entities/hadith';
import { toAr } from '../../shared/utils/format';
import { colors, icon, radius, space, type } from '../../shared/theme/tokens';

/**
 * The hadith library: search, hadith of the day and the category index on top; a
 * category shows its sub-categories and its hadiths; `favorites` lists saved ones.
 */
const HadithLibraryScreen = ({ navigation, route }: ScreenProps<'الأحاديث'>) => {
  const categoryId = route.params?.categoryId;
  const showFavorites = !!route.params?.favorites;
  const favorites = useSelector((s: RootState) => s.favorites?.hadiths ?? []);
  const bottom = useBottomInset();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ hits: HadithIndexEntry[]; total: number } | null>(null);
  const [ready, setReady] = useState(false);

  // the index is built off the first frame so the screen opens instantly
  useEffect(() => { const t = setTimeout(() => { warmHadithIndex(); setReady(true); }, 30); return () => clearTimeout(t); }, []);
  useEffect(() => {
    if (query.trim().length < 2) { setResult(null); return; }
    const t = setTimeout(() => setResult(searchHadiths(query)), 200);
    return () => clearTimeout(t);
  }, [query]);

  const open = (id: number) => navigation.navigate('الحديث', { id });
  // a new screen per category level, so back walks up the index
  const go = (params: { categoryId?: number; favorites?: boolean }) => navigation.dispatch(StackActions.push('الأحاديث', params));
  const category = ready && categoryId ? hadithCategory(categoryId) : undefined;
  const children = useMemo(() => (ready ? hadithCategories(categoryId ?? null) : []), [ready, categoryId]);
  const list = useMemo<HadithIndexEntry[]>(() => {
    if (!ready) return [];
    if (showFavorites) return favorites.map((id) => hadithEntry(id)).filter((e): e is HadithIndexEntry => !!e);
    return categoryId ? hadithsIn(categoryId) : [];
  }, [ready, categoryId, showFavorites, favorites]);

  const title = showFavorites ? 'الأحاديث المحفوظة' : category?.title ?? 'الأحاديث';
  const isHome = !categoryId && !showFavorites;
  const today = ready && isHome ? hadithOfTheDay() : null;

  const header = (
    <View>
      <View style={st.search}>
        <Search size={18} color={colors.textMuted} />
        <TextInput style={st.searchInput} placeholder="ابحث في الأحاديث… (الصبر، النية، بر الوالدين)" placeholderTextColor={colors.textFaint} value={query} onChangeText={setQuery} textAlign="right" returnKeyType="search" />
        {query ? <TouchableOpacity onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="مسح البحث"><X size={18} color={colors.textMuted} /></TouchableOpacity> : null}
      </View>

      {!result && today ? (
        <TouchableOpacity style={st.today} onPress={() => open(today.id)} activeOpacity={0.85} accessibilityRole="button">
          <Text style={st.todayLabel}>حديث اليوم</Text>
          <Text style={st.todayText} numberOfLines={4}>«{today.title}»</Text>
          <GradeChips grade={today.grade} attribution={today.attribution} />
        </TouchableOpacity>
      ) : null}

      {!result && isHome && favorites.length ? (
        <TouchableOpacity style={st.favRow} onPress={() => go({ favorites: true })} accessibilityRole="button">
          <Star size={icon.size.md} color={colors.gold} fill={colors.gold} />
          <Text style={st.favText}>الأحاديث المحفوظة ({toAr(favorites.length)})</Text>
          <ChevronLeft size={icon.size.sm} color={colors.textFaint} />
        </TouchableOpacity>
      ) : null}

      {!result && children.length ? (
        isHome ? (
          <View style={st.grid}>
            {children.map((c) => (
              <TouchableOpacity key={c.id} style={st.cat} onPress={() => go({ categoryId: c.id })} accessibilityRole="button" activeOpacity={0.85}>
                <Text style={st.catTitle}>{c.title}</Text>
                <Text style={st.catCount}>{toAr(c.indexed)} حديثًا</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.subRow}>
            {children.map((c) => (
              <TouchableOpacity key={c.id} style={st.sub} onPress={() => go({ categoryId: c.id })} accessibilityRole="button">
                <Text style={st.subText}>{c.title} · {toAr(c.indexed)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )
      ) : null}

      {result ? (
        <Text style={st.count}>{result.total > result.hits.length ? `${toAr(result.total)} نتيجة، تظهر أول ${toAr(result.hits.length)}` : `${toAr(result.total)} نتيجة`}</Text>
      ) : isHome && ready ? (
        <Text style={st.note}>{toAr(hadithCount())} حديثًا صحيحًا أو حسنًا · المصدر: موسوعة الأحاديث النبوية</Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={st.root}>
      <ScreenHeader title={title} onBack={() => navigation.goBack()} />
      <FlatList
        data={result ? result.hits : list}
        keyExtractor={(e) => String(e.id)}
        renderItem={({ item }) => <HadithRow entry={item} onPress={() => open(item.id)} />}
        ListHeaderComponent={header}
        ListEmptyComponent={result ? <EmptyState icon={Search} title="لا توجد أحاديث مطابقة" message="جرّب كلمة أخرى أو صيغة أقصر" /> : showFavorites ? <EmptyState icon={Star} title="لا توجد أحاديث محفوظة" message="اضغط ★ في صفحة الحديث لحفظه هنا" /> : null}
        contentContainerStyle={[st.list, { paddingBottom: bottom }]}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={12}
      />
    </SafeAreaView>
  );
};

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  list: { paddingHorizontal: 20 },
  search: { flexDirection: 'row', alignItems: 'center', gap: space[2], backgroundColor: colors.surface, borderRadius: radius.field, paddingHorizontal: space[4], height: 48, marginBottom: space[3] },
  searchInput: { flex: 1, color: colors.text, ...type.body, paddingVertical: 0 },
  today: { backgroundColor: colors.goldSoft, borderRadius: radius.card, padding: space[4], marginBottom: space[3] },
  todayLabel: { ...type.label, color: colors.gold },
  todayText: { fontFamily: 'Amiri_700Bold', fontSize: 18, lineHeight: 33, color: colors.text, marginTop: space[1] },
  favRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], backgroundColor: colors.surface, borderRadius: radius.card, padding: space[4], marginBottom: space[3] },
  favText: { ...type.bodyMedium, color: colors.text, flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2], marginBottom: space[3] },
  cat: { width: '48%', flexGrow: 1, backgroundColor: colors.surface, borderRadius: radius.card, padding: space[4] },
  catTitle: { ...type.bodyMedium, fontFamily: 'Tajawal_700Bold', color: colors.text },
  catCount: { ...type.caption, color: colors.textMuted, marginTop: 2 },
  subRow: { gap: space[2], paddingBottom: space[3] },
  sub: { backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: space[4], paddingVertical: space[2] },
  subText: { ...type.label, color: colors.textSoft },
  count: { ...type.caption, color: colors.textMuted, marginBottom: space[2] },
  note: { ...type.caption, color: colors.textFaint, textAlign: 'center', marginBottom: space[3] },
});

export default HadithLibraryScreen;

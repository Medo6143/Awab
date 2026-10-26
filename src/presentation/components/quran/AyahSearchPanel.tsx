import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../ui';
import { AyahHit, searchAyahs, warmAyahIndex } from '../../../data/quran/ayahSearch';
import { colors, radius, space, type } from '../../../shared/theme/tokens';
import { toAr } from '../../../shared/utils/format';
import { s } from './QuranStyles';
import { SurahMeta } from './QuranConstants';

/** Search box + results for the ayah tab of the Quran index. Searches 200 ms after typing stops. */
export const AyahSearchPanel = ({ surahs, onSelect }: { surahs: SurahMeta[]; onSelect: (hit: AyahHit) => void }) => {
  const [query, setQuery] = useState('');
  const navBar = useSafeAreaInsets().bottom;
  const [result, setResult] = useState<{ hits: AyahHit[]; total: number } | null>(null);

  // build the index while the keyboard opens, so the first query is as fast as the rest
  useEffect(() => {
    const t = setTimeout(warmAyahIndex, 350);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) { setResult(null); return; }
    const t = setTimeout(() => setResult(searchAyahs(query)), 200);
    return () => clearTimeout(t);
  }, [query]);

  const surahName = (n: number) => surahs[n - 1]?.name ?? `سورة ${toAr(n)}`;

  return (
    <View style={{ flex: 1 }}>
      <View style={s.searchFieldWrap}>
        <Search size={18} color={colors.textMuted} />
        <TextInput
          style={s.searchInput}
          textAlign="right"
          placeholder="اكتب كلمات من الآية..."
          placeholderTextColor={colors.textFaint}
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery('')} accessibilityLabel="مسح البحث" hitSlop={8}>
            <X size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {result ? (
        <FlatList
          data={result.hits}
          keyExtractor={(h) => String(h.number)}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[st.list, { paddingBottom: space[10] + navBar }]}
          ListHeaderComponent={result.total ? (
            <Text style={st.count}>
              {result.total > result.hits.length
                ? `${toAr(result.total)} نتيجة، تظهر أول ${toAr(result.hits.length)}`
                : `${toAr(result.total)} نتيجة`}
            </Text>
          ) : null}
          ListEmptyComponent={<EmptyState icon={Search} title="لا توجد آيات مطابقة" message="جرّب كلمات أقل أو بصيغة أخرى" />}
          renderItem={({ item }) => (
            <TouchableOpacity style={st.row} onPress={() => onSelect(item)} accessibilityRole="button">
              <Text style={st.text} numberOfLines={3}>{item.text}</Text>
              <Text style={st.ref}>{surahName(item.surah)} · آية {toAr(item.ayah)} · صفحة {toAr(item.page)}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <EmptyState icon={Search} title="ابحث في آيات القرآن" message="اكتب كلمتين أو أكثر، والتشكيل غير مطلوب" />
      )}
    </View>
  );
};

const st = StyleSheet.create({
  list: { paddingHorizontal: space[5], paddingBottom: space[10] },
  count: { ...type.caption, color: colors.textMuted, marginBottom: space[2] },
  row: { backgroundColor: colors.surface, borderRadius: radius.card, padding: space[4], marginBottom: space[2] },
  text: { fontFamily: 'Amiri_400Regular', fontSize: 18, lineHeight: 34, color: colors.text, textAlign: 'right' },
  ref: { ...type.caption, color: colors.gold, marginTop: space[1] },
});

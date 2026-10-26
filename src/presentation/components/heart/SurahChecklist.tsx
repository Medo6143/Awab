import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { CheckCircle2, Circle, Search, X } from 'lucide-react-native';
import { s } from './HeartJourneyStyles';
import { colors } from '../../../shared/theme/tokens';
import { toAr } from './HeartJourneyConstants';
import { SURAH_NAMES } from '../../../shared/constants/surahs';

// Strip Arabic diacritics/hamza variants so "البقره" or "بقرة" still matches "البقرة".
const normalize = (t: string) =>
  t
    .replace(/[ً-ْٰـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/^ال/, '')
    .trim()
    .toLowerCase();

export const SurahChecklist = ({ completedSurahs, onToggle }: { completedSurahs: number[]; onToggle: (surahId: number) => void }) => {
  const [query, setQuery] = useState('');

  const items = useMemo(() => {
    const q = normalize(query);
    const westernDigits = query.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
    return SURAH_NAMES.map((name, index) => ({ id: index + 1, name })).filter(({ id, name }) => {
      if (!q) return true;
      if (/^\d+$/.test(westernDigits.trim())) return id === parseInt(westernDigits, 10);
      return normalize(name).includes(q);
    });
  }, [query]);

  return (
    <View style={s.checklistContainer}>
      <View style={s.searchBox}>
        {query.length > 0 ? (
          <TouchableOpacity onPress={() => setQuery('')} accessibilityLabel="مسح البحث" hitSlop={8}>
            <X size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ) : (
          <Search size={18} color={colors.textMuted} />
        )}
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="ابحث باسم السورة أو رقمها"
          placeholderTextColor={colors.textFaint}
          style={s.searchInput}
          returnKeyType="search"
          accessibilityLabel="بحث عن سورة"
        />
      </View>

      {items.length === 0 && (
        <Text style={s.searchEmpty}>لا توجد سورة بهذا الاسم</Text>
      )}

      {items.map(({ id, name }) => {
        const isDone = completedSurahs.includes(id);
        return (
          <TouchableOpacity
            key={id}
            style={[s.checkItem, isDone && s.checkItemDone]}
            onPress={() => onToggle(id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isDone }}
          >
            <View style={s.checkRight}>
              <Text style={s.surahNum}>{toAr(id)}</Text>
              <Text style={[s.surahName, isDone && s.surahNameDone]}>{name}</Text>
            </View>
            {isDone ? <CheckCircle2 color={colors.goldText} size={24} /> : <Circle color={colors.textFaint} size={24} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

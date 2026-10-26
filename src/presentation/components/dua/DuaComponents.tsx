import { Dua } from '../../../domain/entities/types';
import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Plus, Search, X, Share2, Copy } from 'lucide-react-native';
import { s } from './DuaStyles';
import { DUA_CATEGORIES } from './DuaConstants';
import { ScreenHeader, IconButton, Chip } from '../ui';
import { colors, icon } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';

export const DuaHeader = ({ onAdd, onBack, hideHeader }: { onAdd: () => void; onBack: () => void; hideHeader?: boolean }) => {
  if (hideHeader) return null;
  return (
    <ScreenHeader
      title="جوامع الدعاء"
      onBack={onBack}
      right={
        <IconButton onPress={onAdd} label="إضافة دعاء">
          <Plus color={colors.gold} size={icon.size.lg} strokeWidth={icon.stroke} />
        </IconButton>
      }
    />
  );
};

export const DuaSearch = ({ query, onChange }: { query: string; onChange: (text: string) => void }) => (
  <View style={s.searchSection}>
    <View style={s.searchBar}>
      {query !== '' ? (
        <TouchableOpacity onPress={() => onChange('')} hitSlop={8} accessibilityLabel="مسح البحث">
          <X size={18} color={colors.textMuted} />
        </TouchableOpacity>
      ) : (
        <Search size={18} color={colors.textMuted} />
      )}
      <TextInput
        style={s.searchInput}
        placeholder="ابحث في الأدعية..."
        placeholderTextColor={colors.textFaint}
        value={query}
        onChangeText={onChange}
        textAlign="right"
        accessibilityLabel="بحث في الأدعية"
      />
    </View>
  </View>
);

export const DuaCategories = ({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) => {
  const accent = useAccent();
  return (
    <View style={s.categoriesScroll}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catContent}>
        <Chip label="الكل" selected={selected === 'all'} onPress={() => onSelect('all')} size="sm" />
        {DUA_CATEGORIES.map((cat) => (
          <Chip
            key={cat.id}
            label={cat.name}
            selected={selected === cat.id}
            onPress={() => onSelect(cat.id)}
            size="sm"
            icon={<cat.icon size={icon.size.sm} color={selected === cat.id ? accent.accentText : colors.textMuted} strokeWidth={icon.stroke} />}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export const DuaCard = ({ item, onShare, onShareText, onCopy }: { item: Dua; onShare: (text: string, ref: string) => void; onShareText?: (text: string, ref: string) => void; onCopy: (text: string) => void }) => (
  <View style={s.duaCard}>
    <Text style={s.duaText}>{item.text}</Text>
    <View style={s.duaFooter}>
      <Text style={s.duaRef}>{item.ref}</Text>
      <View style={s.actions}>
        <TouchableOpacity onPress={() => onCopy(item.text)} style={s.actionBtn} accessibilityLabel="نسخ">
          <Copy size={16} color={colors.gold} strokeWidth={icon.stroke} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onShare(item.text, item.ref)} onLongPress={() => onShareText?.(item.text, item.ref)} style={s.actionBtn} accessibilityLabel="مشاركة كصورة">
          <Share2 size={16} color={colors.gold} strokeWidth={icon.stroke} />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

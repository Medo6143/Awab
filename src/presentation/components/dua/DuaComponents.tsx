import { Dua } from '../../../domain/entities/types';
import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Plus, Search, X, Share2, Copy, Heart, Shuffle, LayoutGrid } from 'lucide-react-native';
import { s } from './DuaStyles';
import { DUA_CATEGORIES } from './DuaConstants';
import { ScreenHeader, IconButton } from '../ui';
import { colors, icon } from '../../../shared/theme/tokens';

export const DuaHeader = ({ onAdd, onBack, hideHeader }: { onAdd: () => void; onBack: () => void; hideHeader?: boolean }) => {
  if (hideHeader) return null;
  return (
    <ScreenHeader
      title="الأدعية"
      subtitle="من القرآن والسنة الصحيحة"
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
      placeholder="ابحث في الأدعية"
      placeholderTextColor={colors.textFaint}
      value={query}
      onChangeText={onChange}
      textAlign="right"
      accessibilityLabel="بحث في الأدعية"
    />
  </View>
);

/** "دعاء اليوم": one dua a day, with a button for another at random. */
export const DuaOfTheDay = ({ item, onAnother, onShare, onCopy }: { item: Dua; onAnother: () => void; onShare: () => void; onCopy: () => void }) => (
  <View style={s.hero}>
    <View style={s.heroHead}>
      <Text style={s.heroLabel}>دعاء اليوم</Text>
      <TouchableOpacity onPress={onAnother} style={s.heroAnother} hitSlop={8} accessibilityRole="button" accessibilityLabel="دعاء تاني">
        <Shuffle size={14} color={colors.goldText} />
        <Text style={s.heroAnotherText}>دعاء تاني</Text>
      </TouchableOpacity>
    </View>
    <Text style={s.heroText}>{item.text}</Text>
    <View style={s.duaFooter}>
      <Text style={s.duaRef} numberOfLines={2}>{item.ref}</Text>
      <View style={s.actions}>
        <TouchableOpacity onPress={onCopy} style={s.actionBtn} accessibilityLabel="نسخ"><Copy size={16} color={colors.gold} strokeWidth={icon.stroke} /></TouchableOpacity>
        <TouchableOpacity onPress={onShare} style={s.actionBtn} accessibilityLabel="مشاركة كصورة"><Share2 size={16} color={colors.gold} strokeWidth={icon.stroke} /></TouchableOpacity>
      </View>
    </View>
  </View>
);

const TILES = [
  { id: 'all', name: 'الكل', icon: LayoutGrid },
  { id: 'favorites', name: 'المفضلة', icon: Heart },
  ...DUA_CATEGORIES.map((c) => (c.id === 'personal' ? { ...c, name: 'أدعيتي' } : c)),
];

/** Categories as a grid of tiles, each with its count. */
export const DuaCategories = ({ selected, onSelect, counts }: { selected: string; onSelect: (id: string) => void; counts: Record<string, number> }) => (
  <View style={s.grid}>
    {TILES.map((t) => {
      const on = selected === t.id;
      const Icon = t.icon;
      return (
        <TouchableOpacity key={t.id} style={[s.tile, on && s.tileOn]} onPress={() => onSelect(t.id)} accessibilityRole="button" accessibilityState={{ selected: on }} activeOpacity={0.85}>
          <Icon size={icon.size.md} color={on ? colors.onGold : colors.gold} strokeWidth={icon.stroke} />
          <Text style={[s.tileName, on && s.tileTextOn]} numberOfLines={1}>{t.name}</Text>
          <Text style={[s.tileCount, on && s.tileTextOn]}>{(counts[t.id] ?? 0).toLocaleString('ar-EG')}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export const DuaCard = ({ item, favorite, onFavorite, onShare, onShareText, onCopy }: {
  item: Dua; favorite: boolean; onFavorite: () => void;
  onShare: (text: string, ref: string) => void; onShareText?: (text: string, ref: string) => void; onCopy: (text: string) => void;
}) => (
  <View style={s.duaCard}>
    <Text style={s.duaText}>{item.text}</Text>
    <View style={s.duaFooter}>
      <Text style={s.duaRef} numberOfLines={2}>{item.ref}</Text>
      <View style={s.actions}>
        <TouchableOpacity onPress={onFavorite} style={s.actionBtn} accessibilityLabel={favorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'} accessibilityState={{ selected: favorite }}>
          <Heart size={16} color={colors.gold} fill={favorite ? colors.gold : 'transparent'} strokeWidth={icon.stroke} />
        </TouchableOpacity>
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

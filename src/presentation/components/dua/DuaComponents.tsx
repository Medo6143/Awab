import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Plus, Search, X, Share2, Copy } from 'lucide-react-native';
import { s } from './DuaStyles';
import { DUA_CATEGORIES } from './DuaConstants';

export const DuaHeader = ({ onAdd, hideHeader }: any) => {
  if (hideHeader) return null;
  return (
    <View style={s.header}>
      <TouchableOpacity onPress={onAdd} style={s.addBtn}>
        <Plus color="#fcd34d" size={24} />
      </TouchableOpacity>
      <Text style={s.headerTitle}>جوامع الدعاء</Text>
      <View style={{ width: 40 }} />
    </View>
  );
};

export const DuaSearch = ({ query, onChange }: any) => (
  <View style={s.searchSection}>
    <View style={s.searchBar}>
      <Search size={20} color="#94a3b8" />
      <TextInput 
        style={s.searchInput}
        placeholder="ابحث في الأدعية..."
        placeholderTextColor="#64748b"
        value={query}
        onChangeText={onChange}
        textAlign="right"
      />
      {query !== '' && (
        <TouchableOpacity onPress={() => onChange('')}>
          <X size={18} color="#94a3b8" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export const DuaCategories = ({ selected, onSelect }: any) => (
  <View style={s.categoriesScroll}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catContent}>
      <TouchableOpacity 
        onPress={() => onSelect('all')}
        style={[s.catChip, selected === 'all' && s.catChipActive]}
      >
        <Text style={[s.catText, selected === 'all' && s.catTextActive]}>الكل</Text>
      </TouchableOpacity>
      {DUA_CATEGORIES.map(cat => (
        <TouchableOpacity 
          key={cat.id}
          onPress={() => onSelect(cat.id)}
          style={[s.catChip, selected === cat.id && s.catChipActive]}
        >
          <cat.icon size={16} color={selected === cat.id ? "#fff" : "#B8860B"} />
          <Text style={[s.catText, selected === cat.id && s.catTextActive]}>{cat.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

export const DuaCard = ({ item, onShare, onCopy }: any) => (
  <View style={s.duaCard}>
    <Text style={s.duaText}>{item.text}</Text>
    <View style={s.duaFooter}>
      <Text style={s.duaRef}>{item.ref}</Text>
      <View style={{ flexDirection: 'row', gap: 15 }}>
        <TouchableOpacity onPress={() => onShare(item.text, item.ref)} style={s.actionBtn}>
          <Share2 size={18} color="#B8860B" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onCopy(item.text)} style={s.actionBtn}>
          <Copy size={18} color="#B8860B" />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

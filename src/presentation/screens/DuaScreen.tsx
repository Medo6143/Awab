import React, { useState } from 'react';
import { FlatList, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { HandHeart } from 'lucide-react-native';
import { RootState } from '../store';
import { addPersonalDua } from '../store/slices/duasSlice';
import { EmptyState } from '../components/ui';
import { DuaHeader, DuaSearch, DuaCategories, DuaCard } from '../components/dua/DuaComponents';
import { AddDuaModal } from '../components/dua/DuaModals';
import { s } from '../components/dua/DuaStyles';
import { DUAS_DATA } from '../components/dua/DuaConstants';

const DuaScreen = ({ hideHeader, navigation }: any) => {
  const dispatch = useDispatch();
  const personalDuas = useSelector((state: RootState) => state.duas.personalDuas);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDuaText, setNewDuaText] = useState('');
  const [newDuaRef, setNewDuaRef] = useState('');

  const allDuas = [...DUAS_DATA, ...personalDuas.map((d: any) => ({ ...d, category: 'personal' }))];
  const filteredDuas = allDuas.filter((d: any) =>
    (selectedCategory === 'all' || d.category === selectedCategory) &&
    (d.text.includes(searchQuery) || d.ref.includes(searchQuery)),
  );

  const handleShare = async (text: string, ref: string) => {
    try { await Share.share({ message: `${text}\n[${ref}]` }); } catch {}
  };
  const handleCopy = async (text: string) => { await Clipboard.setStringAsync(text); };

  const handleAddDua = () => {
    if (!newDuaText.trim()) return;
    dispatch(addPersonalDua({ id: Date.now().toString(), text: newDuaText.trim(), ref: newDuaRef.trim() || 'دعاء شخصي', category: 'personal' as any } as any));
    setNewDuaText(''); setNewDuaRef(''); setShowAddModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const emptyTitle = selectedCategory === 'personal' && !searchQuery ? 'لا توجد أدعية شخصية بعد' : 'لا توجد أدعية مطابقة';

  return (
    <SafeAreaView edges={['top']} style={s.root}>
      <DuaHeader hideHeader={hideHeader} onBack={() => navigation?.goBack()} onAdd={() => setShowAddModal(true)} />
      <DuaSearch query={searchQuery} onChange={setSearchQuery} />
      <DuaCategories selected={selectedCategory} onSelect={setSelectedCategory} />

      <FlatList
        data={filteredDuas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <DuaCard item={item} onShare={handleShare} onCopy={handleCopy} />}
        contentContainerStyle={s.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <EmptyState
            icon={HandHeart}
            title={emptyTitle}
            message={selectedCategory === 'personal' ? 'أضف دعاءك الخاص ليظهر هنا' : 'جرّب كلمة أخرى أو تصنيفاً مختلفاً'}
            action={selectedCategory === 'personal' ? { label: 'إضافة دعاء', onPress: () => setShowAddModal(true) } : undefined}
          />
        }
      />

      <AddDuaModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        text={newDuaText} setText={setNewDuaText}
        refText={newDuaRef} setRefText={setNewDuaRef}
        onSave={handleAddDua}
      />
    </SafeAreaView>
  );
};

export default DuaScreen;

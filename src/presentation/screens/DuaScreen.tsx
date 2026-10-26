import { EmbeddableScreenProps } from '../navigation/types';
import React, { useState } from 'react';
import { FlatList, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { DuaHandsIcon } from '../components/icons/IslamicIcons';
import { RootState } from '../store';
import { addPersonalDua } from '../store/slices/duasSlice';
import { EmptyState } from '../components/ui';
import { DuaHeader, DuaSearch, DuaCategories, DuaCard } from '../components/dua/DuaComponents';
import { AddDuaModal } from '../components/dua/DuaModals';
import { s } from '../components/dua/DuaStyles';
import { DUAS_DATA } from '../components/dua/DuaConstants';
import { ImageShareModal } from '../components/share/ImageShareModal';
import { DuaShareCard } from '../components/share/DuaShareCard';

const DuaScreen = ({ hideHeader, navigation }: EmbeddableScreenProps) => {
  const dispatch = useDispatch();
  const personalDuas = useSelector((state: RootState) => state.duas.personalDuas);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDuaText, setNewDuaText] = useState('');
  const [newDuaRef, setNewDuaRef] = useState('');

  const allDuas = [...DUAS_DATA, ...personalDuas.map((d) => ({ ...d, category: 'personal' }))];
  const filteredDuas = allDuas.filter((d) =>
    (selectedCategory === 'all' || d.category === selectedCategory) &&
    (d.text.includes(searchQuery) || d.ref.includes(searchQuery)),
  );

  // share opens the image card; long-press on share still shares plain text
  const [shareDua, setShareDua] = useState<{ text: string; ref: string } | null>(null);
  const handleShare = (text: string, ref: string) => setShareDua({ text, ref });
  const handleShareText = async (text: string, ref: string) => {
    try { await Share.share({ message: `${text}\n[${ref}]` }); } catch {}
  };
  const handleCopy = async (text: string) => { await Clipboard.setStringAsync(text); };

  const handleAddDua = () => {
    if (!newDuaText.trim()) return;
    dispatch(addPersonalDua({ id: Date.now().toString(), text: newDuaText.trim(), ref: newDuaRef.trim() || 'دعاء شخصي', category: 'personal' }));
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
        renderItem={({ item }) => <DuaCard item={item} onShare={handleShare} onShareText={handleShareText} onCopy={handleCopy} />}
        contentContainerStyle={s.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <EmptyState
            icon={DuaHandsIcon}
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

      <ImageShareModal visible={!!shareDua} title="مشاركة الدعاء كصورة" onClose={() => setShareDua(null)}>
        {shareDua ? <DuaShareCard text={shareDua.text} source={shareDua.ref} /> : null}
      </ImageShareModal>
    </SafeAreaView>
  );
};

export default DuaScreen;

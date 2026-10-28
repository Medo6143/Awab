import { EmbeddableScreenProps } from '../navigation/types';
import React, { useMemo, useState } from 'react';
import { FlatList, Platform, Share, Text, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { DuaHandsIcon } from '../components/icons/IslamicIcons';
import { RootState } from '../store';
import { addPersonalDua, toggleFavorite } from '../store/slices/duasSlice';
import { EmptyState } from '../components/ui';
import { DuaHeader, DuaSearch, DuaCategories, DuaCard, DuaOfTheDay } from '../components/dua/DuaComponents';
import { AddDuaModal } from '../components/dua/DuaModals';
import { s } from '../components/dua/DuaStyles';
import { DUAS_DATA, DUA_CATEGORIES } from '../components/dua/DuaConstants';
import { ImageShareModal } from '../components/share/ImageShareModal';
import { DuaShare } from '../components/share/StoryCard';
import { VirtueBanner } from '../components/guidance/GuidanceBlocks';
import { ShareStylePicker } from '../components/share/ShareStylePicker';

const dayNumber = () => {
  const d = new Date();
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
};

const CATEGORY_NAME: Record<string, string> = {
  all: 'كل الأدعية', favorites: 'المفضلة', ...Object.fromEntries(DUA_CATEGORIES.map((c) => [c.id, c.id === 'personal' ? 'أدعيتي' : c.name])),
};

/**
 * الأدعية: the dua of the day on top (another at random on demand), search, categories as
 * tiles with counts (favorites and the user's own included), then the list.
 */
const DuaScreen = ({ hideHeader, navigation }: EmbeddableScreenProps) => {
  const dispatch = useDispatch();
  const personalDuas = useSelector((state: RootState) => state.duas.personalDuas);
  const favorites = useSelector((state: RootState) => state.duas.favorites ?? []);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDuaText, setNewDuaText] = useState('');
  const [newDuaRef, setNewDuaRef] = useState('');
  const [heroIndex, setHeroIndex] = useState(() => dayNumber() % DUAS_DATA.length);

  const allDuas = useMemo(() => [...DUAS_DATA, ...personalDuas.map((d) => ({ ...d, category: 'personal' }))], [personalDuas]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: allDuas.length, favorites: allDuas.filter((d) => favorites.includes(String(d.id))).length };
    for (const d of allDuas) c[d.category] = (c[d.category] ?? 0) + 1;
    return c;
  }, [allDuas, favorites]);
  const filteredDuas = allDuas.filter((d) =>
    (selectedCategory === 'all' || (selectedCategory === 'favorites' ? favorites.includes(String(d.id)) : d.category === selectedCategory)) &&
    (d.text.includes(searchQuery) || d.ref.includes(searchQuery)),
  );
  const hero = DUAS_DATA[heroIndex];

  // share opens the image card; long-press on share still shares plain text
  const [shareDua, setShareDua] = useState<{ text: string; ref: string } | null>(null);
  const handleShare = (text: string, ref: string) => setShareDua({ text, ref });
  const handleShareText = async (text: string, ref: string) => {
    try { await Share.share({ message: `${text}\n[${ref}]` }); } catch {}
  };
  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Haptics.selectionAsync();
    if (Platform.OS === 'android') ToastAndroid.show('اتنسخ الدعاء', ToastAndroid.SHORT);
  };
  const another = () => {
    Haptics.selectionAsync();
    setHeroIndex((i) => (i + 1 + Math.floor(Math.random() * (DUAS_DATA.length - 1))) % DUAS_DATA.length);
  };

  const handleAddDua = () => {
    if (!newDuaText.trim()) return;
    dispatch(addPersonalDua({ id: Date.now().toString(), text: newDuaText.trim(), ref: newDuaRef.trim() || 'دعاء شخصي', category: 'personal' }));
    setNewDuaText(''); setNewDuaRef(''); setShowAddModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const emptyTitle = selectedCategory === 'personal' && !searchQuery ? 'أضف أول دعاء ليك'
    : selectedCategory === 'favorites' && !searchQuery ? 'مفيش أدعية في المفضلة' : 'مفيش أدعية مطابقة';
  const emptyMessage = selectedCategory === 'personal' ? 'اكتب دعاءك بكلامك وهيظهر هنا'
    : selectedCategory === 'favorites' ? 'دوس على القلب جنب أي دعاء يضيفه هنا' : 'جرّب كلمة تانية أو تصنيف تاني';

  return (
    <SafeAreaView edges={['top']} style={s.root}>
      <DuaHeader hideHeader={hideHeader} onBack={() => navigation?.goBack()} onAdd={() => setShowAddModal(true)} />

      <FlatList
        data={filteredDuas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <DuaCard item={item} favorite={favorites.includes(String(item.id))} onFavorite={() => { Haptics.selectionAsync(); dispatch(toggleFavorite(String(item.id))); }}
            onShare={handleShare} onShareText={handleShareText} onCopy={handleCopy} />
        )}
        contentContainerStyle={s.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            {!searchQuery ? <DuaOfTheDay item={hero} onAnother={another} onShare={() => handleShare(hero.text, hero.ref)} onCopy={() => handleCopy(hero.text)} /> : null}
            <DuaSearch query={searchQuery} onChange={setSearchQuery} />
            <DuaCategories selected={selectedCategory} onSelect={setSelectedCategory} counts={counts} />
            {!searchQuery ? (
              <View style={{ marginTop: 16 }}>
                <VirtueBanner icon={DuaHandsIcon} title="لماذا ندعو؟" sub="فضل الدعاء، وكيف يستجيب الله للمضطر إذا دعاه"
                  onPress={() => navigation?.navigate('الفضائل', { topic: 'dua' })} />
              </View>
            ) : null}
            <Text style={s.listTitle}>{CATEGORY_NAME[selectedCategory]} · {filteredDuas.length.toLocaleString('ar-EG')}</Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon={DuaHandsIcon}
            title={emptyTitle}
            message={emptyMessage}
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

      <ImageShareModal visible={!!shareDua} title="مشاركة الدعاء كصورة" onClose={() => setShareDua(null)} toolbar={<ShareStylePicker />}>
        {shareDua ? <DuaShare text={shareDua.text} source={shareDua.ref} /> : null}
      </ImageShareModal>
    </SafeAreaView>
  );
};

export default DuaScreen;

import React from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Bookmark } from 'lucide-react-native';
import { s } from './QuranStyles';
import { toAr } from './QuranConstants';

interface Props {
  visible: boolean;
  onClose: () => void;
  bookmarkedPages: number[];
  onPageSelect: (p: number) => void;
}

export const BookmarksModal = ({ visible, onClose, bookmarkedPages, onPageSelect }: Props) => {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0c0805' }}>
        <View style={s.modalHead}>
          <TouchableOpacity onPress={onClose}><X size={26} color="#fcd34d" /></TouchableOpacity>
          <Text style={s.modalHeadTitle}>العلامات المرجعية</Text>
          <View style={{ width: 26 }} />
        </View>
        <FlatList
          data={bookmarkedPages}
          keyExtractor={p => String(p)}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => onPageSelect(item)} style={s.bookmarkRow}>
              <Bookmark size={22} color="#fcd34d" fill="#fcd34d" />
              <Text style={s.bookmarkRowLabel}>صفحة {toAr(item)}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={s.emptyBoxText}>لم تحفظ صفحات بعد</Text>}
        />
      </SafeAreaView>
    </Modal>
  );
};

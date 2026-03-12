import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { X } from 'lucide-react-native';
import { s } from './HeartJourneyStyles';
import { toAr } from './HeartJourneyConstants';
import { SURAH_NAMES } from '../../../shared/constants/surahs';

export const JuzSelectionModal = ({ visible, onClose, onSelectJuz }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={s.modalOverlay}>
      <View style={s.modalContent}>
        <View style={s.modalHeader}>
          <Text style={s.modalTitle}>اختر الجزء الذي أتممته</Text>
          <TouchableOpacity onPress={onClose}><X size={24} color="#fcd34d" /></TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={s.juzGrid}>
          {Array.from({ length: 30 }, (_, i) => i + 1).map(j => (
            <TouchableOpacity key={j} style={s.juzChip} onPress={() => onSelectJuz(j-1)}>
              <Text style={s.juzChipText}>الجزء {toAr(j)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

export const BulkMarkModal = ({ visible, onClose, onSelectSurah }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={s.modalOverlay}>
      <View style={s.modalContent}>
        <View style={s.modalHeader}>
          <Text style={s.modalTitle}>تحديد سريع حتى سورة</Text>
          <TouchableOpacity onPress={onClose}><X size={24} color="#fcd34d" /></TouchableOpacity>
        </View>
        <FlatList 
          data={SURAH_NAMES}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item, index }) => (
            <TouchableOpacity 
              style={s.bulkItem} 
              onPress={() => onSelectSurah(index + 1)}
            >
              <Text style={s.bulkItemText}>{item}</Text>
              <Text style={s.bulkItemNum}>{toAr(index + 1)}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  </Modal>
);

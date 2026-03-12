import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { X } from 'lucide-react-native';
import { s } from './DuaStyles';

export const AddDuaModal = ({ visible, onClose, text, setText, refText, setRefText, onSave }: any) => (
  <Modal visible={visible} animationType="slide" transparent>
    <View style={s.modalOverlay}>
      <View style={s.modalContent}>
        <View style={s.modalHeader}>
          <TouchableOpacity onPress={onClose}><X color="#94a3b8" size={24} /></TouchableOpacity>
          <Text style={s.modalTitle}>إضافة دعاء جديد</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={s.modalBody}>
          <Text style={s.inputLabel}>نص الدعاء</Text>
          <TextInput
            style={[s.textInput, s.largeInput]}
            multiline
            numberOfLines={4}
            placeholder="اكتب دعاءك هنا..."
            placeholderTextColor="#64748b"
            value={text}
            onChangeText={setText}
          />

          <Text style={s.inputLabel}>المصدر (اختياري)</Text>
          <TextInput
            style={s.textInput}
            placeholder="مثلاً: لصديق، من القلب، إلخ"
            placeholderTextColor="#64748b"
            value={refText}
            onChangeText={setRefText}
          />

          <TouchableOpacity 
            style={[s.submitBtn, !text.trim() && s.submitBtnDisabled]} 
            onPress={onSave}
            disabled={!text.trim()}
          >
            <Text style={s.submitBtnText}>حفظ الدعاء</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

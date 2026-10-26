import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { X } from 'lucide-react-native';
import { s } from './DuaStyles';
import { PillButton } from '../ui';
import { colors } from '../../../shared/theme/tokens';

export const AddDuaModal = ({ visible, onClose, text, setText, refText, setRefText, onSave }: {
  visible: boolean; onClose: () => void;
  text: string; setText: (t: string) => void;
  refText: string; setRefText: (t: string) => void;
  onSave: () => void;
}) => (
  <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
    <View style={s.modalOverlay}>
      <View style={s.modalContent}>
        <View style={s.modalHeader}>
          <TouchableOpacity onPress={onClose} hitSlop={8} accessibilityLabel="إغلاق"><X color={colors.textMuted} size={24} /></TouchableOpacity>
          <Text style={s.modalTitle}>إضافة دعاء جديد</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={s.modalBody} keyboardShouldPersistTaps="handled">
          <Text style={s.inputLabel}>نص الدعاء</Text>
          <TextInput
            style={[s.textInput, s.largeInput]}
            multiline
            numberOfLines={4}
            placeholder="اكتب دعاءك هنا..."
            placeholderTextColor={colors.textFaint}
            value={text}
            onChangeText={setText}
          />
          <Text style={s.inputLabel}>المصدر (اختياري)</Text>
          <TextInput
            style={s.textInput}
            placeholder="مثلاً: من القلب، لصديق..."
            placeholderTextColor={colors.textFaint}
            value={refText}
            onChangeText={setRefText}
          />
          <PillButton label="حفظ الدعاء" onPress={onSave} disabled={!text.trim()} />
        </ScrollView>
      </View>
    </View>
  </Modal>
);

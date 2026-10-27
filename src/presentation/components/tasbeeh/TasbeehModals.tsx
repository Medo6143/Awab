import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { s } from './TasbeehStyles';
import { colors } from '../../../shared/theme/tokens';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (val: string) => void;
  title: string;
  subtitle?: string;
  placeholder: string;
  keyboardType?: 'default' | 'number-pad';
  value: string;
  setValue: (v: string) => void;
  suggestions?: string[];
}

export const InputModal = ({ visible, onClose, onConfirm, title, subtitle, placeholder, keyboardType, value, setValue, suggestions }: ModalProps) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={s.modalOverlay}>
      <View style={s.modalContent}>
        <Text style={s.modalTitle}>{title}</Text>
        {subtitle && <Text style={s.modalSubTitle}>{subtitle}</Text>}
        
        <TextInput 
          style={s.modalInput} 
          placeholder={placeholder} 
          placeholderTextColor={colors.textFaint}
          value={value}
          onChangeText={setValue}
          keyboardType={keyboardType}
          textAlign="center"
        />

        {suggestions && suggestions.length > 0 && (
          <View style={{ maxHeight: 150, marginBottom: 20 }}>
            <Text style={s.suggestionsLabel}>مقترحات:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {suggestions.map((sug, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  onPress={() => setValue(sug)}
                  style={s.suggestionChip}
                >
                  <Text style={s.suggestionText}>{sug}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={s.modalActions}>
          <TouchableOpacity onPress={onClose} style={s.modalBtnCancel}>
            <Text style={s.modalBtnText}>إلغاء</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onConfirm(value)} style={s.modalBtnAdd}>
            <Text style={s.modalBtnTextPrimary}>تأكيد</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export const TasbeehModals = ({ 
  showAddDhikr, setShowAddDhikr, newDhikr, setNewDhikr, onAddDhikr,
  showManualAdd, setShowManualAdd, manualCountVal, setManualCountVal, onManualAdd,
  showCustomTarget, setShowCustomTarget, customTargetVal, setCustomTargetVal, onCustomTarget
}: {
  showAddDhikr: boolean; setShowAddDhikr: (v: boolean) => void; newDhikr: string; setNewDhikr: (v: string) => void; onAddDhikr: (v: string) => void;
  showManualAdd: boolean; setShowManualAdd: (v: boolean) => void; manualCountVal: string; setManualCountVal: (v: string) => void; onManualAdd: (v: string) => void;
  showCustomTarget: boolean; setShowCustomTarget: (v: boolean) => void; customTargetVal: string; setCustomTargetVal: (v: string) => void; onCustomTarget: (v: string) => void;
}) => {
  // Actually let's use the full text but display shortened
  const suggestions = [
    "سبحان الله", "الحمد لله", "لا إله إلا الله", "الله أكبر", 
    "لا حول ولا قوة إلا بالله", "أستغفر الله", "اللهم صل على محمد"
  ];

  return (
    <>
      <InputModal 
        visible={showAddDhikr} 
        onClose={() => setShowAddDhikr(false)} 
        onConfirm={onAddDhikr}
        title="إضافة ذكر جديد"
        placeholder="اكتب الذكر هنا..."
        value={newDhikr}
        setValue={setNewDhikr}
        suggestions={suggestions}
      />
      <InputModal 
        visible={showManualAdd} 
        onClose={() => setShowManualAdd(false)} 
        onConfirm={onManualAdd}
        title="إضافة تسبيح يدوي"
        subtitle="أضف التسبيح الذي قمت به يدوياً خارج التطبيق"
        placeholder="أدخل عدد التسبيحات..."
        keyboardType="number-pad"
        value={manualCountVal}
        setValue={setManualCountVal}
      />
      <InputModal 
        visible={showCustomTarget} 
        onClose={() => setShowCustomTarget(false)} 
        onConfirm={onCustomTarget}
        title="تحديد هدف مخصص"
        placeholder="أدخل الرقم..."
        keyboardType="number-pad"
        value={customTargetVal}
        setValue={setCustomTargetVal}
      />
    </>
  );
};

import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { s } from './TasbeehStyles';
import { MORNING_ATHKAR, EVENING_ATHKAR } from '../../../shared/constants/athkar';

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

const CustomModal = ({ visible, onClose, onConfirm, title, subtitle, placeholder, keyboardType, value, setValue, suggestions }: ModalProps) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={s.modalOverlay}>
      <View style={s.modalContent}>
        <Text style={s.modalTitle}>{title}</Text>
        {subtitle && <Text style={s.modalSubTitle}>{subtitle}</Text>}
        
        <TextInput 
          style={s.modalInput} 
          placeholder={placeholder} 
          placeholderTextColor="#94a3b8"
          value={value}
          onChangeText={setValue}
          keyboardType={keyboardType}
          textAlign="center"
        />

        {suggestions && suggestions.length > 0 && (
          <View style={{ maxHeight: 150, marginBottom: 20 }}>
            <Text style={{ fontFamily: 'Tajawal_700Bold', fontSize: 13, color: '#B8860B', marginBottom: 10 }}>مقترحات:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {suggestions.map((sug, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  onPress={() => setValue(sug)}
                  style={{ backgroundColor: 'rgba(184, 134, 11, 0.1)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(184, 134, 11, 0.3)' }}
                >
                  <Text style={{ color: '#fcd34d', fontFamily: 'Tajawal_500Medium', fontSize: 13 }}>{sug}</Text>
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
            <Text style={s.modalBtnText}>تأكيد</Text>
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
}: any) => {
  const allSuggested = [
    ...MORNING_ATHKAR.map(a => a.text.substring(0, 30) + (a.text.length > 30 ? '...' : '')),
    ...EVENING_ATHKAR.map(a => a.text.substring(0, 30) + (a.text.length > 30 ? '...' : ''))
  ];
  
  // Actually let's use the full text but display shortened
  const suggestions = [
    "سبحان الله", "الحمد لله", "لا إله إلا الله", "الله أكبر", 
    "لا حول ولا قوة إلا بالله", "أستغفر الله", "اللهم صل على محمد"
  ];

  return (
    <>
      <CustomModal 
        visible={showAddDhikr} 
        onClose={() => setShowAddDhikr(false)} 
        onConfirm={onAddDhikr}
        title="إضافة ذكر جديد"
        placeholder="اكتب الذكر هنا..."
        value={newDhikr}
        setValue={setNewDhikr}
        suggestions={suggestions}
      />
      <CustomModal 
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
      <CustomModal 
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

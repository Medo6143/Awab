import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { X, Star } from 'lucide-react-native';
import { s } from './QuranStyles';
import { RECITER_MAP } from '../../../data/services/AudioService';

interface Props {
  visible: boolean;
  onClose: () => void;
  activeReciter: any;
  onReciterChange: (id: string) => void;
}

export const ReciterPickerModal = ({ visible, onClose, activeReciter, onReciterChange }: Props) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.reciterModalOverlay}>
        <View style={s.reciterModalContent}>
          <View style={s.reciterModalHead}>
            <Text style={s.reciterModalTitle}>اختر القارئ</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#fcd34d" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {Object.entries(RECITER_MAP).map(([id, r]) => (
              <TouchableOpacity 
                key={id} 
                onPress={() => onReciterChange(id)}
                style={[s.reciterItem, activeReciter?.name === r.name && s.reciterItemActive]}
              >
                <Text style={[s.reciterItemName, activeReciter?.name === r.name && s.reciterItemNameActive]}>
                  {r.name}
                </Text>
                {activeReciter?.name === r.name && <Star size={18} color="#fcd34d" fill="#fcd34d" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

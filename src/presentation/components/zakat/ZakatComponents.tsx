import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { s } from './ZakatStyles';

export const ZakatInput = ({ label, value, onChange, icon: Icon, unit }: any) => (
  <View style={s.inputWrapper}>
    <Text style={s.inputLabel}>{label}</Text>
    <View style={s.inputRow}>
      <View style={s.iconBox}><Icon size={18} color="#fcd34d" /></View>
      <TextInput
        style={s.input}
        keyboardType="numeric"
        placeholder="٠"
        placeholderTextColor="#475569"
        value={value}
        onChangeText={onChange}
        textAlign="right"
      />
      <Text style={s.unitText}>{unit}</Text>
    </View>
  </View>
);

export const ZakatInfoBox = () => (
  <View style={s.infoBox}>
     <Text style={s.infoTitle}>عن الزكاة</Text>
     <Text style={s.infoDesc}>
       تُستحق الزكاة إذا بلغ المال النصاب (ما يعادل قيمة ٨٥ جراماً من الذهب) وحال عليه الحول (عام هجري كامل). النسبة المقررة هي ٢.٥٪ من إجمالي المال.
     </Text>
  </View>
);

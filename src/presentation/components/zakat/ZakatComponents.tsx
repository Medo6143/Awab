import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { s } from './ZakatStyles';
import { Card, IconTile } from '../ui';
import { colors } from '../../../shared/theme/tokens';

export const ZakatInput = ({ label, value, onChange, icon, unit }: any) => (
  <View style={s.inputWrapper}>
    <Text style={s.inputLabel}>{label}</Text>
    <View style={s.inputRow}>
      <IconTile icon={icon} />
      <TextInput
        style={s.input}
        keyboardType="numeric"
        placeholder="٠"
        placeholderTextColor={colors.textFaint}
        value={value}
        onChangeText={onChange}
        textAlign="right"
        accessibilityLabel={label}
      />
      <Text style={s.unitText}>{unit}</Text>
    </View>
  </View>
);

export const ZakatInfoBox = () => (
  <Card padding={5} style={{ marginTop: 24 }}>
    <Text style={s.infoTitle}>عن الزكاة</Text>
    <Text style={s.infoDesc}>
      تُستحق الزكاة إذا بلغ المال النصاب (ما يعادل قيمة ٨٥ جراماً من الذهب) وحال عليه الحول (عام هجري كامل). النسبة المقررة هي ٢.٥٪ من إجمالي المال.
    </Text>
  </Card>
);

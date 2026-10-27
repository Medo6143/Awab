import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { Chip } from '../ui';
import { setShareCardStyle, setShareTextSize } from '../../store/slices/settingsSlice';
import { colors, space, type } from '../../../shared/theme/tokens';
import { SHARE_STYLES, SHARE_TEXT_SIZES, useShareStyle } from './storyThemes';

/** Design and text-size choice under the share preview; remembered for the next share. */
export const ShareStylePicker = () => {
  const dispatch = useDispatch();
  const { style, size } = useShareStyle();
  return (
    <View style={{ gap: space[2] }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.row}>
        {SHARE_STYLES.map((o) => (
          <Chip key={o.id} label={o.name} size="sm" selected={style === o.id} onPress={() => dispatch(setShareCardStyle(o.id))} />
        ))}
      </ScrollView>
      <View style={st.sizeRow}>
        <Text style={st.sizeLabel}>حجم الخط</Text>
        {SHARE_TEXT_SIZES.map((o) => (
          <Chip key={o.id} label={o.name} size="sm" selected={size === o.id} onPress={() => dispatch(setShareTextSize(o.id))} />
        ))}
      </View>
    </View>
  );
};

const st = StyleSheet.create({
  row: { gap: space[2], paddingHorizontal: space[1] },
  sizeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2] },
  sizeLabel: { ...type.caption, color: colors.textMuted },
});

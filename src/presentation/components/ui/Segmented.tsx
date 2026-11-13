import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, space, themed, type } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';

type Option<T extends string> = { value: T; label: string };

/** One choice out of a few, as a pill track with the picked one filled (tabs inside a screen). */
export const Segmented = <T extends string>({ options, value, onChange, style }: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  style?: object;
}) => {
  const accent = useAccent();
  return (
    <View style={[st.track, style]} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <TouchableOpacity
            key={o.value}
            onPress={() => onChange(o.value)}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={[st.item, on && { backgroundColor: accent.accent }]}
          >
            <Text numberOfLines={1} style={[st.label, { color: on ? accent.onAccent : colors.textMuted }]}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const st = themed(() => ({
  track: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.pill, padding: space[1] },
  item: { flex: 1, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space[1] },
  label: { ...type.label },
}));

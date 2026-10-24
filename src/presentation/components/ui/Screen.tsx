import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors, layout, space } from '../../../shared/theme/tokens';

type Props = {
  children: React.ReactNode;
  /** Wrap content in a ScrollView. */
  scroll?: boolean;
  /** Screen lives under the floating tab bar: adds the tab-bar inset at the bottom. */
  tab?: boolean;
  /** Horizontal screen padding (default true). */
  padded?: boolean;
  header?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
};

/** Bottom padding to pass to a FlatList/ScrollView the screen owns itself. */
export const bottomInset = (tab?: boolean) => (tab ? layout.tabBarInset : space[8]);

export const Screen = ({ children, scroll, tab, padded = true, header, style, contentStyle, edges = ['top'] }: Props) => {
  const padding = padded ? { paddingHorizontal: layout.screenPadding } : null;
  return (
    <SafeAreaView edges={edges} style={[styles.root, style]}>
      {header}
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[padding, { paddingBottom: bottomInset(tab) }, contentStyle]}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, padding, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
});

import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView, Edge, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, layout, space, themed } from '../../../shared/theme/tokens';

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

/**
 * Bottom padding for scrolling content: clears the floating tab bar (if any) and the system
 * navigation bar, which the app draws under (edge-to-edge; 3-button nav makes it tall).
 */
export const useBottomInset = (tab?: boolean) => (tab ? layout.tabBarInset : space[8]) + useSafeAreaInsets().bottom;

export const Screen = ({ children, scroll, tab, padded = true, header, style, contentStyle, edges = ['top'] }: Props) => {
  const padding = padded ? { paddingHorizontal: layout.screenPadding } : null;
  const bottom = useBottomInset(tab);
  return (
    <SafeAreaView edges={edges} style={[styles.root, style]}>
      {header}
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[padding, contentStyle, { paddingBottom: bottom }]}
        >
          {children}
        </ScrollView>
      ) : (
        // tab screens keep their last row above the floating tab bar
        <View style={[styles.fill, padding, contentStyle, tab && { paddingBottom: bottom }]}>{children}</View>
      )}
    </SafeAreaView>
  );
};

const styles = themed(() => ({
  root: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
}));

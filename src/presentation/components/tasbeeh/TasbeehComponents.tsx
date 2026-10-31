import React, { useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Animated, FlatList, Dimensions } from 'react-native';
import { Hash, Target, Plus } from 'lucide-react-native';
import { s } from './TasbeehStyles';
import { toAr } from './TasbeehConstants';
import { SebhaSvg } from './SebhaSvg';
import { colors, isLightTheme } from '../../../shared/theme/tokens';

const { width } = Dimensions.get('window');

/** Brightness 0..1 of a #rrggbb colour. */
const lightness = (hex: string) => {
  const n = parseInt(hex.slice(1, 7), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
};

/**
 * The count is drawn in the bubble colour the user picked, straight on the page. A colour
 * too close to the page (white in light mode, black in dark) gives way to the theme's own.
 */
const readableOnPage = (accent?: string) => {
  if (!accent || !/^#[0-9a-f]{6}$/i.test(accent)) return colors.goldText;
  const l = lightness(accent);
  if (isLightTheme() ? l > 0.8 : l < 0.2) return isLightTheme() ? colors.goldText : '#FFFFFF';
  return accent;
};

// ── Tasbeeh Counter ────────────────────────────────────────────────────────
export const TasbeehCounter = ({ count, target, selectedDhikr, scaleAnim, onPress, accentColor }: {
  count: number; target: number; selectedDhikr: string; scaleAnim: Animated.Value; onPress: () => void; accentColor: string;
}) => {
  const textColor = readableOnPage(accentColor);
  const size = Math.min(width * 0.86, 360);

  return (
    <View style={s.counterBody}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <SebhaSvg size={size} count={count} accentColor={accentColor || '#B8860B'} onPress={onPress}>
          <Text style={s.dhikrHeader}>{selectedDhikr}</Text>
          <Text style={[s.mainCount, { color: textColor }]}>{toAr(count)}</Text>
          <View style={s.progressTextRow}>
            <Target size={14} color={textColor} />
            <Text style={[s.progressText, { color: textColor }]}>الهدف: {toAr(target)}</Text>
          </View>
        </SebhaSvg>
      </Animated.View>
    </View>
  );
};

// ── Target Carousel ────────────────────────────────────────────────────────
type CarouselItem =
  | { type: 'target'; value: number }
  | { type: 'custom' }
  | { type: 'manual' };

interface TargetCarouselProps {
  targets: number[];
  currentTarget: number;
  onSelect: (t: number) => void;
  onCustom: () => void;
  onManual: () => void;
}

export const TargetCarousel = ({
  targets, currentTarget, onSelect, onCustom, onManual,
}: TargetCarouselProps) => {
  const listRef = useRef<FlatList<CarouselItem>>(null);
  const scaleAnims = useRef<{ [key: string]: Animated.Value }>({}).current;

  // Build items list: targets + custom + manual
  const items: CarouselItem[] = [
    ...targets.map(v => ({ type: 'target' as const, value: v })),
    { type: 'custom' as const },
    { type: 'manual' as const },
  ];

  const getScale = (key: string) => {
    if (!scaleAnims[key]) scaleAnims[key] = new Animated.Value(1);
    return scaleAnims[key];
  };

  const animatePress = (key: string) => {
    const anim = getScale(key);
    Animated.sequence([
      Animated.spring(anim, { toValue: 0.88, useNativeDriver: true, speed: 40 }),
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 4 }),
    ]).start();
  };

  const handleSelect = (value: number, idx: number) => {
    animatePress(`t_${value}`);
    onSelect(value);
    // Scroll selected item into view (center-ish)
    try {
      listRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.5 });
    } catch {}
  };

  const renderItem = useCallback(({ item, index }: { item: CarouselItem; index: number }) => {
    if (item.type === 'target') {
      const isActive = item.value === currentTarget;
      const scale = getScale(`t_${item.value}`);
      return (
        <Animated.View style={{ transform: [{ scale }] }}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => handleSelect(item.value, index)}
            style={[s.carouselItem, isActive && s.carouselItemActive]}
          >
            <Text style={[s.carouselItemText, isActive && s.carouselItemTextActive]}>
              {toAr(item.value)}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    if (item.type === 'custom') {
      return (
        <TouchableOpacity activeOpacity={0.75} onPress={onCustom} style={s.carouselAddItem} accessibilityRole="button" accessibilityLabel="إضافة هدف جديد">
          <Plus size={16} color={colors.goldText} />
          <Text style={s.carouselAddText}>هدف</Text>
        </TouchableOpacity>
      );
    }

    // manual
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onManual}
        style={s.carouselIconItem}
        accessibilityRole="button"
        accessibilityLabel="إضافة عدد يدويًا"
      >
        <Hash size={18} color={colors.textMuted} />
      </TouchableOpacity>
    );
  }, [currentTarget, targets]);

  // Dot indicators (only for target items)
  const activeIdx = targets.indexOf(currentTarget);

  return (
    <View style={s.carouselWrapper}>
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(item, i) =>
          item.type === 'target' ? `t_${item.value}` : `${item.type}_${i}`
        }
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.carouselContent}
        onScrollToIndexFailed={() => {}}
        // Snap to center each card
        snapToInterval={80}
        decelerationRate="fast"
      />

      {/* Dot indicators */}
      <View style={s.dotsRow}>
        {targets.map((t, i) => (
          <View
            key={t}
            style={[s.dot, i === activeIdx && s.dotActive]}
          />
        ))}
      </View>
    </View>
  );
};

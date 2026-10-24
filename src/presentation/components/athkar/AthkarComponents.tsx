import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { RotateCcw, Sun, Moon, CheckCircle2 } from 'lucide-react-native';
import { s } from './AthkarStyles';
import { AthkarItem } from '../../../shared/constants/athkar';
import { ScreenHeader, IconButton, Chip, ProgressBar } from '../ui';
import { colors, icon } from '../../../shared/theme/tokens';
import { useAccent } from '../../../shared/theme/useAccent';
import { toAr } from '../../../shared/utils/format';

export const AthkarHeader = ({ onBack, onReset, hideHeader, isTab }: any) => {
  if (hideHeader) return null;
  return (
    <ScreenHeader
      title="أذكار المسلم"
      large={isTab}
      onBack={isTab ? undefined : onBack}
      right={
        <IconButton onPress={onReset} label="إعادة ضبط العدّادات">
          <RotateCcw color={colors.textMuted} size={icon.size.md} strokeWidth={icon.stroke} />
        </IconButton>
      }
    />
  );
};

export const AthkarTabs = ({ activeTab, onTabChange }: any) => {
  const accent = useAccent();
  const c = (id: string) => (activeTab === id ? accent.accentText : colors.textMuted);
  return (
    <View style={s.tabContainer}>
      <Chip label="أذكار الصباح" selected={activeTab === 'morning'} onPress={() => onTabChange('morning')} icon={<Sun size={icon.size.md} color={c('morning')} strokeWidth={icon.stroke} />} />
      <Chip label="أذكار المساء" selected={activeTab === 'evening'} onPress={() => onTabChange('evening')} icon={<Moon size={icon.size.md} color={c('evening')} strokeWidth={icon.stroke} />} />
    </View>
  );
};

export const AthkarProgressBar = ({ progressPercent, totalCompleted, totalPossible }: any) => (
  <View style={s.progressSection}>
    <View style={s.progressHeader}>
      <Text style={s.progressSub}>{toAr(totalCompleted)} من {toAr(totalPossible)} تسبيحة</Text>
      <Text style={s.progressLabel}>{toAr(Math.round(progressPercent))}٪</Text>
    </View>
    <ProgressBar progress={progressPercent / 100} />
  </View>
);

export const AthkarCard = ({ item, currentCount, onToggle }: { item: AthkarItem; currentCount: number; onToggle: (item: AthkarItem) => void }) => {
  const isCompleted = currentCount >= item.count;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onToggle(item)}
      style={[s.athkarCard, isCompleted && s.athkarCardCompleted]}
      accessibilityRole="button"
      accessibilityLabel={`${item.text}. ${toAr(currentCount)} من ${toAr(item.count)}`}
    >
      <View style={s.cardBody}>
        <Text style={[s.athkarText, isCompleted && s.textCompleted]}>{item.text}</Text>
        <View style={s.counterContainer}>
          <View style={[s.miniCounter, isCompleted && s.miniCounterCompleted]}>
            <Text style={[s.counterText, isCompleted && s.counterTextCompleted]}>{toAr(currentCount)} / {toAr(item.count)}</Text>
          </View>
          {isCompleted && <CheckCircle2 size={22} color={colors.success} strokeWidth={icon.stroke} style={s.checkmark} />}
        </View>
      </View>
    </TouchableOpacity>
  );
};

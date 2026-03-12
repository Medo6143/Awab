import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { ChevronRight, RotateCcw, Sun, Moon, CheckCircle2 } from 'lucide-react-native';
import { s } from './AthkarStyles';
import { AthkarItem } from '../../../shared/constants/athkar';

const toAr = (n: number) => n.toString().replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);

export const AthkarHeader = ({ onBack, onReset, hideHeader }: any) => {
  if (hideHeader) return null;
  return (
    <View style={s.header}>
      <TouchableOpacity onPress={onBack} style={s.backBtn}>
        <ChevronRight color="#fcd34d" size={24} />
      </TouchableOpacity>
      <Text style={s.headerTitle}>أذكار المسلم</Text>
      <TouchableOpacity onPress={onReset} style={s.resetBtn}>
        <RotateCcw color="#94a3b8" size={20} />
      </TouchableOpacity>
    </View>
  );
};

export const AthkarTabs = ({ activeTab, onTabChange }: any) => (
  <View style={s.tabContainer}>
    <TouchableOpacity 
      onPress={() => onTabChange('morning')}
      style={[s.tab, activeTab === 'morning' && s.tabActive]}
    >
      <Sun size={20} color={activeTab === 'morning' ? "#fff" : "#94a3b8"} />
      <Text style={[s.tabLabel, activeTab === 'morning' && s.tabLabelActive]}>صباحاً</Text>
    </TouchableOpacity>
    <TouchableOpacity 
      onPress={() => onTabChange('evening')}
      style={[s.tab, activeTab === 'evening' && s.tabActive]}
    >
      <Moon size={20} color={activeTab === 'evening' ? "#fff" : "#94a3b8"} />
      <Text style={[s.tabLabel, activeTab === 'evening' && s.tabLabelActive]}>مساءً</Text>
    </TouchableOpacity>
  </View>
);

export const AthkarProgressBar = ({ progressPercent, totalCompleted, totalPossible }: any) => (
  <View style={s.progressSection}>
    <View style={s.progressHeader}>
      <Text style={s.progressLabel}>{Math.round(progressPercent)}% تم الإنجاز</Text>
      <Text style={s.progressSub}>{toAr(totalCompleted)} من {toAr(totalPossible)} تسبيحة</Text>
    </View>
    <View style={s.progressBarBg}>
       <Animated.View style={[s.progressBarFill, { width: `${progressPercent}%` }]} />
    </View>
  </View>
);

export const AthkarCard = ({ item, currentCount, onToggle }: { item: AthkarItem, currentCount: number, onToggle: (item: AthkarItem) => void }) => {
  const isCompleted = currentCount >= item.count;
  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => onToggle(item)}
      style={[s.athkarCard, isCompleted && s.athkarCardCompleted]}
    >
      <View style={s.cardBody}>
        <Text style={[s.athkarText, isCompleted && s.textCompleted]}>{item.text}</Text>
        <View style={s.counterContainer}>
           <View style={[s.miniCounter, isCompleted && s.miniCounterCompleted]}>
              <Text style={[s.counterText, isCompleted && s.counterTextCompleted]}>
                {toAr(currentCount)} / {toAr(item.count)}
              </Text>
           </View>
           {isCompleted && <CheckCircle2 size={24} color="#2E7D32" style={s.checkmark} />}
        </View>
      </View>
    </TouchableOpacity>
  );
};

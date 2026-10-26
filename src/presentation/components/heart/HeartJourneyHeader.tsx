import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Award, Library, PlayCircle, RotateCcw } from 'lucide-react-native';
import { s } from './HeartJourneyStyles';
import { ScreenHeader } from '../ui';
import { colors } from '../../../shared/theme/tokens';
import { toAr } from './HeartJourneyConstants';

export const HeartJourneyHeader = ({ completedCount, onBack }: { completedCount: number; onBack: () => void }) => (
  <ScreenHeader
    title="نور القرآن في قلبك"
    onBack={onBack}
    right={<View style={s.progressBadge}><Text style={s.progressBadgeText} numberOfLines={1}>{toAr(completedCount)}/١١٤</Text></View>}
  />
);

export const HeartNarrative = ({ khatmaCount, completedCount, onShowJuz, onShowBulk, onFinish }: {
  khatmaCount: number; completedCount: number;
  onShowJuz: () => void; onShowBulk: () => void; onFinish: () => void;
}) => (
  <View style={s.narrative}>
    <View style={s.narrativeHeader}>
      <View>
        <Text style={s.narrativeTitle}>جدول ختم السور</Text>
        <Text style={s.narrativeSub}>حدد السورة التي أتممتها لتمتلئ بها عروق قلبك</Text>
      </View>
      {khatmaCount > 0 && (
        <View style={s.khatmaBadge}>
          <Award size={16} color={colors.goldText} />
          <Text style={s.khatmaBadgeText}>ختمات: {toAr(khatmaCount)}</Text>
        </View>
      )}
    </View>

    <View style={s.controlsRow}>
      <TouchableOpacity onPress={onShowJuz} style={s.controlBtn}>
        <Library size={18} color={colors.goldText} />
        <Text style={s.controlBtnText}>ختم جزء</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onShowBulk} style={s.controlBtn}>
        <PlayCircle size={18} color={colors.goldText} />
        <Text style={s.controlBtnText}>تحديد سريع</Text>
      </TouchableOpacity>

      {completedCount === 114 && (
        <TouchableOpacity onPress={onFinish} style={[s.controlBtn, s.finishBtn]}>
          <RotateCcw size={18} color={colors.onGold} />
          <Text style={[s.controlBtnText, { color: colors.onGold }]}>إنهاء الختمة</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

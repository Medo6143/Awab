import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { History, Library, PlayCircle, RotateCcw } from 'lucide-react-native';
import { s } from './HeartJourneyStyles';
import { ScreenHeader } from '../ui';
import { colors } from '../../../shared/theme/tokens';
import { toAr } from './HeartJourneyConstants';
import { formatDate, khatmaTitle } from './khatmaFormat';
import type { HeartMode } from '../../store/slices/quranSlice';

export const HeartJourneyHeader = ({ completedCount, onBack }: { completedCount: number; onBack: () => void }) => (
  <ScreenHeader
    title="نور القرآن في قلبك"
    onBack={onBack}
    right={<View style={s.progressBadge}><Text style={s.progressBadgeText} numberOfLines={1}>{toAr(completedCount)}/١١٤</Text></View>}
  />
);

export const HeartNarrative = ({ mode, khatmaCount, completedCount, startedAt, onShowJuz, onShowBulk, onFinish, onShowLog }: {
  mode: HeartMode; khatmaCount: number; completedCount: number; startedAt?: string;
  onShowJuz: () => void; onShowBulk: () => void; onFinish: () => void; onShowLog: () => void;
}) => (
  <View style={s.narrative}>
    <View style={s.narrativeHeader}>
      <View style={{ flex: 1 }}>
        <Text style={s.narrativeTitle}>{mode === 'reading' ? 'جدول ختم السور' : 'جدول حفظ السور'}</Text>
        <Text style={s.narrativeSub}>
          {mode === 'reading' ? 'حدد السورة التي أتممتها لتمتلئ بها عروق قلبك' : 'حدد السورة التي حفظتها لتمتلئ بها عروق قلبك'}
        </Text>
        <Text style={s.khatmaInfo}>
          {khatmaTitle(khatmaCount + 1)}{startedAt ? ` · بدأت ${formatDate(startedAt)}` : ''}
        </Text>
      </View>
      <TouchableOpacity style={s.khatmaBadge} onPress={onShowLog} accessibilityRole="button" accessibilityLabel="سجل الختمات">
        <History size={16} color={colors.goldText} />
        <Text style={s.khatmaBadgeText}>السجل</Text>
      </TouchableOpacity>
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

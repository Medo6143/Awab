import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight, Award, Library, PlayCircle, RotateCcw } from 'lucide-react-native';
import { s } from './HeartJourneyStyles';
import { toAr } from './HeartJourneyConstants';

export const HeartJourneyHeader = ({ completedCount, onBack }: any) => (
  <View style={s.header}>
    <TouchableOpacity onPress={onBack} style={s.backBtn}>
      <ChevronRight color="#fcd34d" size={24} />
    </TouchableOpacity>
    <Text style={s.headerTitle}>نور القرآن في قلبك</Text>
    <View style={s.progressBadge}>
      <Text style={s.progressBadgeText}>{toAr(completedCount)}/١١٤</Text>
    </View>
  </View>
);

export const HeartNarrative = ({ khatmaCount, completedCount, onShowJuz, onShowBulk, onFinish }: any) => (
  <View style={s.narrative}>
    <View style={s.narrativeHeader}>
      <View>
        <Text style={s.narrativeTitle}>جدول ختم السور</Text>
        <Text style={s.narrativeSub}>حدد السورة التي أتممتها لتمتلئ بها عروق قلبك</Text>
      </View>
      {khatmaCount > 0 && (
        <View style={s.khatmaBadge}>
          <Award size={16} color="#451a03" />
          <Text style={s.khatmaBadgeText}>ختمات: {toAr(khatmaCount)}</Text>
        </View>
      )}
    </View>

    <View style={s.controlsRow}>
      <TouchableOpacity onPress={onShowJuz} style={s.controlBtn}>
        <Library size={18} color="#fcd34d" />
        <Text style={s.controlBtnText}>ختم جزء</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onShowBulk} style={s.controlBtn}>
        <PlayCircle size={18} color="#fcd34d" />
        <Text style={s.controlBtnText}>تحديد سريع</Text>
      </TouchableOpacity>

      {completedCount === 114 && (
        <TouchableOpacity onPress={onFinish} style={[s.controlBtn, s.finishBtn]}>
          <RotateCcw size={18} color="#fff" />
          <Text style={[s.controlBtnText, { color: '#fff' }]}>إنهاء الختمة</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

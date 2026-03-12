import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { X as LucideX, Activity, BookOpen, Star } from 'lucide-react-native';
import { s } from './StatsStyles';

const toAr = (n: number | string) => n.toLocaleString('ar-EG');

const DetailBlock = ({ title, count, content, icon, color }: any) => (
  <View style={s.detailBlock}>
    <View style={s.detailBlockHead}>
       {icon}
       <Text style={s.detailBlockTitle}>{title}</Text>
       <View style={[s.detailBlockBadge, { backgroundColor: color + '20' }]}>
          <Text style={[s.detailBlockBadgeText, { color }]}>{count}</Text>
       </View>
    </View>
    <Text style={s.detailBlockContent}>{content}</Text>
  </View>
);

const X = ({ color, size }: any) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ position: 'absolute', width: size, height: 2, backgroundColor: color, transform: [{ rotate: '45deg' }] }} />
    <View style={{ position: 'absolute', width: size, height: 2, backgroundColor: color, transform: [{ rotate: '-45deg' }] }} />
  </View>
);

export const DayDetailModal = ({ visible, selectedDate, dailyRecords, onClose, getPrayerName, accentColor }: any) => {
  const rec = selectedDate ? (dailyRecords || {})[selectedDate] : null;
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.modalOverlay}>
         <View style={s.modalGlass}>
            <View style={s.modalIndicator} />
            <View style={s.modalHeader}>
               <View>
                  <Text style={s.modalTopLabel}>تقرير يوم</Text>
                  <Text style={s.modalTitleText}>{selectedDate}</Text>
               </View>
               <TouchableOpacity onPress={onClose} style={s.closeCircle}>
                  <X color="#fff" size={20} />
               </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
               {rec && (
                 <View style={s.modalBody}>
                    <DetailBlock 
                      title="الصلوات والمهام" 
                      count={rec.prayers.length}
                      content={rec.prayers.map((p: string) => getPrayerName(p)).join('، ')}
                      icon={<Activity color="#fbbf24" />}
                      color="#fbbf24"
                    />
                    <DetailBlock 
                      title="ورد القرآن" 
                      count={rec.quranPages.length}
                      content={rec.quranPages.length > 0 ? 
                        [...rec.quranPages].sort((a:number,b:number)=>a-b).map(n => toAr(n)).join('، ') : 'لم يتم التسجيل'}
                      icon={<BookOpen color="#10b981" />}
                      color="#10b981"
                    />
                    <DetailBlock 
                      title="الأذكار والتسبيح" 
                      count={rec.dhikrCount}
                      content={
                        rec.dhikrDetails && Object.keys(rec.dhikrDetails).length > 0 ?
                        Object.entries(rec.dhikrDetails)
                          .sort((a, b) => (b[1] as number) - (a[1] as number))
                          .map(([name, count]) => `${name} (${toAr(count as number)})`)
                          .join('، ')
                        : 'لم يتم تسجيل أذكار'
                      }
                      icon={<Star color={accentColor} />}
                      color={accentColor}
                    />
                 </View>
               )}
            </ScrollView>
         </View>
      </View>
    </Modal>
  );
};

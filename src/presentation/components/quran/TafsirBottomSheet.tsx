import React from 'react';
import { View, Text, Modal, Pressable, Animated, ScrollView, TouchableOpacity, Share, ActivityIndicator, StyleSheet } from 'react-native';
import { Share2, Copy, Star, Play, X } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { s } from './QuranStyles';
import { toAr, Ayah } from './QuranConstants';

interface Props {
  visible: boolean;
  selectedAyah: Ayah | null;
  tafsir: string | null;
  tafsirLoading: boolean;
  tafsirStyle: string;
  tafsirFontSize: number;
  bottomSheetAnim: Animated.Value;
  bookmarks: number[];
  onClose: () => void;
  onToggleBookmark: () => void;
  onPlayAyah: (surah: number, ayah: number, surahName?: string) => void;
}

export const TafsirBottomSheet = ({
  visible, selectedAyah, tafsir, tafsirLoading, tafsirStyle, tafsirFontSize,
  bottomSheetAnim, bookmarks, onClose, onToggleBookmark, onPlayAyah
}: Props) => {

  const handleShare = async () => {
    if (!selectedAyah) return;
    try {
      await Share.share({
        message: `${selectedAyah.text}\n\n[${selectedAyah.surah.name} - آية ${selectedAyah.numberInSurah}]`,
      });
    } catch (error) {}
  };

  const handleCopy = async () => {
    if (selectedAyah) {
      await Clipboard.setStringAsync(selectedAyah.text);
    }
  };

  const renderTafsirContent = () => {
    if (tafsirLoading) {
      return (
        <View style={s.tafsirLoader}>
          <ActivityIndicator color="#C8771E" />
          <Text style={s.loadingTextSmall}>إحضار التفسير...</Text>
        </View>
      );
    }

    if (!tafsir) return null;

    switch (tafsirStyle) {
      case 'simple':
        return (
          <View style={s.simpleTafsir}>
            <Text style={[s.tafsirTextMain, { fontSize: tafsirFontSize }]}>{tafsir}</Text>
          </View>
        );
      case 'book':
        return (
          <View style={s.bookTafsir}>
            <View style={s.bookOrnamentTop} />
            <Text style={[s.tafsirTextMain, s.bookText, { fontSize: tafsirFontSize }]}>{tafsir}</Text>
            <View style={s.bookOrnamentBottom} />
          </View>
        );
      case 'modern':
      default:
        return (
          <View style={s.modernTafsir}>
            <View style={s.modernHeader}>
              <View style={s.modernIndicator} />
              <Text style={s.modernTitle}>التفسير</Text>
            </View>
            <Text style={[s.tafsirTextMain, s.modernText, { fontSize: tafsirFontSize }]}>{tafsir}</Text>
          </View>
        );
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={s.sheetOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[s.sheetContent, { transform: [{ translateY: bottomSheetAnim }] }]}>
          <View style={s.sheetGrabArea}>
            <View style={s.sheetGrab} />
          </View>
          <View style={{ flex: 1 }}>
            <ScrollView 
              scrollEnabled={true}
              showsVerticalScrollIndicator={true}
              style={s.sheetScrollable}
              contentContainerStyle={s.sheetScrollContent}
            >
              {selectedAyah && (
                <>
                  <View style={s.ayahPreviewCard}>
                    <Text style={s.ayahPreviewText}>{selectedAyah.text}</Text>
                    <Text style={s.ayahPreviewRef}>
                      {selectedAyah.surah.name} ﴿{toAr(selectedAyah.numberInSurah)}﴾
                    </Text>
                  </View>
                  {renderTafsirContent()}
                  <View style={{ height: 120 }} /> 
                </>
              )}
            </ScrollView>
          </View>
          <View style={s.sheetToolBar}>
            <TouchableOpacity style={s.sheetToolBtn} onPress={onToggleBookmark}>
              <Star size={24} color="#b45309" fill={selectedAyah && bookmarks.includes(selectedAyah.number) ? "#b45309" : "transparent"} />
              <Text style={s.sheetToolLab}>حفظ</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={s.sheetToolBtn} 
              onPress={() => selectedAyah && onPlayAyah(selectedAyah.surah.number, selectedAyah.numberInSurah, selectedAyah.surah.name)}
            >
              <Play size={24} color="#b45309" />
              <Text style={s.sheetToolLab}>الصوت</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.sheetToolBtn} onPress={handleShare}>
              <Share2 size={24} color="#b45309" />
              <Text style={s.sheetToolLab}>مشاركة</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.sheetToolBtn} onPress={handleCopy}>
              <Copy size={24} color="#b45309" />
              <Text style={s.sheetToolLab}>نسخ</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

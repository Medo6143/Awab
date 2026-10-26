import React, { useMemo, useState } from 'react';
import { View, Text, Modal, Pressable, Animated, ScrollView, TouchableOpacity, Share, ActivityIndicator, StyleSheet } from 'react-native';
import { Share2, Copy, Star, Play, X } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { s } from './QuranStyles';
import { colors } from '../../../shared/theme/tokens';
import { toAr, Ayah } from './QuranConstants';
import { TafsirBlocks } from './TafsirBlocks';
import { parseTafsir, tafsirExcerpt } from './tafsirParser';
import { ImageShareModal } from '../share/ImageShareModal';
import { AyahShareCard } from '../share/AyahShareCard';

interface Props {
  visible: boolean;
  selectedAyah: Ayah | null;
  tafsir: string | null;          // raw HTML from the API
  tafsirName?: string;
  tafsirLoading: boolean;
  tafsirError: boolean;
  onRetryTafsir: () => void;
  tafsirStyle: string;
  tafsirFontSize: number;
  bottomSheetAnim: Animated.Value;
  bookmarks: number[];
  onClose: () => void;
  onToggleBookmark: () => void;
  onPlayAyah: (surah: number, ayah: number, surahName?: string) => void;
}

export const TafsirBottomSheet = ({
  visible, selectedAyah, tafsir, tafsirName, tafsirLoading, tafsirError, onRetryTafsir, tafsirStyle, tafsirFontSize,
  bottomSheetAnim, bookmarks, onClose, onToggleBookmark, onPlayAyah
}: Props) => {

  const [shareOpen, setShareOpen] = useState(false);
  // parse once: the sections and the share-card excerpt come from the same blocks
  const blocks = useMemo(() => (tafsir ? parseTafsir(tafsir) : []), [tafsir]);
  const excerpt = useMemo(() => tafsirExcerpt(blocks), [blocks]);

  const handleShareText = async () => {
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
          <ActivityIndicator color={colors.goldDeep} />
          <Text style={s.loadingTextSmall}>إحضار التفسير...</Text>
        </View>
      );
    }

    if (tafsirError) {
      return (
        <View style={s.tafsirLoader}>
          <Text style={s.pageErrorText}>تعذّر تحميل التفسير. تأكد من الاتصال بالإنترنت.</Text>
          <TouchableOpacity style={s.pageRetryBtn} onPress={onRetryTafsir} accessibilityRole="button">
            <Text style={s.pageRetryText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!tafsir) return null;

    const variant = tafsirStyle === 'book' || tafsirStyle === 'simple' ? tafsirStyle : 'modern';
    return <TafsirBlocks blocks={blocks} fontSize={tafsirFontSize} variant={variant} sourceName={tafsirName} />;
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
              <Star size={24} color={colors.paperInk} fill={selectedAyah && bookmarks.includes(selectedAyah.number) ? colors.paperInk : "transparent"} />
              <Text style={s.sheetToolLab}>حفظ</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={s.sheetToolBtn} 
              onPress={() => selectedAyah && onPlayAyah(selectedAyah.surah.number, selectedAyah.numberInSurah, selectedAyah.surah.name)}
            >
              <Play size={24} color={colors.paperInk} />
              <Text style={s.sheetToolLab}>الصوت</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.sheetToolBtn} onPress={() => setShareOpen(true)} onLongPress={handleShareText}>
              <Share2 size={24} color={colors.paperInk} />
              <Text style={s.sheetToolLab}>صورة</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.sheetToolBtn} onPress={handleCopy}>
              <Copy size={24} color={colors.paperInk} />
              <Text style={s.sheetToolLab}>نسخ</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
      {selectedAyah ? (
        <ImageShareModal visible={shareOpen} title="مشاركة الآية كصورة" onClose={() => setShareOpen(false)}>
          <AyahShareCard
            ayahText={selectedAyah.text}
            surahName={selectedAyah.surah.name}
            ayahNumber={selectedAyah.numberInSurah}
            tafsirName={tafsirName}
            tafsirExcerpt={excerpt}
          />
        </ImageShareModal>
      ) : null}
    </Modal>
  );
};

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform, NativeModules, StyleSheet, DeviceEventEmitter } from 'react-native';
import { showFloatingBubble, hideFloatingBubble, requestPermission, checkPermission, initialize, updateTasbeehCount } from 'react-native-floating-bubble';
import { FontAwesome5 } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { incrementCount, resetCount } from '../../store/slices/tasbeehSlice';
import { THEME } from '../../../shared/theme/constants';

export const FloatingTasbeehToggle = ({ accentTheme }: any) => {
  const dispatch = useDispatch();
  const { count } = useSelector((state: RootState) => state.tasbeeh);

  const [isPermitted, setIsPermitted] = useState(false);
  const [isBubbleActive, setIsBubbleActive] = useState(false);
  const hasFloatingBubbleModule = Platform.OS === 'android' && !!NativeModules?.RNFloatingBubble;
  
  const accentColor = (THEME.colors as any)[accentTheme] || THEME.colors.primary;
  const statusLabel = !isPermitted ? 'تحتاج صلاحية' : isBubbleActive ? 'مفعلة الآن' : 'جاهزة للتفعيل';
  const statusColor = !isPermitted ? '#ef4444' : isBubbleActive ? '#22c55e' : '#f59e0b';

  useEffect(() => {
    if (hasFloatingBubbleModule) {
      checkPermission()
        .then((value: boolean) => {
          setIsPermitted(value);
          if (value) {
            // Now safe to initialize as it's a no-op in our fixed native module
            initialize().catch((err: any) => console.log('Init failed', err));
          }
        })
        .catch((err: any) => console.log('Permission check failed', err));
    }
  }, [hasFloatingBubbleModule]);

  // Sync redux count to native module whenever it changes and bubble is active
  useEffect(() => {
    if (isBubbleActive && hasFloatingBubbleModule) {
      updateTasbeehCount(count);
    }
  }, [count, isBubbleActive, hasFloatingBubbleModule]);

  // Listen to native module clicks to sync back to Redux
  useEffect(() => {
    const pressListener = DeviceEventEmitter.addListener('floating-bubble-press', () => {
      dispatch(incrementCount(1));
    });
    const resetListener = DeviceEventEmitter.addListener('floating-bubble-reset', () => {
      dispatch(resetCount());
    });
    
    return () => {
      pressListener.remove();
      resetListener.remove();
    };
  }, [dispatch]);

  const handleToggle = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('تنبيه', 'هذه الميزة متاحة فقط على أجهزة الأندرويد.');
      return;
    }

    if (!hasFloatingBubbleModule) {
      Alert.alert(
        'الميزة غير متاحة',
        'مكتبة المسبحة العائمة غير مدمجة في هذا الإصدار. شغّل التطبيق عبر build أصلي (expo run:android أو dev client) ليتم تفعيلها.'
      );
      return;
    }

    if (!isPermitted) {
      try {
        await requestPermission();
        const permitted = await checkPermission();
        setIsPermitted(permitted);
        if (!permitted) {
          Alert.alert('صلاحية مطلوبة', 'يجب إعطاء الصلاحية للتطبيق للظهور فوق التطبيقات الأخرى لتعمل المسبحة العائمة.');
          return;
        }
      } catch (e) {
        console.error('Permission request failed', e);
        return;
      }
    }

    if (isBubbleActive) {
      hideFloatingBubble().then(() => setIsBubbleActive(false));
    } else {
      // First ensure it is initialized
      initialize()
        .then(() => {
          return showFloatingBubble(10, 10);
        })
        .then(() => {
          setIsBubbleActive(true);
          updateTasbeehCount(count); // initial sync
          Alert.alert('تم التفعيل', 'المسبحة العائمة تعمل الآن. انقر عليها للتسبيح أينما كنت!');
        })
        .catch((err: any) => {
          console.error('Failed to show floating bubble', err);
          Alert.alert('خطأ', 'حدث خطأ أثناء تفعيل المسبحة العائمة. تأكد من إعطاء الصلاحيات اللازمة.');
        });
    }
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: isBubbleActive ? '#7f1d1d' : accentColor }]}
        onPress={handleToggle}
      >
        <Text style={styles.actionText}>{isBubbleActive ? 'إيقاف' : 'تفعيل'}</Text>
      </TouchableOpacity>

      <View style={styles.textCol}>
        <Text style={styles.title}>المسبحة العائمة</Text>
        <Text style={styles.subtitle}>تعمل فوق التطبيقات للتسبيح السريع</Text>
        <View style={styles.statusRow}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        </View>
      </View>

      <View style={[styles.iconWrap, { backgroundColor: accentColor + '20' }]}>
        <FontAwesome5 name="layer-group" color={accentColor} size={20} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#1a140f',
    borderWidth: 1,
    borderColor: '#2b1f15',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1 },
  title: { fontFamily: 'Tajawal_700Bold', fontSize: 16, color: '#fff', textAlign: 'right' },
  subtitle: { fontFamily: 'Tajawal_400Regular', fontSize: 12.5, color: '#94a3b8', marginTop: 2, textAlign: 'right' },
  statusRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginTop: 6, justifyContent: 'flex-start' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontFamily: 'Tajawal_500Medium', fontSize: 12 },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  actionText: { fontFamily: 'Tajawal_700Bold', fontSize: 13.5, color: '#fff' },
});

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform, NativeModules, StyleSheet, DeviceEventEmitter, AppState } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { incrementCount, resetCount, setFloatingActive } from '../../store/slices/tasbeehSlice';
import { logDhikr } from '../../store/slices/statsSlice';
import { store } from '../../store';
import { THEME } from '../../../shared/theme/constants';

// ── Native Module Safety Helpers ──
const safeInitialize = () => {
    try {
        const { RNFloatingBubble } = NativeModules;
        if (RNFloatingBubble?.initialize) return RNFloatingBubble.initialize();
    } catch (e) { console.warn('⚠️ initialize failed:', e); }
    return Promise.resolve();
};

const safeUpdateTasbeehCount = (count: number) => {
    try {
        const { RNFloatingBubble } = NativeModules;
        if (RNFloatingBubble?.updateTasbeehCount) RNFloatingBubble.updateTasbeehCount(count);
    } catch (e) { console.warn('⚠️ updateTasbeehCount failed:', e); }
};

const safeUpdateTasbeehLabel = (label: string) => {
    try {
        const { RNFloatingBubble } = NativeModules;
        if (RNFloatingBubble?.updateTasbeehLabel) RNFloatingBubble.updateTasbeehLabel(label || 'سبحان الله');
    } catch (e) { console.warn('⚠️ updateTasbeehLabel failed:', e); }
};

const safeConfig = (config: any) => {
    try {
        const { RNFloatingBubble } = NativeModules;
        if (RNFloatingBubble?.config) RNFloatingBubble.config(config);
    } catch (e) { console.warn('⚠️ config failed:', e); }
};

const safeShowDhikrReminder = (label: string) => {
    try {
        const { RNFloatingBubble } = NativeModules;
        if (RNFloatingBubble?.showDhikrReminder) RNFloatingBubble.showDhikrReminder(label || 'سبحان الله');
    } catch (e) { console.warn('⚠️ showDhikrReminder failed:', e); }
};

const safeCheckPermission = () => {
    try {
        const { RNFloatingBubble } = NativeModules;
        if (RNFloatingBubble?.checkPermission) return RNFloatingBubble.checkPermission();
    } catch (e) { console.warn('⚠️ checkPermission failed:', e); }
    return Promise.resolve(false);
};

const safeRequestPermission = () => {
    try {
        const { RNFloatingBubble } = NativeModules;
        if (RNFloatingBubble?.requestPermission) return RNFloatingBubble.requestPermission();
    } catch (e) { console.warn('⚠️ requestPermission failed:', e); }
    return Promise.reject('Module not available');
};

const safeShowFloatingBubble = (x: number, y: number) => {
    try {
        const { RNFloatingBubble } = NativeModules;
        if (RNFloatingBubble?.showFloatingBubble) return RNFloatingBubble.showFloatingBubble(x, y);
    } catch (e) { console.warn('⚠️ showFloatingBubble failed:', e); }
    return Promise.reject('Module not available');
};

const safeHideFloatingBubble = () => {
    try {
        const { RNFloatingBubble } = NativeModules;
        if (RNFloatingBubble?.hideFloatingBubble) return RNFloatingBubble.hideFloatingBubble();
    } catch (e) { console.warn('⚠️ hideFloatingBubble failed:', e); }
    return Promise.resolve();
};

/**
 * ── GLOBAL CONTROLLER ──
 * This component handles the background synchronization between Redux and the Native Floating Bubble.
 * It should be rendered at the root of the app (e.g. in App.tsx).
 */
export const FloatingTasbeehController = () => {
    const dispatch = useDispatch();
    const { 
        count, isFloatingActive, selectedDhikr, 
        floatingScale, floatingBubbleColor, floatingShowBorder, 
        floatingShowReset, floatingReminderInterval 
    } = useSelector((state: RootState) => state.tasbeeh);

    const hasFloatingBubbleModule = Platform.OS === 'android' && !!NativeModules?.RNFloatingBubble;
    console.log('🟢 FloatingTasbeehController mounted. Platform:', Platform.OS, 'NativeModules.RNFloatingBubble:', !!NativeModules?.RNFloatingBubble, 'hasModule:', hasFloatingBubbleModule, 'isFloatingActive:', isFloatingActive);
    const selectedDhikrRef = useRef(selectedDhikr);
    const countRef = useRef(count);
    const lastShownDhikr = useRef<string | null>(null);
    const [isNativeSynced, setIsNativeSynced] = useState(false);

    useEffect(() => { selectedDhikrRef.current = selectedDhikr; }, [selectedDhikr]);
    useEffect(() => { countRef.current = count; }, [count]);

    const syncCountFromNative = async () => {
        try {
            const { RNFloatingBubble } = NativeModules;
            if (RNFloatingBubble?.getSavedTasbeehCount) {
                const nativeCount = await RNFloatingBubble.getSavedTasbeehCount();
                const currentCount = countRef.current;
                
                if (nativeCount > currentCount) {
                    dispatch(incrementCount(nativeCount - currentCount));
                    dispatch(logDhikr({ name: selectedDhikrRef.current || 'سبحان الله', count: nativeCount - currentCount }));
                } else if (currentCount > nativeCount && nativeCount === 0) {
                    dispatch(resetCount());
                } else if (currentCount > nativeCount) {
                    safeUpdateTasbeehCount(currentCount);
                }
            }
        } catch (e) {
            safeUpdateTasbeehCount(countRef.current);
        }
    };

    // 0. Auto-restart bubble if it should be active
    useEffect(() => {
        console.log('🟢 FloatingTasbeehController mount effect. isFloatingActive:', isFloatingActive, 'hasModule:', hasFloatingBubbleModule);
        if (isFloatingActive && hasFloatingBubbleModule) {
            safeCheckPermission().then(async (permitted: boolean) => {
                console.log('🟢 Permission check result:', permitted);
                if (permitted) {
                    // Also check notification permission for Android 13+
                    const { NotificationService } = require('../../../data/services/NotificationService');
                    await NotificationService.requestPermissions();
                    
                    safeInitialize().then(async () => {
                        console.log('🟢 Initialized. Checking if bubble is already visible...');
                        const { RNFloatingBubble } = NativeModules;
                        let alreadyVisible = false;
                        if (RNFloatingBubble?.isBubbleVisible) {
                            const status = await RNFloatingBubble.isBubbleVisible();
                            alreadyVisible = !!status?.bubbleViewExists;
                        }
                        
                        if (!alreadyVisible) {
                            console.log('🟢 Bubble not visible, calling showFloatingBubble(-1, -1)');
                            // Sync config before showing to ensure it starts with correct values
                            safeConfig({
                                scale: typeof floatingScale === 'number' ? floatingScale : 1.0,
                                accentColor: floatingBubbleColor || '#B8860B',
                                showBorder: !!floatingShowBorder,
                                showReset: !!floatingShowReset,
                                reminderInterval: floatingReminderInterval || 10
                            });
                            await safeShowFloatingBubble(-1, -1);
                        } else {
                            console.log('🟢 Bubble already visible, skipping show call');
                        }
                        
                        await syncCountFromNative();
                        setIsNativeSynced(true);
                        console.log('🟢 Bubble transition complete');
                    });
                } else {
                    console.log('🟡 Permission denied, deactivating');
                    dispatch(setFloatingActive(false));
                    setIsNativeSynced(true);
                }
            });
        } else {
            console.log('🟡 Skipping bubble restore. isFloatingActive:', isFloatingActive, 'hasModule:', hasFloatingBubbleModule);
            setIsNativeSynced(true);
        }
    }, []); // Only on mount

    // Sync when returning to app from background — show bubble instantly if missing
    useEffect(() => {
        const subscription = AppState.addEventListener('change', async (nextAppState) => {
            if (nextAppState === 'active' && isFloatingActive && hasFloatingBubbleModule && isNativeSynced) {
                try {
                    const { RNFloatingBubble } = NativeModules;
                    let bubbleExists = false;

                    // Quick native check — is the bubble still attached to the window?
                    if (RNFloatingBubble?.isBubbleVisible) {
                        const status = await RNFloatingBubble.isBubbleVisible();
                        bubbleExists = !!status?.bubbleViewExists;
                    }

                    if (!bubbleExists) {
                        // Service was killed by system — restore immediately (no UI delay)
                        await safeShowFloatingBubble(-1, -1);
                    }
                } catch (_) {}

                // Always sync count after returning (fire-and-forget)
                syncCountFromNative();
            }
        });
        return () => subscription.remove();
    }, [isFloatingActive, hasFloatingBubbleModule, isNativeSynced]);

    // 1. Sync configuration changes — only call safeConfig when bubble is ACTIVE
    // This prevents startForegroundService from being called in background (crashes on Android 12+)
    useEffect(() => {
        if (hasFloatingBubbleModule && isFloatingActive) {
            safeConfig({
                scale: typeof floatingScale === 'number' ? floatingScale : 1.0,
                accentColor: floatingBubbleColor || '#B8860B',
                showBorder: !!floatingShowBorder,
                showReset: !!floatingShowReset,
                reminderInterval: floatingReminderInterval || 10
            });
        }
    }, [floatingScale, floatingBubbleColor, floatingShowBorder, floatingShowReset, floatingReminderInterval, hasFloatingBubbleModule, isFloatingActive]);

    // 2. Sync count changes
    useEffect(() => {
        if (isNativeSynced && isFloatingActive && hasFloatingBubbleModule) {
            safeUpdateTasbeehCount(count);
        }
    }, [count, isFloatingActive, hasFloatingBubbleModule, isNativeSynced]);

    // 3. Sync label changes & reminders
    useEffect(() => {
        if (isFloatingActive && hasFloatingBubbleModule) {
            const label = selectedDhikr || 'سبحان الله';
            safeUpdateTasbeehLabel(label);
            if (lastShownDhikr.current !== label) {
                safeShowDhikrReminder(label);
                lastShownDhikr.current = label;
            }
        }
    }, [selectedDhikr, isFloatingActive, hasFloatingBubbleModule]);

    // 4. Native Event Listeners (ensure they are only active once)
    useEffect(() => {
        if (!hasFloatingBubbleModule) return;

        const pressSub = DeviceEventEmitter.addListener('floating-bubble-press', () => {
            dispatch(incrementCount(1));
            dispatch(logDhikr({ name: selectedDhikrRef.current || 'سبحان الله', count: 1 }));
        });

        const resetSub = DeviceEventEmitter.addListener('floating-bubble-reset', () => {
            dispatch(resetCount());
        });

        return () => {
            pressSub.remove();
            resetSub.remove();
        };
    }, [dispatch, hasFloatingBubbleModule]);

    return null; // Logic only
};

/**
 * ── TOGGLE UI COMPONENT ──
 * This is the UI button shown in Settings to turn the bubble on/off.
 */
export const FloatingTasbeehToggle = ({ accentTheme }: any) => {
    const dispatch = useDispatch();
    const { count, isFloatingActive } = useSelector((state: RootState) => state.tasbeeh);
    const [isPermitted, setIsPermitted] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const hasFloatingBubbleModule = Platform.OS === 'android' && !!NativeModules?.RNFloatingBubble;

    const accentColor = (THEME.colors as any)[accentTheme] || THEME.colors.primary;

    useEffect(() => {
        if (hasFloatingBubbleModule) {
            safeCheckPermission().then((val: any) => {
                setIsPermitted(!!val);
                if (val) safeInitialize();
            });
        }
    }, [hasFloatingBubbleModule]);

    const handleToggle = async () => {
        console.log('🔵 Toggle pressed. isToggling:', isToggling, 'hasModule:', hasFloatingBubbleModule, 'isPermitted:', isPermitted, 'isFloatingActive:', isFloatingActive);
        if (isToggling || !hasFloatingBubbleModule) {
            console.log('🔴 Toggle blocked. isToggling:', isToggling, 'hasModule:', hasFloatingBubbleModule);
            if (!hasFloatingBubbleModule) {
                Alert.alert('خطأ', 'الموديول الأصلي للمسبحة العائمة غير متاح. تأكد من تثبيت التطبيق بالكامل.');
            }
            return;
        }
        setIsToggling(true);

        try {
            // Check permission first
            let currentlyPermitted = await safeCheckPermission();
            console.log('🔵 Current permission status:', currentlyPermitted);
            
            if (!currentlyPermitted) {
                console.log('🔵 Opening overlay permission settings...');
                // Open settings and wait for user to come back
                await safeRequestPermission();
                
                // Wait for user to return from settings
                const waitForReturn = () => new Promise<void>((resolve) => {
                    const sub = AppState.addEventListener('change', (nextState) => {
                        if (nextState === 'active') {
                            sub.remove();
                            // Small delay to let system update permission state
                            setTimeout(resolve, 500);
                        }
                    });
                    // Timeout after 30 seconds
                    setTimeout(() => { sub.remove(); resolve(); }, 30000);
                });
                await waitForReturn();
                
                currentlyPermitted = await safeCheckPermission();
                console.log('🔵 Permission after returning from settings:', currentlyPermitted);
                setIsPermitted(!!currentlyPermitted);
                
                if (!currentlyPermitted) {
                    Alert.alert('صلاحية مطلوبة', 'يجب تفعيل "السماح بالعرض فوق التطبيقات الأخرى" من الإعدادات.');
                    setIsToggling(false);
                    return;
                }
            }

            // Check Notification Permission (Android 13+)
            if (Platform.OS === 'android' && Platform.Version >= 33) {
                const { NotificationService } = require('../../../data/services/NotificationService');
                const hasNotifyPerm = await NotificationService.requestPermissions();
                if (!hasNotifyPerm) {
                    Alert.alert('تنبيه الإشعارات', 'يُفضل تفعيل الإشعارات لضمان استقرار المسبحة العائمة في الخلفية.');
                }
            }

            if (isFloatingActive) {
                console.log('🔵 Hiding bubble...');
                await safeHideFloatingBubble();
                dispatch(setFloatingActive(false));
            } else {
                console.log('🔵 Showing bubble...');
                try {
                    await safeInitialize();
                    console.log('🔵 Initialize done, calling showFloatingBubble...');
                    // Sync config before showing
                    const { 
                        floatingScale, floatingBubbleColor, floatingShowBorder, 
                        floatingShowReset, floatingReminderInterval 
                    } = store.getState().tasbeeh;
                    
                    safeConfig({
                        scale: typeof floatingScale === 'number' ? floatingScale : 1.0,
                        accentColor: floatingBubbleColor || '#B8860B',
                        showBorder: !!floatingShowBorder,
                        showReset: !!floatingShowReset,
                        reminderInterval: floatingReminderInterval || 10
                    });

                    await safeShowFloatingBubble(-1, -1);
                    console.log('🔵 showFloatingBubble done, updating count...');
                    safeUpdateTasbeehCount(count);
                    dispatch(setFloatingActive(true));
                    // Verify the bubble actually appeared
                    setTimeout(async () => {
                        try {
                            const { RNFloatingBubble } = NativeModules;
                            if (RNFloatingBubble?.isBubbleVisible) {
                                const s = await RNFloatingBubble.isBubbleVisible();
                                console.log('🔵 Bubble diagnostic:', JSON.stringify(s));
                                if (s && !s.bubbleViewExists) {
                                    Alert.alert('تشخيص المسبحة',
                                        `الخدمة: ${s.serviceRunning ? '✅' : '❌'}\n` +
                                        `صلاحية العرض: ${s.overlayPermission ? '✅' : '❌'}\n` +
                                        `الفقاعة: ${s.bubbleViewExists ? '✅' : '❌'}\n` +
                                        `الحدث: ${s.lastEvent || 'N/A'}\n` +
                                        `الخطأ: ${s.lastError || 'None'}\n\n` +
                                        'تأكد من:\n1. صلاحية العرض فوق التطبيقات\n2. إيقاف توفير البطارية\n3. السماح بالنوافذ المنبثقة');
                                } else {
                                    Alert.alert('تم التفعيل', 'المسبحة العائمة تعمل الآن.');
                                }
                            } else {
                                Alert.alert('تم التفعيل', 'المسبحة العائمة تعمل الآن.');
                            }
                        } catch (e) {
                            Alert.alert('تم التفعيل', 'المسبحة العائمة تعمل الآن.');
                        }
                    }, 1500);
                } catch (showErr: any) {
                    console.error('🔴 showFloatingBubble error:', showErr);
                    Alert.alert('خطأ في التفعيل', 'فشل إظهار المسبحة العائمة: ' + (showErr?.message || String(showErr)) + '\n\nتأكد من:\n1. تفعيل "العرض فوق التطبيقات"\n2. عدم تفعيل توفير البطارية للتطبيق');
                }
            }
        } catch (err: any) {
            console.error('🔴 Toggle error:', err);
            Alert.alert('خطأ', 'حدث خطأ: ' + (err?.message || String(err)));
        } finally {
            setIsToggling(false);
        }
    };

    const statusLabel = !isPermitted ? 'تحتاج صلاحية' : isFloatingActive ? 'مفعلة الآن' : 'جاهزة للتفعيل';
    const statusColor = !isPermitted ? '#ef4444' : isFloatingActive ? '#22c55e' : '#f59e0b';

    return (
        <View style={styles.card}>
            <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: isFloatingActive ? '#7f1d1d' : accentColor, opacity: isToggling ? 0.6 : 1 }]}
                onPress={handleToggle}
                disabled={isToggling}
            >
                <Text style={styles.actionText}>{isFloatingActive ? 'إيقاف' : 'تفعيل'}</Text>
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
    card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18, backgroundColor: '#1a140f', borderWidth: 1, borderColor: '#2b1f15' },
    iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    textCol: { flex: 1 },
    title: { fontFamily: 'Tajawal_700Bold', fontSize: 16, color: '#fff', textAlign: 'right' },
    subtitle: { fontFamily: 'Tajawal_400Regular', fontSize: 12.5, color: '#94a3b8', marginTop: 2, textAlign: 'right' },
    statusRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginTop: 6, justifyContent: 'flex-start' },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { fontFamily: 'Tajawal_500Medium', fontSize: 12 },
    actionBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, minWidth: 80, alignItems: 'center' },
    actionText: { fontFamily: 'Tajawal_700Bold', fontSize: 13.5, color: '#fff' },
});

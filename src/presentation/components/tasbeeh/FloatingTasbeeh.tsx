import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Layers } from 'lucide-react-native';
import { colors, radius, space, type, themed } from '../../../shared/theme/tokens';
import { useFloatingSebhaSync, useFloatingSebhaToggle } from '../../hooks/useFloatingSebha';
import { useAccent } from '../../../shared/theme/useAccent';

/**
 * ── GLOBAL CONTROLLER ──
 * Keeps the native floating sebha in step with the store. Rendered once at the app root;
 * all logic lives in useFloatingSebhaSync.
 */
export const FloatingTasbeehController = () => {
    useFloatingSebhaSync();
    return null;
};

/**
 * ── TOGGLE UI COMPONENT ──
 * The on/off card shown in Settings. Rendering only; behaviour is in useFloatingSebhaToggle.
 */
export const FloatingTasbeehToggle = () => {
    const { isActive: isFloatingActive, isPermitted, isToggling, toggle: handleToggle } = useFloatingSebhaToggle();
    const accentColor = useAccent().accent;

    const statusLabel = !isPermitted ? 'تحتاج صلاحية' : isFloatingActive ? 'مفعلة الآن' : 'جاهزة للتفعيل';
    const statusColor = !isPermitted ? colors.dangerText : isFloatingActive ? colors.success : colors.goldText;

    return (
        <View style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: accentColor + '20' }]}>
                <Layers color={accentColor} size={20} strokeWidth={1.75} />
            </View>

            <View style={styles.textCol}>
                <Text style={styles.title}>المسبحة العائمة</Text>
                <Text style={styles.subtitle}>تعمل فوق التطبيقات للتسبيح السريع</Text>
                <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: isFloatingActive ? colors.dangerSoft : accentColor, opacity: isToggling ? 0.6 : 1 }]}
                onPress={handleToggle}
                disabled={isToggling}
            >
                <Text style={[styles.actionText, isFloatingActive && { color: colors.dangerText }]}>{isFloatingActive ? 'إيقاف' : 'تفعيل'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = themed(() => ({
    card: { flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[4], borderRadius: radius.card, backgroundColor: colors.surface },
    iconWrap: { width: 44, height: 44, borderRadius: radius.tile, alignItems: 'center', justifyContent: 'center' },
    textCol: { flex: 1 },
    title: { ...type.bodyMedium, fontFamily: 'Tajawal_700Bold', color: colors.text },
    subtitle: { ...type.caption, color: colors.textMuted, marginTop: 2 },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, justifyContent: 'flex-start' },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { ...type.caption },
    actionBtn: { paddingHorizontal: space[4], height: 40, borderRadius: radius.pill, minWidth: 80, alignItems: 'center', justifyContent: 'center' },
    actionText: { ...type.label, color: colors.onGold },
}));

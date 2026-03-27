import React from 'react';
import { View, Text, Switch, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { s } from './SettingsStyles';
import { TAFSIR_LIST, STYLES_LIST, THEME_LIST } from './SettingsConstants';
import { RECITER_MAP } from '../../../data/services/AudioService';

export const SettingSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <View style={s.section}>
    <Text style={s.sectionTitle}>{title}</Text>
    <View style={s.sectionContent}>{children}</View>
  </View>
);

export const ItemRow = ({ icon: iconName, label, value, onValueChange, isToggle = false, accentColor }: any) => (
  <View style={s.itemRow}>
    <View style={s.itemLeft}>
      <View style={[s.iconBox, { backgroundColor: accentColor + '15' }]}><FontAwesome5 name={iconName} size={18} color={accentColor} /></View>
      <Text style={s.itemLabel}>{label}</Text>
    </View>
    {isToggle ? (
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: '#334155', true: accentColor }} />
    ) : (
      <View>{value}</View>
    )}
  </View>
);

export const ThemeSelector = ({ accentTheme, onSelect, accentColor }: any) => (
  <View style={s.subSection}>
    <View style={s.labelRow}><FontAwesome5 name="palette" size={16} color={accentColor} /><Text style={s.subLabel}>لون السمة (Accent Color)</Text></View>
    <View style={s.themeGrid}>
      {THEME_LIST.map((t) => (
        <TouchableOpacity 
          key={t.id} 
          style={[s.themeBtn, accentTheme === t.id && { borderColor: t.color, backgroundColor: 'rgba(255,255,255,0.05)' }]}
          onPress={() => onSelect(t.id)}
        >
          <View style={[s.colorCircle, { backgroundColor: t.color }]} />
          <Text style={[s.themeBtnText, accentTheme === t.id && { color: '#fff' }]}>{t.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export const ReciterSelector = ({ selectedReciterId, onSelect, accentColor }: any) => (
  <View style={s.subSection}>
    <View style={s.labelRow}><FontAwesome5 name="user-circle" size={16} color={accentColor} /><Text style={s.subLabel}>اختر القارئ المفضل</Text></View>
    <View style={s.reciterGrid}>
      {Object.entries(RECITER_MAP).map(([id, r]) => (
        <TouchableOpacity 
          key={id} 
          style={[s.reciterBtn, selectedReciterId === id && { borderColor: accentColor, backgroundColor: '#1e293b' }]}
          onPress={() => onSelect(id)}
        >
          <Text style={[s.reciterBtnText, selectedReciterId === id && { color: accentColor }]}>{r.name}</Text>
          {selectedReciterId === id && <FontAwesome5 name="check-circle" size={14} color={accentColor} />}
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export const TafsirSettings = ({ selectedTafsirId, onSelectTafsir, tafsirStyle, onSelectStyle, tafsirFontSize, setFontSize, accentColor }: any) => (
  <>
    <View style={s.subSection}>
      <View style={s.labelRow}><FontAwesome5 name="book" size={16} color={accentColor} /><Text style={s.subLabel}>اختر المفسر</Text></View>
      <View style={s.tafsirGrid}>
        {TAFSIR_LIST.map((t) => (
          <TouchableOpacity 
            key={t.id} 
            style={[s.chip, selectedTafsirId === t.id && { backgroundColor: accentColor, borderColor: accentColor }]}
            onPress={() => onSelectTafsir(t.id)}
          >
            <Text style={[s.chipText, selectedTafsirId === t.id && s.chipTextActive]}>{t.name}</Text>
            {selectedTafsirId === t.id && <FontAwesome5 name="check-circle" size={12} color="#FFF" style={{ marginLeft: 6 }} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>

    <View style={s.subSection}>
      <View style={s.labelRow}><FontAwesome5 name="layer-group" size={16} color={accentColor} /><Text style={s.subLabel}>نمط العرض</Text></View>
      <View style={s.styleRow}>
        {STYLES_LIST.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={[s.styleBtn, tafsirStyle === item.id && { backgroundColor: '#1e293b', borderColor: accentColor }]}
            onPress={() => onSelectStyle(item.id)}
          >
            <Text style={[s.styleText, tafsirStyle === item.id && { color: accentColor }]}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>

    <View style={s.subSection}>
      <View style={s.labelRow}><FontAwesome5 name="text-height" size={16} color={accentColor} /><Text style={s.subLabel}>حجم خط التفسير ({tafsirFontSize})</Text></View>
      <View style={s.fontControls}>
        <TouchableOpacity style={s.fontBtn} onPress={() => setFontSize(Math.max(12, tafsirFontSize - 2))}><Text style={s.fontBtnText}>A-</Text></TouchableOpacity>
        <View style={s.fontPreview}><Text style={[s.previewText, { fontSize: tafsirFontSize }]}>نص تجريبي للتفسير</Text></View>
        <TouchableOpacity style={s.fontBtn} onPress={() => setFontSize(Math.min(32, tafsirFontSize + 2))}><Text style={s.fontBtnText}>A+</Text></TouchableOpacity>
      </View>
    </View>
  </>
);

export const NotificationSettings = ({ notificationPrefs, onToggleCategory, onTestNotification, accentColor }: any) => {
  const categories = [
    { id: 'prayers', label: 'مواقيت الصلاة', icon: 'mosque' },
    { id: 'athkar', label: 'أذكار الصباح والمساء', icon: 'moon' },
    { id: 'qiyam', label: 'تنبيه قيام الليل', icon: 'star-and-crescent' },
    { id: 'duha', label: 'تنبيه صلاة الضحى', icon: 'sun' },
    { id: 'dailyWardEnabled', label: 'موعد الورد اليومي', icon: 'book-open' },
    { id: 'encouragementEnabled', label: 'رسائل تشجيعية (بصوت الصلاة على النبي)', icon: 'heartbeat' },
    { id: 'prePrayerReminderEnabled', label: 'تذكير ما قبل الصلاة (استعداد)', icon: 'pray' },
    { id: 'dailyReminder', label: 'تذكير يومي منوع', icon: 'kaaba' },
  ];

  return (
    <View style={s.subSection}>
      <View style={s.labelRow}><FontAwesome5 name="check-circle" size={16} color={accentColor} /><Text style={s.subLabel}>تخصيص التنبيهات</Text></View>
      <View style={{ marginTop: 10 }}>
        {categories.map((cat) => (
          <ItemRow 
            key={cat.id}
            icon={cat.icon}
            label={cat.label}
            value={notificationPrefs ? notificationPrefs[cat.id] : true}
            isToggle
            onValueChange={() => onToggleCategory(cat.id)}
            accentColor={accentColor}
          />
        ))}

        {notificationPrefs?.dailyWardEnabled && (
          <View style={{ marginTop: 5, paddingLeft: 40, marginBottom: 15 }}>
            <Text style={[s.subLabel, { fontSize: 13, marginBottom: 8 }]}>توقيت الورد اليومي:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {['01:00', '05:00', '10:00', '16:00', '21:00', '23:00'].map((time) => (
                <TouchableOpacity 
                  key={time}
                  style={[
                    s.chip, 
                    { paddingHorizontal: 15, paddingVertical: 6 },
                    notificationPrefs.dailyWardTime === time && { backgroundColor: accentColor, borderColor: accentColor }
                  ]}
                  onPress={() => onToggleCategory({ id: 'dailyWardTime', value: time })}
                >
                  <Text style={[
                     s.chipText, 
                     { fontSize: 13 },
                     notificationPrefs.dailyWardTime === time && { color: '#fff' }
                  ]}>{time}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {notificationPrefs?.encouragementEnabled && (
          <View style={{ marginTop: 5, paddingLeft: 40, marginBottom: 15 }}>
            <Text style={[s.subLabel, { fontSize: 13, marginBottom: 8 }]}>تكرار رسائل التشجيع (كل كم ساعة):</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {[1, 2, 3, 4, 6, 8].map((hours) => (
                <TouchableOpacity 
                  key={hours}
                  style={[
                    s.chip, 
                    { paddingHorizontal: 15, paddingVertical: 6 },
                    notificationPrefs.encouragementInterval === hours && { backgroundColor: accentColor, borderColor: accentColor }
                  ]}
                  onPress={() => onToggleCategory({ id: 'encouragementInterval', value: hours })}
                >
                  <Text style={[
                     s.chipText, 
                     { fontSize: 13 },
                     notificationPrefs.encouragementInterval === hours && { color: '#fff' }
                  ]}>{hours} {hours === 1 ? 'ساعة' : (hours === 2 ? 'ساعتين' : 'ساعات')}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}


      </View>
    </View>
  );
};

// Removed CalculationMethodSelector
export const AzanSelector = ({ azanSettings, onUpdate, accentColor }: any) => {
  const { AZAN_TYPES } = require('./AzanConstants');
  const { NativeModules, Platform } = require('react-native');
  const [hasOverlayPermission, setHasOverlayPermission] = React.useState(true);

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      const module = NativeModules.AzanModule;
      if (module && module.checkOverlayPermission) {
        module.checkOverlayPermission().then(setHasOverlayPermission);
      } else {
        console.warn('AzanModule or checkOverlayPermission is not available. A native rebuild may be required.');
        setHasOverlayPermission(false);
      }
    }
  }, []);

  const requestPermission = () => {
    const module = NativeModules.AzanModule;
    if (module && module.requestOverlayPermission) {
      module.requestOverlayPermission();
      setTimeout(() => {
        if (module.checkOverlayPermission) {
          module.checkOverlayPermission().then(setHasOverlayPermission);
        }
      }, 5000);
    } else {
      Alert.alert("خطأ", "موديول صلاحيات الأذان غير متوفر حالياً. يرجى إعادة بناء التطبيق (Rebuild).");
    }
  };

  const startTest = () => {
    const module = NativeModules.AzanModule;
    if (module && module.testAzan) {
      module.testAzan(30);
      Alert.alert(
        "بدء التجربة",
        "سيتم تشغيل الأذان كاملاً مع الفيديو بعد 30 ثانية من الآن. يرجى إغلاق الشاشة أو الخروج من التطبيق لتجربة التنبيه.",
        [{ text: "حسنًا" }]
      );
    } else {
      Alert.alert("خطأ", "موديول تجربة الأذان غير متوفر حالياً. يرجى إعادة بناء التطبيق (Rebuild).");
    }
  };

  return (
    <View style={s.subSection}>
      <View style={s.labelRow}><FontAwesome5 name="bell" size={16} color={accentColor} /><Text style={s.subLabel}>تنبيه الآذان</Text></View>
      
      {/* Azan Type Selection */}
      <View style={s.styleRow}>
        {AZAN_TYPES.map((t: any) => (
          <TouchableOpacity 
            key={t.id} 
            style={[s.styleBtn, azanSettings.type === t.id && { backgroundColor: '#1e293b', borderColor: accentColor }]}
            onPress={() => onUpdate({ type: t.id })}
          >
            <Text style={[s.styleText, azanSettings.type === t.id && { color: accentColor }]}>{t.name}</Text>
          </TouchableOpacity>
        ))}
      </View>


    </View>
  );
};

export const FloatingTasbeehSettings = ({ 
  floatingScale, onUpdateScale, 
  floatingBubbleColor, onUpdateColor, 
  floatingShowBorder, onToggleBorder,
  floatingShowReset, onToggleReset,
  floatingReminderInterval, onUpdateInterval,
  accentColor 
}: any) => {
  const safeScale = typeof floatingScale === 'number' ? floatingScale : 1.0;
  
  const increment = () => onUpdateScale(Math.min(2.0, Number((safeScale + 0.1).toFixed(1))));
  const decrement = () => onUpdateScale(Math.max(0.5, Number((safeScale - 0.1).toFixed(1))));

  const COLORS = [
    { id: '#FFFFFF', name: 'أبيض' },
    { id: '#000000', name: 'أسود' },
    { id: '#FF9800', name: 'برتقالي' },
    { id: '#B8860B', name: 'ذهبي الشعار' },
    { id: '#8B0000', name: 'أحمر داكن' },
    { id: '#065f46', name: 'أخضر زمردي' },
    { id: '#1e1b4b', name: 'أزرق ليلي' }
  ];

  return (
    <View style={s.subSection}>
      <View style={s.labelRow}>
        <FontAwesome5 name="expand-arrows-alt" size={16} color={accentColor} />
        <Text style={s.subLabel}>تحكم في حجم السبحة ({Math.round(safeScale * 100)}%)</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 10 }}>
        <TouchableOpacity 
          style={[s.fontBtn, { backgroundColor: '#15110d', borderColor: accentColor, width: 45, height: 45 }]} 
          onPress={decrement}
        >
          <FontAwesome5 name="minus" size={14} color={accentColor} />
        </TouchableOpacity>
        
        <View style={{ flex: 1, height: 45, backgroundColor: '#0f172a', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1e293b' }}>
          <Text style={{ color: '#fff', fontFamily: 'Tajawal_700Bold', fontSize: 16 }}>
            {safeScale.toFixed(1)}x
          </Text>
        </View>

        <TouchableOpacity 
          style={[s.fontBtn, { backgroundColor: '#15110d', borderColor: accentColor, width: 45, height: 45 }]} 
          onPress={increment}
        >
          <FontAwesome5 name="plus" size={14} color={accentColor} />
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 15 }}>
        <ItemRow 
          icon="border-style" 
          label="إظهار إطار للسبحة" 
          value={floatingShowBorder} 
          isToggle 
          onValueChange={onToggleBorder} 
          accentColor={accentColor} 
        />
        <ItemRow 
          icon="undo" 
          label="إظهار زر التصفير" 
          value={floatingShowReset} 
          isToggle 
          onValueChange={onToggleReset} 
          accentColor={accentColor} 
        />
      </View>

      <View style={{ marginTop: 20 }}>
        <View style={s.labelRow}>
          <FontAwesome5 name="hourglass-half" size={14} color={accentColor} />
          <Text style={s.subLabel}>تذكير تلقائي بالذكر (كل {floatingReminderInterval} دقيقة)</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 10 }}>
          <TouchableOpacity 
            style={[s.fontBtn, { backgroundColor: '#15110d', borderColor: accentColor, width: 45, height: 45 }]} 
            onPress={() => onUpdateInterval(Math.max(1, floatingReminderInterval - 1))}
          >
            <FontAwesome5 name="minus" size={14} color={accentColor} />
          </TouchableOpacity>
          
          <View style={{ flex: 1, height: 45, backgroundColor: '#0f172a', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1e293b' }}>
            <Text style={{ color: '#fff', fontFamily: 'Tajawal_700Bold', fontSize: 16 }}>
              {floatingReminderInterval} دقيقة
            </Text>
          </View>

          <TouchableOpacity 
            style={[s.fontBtn, { backgroundColor: '#15110d', borderColor: accentColor, width: 45, height: 45 }]} 
            onPress={() => onUpdateInterval(Math.min(60, floatingReminderInterval + 1))}
          >
            <FontAwesome5 name="plus" size={14} color={accentColor} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[s.labelRow, { marginTop: 20 }]}>
        <FontAwesome5 name="palette" size={16} color={accentColor} />
        <Text style={s.subLabel}>لون السبحة العائمة</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
        {COLORS.map((c) => (
          <TouchableOpacity 
            key={c.id} 
            onPress={() => onUpdateColor(c.id)}
            style={[
              { width: 34, height: 34, borderRadius: 17, backgroundColor: c.id, borderWidth: 2, borderColor: floatingBubbleColor === c.id ? accentColor : 'transparent' },
              (c.id === '#FFFFFF' || c.id === '#000000') && { borderWidth: 1, borderColor: '#475569' }
            ]}
          />
        ))}
      </View>

      <Text style={{ color: '#64748b', fontSize: 13, fontFamily: 'Tajawal_500Medium', marginTop: 12 }}>
        * الحجم الافتراضي هو 1.0x. يمكنك التصغير حتى 0.5x أو التكبير حتى 2.0x.
      </Text>
    </View>
  );
};

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
      <View style={s.iconWrapper}><FontAwesome5 name={iconName} size={18} color={accentColor} /></View>
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
    { id: 'prayers', label: 'مواقيت الصلاة', icon: 'clock' },
    { id: 'athkar', label: 'أذكار الصباح والمساء', icon: 'book-reader' },
    { id: 'qiyam', label: 'تنبيه قيام الليل', icon: 'star-and-crescent' },
    { id: 'duha', label: 'تنبيه صلاة الضحى', icon: 'sun' },
    { id: 'dailyWardEnabled', label: 'موعد الورد اليومي', icon: 'book' },
    { id: 'prePrayerReminderEnabled', label: 'تذكير ما قبل الصلاة (استعداد)', icon: 'bell' },
    { id: 'dailyReminder', label: 'تذكير يومي منوع', icon: 'heart' },
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
            <Text style={[s.subLabel, { fontSize: 13, marginBottom: 8, textAlign: 'right' }]}>توقيت الورد اليومي:</Text>
            <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10 }}>
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


      </View>
    </View>
  );
};

export const CalculationMethodSelector = ({ selectedMethod, onSelect, accentColor }: any) => {
  const methods = [
    { id: 5, label: 'الهيئة المصرية العامة للمساحة' },
    { id: 4, label: 'جامعة العلوم الإسلامية بكراتشي' },
    { id: 2, label: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)' },
    { id: 3, label: 'رابطة العالم الإسلامي' },
    { id: 1, label: 'جامعة أم القرى، مكة المكرمة' },
    { id: 8, label: 'معهد الجيوفيزياء بـ طهران' },
    { id: 12, label: 'فرنسا - زاوية (١٢ درجة)' },
  ];

  return (
    <View style={s.subSection}>
      <View style={s.labelRow}><FontAwesome5 name="landmark" size={16} color={accentColor} /><Text style={s.subLabel}>طريقة حساب المواقيت</Text></View>
      <View style={s.settingsGrid}>
        {methods.map((m) => (
          <TouchableOpacity 
            key={m.id} 
            onPress={() => onSelect(m.id)}
            style={[s.methodItem, selectedMethod === m.id && { borderColor: accentColor, backgroundColor: accentColor + '15' }]}
          >
            <Text style={[s.methodLabel, selectedMethod === m.id && { color: accentColor, fontFamily: 'Tajawal_700Bold' }]}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
export const AzanSelector = ({ azanSettings, onUpdate, accentColor }: any) => {
  const { AZAN_TYPES } = require('./AzanConstants');

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

      {azanSettings.type !== 'none' && (
        <View style={{ marginTop: 15 }}>
          <ItemRow 
            icon="video" 
            label="العرض المرئي للآذان (فيديو)" 
            value={azanSettings.visualAzanEnabled} 
            isToggle 
            onValueChange={(val: boolean) => onUpdate({ visualAzanEnabled: val })} 
            accentColor={accentColor} 
          />
        </View>
      )}
    </View>
  );
};

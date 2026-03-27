import React from 'react';
import { Text, TouchableOpacity, ScrollView, View, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  toggleNotifications, toggleLocation, setTafsirId, 
  setTafsirStyle, setTafsirFontSize, setAccentTheme, setReciterId,
  toggleNotificationCategory, setAzanSettings,
  setPrePrayerReminderOffset, setDailyWardTime, setEncouragementInterval
} from '../store/slices/settingsSlice';
import { setFloatingScale, setFloatingBubbleColor, toggleFloatingBorder, toggleFloatingReset, setFloatingReminderInterval } from '../store/slices/tasbeehSlice';
import { showAzanModal } from '../store/slices/uiSlice';
import { AudioService } from '../../data/services/AudioService';
import { THEME } from '../../shared/theme/constants';
import { FontAwesome5 } from '@expo/vector-icons';
import { NotificationService } from '../../data/services/NotificationService';

// Settings Components & Styles
import { 
  SettingSection, ItemRow, ThemeSelector, 
  ReciterSelector, TafsirSettings, NotificationSettings,
  AzanSelector, FloatingTasbeehSettings
} from '../components/settings/SettingsComponents';
import { s } from '../components/settings/SettingsStyles';
import { FloatingTasbeehToggle } from '../components/tasbeeh/FloatingTasbeeh';

const SettingsScreen = () => {
  const dispatch = useDispatch();
  const { 
    notificationsEnabled, locationEnabled, selectedTafsirId, 
    tafsirStyle, tafsirFontSize, accentTheme, selectedReciterId,
    notificationPrefs, azanSettings: rawAzanSettings
  } = useSelector((state: RootState) => state.settings);
  const { floatingScale, floatingBubbleColor, floatingShowBorder, floatingShowReset, floatingReminderInterval } = useSelector((state: RootState) => state.tasbeeh);

  const azanSettings = rawAzanSettings || { type: 'full', visualAzanEnabled: true };

  const colors = THEME.colors as any;
  const accentColor = colors[accentTheme] || colors.primary;

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      
      <View style={s.headerContainer}>
        <Text style={s.headerTitle}>الإعدادات</Text>
        <Text style={s.headerSub}>تخصيص تجربة أوّاب</Text>
      </View>
      
      <SettingSection title="العامة">
        <ItemRow icon="bell" label="التنبيهات العامة" value={notificationsEnabled} isToggle onValueChange={() => dispatch(toggleNotifications())} accentColor={accentColor} />
        {notificationsEnabled && (
          <NotificationSettings 
            notificationPrefs={notificationPrefs} 
            onToggleCategory={(id: any) => {
              if (typeof id === 'object' && id.id === 'prePrayerReminderOffset') {
                dispatch(setPrePrayerReminderOffset(id.value));
              } else if (typeof id === 'object' && id.id === 'dailyWardTime') {
                dispatch(setDailyWardTime(id.value));
              } else if (typeof id === 'object' && id.id === 'encouragementInterval') {
                dispatch(setEncouragementInterval(id.value));
              } else {
                dispatch(toggleNotificationCategory(id));
              }
            }} 
            onTestNotification={async () => {
              const hasPerm = await NotificationService.requestPermissions();
              if (hasPerm) {
                NotificationService.testNotification();
                dispatch(showAzanModal('تجربة'));
                AudioService.playAzan('full');
              } else {
                Alert.alert('صلاحية مطلوبة', 'يرجى تفعيل الإشعارات من إعدادات الهاتف لتتمكن من تلقي التنبيهات.');
              }
            }} 
            accentColor={accentColor} 
          />
        )}
        
        {/* Daily Ward Quick Setting */}
        <ItemRow 
          icon="book-open" 
          label="موعد الورد اليومي" 
          value={notificationPrefs?.dailyWardEnabled} 
          isToggle 
          onValueChange={() => dispatch(toggleNotificationCategory('dailyWardEnabled' as any))} 
          accentColor={accentColor} 
        />

        <AzanSelector 
          azanSettings={azanSettings} 
          onUpdate={(update: any) => dispatch(setAzanSettings(update))} 
          accentColor={accentColor} 
        />
        
        {/* Location based timings */}
        <ItemRow 
          icon="map-marker-alt" 
          label="مواقيت الصلاة حسب الموقع" 
          value={locationEnabled} 
          isToggle 
          onValueChange={() => dispatch(toggleLocation())} 
          accentColor={accentColor} 
        />

        <View style={{ marginTop: 24, marginHorizontal: 16 }}>
          <FloatingTasbeehToggle accentTheme={accentTheme} />
        </View>

        <FloatingTasbeehSettings 
          floatingScale={floatingScale} 
          onUpdateScale={(scale: number) => dispatch(setFloatingScale(scale))} 
          floatingBubbleColor={floatingBubbleColor}
          onUpdateColor={(color: string) => dispatch(setFloatingBubbleColor(color))}
          floatingShowBorder={floatingShowBorder}
          onToggleBorder={() => dispatch(toggleFloatingBorder())}
          floatingShowReset={floatingShowReset}
          onToggleReset={() => dispatch(toggleFloatingReset())}
          floatingReminderInterval={floatingReminderInterval}
          onUpdateInterval={(minutes: number) => dispatch(setFloatingReminderInterval(minutes))}
          accentColor={accentColor} 
        />
      </SettingSection>

      <SettingSection title="المظهر واللوان">
        <ThemeSelector accentTheme={accentTheme} onSelect={(id: any) => dispatch(setAccentTheme(id))} accentColor={accentColor} />
      </SettingSection>

      <SettingSection title="إعدادات التلاوة">
        <ReciterSelector selectedReciterId={selectedReciterId} onSelect={(id: string) => dispatch(setReciterId(id))} accentColor={accentColor} />
      </SettingSection>

      <SettingSection title="تخصيص المصحف">
        <TafsirSettings 
          selectedTafsirId={selectedTafsirId} onSelectTafsir={(id: number) => dispatch(setTafsirId(id))}
          tafsirStyle={tafsirStyle} onSelectStyle={(style: any) => dispatch(setTafsirStyle(style))}
          tafsirFontSize={tafsirFontSize} setFontSize={(size: number) => dispatch(setTafsirFontSize(size))}
          accentColor={accentColor}
        />
      </SettingSection>

      <TouchableOpacity style={s.aboutBtn}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <FontAwesome5 name="info-circle" size={18} color="#d4af37" />
          <Text style={s.aboutText}>عن التطبيق</Text>
        </View>
        <FontAwesome5 name="chevron-left" size={14} color="#64748b" />
      </TouchableOpacity>

      <View style={{ alignItems: 'center', marginTop: 30, marginBottom: 20 }}>
        <Text style={{ fontFamily: 'Tajawal_500Medium', fontSize: 13, color: '#64748b' }}>
          Developed with ❤️ by
        </Text>
        <Text style={{ fontFamily: 'Tajawal_800ExtraBold', fontSize: 15, color: accentColor, marginTop: 4 }}>
          Mohamed Wael
        </Text>
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;

import React from 'react';
import { Text, TouchableOpacity, ScrollView, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  toggleNotifications, toggleLocation, setTafsirId, 
  setTafsirStyle, setTafsirFontSize, setAccentTheme, setReciterId,
  toggleNotificationCategory, setCalculationMethod, setAzanSettings,
  setPrePrayerReminderOffset, setDailyWardTime
} from '../store/slices/settingsSlice';
import { showAzanModal } from '../store/slices/uiSlice';
import { AudioService } from '../../data/services/AudioService';
import { THEME } from '../../shared/theme/constants';
import { FontAwesome5 } from '@expo/vector-icons';
import { NotificationService } from '../../data/services/NotificationService';

// Settings Components & Styles
import { 
  SettingSection, ItemRow, ThemeSelector, 
  ReciterSelector, TafsirSettings, NotificationSettings,
  CalculationMethodSelector, AzanSelector
} from '../components/settings/SettingsComponents';
import { s } from '../components/settings/SettingsStyles';
import { FloatingTasbeehToggle } from '../components/tasbeeh/FloatingTasbeeh';

const SettingsScreen = () => {
  const dispatch = useDispatch();
  const { 
    notificationsEnabled, locationEnabled, selectedTafsirId, 
    tafsirStyle, tafsirFontSize, accentTheme, selectedReciterId,
    notificationPrefs, calculationMethod, azanSettings: rawAzanSettings
  } = useSelector((state: RootState) => state.settings);

  const azanSettings = rawAzanSettings || { type: 'full', visualAzanEnabled: true };

  const colors = THEME.colors as any;
  const accentColor = colors[accentTheme] || colors.primary;

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      <Text style={s.header}>الإعدادات</Text>
      
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
              } else {
                dispatch(toggleNotificationCategory(id));
              }
            }} 
            onTestNotification={() => {
              NotificationService.testNotification();
              dispatch(showAzanModal('تجربة'));
              AudioService.playAzan('full');
            }}
            accentColor={accentColor} 
          />
        )}
        {/* Daily Ward Quick Setting */}
        <ItemRow 
          icon="bell" 
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
        <ItemRow icon="map-marker-alt" label="مواقيت الصلاة حسب الموقع" value={locationEnabled} isToggle onValueChange={() => dispatch(toggleLocation())} accentColor={accentColor} />
        
        <CalculationMethodSelector 
          selectedMethod={calculationMethod} 
          onSelect={(id: number) => dispatch(setCalculationMethod(id))} 
          accentColor={accentColor} 
        />

        <View style={{ marginTop: 20 }}>
          <FloatingTasbeehToggle accentTheme={accentTheme} />
        </View>
      </SettingSection>

      <SettingSection title="المظهر والسمات">
        <ThemeSelector accentTheme={accentTheme} onSelect={(id: any) => dispatch(setAccentTheme(id))} accentColor={accentColor} />
      </SettingSection>

      <SettingSection title="إعدادات التلاوة">
        <ReciterSelector selectedReciterId={selectedReciterId} onSelect={(id: string) => dispatch(setReciterId(id))} accentColor={accentColor} />
      </SettingSection>

      <SettingSection title="إعدادات التفسير">
        <TafsirSettings 
          selectedTafsirId={selectedTafsirId} onSelectTafsir={(id: number) => dispatch(setTafsirId(id))}
          tafsirStyle={tafsirStyle} onSelectStyle={(style: any) => dispatch(setTafsirStyle(style))}
          tafsirFontSize={tafsirFontSize} setFontSize={(size: number) => dispatch(setTafsirFontSize(size))}
          accentColor={accentColor}
        />
      </SettingSection>

      <TouchableOpacity style={s.aboutBtn}>
        <Text style={s.aboutText}>عن التطبيق</Text>
        <FontAwesome5 name="chevron-left" size={16} color="#64748b" />
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SettingsScreen;

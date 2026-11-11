import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { AccentKey, ACCENTS, colors, currentAccentKey, isLightTheme, setAccentKey, setLightTheme } from './tokens';
import type { ThemeMode } from '../../presentation/store/slices/settingsSlice';

/**
 * Picks the palette from the «المظهر» setting (or the phone's own setting) before anything
 * under it renders, and the accent colour with it. Stylesheets are built per theme and
 * accent and read on render, so a switch only needs everything drawn again: the key
 * remounts the subtree in the new colours.
 */
export const ThemeRoot = ({ children }: { children: React.ReactNode }) => {
  const mode = useSelector((s: { settings?: { theme?: ThemeMode } }) => s.settings?.theme) ?? 'dark';
  const system = useColorScheme();
  const light = mode === 'light' || (mode === 'system' && system === 'light');
  if (isLightTheme() !== light) setLightTheme(light);
  const picked = useSelector((s: { settings?: { accentTheme?: AccentKey } }) => s.settings?.accentTheme);
  const accent: AccentKey = picked && picked in ACCENTS ? picked : 'gold';
  if (currentAccentKey() !== accent) setAccentKey(accent);
  // the native root view shows through during keyboard resizes and modal transitions
  useEffect(() => { SystemUI.setBackgroundColorAsync(colors.bg).catch(() => undefined); }, [light]);
  return (
    <React.Fragment key={`${light ? 'light' : 'dark'}-${accent}`}>
      <StatusBar style={light ? 'dark' : 'light'} />
      {children}
    </React.Fragment>
  );
};


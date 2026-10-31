import React from 'react';
import { useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { isLightTheme, setLightTheme } from './tokens';

type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Picks the palette from the «المظهر» setting (or the phone's own setting) before anything
 * under it renders. Stylesheets are built per theme and read on render, so a switch only
 * needs everything drawn again: the key remounts the subtree in the new colours.
 */
export const ThemeRoot = ({ children }: { children: React.ReactNode }) => {
  const mode = useSelector((s: { settings?: { theme?: ThemeMode } }) => s.settings?.theme) ?? 'dark';
  const system = useColorScheme();
  const light = mode === 'light' || (mode === 'system' && system === 'light');
  if (isLightTheme() !== light) setLightTheme(light);
  return (
    <React.Fragment key={light ? 'light' : 'dark'}>
      <StatusBar style={light ? 'dark' : 'light'} />
      {children}
    </React.Fragment>
  );
};

/** Whether the light palette is on screen, for code that picks colours outside the tokens. */
export const useIsLight = () => {
  const mode = useSelector((s: { settings?: { theme?: ThemeMode } }) => s.settings?.theme) ?? 'dark';
  const system = useColorScheme();
  return mode === 'light' || (mode === 'system' && system === 'light');
};

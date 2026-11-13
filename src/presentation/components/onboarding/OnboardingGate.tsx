import React from 'react';
import { useSelector } from 'react-redux';
import { OnboardingScreen } from './OnboardingScreen';

/**
 * The app, or the welcome screens until they are done. The app is not mounted meanwhile, so
 * the home screen does not ask for the location (or the schedule for notifications) before the
 * second welcome screen explains why.
 */
export const OnboardingGate = ({ children }: { children: React.ReactNode }) => {
  // missing in state persisted before the flag existed: migration 8 sets it, so treat as done
  const onboarded = useSelector((s: { settings?: { onboarded?: boolean } }) => s.settings?.onboarded ?? true);
  return onboarded ? <>{children}</> : <OnboardingScreen />;
};

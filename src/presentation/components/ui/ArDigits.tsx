import React from 'react';
import { Platform, Text } from 'react-native';
import { toAr } from '../../../shared/utils/format';

/**
 * Tajawal draws the Arabic-Indic zero as a diamond, which at counter sizes reads as an icon
 * («◆/٥») instead of a number. The zeros are set in the system font, whose zero is the usual dot.
 */
const ZERO_FONT = { fontFamily: Platform.select({ android: 'sans-serif', default: 'System' }), fontWeight: 'bold' } as const;

/**
 * Arabic-Indic digits for a big number, for use inside a `<Text>`: `<Text>{arDigits(count)}</Text>`.
 * Body-size text does not need it: plain `toAr` is fine there.
 */
export const arDigits = (value: number | string): React.ReactNode => {
  const text = toAr(value);
  if (!text.includes('٠')) return text;
  return text.split(/(٠+)/).filter(Boolean).map((part, i) =>
    part[0] === '٠' ? <Text key={i} style={ZERO_FONT}>{part}</Text> : part,
  );
};

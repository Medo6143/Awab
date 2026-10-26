import { useSelector } from 'react-redux';
import { ACCENTS, Accent, AccentKey } from './tokens';

/** Resolves the user's chosen accent theme (gold | emerald | midnight) to its colour triple. */
export const useAccent = (): Accent => {
  const key = useSelector((state: { settings?: { accentTheme?: AccentKey } }) => state?.settings?.accentTheme);
  return ACCENTS[key && key in ACCENTS ? key : 'gold'];
};

export const getAccent = (key?: string | null): Accent =>
  ACCENTS[(key && key in ACCENTS ? key : 'gold') as AccentKey];

import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { icon } from '../../../shared/theme/tokens';

/**
 * The app's own line icons for the places that carry its identity (tab bar, home grid,
 * empty states). Same 24-unit grid and props as lucide, so they sit beside lucide icons
 * and fit anywhere an `IconComponent` is expected.
 */
export type IconProps = { color?: string; size?: number; strokeWidth?: number };
export type IconComponent = React.ComponentType<IconProps>;

const make = (children: React.ReactNode, name: string): IconComponent => {
  const C = ({ color = 'currentColor', size = icon.size.lg, strokeWidth = icon.stroke }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </Svg>
  );
  C.displayName = name;
  return C;
};

/** Domed mosque with a finial and a doorway. */
export const MosqueIcon = make(<>
  <Path d="M3 21h18" />
  <Path d="M6 21v-6a6 6 0 0 1 12 0v6" />
  <Path d="M12 9V6.6" />
  <Circle cx={12} cy={5.2} r={1.2} />
  <Path d="M10.5 21v-3a1.5 1.5 0 0 1 3 0v3" />
</>, 'MosqueIcon');

/** Mihrab arch with clock hands: prayer times. */
export const MihrabClockIcon = make(<>
  <Path d="M4 21h16" />
  <Path d="M6 21V11a6 6 0 0 1 12 0v10" />
  <Path d="M12 5V3" />
  <Path d="M12 11v3.5l2.2 1.5" />
</>, 'MihrabClockIcon');

/** Open mushaf on a folding stand (rahl). */
export const QuranStandIcon = make(<>
  <Path d="M3.5 6.5C6.5 5.5 9.5 6 12 8c2.5-2 5.5-2.5 8.5-1.5v7.5c-3-1-6-.5-8.5 1.5-2.5-2-5.5-2.5-8.5-1.5z" />
  <Path d="M12 8v7.5" />
  <Path d="M7 21l10-5" />
  <Path d="M17 21L7 16" />
</>, 'QuranStandIcon');

const BEADS: [number, number][] = [[12, 3.8], [16.3, 5.6], [18, 10], [16.3, 14.4], [7.7, 14.4], [6, 10], [7.7, 5.6]];

/** Prayer beads around a loop with a tassel. */
export const TasbihIcon = make(<>
  {BEADS.map(([x, y]) => <Circle key={`${x}-${y}`} cx={x} cy={y} r={1.3} />)}
  <Path d="M12 15v3" />
  <Path d="M10.3 21.5L12 18l1.7 3.5" />
</>, 'TasbihIcon');

/** Crescent with a small star: remembrance. */
export const CrescentStarIcon = make(<>
  <Path d="M14 3.5a8.5 8.5 0 1 0 6.5 13.5A7 7 0 0 1 14 3.5z" />
  <Path d="M18 6.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z" />
</>, 'CrescentStarIcon');

/** The Kaaba with its band (kiswa). */
export const KaabaIcon = make(<>
  <Path d="M4 7.5L12 4l8 3.5v9.5L12 20.5 4 17z" />
  <Path d="M4 7.5l8 3.5 8-3.5" />
  <Path d="M12 11v9.5" />
  <Path d="M4 10.3l8 3.5 8-3.5" />
</>, 'KaabaIcon');

/** Prayer mat with its arch and fringe: daily worship tasks. */
export const PrayerMatIcon = make(<>
  <Path d="M5 3h14v18H5z" />
  <Path d="M9 12V9a3 3 0 0 1 6 0v3z" />
  <Path d="M8 16h8" />
  <Path d="M8 21v1.5M12 21v1.5M16 21v1.5" />
</>, 'PrayerMatIcon');

/** Coin stamped with a crescent: zakat. */
export const ZakatCoinIcon = make(<>
  <Circle cx={12} cy={12} r={8.5} />
  <Circle cx={12} cy={12} r={5.5} />
  <Path d="M13.3 9.3a3 3 0 1 0 0 5.4 2.4 2.4 0 0 1 0-5.4z" />
</>, 'ZakatCoinIcon');

/** Heart with light above it: the Quran heart. */
export const HeartLightIcon = make(<>
  <Path d="M12 20s-7.5-4.5-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10C19.5 15.5 12 20 12 20z" />
  <Path d="M12 2.5v1.7M7 4l.8 1.4M17 4l-.8 1.4" />
</>, 'HeartLightIcon');

/** An open mushaf with a small heart above it: a message from the Quran. */
export const QuranMessageIcon = make(<>
  <Path d="M3.5 9.5C6.5 8.5 9.5 9 12 11c2.5-2 5.5-2.5 8.5-1.5v9c-3-1-6-.5-8.5 1.5-2.5-2-5.5-2.5-8.5-1.5z" />
  <Path d="M12 11v9" />
  <Path d="M12 7.2s-2.6-1.5-2.6-3.3A1.4 1.4 0 0 1 12 3.4a1.4 1.4 0 0 1 2.6.5C14.6 5.7 12 7.2 12 7.2z" />
</>, 'QuranMessageIcon');

/** A scroll with written lines: the hadith library. */
export const HadithScrollIcon = make(<>
  <Path d="M7 4h11a2 2 0 0 1 2 2v1H9" />
  <Path d="M7 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7" />
  <Path d="M7 4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2" />
  <Path d="M12 11h4M12 14h4M12 17h2.5" />
</>, 'HadithScrollIcon');

// ── the five prayers and sunrise: where the sun is at each time ──
/** Fajr: first light over the horizon, a star still out. */
export const FajrIcon = make(<>
  <Path d="M3 19h18" />
  <Path d="M7.5 19a4.5 4.5 0 0 1 9 0" />
  <Path d="M12 11.5v-1.5M6.2 13.8l-1-1M17.8 13.8l1-1" strokeOpacity={0.6} />
  <Path d="M18 4.5l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5z" />
</>, 'FajrIcon');

/** Sunrise: the sun coming up. */
export const SunriseIcon = make(<>
  <Path d="M3 19h18" />
  <Path d="M7 19a5 5 0 0 1 10 0" />
  <Path d="M12 3v6M9.5 5.5 12 3l2.5 2.5" />
</>, 'SunriseIcon');

/** Dhuhr: the sun at its height. */
export const DhuhrIcon = make(<>
  <Circle cx={12} cy={12} r={4} />
  <Path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
</>, 'DhuhrIcon');

/** Asr: the sun lower, toward the west. */
export const AsrIcon = make(<>
  <Path d="M3 19h18" />
  <Circle cx={15.5} cy={11} r={3.2} />
  <Path d="M15.5 5v1.4M21 11h-1.4M19.4 7.1l-1 1M11.6 7.1l1 1" />
  <Path d="M5 16h6" strokeOpacity={0.6} />
</>, 'AsrIcon');

/** Maghrib: the sun going down. */
export const MaghribIcon = make(<>
  <Path d="M3 19h18" />
  <Path d="M7 19a5 5 0 0 1 10 0" />
  <Path d="M12 9V3M9.5 6.5 12 9l2.5-2.5" />
</>, 'MaghribIcon');

/** Isha: night, a crescent and stars. */
export const IshaIcon = make(<>
  <Path d="M13.5 4a7.5 7.5 0 1 0 6.5 11.5A6 6 0 0 1 13.5 4z" />
  <Path d="M19 4.2l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4zM20.5 9.5l.3.7.7.3-.7.3-.3.7-.3-.7-.7-.3.7-.3z" />
</>, 'IshaIcon');

/** Two open palms raised in supplication. */
export const DuaHandsIcon = make(<>
  <Path d="M9 21v-3.5L6.2 14V7.5a1.1 1.1 0 0 1 2.2 0V12" />
  <Path d="M8.4 9V5.2a1.1 1.1 0 0 1 2.2 0V12" />
  <Path d="M10.6 6.3a1.1 1.1 0 0 1 2.2 0v7.2L11 16" />
  <Path d="M15 21v-3.5l2.8-3.5V7.5a1.1 1.1 0 0 0-2.2 0V12" />
  <Path d="M15.6 9V5.2a1.1 1.1 0 0 0-2.2 0V12" />
</>, 'DuaHandsIcon');

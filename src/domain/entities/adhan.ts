/**
 * The twelve lines of the adhan with where each one is called in assets/audio/azan.mp3
 * (seconds). Measured from the recording's loudness: each line is one sustained phrase
 * separated by a breath, 12 segments over 133 s.
 */
export interface AdhanLine { text: string; start: number; end: number }

export const ADHAN_LINES: AdhanLine[] = [
  { text: 'اللهُ أكبرُ، اللهُ أكبر', start: 0.8, end: 4.0 },
  { text: 'اللهُ أكبرُ، اللهُ أكبر', start: 8.1, end: 19.1 },
  { text: 'أشهدُ أن لا إلهَ إلا الله', start: 22.4, end: 28.3 },
  { text: 'أشهدُ أن لا إلهَ إلا الله', start: 30.4, end: 40.6 },
  { text: 'أشهدُ أنَّ محمدًا رسولُ الله', start: 42.8, end: 49.2 },
  { text: 'أشهدُ أنَّ محمدًا رسولُ الله', start: 51.4, end: 63.7 },
  { text: 'حيَّ على الصلاة', start: 66.0, end: 69.9 },
  { text: 'حيَّ على الصلاة', start: 73.0, end: 88.2 },
  { text: 'حيَّ على الفلاح', start: 90.7, end: 95.6 },
  { text: 'حيَّ على الفلاح', start: 97.5, end: 111.0 },
  { text: 'اللهُ أكبرُ، اللهُ أكبر', start: 112.7, end: 121.0 },
  { text: 'لا إلهَ إلا الله', start: 122.0, end: 132.5 },
];

/** Index of the line being called at `seconds` (the previous line stays up during a breath). */
export const adhanLineAt = (seconds: number): number => {
  let idx = 0;
  for (let i = 0; i < ADHAN_LINES.length; i++) if (seconds >= ADHAN_LINES[i].start - 0.2) idx = i;
  return idx;
};

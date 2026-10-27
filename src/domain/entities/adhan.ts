/**
 * The twelve lines of the adhan with where each one is called in assets/audio/azan.mp3
 * (seconds). Measured from the recording's loudness: each line is one sustained phrase
 * separated by a breath, 12 segments over 133 s.
 */
export interface AdhanLine {
  text: string;
  start: number;
  end: number;
  /** What the listener says back, when it is not the line itself (مسلم ٣٨٥). */
  response?: string;
}

const HAWQALA = 'لا حولَ ولا قوةَ إلا بالله';

export const ADHAN_LINES: AdhanLine[] = [
  { text: 'اللهُ أكبرُ، اللهُ أكبر', start: 0.8, end: 4.0 },
  { text: 'اللهُ أكبرُ، اللهُ أكبر', start: 8.1, end: 19.1 },
  { text: 'أشهدُ أن لا إلهَ إلا الله', start: 22.4, end: 28.3 },
  { text: 'أشهدُ أن لا إلهَ إلا الله', start: 30.4, end: 40.6 },
  { text: 'أشهدُ أنَّ محمدًا رسولُ الله', start: 42.8, end: 49.2 },
  { text: 'أشهدُ أنَّ محمدًا رسولُ الله', start: 51.4, end: 63.7 },
  { text: 'حيَّ على الصلاة', start: 66.0, end: 69.9, response: HAWQALA },
  { text: 'حيَّ على الصلاة', start: 73.0, end: 88.2, response: HAWQALA },
  { text: 'حيَّ على الفلاح', start: 90.7, end: 95.6, response: HAWQALA },
  { text: 'حيَّ على الفلاح', start: 97.5, end: 111.0, response: HAWQALA },
  { text: 'اللهُ أكبرُ، اللهُ أكبر', start: 112.7, end: 121.0 },
  { text: 'لا إلهَ إلا الله', start: 122.0, end: 132.5 },
];

/** Seconds after which the recording has finished. */
export const ADHAN_END = 133.5;

/**
 * Said after the adhan, in al-Bukhari's wording (٦١٤). Muslim (٣٨٤) adds the order:
 * repeat after the muezzin, send blessings on the Prophet ﷺ, then ask for al-Wasila.
 * The extra «إنك لا تخلف الميعاد» (al-Bayhaqi) is left out: graded shādh.
 */
export const POST_ADHAN_DUA = {
  intro: 'صلِّ على النبي ﷺ ثم قل:',
  text: 'اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ',
  virtue: 'من قالها حلّت له شفاعة النبي ﷺ يوم القيامة',
  source: 'صحيح البخاري ٦١٤',
};

/** Index of the line being called at `seconds` (the previous line stays up during a breath). */
export const adhanLineAt = (seconds: number): number => {
  let idx = 0;
  for (let i = 0; i < ADHAN_LINES.length; i++) if (seconds >= ADHAN_LINES[i].start - 0.2) idx = i;
  return idx;
};

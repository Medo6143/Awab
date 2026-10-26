/** A verse about the worth of prayer for each prayer, shown on the azan screen. */
export interface PrayerVerse { text: string; ref: string }

const BY_PRAYER: Record<string, PrayerVerse> = {
  'الفجر': { text: 'وَقُرْآنَ الْفَجْرِ ۖ إِنَّ قُرْآنَ الْفَجْرِ كَانَ مَشْهُودًا', ref: 'الإسراء ٧٨' },
  'الظهر': { text: 'حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ وَقُومُوا لِلَّهِ قَانِتِينَ', ref: 'البقرة ٢٣٨' },
  'العصر': { text: 'إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا', ref: 'النساء ١٠٣' },
  'المغرب': { text: 'فَسُبْحَانَ اللَّهِ حِينَ تُمْسُونَ وَحِينَ تُصْبِحُونَ', ref: 'الروم ١٧' },
  'العشاء': { text: 'وَأَقِمِ الصَّلَاةَ ۖ إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ ۗ وَلَذِكْرُ اللَّهِ أَكْبَرُ', ref: 'العنكبوت ٤٥' },
};

const JUMUAH: PrayerVerse = { text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا نُودِيَ لِلصَّلَاةِ مِن يَوْمِ الْجُمُعَةِ فَاسْعَوْا إِلَىٰ ذِكْرِ اللَّهِ', ref: 'الجمعة ٩' };
const DEFAULT: PrayerVerse = { text: 'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ وَإِنَّهَا لَكَبِيرَةٌ إِلَّا عَلَى الْخَاشِعِينَ', ref: 'البقرة ٤٥' };

/** The verse for a prayer (Arabic name); Friday's Dhuhr gets the Jumu'ah verse. */
export const verseForPrayer = (prayerName: string, now: Date = new Date()): PrayerVerse => {
  const name = prayerName.replace(/^صلاة\s+/, '').trim();
  if (name === 'الظهر' && now.getDay() === 5) return JUMUAH;
  return BY_PRAYER[name] ?? DEFAULT;
};

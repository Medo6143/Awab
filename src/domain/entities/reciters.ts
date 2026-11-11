/** A Quran reciter: `folder` on everyayah.com (single ayahs), `server`/`serverNum` on mp3quran.net (whole surahs). */
export type Reciter = { folder: string; server: string; serverNum: string; name: string };

export const DEFAULT_RECITER_ID = 'alafasy';

export const RECITER_MAP: Record<string, Reciter> = {
  'alafasy': { folder: 'Alafasy_128kbps', server: 'afs', serverNum: '8', name: 'مشاري العفاسي' },
  'abdulbasit': { folder: 'Abdul_Basit_Murattal_64kbps', server: 'basit', serverNum: '7', name: 'عبد الباسط (مرتل)' },
  'husary': { folder: 'Husary_128kbps', server: 'husr', serverNum: '13', name: 'الحصري' },
  'sudais': { folder: 'Abdurrahmaan_As-Sudais_192kbps', server: 'sds', serverNum: '11', name: 'السديس' },
};

/** One ayah's recitation on everyayah.com, for a reciter's `folder`. */
export const ayahAudioUrl = (folder: string, surah: number, ayah: number) =>
  `https://everyayah.com/data/${folder}/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`;

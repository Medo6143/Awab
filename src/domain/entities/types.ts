export type Surah = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  startPage?: number;
  startJuz?: number;
  hizbCount?: number;
};

export type Ayah = {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
};

export type QuranProgress = {
  surahId: number;
  completedAyahs: number;
  totalAyahs: number;
};

export type PrayerTime = {
  name: string;
  time: string; // HH:mm
  isNext: boolean;
};

export type Dua = {
  id: string;
  content: string;
  translation?: string;
  transliteration?: string;
  isPersonal: boolean;
  isFavorite: boolean;
  category?: string;
};

export type Tasbeeh = {
  id: string;
  name: string;
  count: number;
  goal?: number;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type AudioState = {
  isPlaying: boolean;
  isBuffering: boolean;
  currentSurahId: number | null;
  currentPosition: number;
  duration: number;
  playMode?: 'surah' | 'ayah' | 'sequence';
};

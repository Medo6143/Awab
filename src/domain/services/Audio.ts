/** One ayah to recite: surah number and ayah number within it. */
export type AyahKey = { surahId: number; ayahNumber: number };

/** Plays Quran recitation: whole surahs (with the media notification), single ayahs and runs of ayahs. */
export interface QuranPlayer {
  /** Reciter id from RECITER_MAP; unknown ids are ignored. */
  setReciter(id: string): void;
  playSurah(surahId: number, surahName?: string): Promise<boolean>;
  playAyah(surahId: number, ayahNumber: number, surahName?: string): Promise<boolean>;
  /** Plays `items` one after another, then calls `onFinish`. */
  playSequence(items: AyahKey[], title?: string, onFinish?: () => void): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  seek(positionMillis: number): Promise<void>;
  stop(): Promise<void>;
  /** Whether a surah is loaded to resume (false after an app restart). */
  hasQueue(): Promise<boolean>;
}

/** Plays the adhan inside the app (when the native alarm is not the one playing it). */
export interface AzanSound {
  play(type: 'takbir' | 'full'): Promise<void>;
  /** Seconds into the adhan being played, or null when nothing is playing. */
  position(): Promise<number | null>;
  stop(): Promise<void>;
}

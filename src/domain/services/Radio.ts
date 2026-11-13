import { RadioStation } from '../entities/radio';

/** Where the list of live Quran radios (reciters, tafsir, ruqyah…) comes from. */
export interface RadioDirectory {
  /** All stations, from the last saved copy when offline. Rejects only when there is none. */
  stations(): Promise<RadioStation[]>;
}

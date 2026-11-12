import type { HadithCategory, HadithIndexEntry } from '../entities/hadith';

/**
 * The hadith library bundled in the app (graded صحيح or حسن), browsable and searchable
 * offline. Loaded on first use; the full text of one hadith comes from HadithRepository.
 */
export interface HadithLibrary {
  /** Loads the index ahead of first use. */
  warm(): void;
  count(): number;
  /** Categories under `parent` (null: the top level), with how many hadiths each holds. */
  categories(parent: number | null): (HadithCategory & { indexed: number })[];
  category(id: number): HadithCategory | undefined;
  hadithsIn(categoryId: number): HadithIndexEntry[];
  entry(id: number): HadithIndexEntry | undefined;
  search(query: string, limit?: number): { hits: HadithIndexEntry[]; total: number };
  /** The same hadith all day, a different one each day. */
  ofTheDay(date?: Date): HadithIndexEntry;
  random(exceptId?: number): HadithIndexEntry;
}

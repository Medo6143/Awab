import { HadithLibrary } from '../../domain/repositories/HadithLibrary';
import {
  hadithCategories, hadithCategory, hadithCount, hadithEntry, hadithOfTheDay, hadithsIn, randomHadith, searchHadiths, warmHadithIndex,
} from '../hadith/hadithLibrary';

/** HadithLibrary on the bundled index (data/hadith/hadithLibrary). */
export class BundledHadithLibrary implements HadithLibrary {
  warm() { warmHadithIndex(); }
  count() { return hadithCount(); }
  categories(parent: number | null) { return hadithCategories(parent); }
  category(id: number) { return hadithCategory(id); }
  hadithsIn(categoryId: number) { return hadithsIn(categoryId); }
  entry(id: number) { return hadithEntry(id); }
  search(query: string, limit?: number) { return searchHadiths(query, limit); }
  ofTheDay(date?: Date) { return hadithOfTheDay(date); }
  random(exceptId?: number) { return randomHadith(exceptId); }
}

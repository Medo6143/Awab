import type { HadithDetail } from '../entities/hadith';

/** One hadith in full (text, explanation, benefits), from the online source. */
export interface HadithRepository {
  getHadith(id: number): Promise<HadithDetail>;
}

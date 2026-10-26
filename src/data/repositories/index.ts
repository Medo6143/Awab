/**
 * Composition root for data sources: the only place that picks concrete classes.
 * Presentation receives these through RepositoryProvider and sees only the interfaces.
 */
import { quranApi, tafsirApi } from '../api/clients';
import { QuranApiRepository, QuranComTafsirRepository } from './QuranApiRepository';
import { QuranRepository, TafsirRepository } from '../../domain/repositories/QuranRepository';

export type Repositories = {
  quran: QuranRepository;
  tafsir: TafsirRepository;
};

export const createRepositories = (): Repositories => ({
  quran: new QuranApiRepository(quranApi),
  tafsir: new QuranComTafsirRepository(tafsirApi),
});

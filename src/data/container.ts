/**
 * Composition root: the only place that picks concrete classes. Presentation receives
 * these through DependencyProvider and sees only the domain interfaces.
 */
import { quranApi, tafsirApi } from './api/clients';
import { QuranApiRepository, QuranComTafsirRepository } from './repositories/QuranApiRepository';
import { NativeFloatingSebha } from './services/NativeFloatingSebha';
import { QuranRepository, TafsirRepository } from '../domain/repositories/QuranRepository';
import { FloatingSebha } from '../domain/services/FloatingSebha';

export type AppDependencies = {
  quran: QuranRepository;
  tafsir: TafsirRepository;
  floatingSebha: FloatingSebha;
};

export const createDependencies = (): AppDependencies => ({
  quran: new QuranApiRepository(quranApi),
  tafsir: new QuranComTafsirRepository(tafsirApi),
  floatingSebha: new NativeFloatingSebha(),
});

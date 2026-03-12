import { quranApi } from './clients';
import { Surah, Ayah } from '../../domain/entities/types';

export const fetchSurahs = async (): Promise<Surah[]> => {
  const response = await quranApi.get('/surah');
  return response.data.data;
};

export const fetchSurahDetail = async (surahNumber: number): Promise<Surah & { ayahs: Ayah[] }> => {
  const response = await quranApi.get(`/surah/${surahNumber}/ar.alafasy`);
  return response.data.data;
};

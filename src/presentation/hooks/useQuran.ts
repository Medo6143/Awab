import { useQuery } from '@tanstack/react-query';
import { fetchSurahs, fetchSurahDetail } from '../../data/api/quranService';

export const useSurahs = () => {
  return useQuery({
    queryKey: ['surahs'],
    queryFn: fetchSurahs,
  });
};

export const useSurahDetail = (surahNumber: number) => {
  return useQuery({
    queryKey: ['surah', surahNumber],
    queryFn: () => fetchSurahDetail(surahNumber),
    enabled: !!surahNumber,
  });
};

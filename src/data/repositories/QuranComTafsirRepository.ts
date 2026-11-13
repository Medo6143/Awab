import { AxiosInstance } from 'axios';
import { TafsirRepository } from '../../domain/repositories/QuranRepository';
import { AyahRef } from '../../domain/entities/quran';

/** quran.com tafsir API. */
export class QuranComTafsirRepository implements TafsirRepository {
  constructor(private readonly api: AxiosInstance) {}

  async getTafsir(tafsirId: number, { surah, ayah }: AyahRef): Promise<string> {
    const res = await this.api.get(`/tafsirs/${tafsirId}/by_ayah/${surah}:${ayah}`);
    const html: unknown = res.data?.tafsir?.text;
    if (typeof html !== 'string' || !html.trim()) throw new Error('empty tafsir');
    return html;
  }
}

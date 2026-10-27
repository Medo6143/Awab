import { AxiosInstance } from 'axios';
import { QuranRepository, TafsirRepository } from '../../domain/repositories/QuranRepository';
import { AyahRef, MushafAyah, SurahMeta } from '../../domain/entities/quran';

export const TOTAL_MUSHAF_PAGES = 604;

/** alquran.cloud implementation with an in-memory page cache. */
export class QuranApiRepository implements QuranRepository {
  private pages = new Map<number, MushafAyah[]>();
  private inFlight = new Map<number, Promise<MushafAyah[]>>();

  constructor(private readonly api: AxiosInstance) {}

  peekPage(page: number) {
    return this.pages.get(page);
  }

  getPage(page: number): Promise<MushafAyah[]> {
    const cached = this.pages.get(page);
    if (cached) return Promise.resolve(cached);
    const running = this.inFlight.get(page);
    if (running) return running;

    const req = this.api.get(`/page/${page}/quran-uthmani`)
      .then((res) => {
        const ayahs: MushafAyah[] = res.data?.data?.ayahs ?? [];
        if (!ayahs.length) throw new Error(`empty page ${page}`);
        this.pages.set(page, ayahs);
        return ayahs;
      })
      .finally(() => this.inFlight.delete(page));
    this.inFlight.set(page, req);
    return req;
  }

  prefetchPage(page: number) {
    if (page < 1 || page > TOTAL_MUSHAF_PAGES || this.pages.has(page)) return;
    this.getPage(page).catch(() => {});
  }

  async getSurahs(): Promise<SurahMeta[]> {
    const res = await this.api.get('/surah');
    return res.data?.data ?? [];
  }

  private ayahs = new Map<string, string[]>();

  async getAyahs(surah: number, from: number, to: number): Promise<string[]> {
    const key = `${surah}:${from}-${to}`;
    const cached = this.ayahs.get(key);
    if (cached) return cached;
    const res = await this.api.get(`/surah/${surah}/quran-uthmani`, { params: { offset: from - 1, limit: to - from + 1 } });
    const list: { text?: string }[] = res.data?.data?.ayahs ?? [];
    if (list.length !== to - from + 1) throw new Error(`ayahs ${key} not found`);
    // the API prefixes each surah's first ayah with the basmala
    const texts = list.map((a, i) => {
      const t = (a.text ?? '').trim();
      return surah !== 1 && from + i === 1 && t.startsWith('بِسْمِ') ? t.replace(/^\S+\s+\S+\s+\S+\s+\S+\s+/, '') : t;
    });
    this.ayahs.set(key, texts);
    return texts;
  }

  async getSurahStartPage(surah: number): Promise<number> {
    const res = await this.api.get(`/surah/${surah}`);
    const page: unknown = res.data?.data?.ayahs?.[0]?.page;
    if (typeof page !== 'number') throw new Error(`no start page for surah ${surah}`);
    return page;
  }
}

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

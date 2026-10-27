import axios from 'axios';

export const quranApi = axios.create({
  baseURL: 'https://api.alquran.cloud/v1',
  timeout: 15000,
});

export const tafsirApi = axios.create({
  baseURL: 'https://api.quran.com/api/v4',
  timeout: 15000,
});

export const hadithApi = axios.create({
  baseURL: 'https://hadeethenc.com/api/v1',
  timeout: 15000,
});

export const prayerApi = axios.create({
  baseURL: 'https://api.aladhan.com/v1',
});

import axios from 'axios';

export const quranApi = axios.create({
  baseURL: 'https://api.alquran.cloud/v1',
});

export const prayerApi = axios.create({
  baseURL: 'https://api.aladhan.com/v1',
});

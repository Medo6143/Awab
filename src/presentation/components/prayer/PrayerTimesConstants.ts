import { toAr } from '../../../shared/utils/format';
export { toAr };

export const formatRemaining = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${toAr(h)}س و ${toAr(m)}د`;
};

export const PRAYER_NAME_MAP: Record<string, string> = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء'
};

import type { HeartMode } from '../../store/slices/quranSlice';
import { toAr } from '../../../shared/utils/format';

export const MODE_LABEL: Record<HeartMode, string> = { reading: 'القراءة', hifz: 'الحفظ' };
export const MODE_NOUN: Record<HeartMode, string> = { reading: 'قراءة', hifz: 'حفظ' };

const ORDINALS = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة', 'الثامنة', 'التاسعة', 'العاشرة'];

/** "الختمة الثالثة", then "الختمة رقم ١١" past the tenth. */
export const khatmaTitle = (n: number) => `الختمة ${ORDINALS[n - 1] ?? `رقم ${toAr(n)}`}`;

const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

/** Gregorian date in Arabic: "١٢ أكتوبر ٢٠٢٦". */
export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${toAr(d.getDate())} ${MONTHS[d.getMonth()]} ${toAr(d.getFullYear())}`;
};

/** Calendar days from start to end, counting both. */
export const daysBetween = (startIso: string, endIso: string) => {
  const day = (iso: string) => { const d = new Date(iso); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()); };
  return Math.round((day(endIso) - day(startIso)) / 86400000) + 1;
};

export const daysLabel = (n: number) => (n === 1 ? 'يوم واحد' : n === 2 ? 'يومان' : n <= 10 ? `${toAr(n)} أيام` : `${toAr(n)} يومًا`);

/** All 114 surahs: the heart of a finished khatma. */
export const ALL_SURAHS = Array.from({ length: 114 }, (_, i) => i + 1);

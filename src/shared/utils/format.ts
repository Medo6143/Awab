const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Western → Arabic-Indic digits. Accepts numbers or any string containing digits. */
export const toAr = (n: number | string): string =>
  String(n).replace(/[0-9]/g, (d) => AR_DIGITS[+d]);

/** Arabic-Indic digits with thousands separators (used for money). */
export const toArGrouped = (n: number, fractionDigits = 0): string =>
  toAr(
    n.toLocaleString('en-US', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }),
  ).replace(/,/g, '٬');

/** "٤٥ دقيقة" / "١س و ١٤د" style countdown from minutes. */
export const formatCountdown = (totalMinutes: number): string => {
  const m = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h === 0) return `${toAr(mm)} دقيقة`;
  if (mm === 0) return `${toAr(h)} ساعة`;
  return `${toAr(h)}س و ${toAr(mm)}د`;
};

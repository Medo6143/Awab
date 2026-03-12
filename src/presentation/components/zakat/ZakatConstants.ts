export const NISAB_GOLD = 85; // grams
export const GOLD_PRICE_GRAM = 3500; // Example placeholder price

export const toAr = (n: number | string) => {
  return Math.round(Number(n)).toLocaleString('ar-EG');
};

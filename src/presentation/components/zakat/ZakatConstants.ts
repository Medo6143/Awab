export const NISAB_GOLD = 85; // grams
export const GOLD_PRICE_GRAM = 3500; // Example placeholder price

import { toArGrouped } from '../../../shared/utils/format';
// Money: grouped Arabic-Indic digits, rounded to whole units.
export const toAr = (n: number | string) => toArGrouped(Math.round(Number(n)));

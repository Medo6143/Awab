# Zakat calculator («الزكاة» / «زكاة المال»)

> Status: Shipped · A one-field calculator that shows 2.5% of a cash amount when it reaches a fixed nisab estimate.

## What it does

- The user types one number: total money held (cash and bank), in Egyptian pounds.
- The screen shows the zakat due and the nisab estimate, and a note when the amount is below the nisab.
- An info card explains the rule in one paragraph (nisab equal to 85 g of gold, one Hijri year, 2.5%).

## How the user reaches it

| Path from launch | Taps |
|---|---|
| Home grid tile «الزكاة» | 1 |

Route name: `الزكاة` in `src/presentation/navigation/AppNavigation.tsx`. The grid tile is in `src/presentation/components/home/HomeSections.tsx`. The tile is the only entry point found in `src/`.

## How it works

| Quantity | Value in code | Source |
|---|---|---|
| Nisab weight | 85 g of gold | `NISAB_GOLD` |
| Gold price per gram | 3,500 EGP, hard-coded, commented "Example placeholder price" | `GOLD_PRICE_GRAM` |
| Nisab in money | 85 × 3,500 = 297,500 EGP | computed in the screen |
| Rate | 2.5% (`amount * 0.025`) | the screen |

Flow:

1. `amount = Number(cash) || 0`, where `cash` is the raw text of the input.
2. `reached = amount >= nisab`.
3. `zakat = reached ? amount * 0.025 : 0`.
4. The result is shown as «<zakat> ج.م» with the caption «الزكاة المستحقة (٢.٥٪)», rounded to a whole pound and formatted with Arabic-Indic digits and the Arabic thousands separator.
5. If `amount > 0` and the nisab is not reached, the line «المبلغ أقل من النصاب، فلا زكاة عليه» appears.

What the user enters: a single amount. There are no fields for gold, silver, trade goods, debts or the date the year started. The one-year condition is explained in the info card but is not checked.

## Code map

| Layer | File | Role |
|---|---|---|
| Screen | `src/presentation/screens/ZakatScreen.tsx` | Input state and the calculation |
| Components | `src/presentation/components/zakat/ZakatComponents.tsx` | `ZakatInput`, `ZakatInfoBox` |
| Components | `src/presentation/components/zakat/ZakatConstants.ts` | `NISAB_GOLD`, `GOLD_PRICE_GRAM`, money formatter `toAr` |
| Components | `src/presentation/components/zakat/ZakatStyles.ts` | Styles |
| Shared | `src/shared/utils/format.ts` | `toArGrouped` used by the formatter |
| UI kit | `src/presentation/components/ui/StatNumber.tsx` | The large result number |

## State and storage

- One `useState` string (`cash`) inside the screen.
- Nothing is persisted. Verified: there is no zakat slice in `src/presentation/store/index.ts`, the screen does not use Redux, and no AsyncStorage call mentions zakat. The amount is lost when the screen is closed.

## Native, notifications and permissions

None.

## External services

None. The gold price is not fetched; it is the constant above.

## Settings that affect it

None. The currency label («ج.م») and the gold price are fixed in code.

## Edge cases and limitations

- The gold price is a placeholder. The nisab shown (297,500 EGP) is labelled «تقديراً» on screen, but it does not track the market, so the "below nisab" decision can be wrong.
- The currency is always Egyptian pounds, regardless of the user's location.
- `Number(cash)` only understands Western digits and a dot. Arabic-Indic digits (٠–٩), a comma as decimal separator, or any stray character make it `NaN`, which is treated as 0, so the result silently shows zero. The input uses `keyboardType="numeric"`; its placeholder is the Arabic-Indic «٠».
- Negative numbers are not rejected; they are simply below the nisab.
- The result is rounded to a whole pound for display.
- Only cash is covered; the screen title «زكاة المال» is broader than what is calculated.

## Open issues

None. (#13, the zero glyph, may also apply to the result when it is zero, since it is a large number in the display style; Not verified on a device.)

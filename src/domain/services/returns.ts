/**
 * The journey of an أوّاب: someone who slips and comes back. Days are "YYYY-MM-DD" keys of
 * days with any worship logged. A gap of a day or more followed by an active day is a «رجعة»
 * (a return), counted as a good thing rather than as a broken streak.
 */
export type Journey = {
  /** Active days in a row up to today (or up to yesterday, while today is still empty). */
  streak: number;
  longest: number;
  /** Times the user came back after missing at least one whole day. */
  returns: number;
  /** Days since the last active day before today; 0 when yesterday was active. */
  awayDays: number;
  /** Today is the first active day after a gap. */
  returnedToday: boolean;
  /** Each day that was a return, for the calendar. */
  returnDays: Set<string>;
};

const DAY = 86_400_000;
const at = (k: string) => new Date(`${k}T12:00:00`).getTime();
const gap = (a: string, b: string) => Math.round((at(b) - at(a)) / DAY);

export const journeyOf = (activeDays: string[], today: string): Journey => {
  const days = [...new Set(activeDays)].filter((k) => k <= today).sort();
  const returnDays = new Set<string>();
  let longest = 0, run = 0;
  days.forEach((k, i) => {
    const step = i === 0 ? 0 : gap(days[i - 1], k);
    run = step === 1 ? run + 1 : 1;
    if (step > 1) returnDays.add(k);
    longest = Math.max(longest, run);
  });

  const last = days[days.length - 1];
  const activeToday = last === today;
  const before = activeToday ? days[days.length - 2] : last;
  const sinceBefore = before ? gap(before, today) : 0;
  // the run is alive while its last day is today or yesterday
  const streak = last && gap(last, today) <= 1 ? run : 0;

  return {
    streak,
    longest,
    returns: returnDays.size,
    awayDays: before ? Math.max(0, sinceBefore - 1) : 0,
    returnedToday: activeToday && returnDays.has(today),
    returnDays,
  };
};

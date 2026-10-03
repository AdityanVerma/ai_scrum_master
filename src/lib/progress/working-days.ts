// Calendar days as "YYYY-MM-DD", read in UTC so a time zone never moves a
// day. Working days are Monday to Friday, minus any days off passed in
// (public holidays, leave).

const DAY_MS = 24 * 60 * 60 * 1000;

// Long enough for any sprint; stops a loop on broken dates.
const MAX_DAYS = 3660;

export type DaysOff = ReadonlySet<string>;

export function toDay(value: string | Date) {
  return typeof value === 'string'
    ? value.slice(0, 10)
    : value.toISOString().slice(0, 10);
}

export function addDays(day: string, days: number) {
  return new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

export function isWorkingDay(day: string, daysOff?: DaysOff) {
  const weekday = new Date(`${day}T00:00:00Z`).getUTCDay();

  return weekday !== 0 && weekday !== 6 && !daysOff?.has(day);
}

// Working days from `from` to `to`, both included; empty when `to` is
// before `from`.
export function listWorkingDays(from: string, to: string, daysOff?: DaysOff) {
  const days: string[] = [];

  for (
    let day = from, i = 0;
    day <= to && i < MAX_DAYS;
    day = addDays(day, 1), i++
  ) {
    if (isWorkingDay(day, daysOff)) days.push(day);
  }

  return days;
}

export function countWorkingDays(from: string, to: string, daysOff?: DaysOff) {
  return listWorkingDays(from, to, daysOff).length;
}

// The `count`-th working day after `day` (count ≥ 1); `day` itself is not
// counted.
export function addWorkingDays(day: string, count: number, daysOff?: DaysOff) {
  let current = day;

  for (let found = 0, i = 0; found < count && i < MAX_DAYS; i++) {
    current = addDays(current, 1);

    if (isWorkingDay(current, daysOff)) found++;
  }

  return current;
}

import { MARKS } from '@/lib/progress/thresholds';
import {
  addDays,
  countWorkingDays,
  listWorkingDays,
  type DaysOff,
} from '@/lib/progress/working-days';
import type { Period } from '@/lib/progress/schedule';

// The 25 / 50 / 75 / 100 % marks (PHASE-8 section 8). Planned dates are
// worked out when needed, never stored, so they follow edited sprint and
// function dates.

export type Mark = (typeof MARKS)[number];

// The working day by which expected progress reaches each mark: day
// ceil(mark × working days). A 10-working-day period gives days 3, 5, 8, 10.
export function getPlannedMarkDates(period: Period, daysOff?: DaysOff) {
  const days = listWorkingDays(period.start, period.end, daysOff);

  return Object.fromEntries(
    MARKS.map((mark) => {
      if (days.length === 0) return [mark, period.end];

      const index =
        Math.max(1, Math.ceil((mark / 100) * days.length - 1e-9)) - 1;

      return [mark, days[index]];
    }),
  ) as Record<Mark, string>;
}

// The marks a progress (0 to 1) has reached.
export function getReachedMarks(progress: number): Mark[] {
  return MARKS.filter((mark) => progress * 100 >= mark - 1e-9);
}

export type MarkTiming = {
  state: 'REACHED' | 'DUE' | 'OVERDUE';
  // Working days late (positive) or early (negative); 0 is on time.
  daysLate: number;
};

// Reached marks compare the reached day with the planned day. A mark not
// reached yet is DUE until its planned day has passed, then OVERDUE by the
// working days since (today included).
export function getMarkTiming({
  planned,
  reachedOn,
  today,
  daysOff,
}: {
  planned: string;
  reachedOn: string | null;
  today: string;
  daysOff?: DaysOff;
}): MarkTiming {
  if (reachedOn) {
    if (reachedOn > planned) {
      return {
        state: 'REACHED',
        daysLate: countWorkingDays(addDays(planned, 1), reachedOn, daysOff),
      };
    }

    return {
      state: 'REACHED',
      daysLate: -countWorkingDays(addDays(reachedOn, 1), planned, daysOff),
    };
  }

  if (today > planned) {
    return {
      state: 'OVERDUE',
      daysLate: countWorkingDays(addDays(planned, 1), today, daysOff),
    };
  }

  return { state: 'DUE', daysLate: 0 };
}

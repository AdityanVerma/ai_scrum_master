import {
  AT_RISK_MIN_GAP,
  ON_TRACK_MIN_GAP,
  PACE_MIN_DAYS,
  PACE_WINDOW_DAYS,
} from '@/lib/progress/thresholds';
import {
  addDays,
  addWorkingDays,
  countWorkingDays,
  listWorkingDays,
  type DaysOff,
} from '@/lib/progress/working-days';

// Expected progress, status and forecast (PHASE-8 section 7). Days are
// "YYYY-MM-DD"; `today` is the viewer's local date.

export type Period = {
  start: string;
  end: string;
};

export type ProgressStatus = 'ON_TRACK' | 'AT_RISK' | 'DELAYED';

// A straight line over working days: working days finished ÷ working days in
// the period. Days before today count as finished; today does not, because
// its time is logged at End Day.
export function getExpectedProgress(
  period: Period,
  today: string,
  daysOff?: DaysOff,
) {
  const days = listWorkingDays(period.start, period.end, daysOff);

  if (days.length === 0) return today > period.end ? 1 : 0;

  return days.filter((day) => day < today).length / days.length;
}

// Actual minus expected, in percentage points, rounded so 35 % against 40 %
// is exactly −5 and not −5.000000000000004.
export function getGap(actual: number, expected: number) {
  return Math.round((actual - expected) * 100 * 1e6) / 1e6;
}

// ON TRACK when the gap is −5 points or better, AT RISK down to −15, DELAYED
// below that, or when the end date has passed with work unfinished (the
// Overtime badge rule). A forecast past the end date makes it at least
// AT RISK. Finished work is ON TRACK.
export function getStatus({
  actual,
  expected,
  endPassedWithUnfinished = false,
  projectedLate = false,
}: {
  actual: number;
  expected: number;
  endPassedWithUnfinished?: boolean;
  projectedLate?: boolean;
}): ProgressStatus {
  if (actual >= 1) return 'ON_TRACK';
  if (endPassedWithUnfinished) return 'DELAYED';

  const gap = getGap(actual, expected);

  if (gap < AT_RISK_MIN_GAP) return 'DELAYED';
  if (gap < ON_TRACK_MIN_GAP || projectedLate) return 'AT_RISK';

  return 'ON_TRACK';
}

export type ProgressPoint = {
  day: string;
  // Progress at the end of that day, 0 to 1.
  progress: number;
};

export type Forecast = {
  // Progress points (0 to 100) gained per working day recently.
  pace: number;
  // null when nothing moved in the window, so no finish can be projected.
  projectedFinish: string | null;
  // Working days after the end date; 0 when on time.
  workingDaysLate: number;
};

// Where the work is heading: pace = progress gained per working day over the
// last 5 working days, days left = what remains ÷ pace, projected finish =
// that many working days from today. `history` is the progress at the end of
// consecutive working days, oldest first; its first point is the baseline
// (for a new sprint, 0 on the day before it starts). Returns null with fewer
// than 3 working days of data.
export function getForecast({
  history,
  actual,
  today,
  end,
  daysOff,
}: {
  history: ProgressPoint[];
  actual: number;
  today: string;
  end: string;
  daysOff?: DaysOff;
}): Forecast | null {
  const points = history
    .filter((point) => point.day < today)
    .sort((a, b) => a.day.localeCompare(b.day))
    .slice(-(PACE_WINDOW_DAYS + 1));

  if (points.length < 2) return null;

  const first = points[0];
  const last = points[points.length - 1];
  const days = countWorkingDays(addDays(first.day, 1), last.day, daysOff);

  if (days < PACE_MIN_DAYS) return null;

  const pace = ((last.progress - first.progress) * 100) / days;

  if (actual >= 1) {
    return { pace, projectedFinish: today, workingDaysLate: 0 };
  }

  if (pace <= 0) {
    return { pace, projectedFinish: null, workingDaysLate: 0 };
  }

  // Remaining work starts today.
  const daysLeft = Math.ceil(((1 - actual) * 100) / pace - 1e-9);
  const projectedFinish = addWorkingDays(addDays(today, -1), daysLeft, daysOff);

  return {
    pace,
    projectedFinish,
    workingDaysLate:
      projectedFinish > end
        ? countWorkingDays(addDays(end, 1), projectedFinish, daysOff)
        : 0,
  };
}

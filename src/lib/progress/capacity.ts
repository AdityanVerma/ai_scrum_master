import { WORKDAY_HOURS } from '@/lib/progress/thresholds';

// "Other work eating sprint time" (PHASE-8 section 7, ask 5): a hint, not a
// limit, until Phase 10 brings real availability.
//
// time available = working days left × (hours a day − other work a day)
// spare          = time available − sprint work left (negative when short)
export function getCapacityHint({
  sprintWorkLeftMins,
  otherWorkPerDayMins,
  workingDaysLeft,
  hoursPerDay = WORKDAY_HOURS,
}: {
  sprintWorkLeftMins: number;
  otherWorkPerDayMins: number;
  workingDaysLeft: number;
  hoursPerDay?: number;
}) {
  const availableMins = Math.max(
    0,
    workingDaysLeft * (hoursPerDay * 60 - otherWorkPerDayMins),
  );

  return { availableMins, spareMins: availableMins - sprintWorkLeftMins };
}

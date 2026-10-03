// Every number the progress rules depend on, in one place
// (_docs_/PLAN/SUB-PHASES/PHASE-8.md sections 6 to 8, decisions P5 to P7).

// An unfinished task counts at most this share of its estimate (P7), so a
// task is complete only when someone marks it done.
export const TASK_PROGRESS_CAP = 0.9;

// Status from the gap between actual and expected progress, in percentage
// points (P5): ON TRACK at -5 or better, AT RISK down to -15, DELAYED below.
export const ON_TRACK_MIN_GAP = -5;
export const AT_RISK_MIN_GAP = -15;

// The forecast uses the pace of the last 5 working days and needs at least 3.
export const PACE_WINDOW_DAYS = 5;
export const PACE_MIN_DAYS = 3;

// The marks tracked for the sprint, each function and its work types.
export const MARKS = [25, 50, 75, 100] as const;

// Hours in a working day, until Phase 10 brings real availability.
export const WORKDAY_HOURS = 8;

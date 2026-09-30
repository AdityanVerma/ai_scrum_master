// Work types of a sprint task (PHASE-8 decision P8). Research and Deployment
// come from the team's sprint diaries. Daily tasklist tasks use the same names
// plus Meeting and Non-sprint for work outside the sprint.
export const WORK_TYPES = [
  'Development',
  'Documentation',
  'Testing',
  'Research',
  'Deployment',
] as const;

export type WorkType = (typeof WORK_TYPES)[number];

// Matches the database default for SprintTask.category.
export const DEFAULT_WORK_TYPE: WorkType = 'Development';

export function isWorkType(value: string): value is WorkType {
  return (WORK_TYPES as readonly string[]).includes(value);
}

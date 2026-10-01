// Status rules for sprint tasks. Shared by API routes and pages, so it must
// not import Prisma.

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';

export const TASK_STATUSES: TaskStatus[] = [
  'TODO',
  'IN_PROGRESS',
  'DONE',
  'BLOCKED',
];

// DONE → IN_PROGRESS is "reopen", for the Scrum Master only (PHASE-8
// section 5), so a wrong "finished" can be undone. The routes check the role.
export const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
  TODO: ['IN_PROGRESS', 'BLOCKED'],
  IN_PROGRESS: ['TODO', 'DONE', 'BLOCKED'],
  DONE: ['IN_PROGRESS'],
  BLOCKED: ['TODO', 'IN_PROGRESS'],
};

// What End Day does to a linked sprint task (PHASE-8 section 5):
// - "finished" makes it DONE, going through IN_PROGRESS from TODO or BLOCKED;
// - otherwise time logged starts a TODO task (IN_PROGRESS), and a BLOCKED
//   task stays blocked;
// - a DONE task is never changed here.
export function getStatusAfterEndDay(
  current: TaskStatus,
  { loggedTime, finished }: { loggedTime: boolean; finished: boolean },
): TaskStatus {
  if (current === 'DONE') {
    return 'DONE';
  }

  if (finished) {
    return 'DONE';
  }

  if (loggedTime && current === 'TODO') {
    return 'IN_PROGRESS';
  }

  return current;
}

import { TASK_PROGRESS_CAP } from '@/lib/progress/thresholds';

// Progress of sprint tasks and their roll-ups (PHASE-8 section 6).

export type ProgressTask = {
  status: string;
  estimatedHours: number;
  // All time logged against the task on linked daily tasks, by anyone.
  spentMins: number;
};

// DONE is 100 %. Anything else is time spent ÷ estimate, capped at 90 %, so
// a task that ran over its estimate does not look finished.
export function getTaskProgress(task: ProgressTask) {
  if (task.status === 'DONE') return 1;

  const estimateMins = task.estimatedHours * 60;

  if (estimateMins <= 0) return 0;

  return Math.min(task.spentMins / estimateMins, TASK_PROGRESS_CAP);
}

export type RollUp = {
  // 0 to 1; null when there are no estimated hours to weigh.
  progress: number | null;
  hours: number;
  earnedHours: number;
};

// Weighted by estimated hours: Σ (task progress × task hours) ÷ Σ task
// hours. The same formula serves a function, one work type of a function,
// one person's tasks and the whole sprint.
export function rollUp(tasks: ProgressTask[]): RollUp {
  const hours = tasks.reduce((total, task) => total + task.estimatedHours, 0);
  const earnedHours = tasks.reduce(
    (total, task) => total + getTaskProgress(task) * task.estimatedHours,
    0,
  );

  return {
    progress: hours > 0 ? earnedHours / hours : null,
    hours,
    earnedHours,
  };
}

// Roll-ups per group, e.g. per function id or per assignee.
export function rollUpBy<T extends ProgressTask, K>(
  tasks: T[],
  keyOf: (task: T) => K,
) {
  const groups = new Map<K, T[]>();

  for (const task of tasks) {
    const key = keyOf(task);
    groups.set(key, [...(groups.get(key) ?? []), task]);
  }

  return new Map([...groups].map(([key, items]) => [key, rollUp(items)]));
}

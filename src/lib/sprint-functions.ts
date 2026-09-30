// Functions (features) of a sprint and their weights (PHASE-8 section 4).
// Shared by API routes and pages, so it must not import Prisma.

export const NO_FUNCTION_LABEL = 'Not assigned to a function';

// Function names are compared ignoring case and extra spaces.
export function normalizeFunctionName(name: string) {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

// Trims each name and drops empty lines and repeats (ignoring case), keeping
// the first spelling. Two functions with the same name cannot be saved.
export function uniqueFunctionNames(names: string[]) {
  const seen = new Set<string>();

  return names
    .map((name) => name.trim().replace(/\s+/g, ' '))
    .filter((name) => {
      const key = normalizeFunctionName(name);

      if (!key || seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}

export type FunctionGroup<T> = {
  key: string;
  // null for tasks that are not assigned to a function.
  name: string | null;
  tasks: T[];
  hours: number;
  // Share of the sprint's estimated hours, 0 to 1 (decision P1). Worked out
  // when needed, never stored, so it follows any change to the estimates.
  weight: number;
};

// Groups tasks by function, in the order of the function list. Every function
// gets a group, even with no tasks. Tasks with no function, or one that is not
// in the list, go in a last group that is only added when it has tasks.
export function groupTasksByFunction<T extends { estimatedHours: number }>(
  functions: { key: string; name: string }[],
  tasks: T[],
  getFunctionKey: (task: T) => string | null,
): FunctionGroup<T>[] {
  const totalHours = sumHours(tasks);
  const keys = new Set(functions.map((item) => item.key));

  const group = (key: string, name: string | null, groupTasks: T[]) => {
    const hours = sumHours(groupTasks);

    return {
      key,
      name,
      tasks: groupTasks,
      hours,
      weight: totalHours > 0 ? hours / totalHours : 0,
    };
  };

  const groups = functions.map((item) =>
    group(
      item.key,
      item.name,
      tasks.filter((task) => getFunctionKey(task) === item.key),
    ),
  );

  const unassigned = tasks.filter((task) => {
    const key = getFunctionKey(task);
    return key === null || !keys.has(key);
  });

  return unassigned.length > 0
    ? [...groups, group('', null, unassigned)]
    : groups;
}

export function sumHours(tasks: { estimatedHours: number }[]) {
  return tasks.reduce((total, task) => total + task.estimatedHours, 0);
}

// 16.666… → "16.7%"
export function formatWeight(weight: number) {
  return `${Math.round(weight * 1000) / 10}%`;
}

// 12.25 → 12.3, so adding up estimates does not show long decimals.
export function formatHours(hours: number) {
  return Math.round(hours * 10) / 10;
}

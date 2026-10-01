import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

// A daily task can be linked to a sprint task (PHASE-8 section 5). The link
// is optional and lives on a main task only; subtasks belong to their
// parent's sprint task.

// What a daily task shows about the sprint task it is linked to.
export const linkedSprintTaskSelect = {
  id: true,
  taskId: true,
  title: true,
  sprint: { select: { id: true, name: true } },
  function: { select: { id: true, name: true } },
} satisfies Prisma.SprintTaskSelect;

// Only a sprint task that is assigned to the person, in an active sprint and
// not done yet can be picked.
function linkableWhere(memberId: string): Prisma.SprintTaskWhereInput {
  return {
    assignedToId: memberId,
    status: { not: 'DONE' },
    sprint: { status: 'ACTIVE' },
  };
}

// The ids among sprintTaskIds that the member can link to today.
export async function findLinkableSprintTaskIds(
  memberId: string,
  sprintTaskIds: string[],
) {
  const tasks = await prisma.sprintTask.findMany({
    where: { id: { in: sprintTaskIds }, ...linkableWhere(memberId) },
    select: { id: true },
  });

  return new Set(tasks.map((task) => task.id));
}

export async function isLinkableSprintTask(
  memberId: string,
  sprintTaskId: string,
) {
  const ids = await findLinkableSprintTaskIds(memberId, [sprintTaskId]);

  return ids.has(sprintTaskId);
}

// The sprint tasks a member can pick, with the time left on each: the
// estimate minus the time already logged against it on daily tasks.
export async function getLinkableSprintTasks(memberId: string) {
  const tasks = await prisma.sprintTask.findMany({
    where: linkableWhere(memberId),
    select: {
      ...linkedSprintTaskSelect,
      category: true,
      estimatedHours: true,
    },
    orderBy: [{ sprint: { startDate: 'asc' } }, { taskId: 'asc' }],
  });

  const spent = await prisma.tasklistTask.groupBy({
    by: ['sprintTaskId'],
    where: { sprintTaskId: { in: tasks.map((task) => task.id) } },
    _sum: { spentMins: true },
  });

  const spentBySprintTask = new Map(
    spent.map((row) => [row.sprintTaskId, row._sum.spentMins ?? 0]),
  );

  return tasks.map((task) => {
    const spentMins = spentBySprintTask.get(task.id) ?? 0;

    return {
      ...task,
      spentMins,
      remainingMins: Math.max(
        0,
        Math.round(task.estimatedHours * 60) - spentMins,
      ),
    };
  });
}

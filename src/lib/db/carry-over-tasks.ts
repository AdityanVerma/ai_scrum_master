import type { DailyTasklist } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import {
  findLinkableSprintTaskIds,
  linkedSprintTaskSelect,
} from '@/lib/db/sprint-task-links';

// Copies the unfinished tasks of the member's previous tasklist (the latest
// one before this list's date, so Monday picks up Friday) into this list.
// Unfinished subtasks come along under their copied parent. A task already
// carried into this list is skipped, so pressing the button twice adds
// nothing. The total estimate is kept, and so is the sprint task link while
// that task can still be linked; otherwise the link is dropped and counted.
export async function carryOverUnfinishedTasks(tasklist: DailyTasklist) {
  const previous = await prisma.dailyTasklist.findFirst({
    where: {
      memberId: tasklist.memberId,
      date: { lt: tasklist.date },
    },
    orderBy: { date: 'desc' },
    include: {
      tasks: { orderBy: { order: 'asc' } },
    },
  });

  if (!previous) {
    return { fromDate: null, tasks: [], droppedLinks: 0 };
  }

  const alreadyCarried = new Set(
    (
      await prisma.tasklistTask.findMany({
        where: { tasklistId: tasklist.id, carriedForwardFromId: { not: null } },
        select: { carriedForwardFromId: true },
      })
    ).map((task) => task.carriedForwardFromId),
  );

  const unfinished = previous.tasks.filter((task) => task.status !== 'DONE');
  const parents = unfinished.filter(
    (task) => !task.parentTaskId && !alreadyCarried.has(task.id),
  );

  const linkable = await findLinkableSprintTaskIds(
    tasklist.memberId,
    parents.flatMap((task) => (task.sprintTaskId ? [task.sprintTaskId] : [])),
  );

  const last = await prisma.tasklistTask.findFirst({
    where: { tasklistId: tasklist.id, parentTaskId: null },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  const droppedLinks = parents.filter(
    (task) => task.sprintTaskId && !linkable.has(task.sprintTaskId),
  ).length;

  const tasks = await prisma.$transaction(async (tx) => {
    const created = [];
    let order = (last?.order ?? 0) + 1;

    for (const parent of parents) {
      const keepLink =
        parent.sprintTaskId !== null && linkable.has(parent.sprintTaskId);

      const copy = await tx.tasklistTask.create({
        data: {
          tasklistId: tasklist.id,
          title: parent.title,
          category: parent.category,
          estimatedMins: parent.estimatedMins,
          priority: parent.priority,
          order: order++,
          status: 'PENDING',
          carriedForwardFromId: parent.id,
          sprintTaskId: keepLink ? parent.sprintTaskId : null,
          totalEstimateMins: parent.totalEstimateMins,
        },
        include: { sprintTask: { select: linkedSprintTaskSelect } },
      });

      created.push(copy);

      const subtasks = unfinished.filter(
        (task) => task.parentTaskId === parent.id,
      );

      for (const [index, subtask] of subtasks.entries()) {
        created.push(
          await tx.tasklistTask.create({
            data: {
              tasklistId: tasklist.id,
              parentTaskId: copy.id,
              title: subtask.title,
              category: subtask.category,
              estimatedMins: subtask.estimatedMins,
              priority: subtask.priority,
              order: index + 1,
              status: 'PENDING',
              carriedForwardFromId: subtask.id,
            },
            include: { sprintTask: { select: linkedSprintTaskSelect } },
          }),
        );
      }
    }

    return created;
  });

  return { fromDate: previous.date, tasks, droppedLinks };
}

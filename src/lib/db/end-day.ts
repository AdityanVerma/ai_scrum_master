import type { DailyTasklist } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import {
  getStatusAfterEndDay,
  type TaskStatus,
} from '@/lib/sprint-task-status';

export type EndDayEntry = {
  // A main task of the list; subtasks are counted in their parent's time.
  taskId: string;
  spentMins: number;
  // "Is the whole sprint task finished?" Linked tasks only.
  finishesSprintTask?: boolean;
};

export type SprintTaskChange = {
  sprintTaskId: string;
  taskId: string;
  from: TaskStatus;
  to: TaskStatus;
};

// The time is saved but the status is left alone (PHASE-8 section 5).
export type SkippedSprintTaskChange = SprintTaskChange & {
  reason: 'SPRINT_ENDED' | 'REASSIGNED';
};

// Thrown for a request that does not fit the list; the route answers 400.
export class EndDayError extends Error {}

// Thrown when End Day was already captured, e.g. by a second click.
export class AlreadyEndedError extends Error {}

// End Day in one transaction: lock the list, save the time spent on each main
// task, update the linked sprint tasks' statuses, and take the End Day
// snapshot, so the snapshot records the time and the links. A sprint that has
// ended or a task that was reassigned keeps the time and skips the status
// change; End Day never fails because of it.
export async function endDay(tasklist: DailyTasklist, entries: EndDayEntry[]) {
  const tasks = await prisma.tasklistTask.findMany({
    where: { tasklistId: tasklist.id },
    select: { id: true, parentTaskId: true, sprintTaskId: true },
  });

  const tasksById = new Map(tasks.map((task) => [task.id, task]));

  if (new Set(entries.map((entry) => entry.taskId)).size !== entries.length) {
    throw new EndDayError('Each task can only be listed once.');
  }

  for (const entry of entries) {
    const task = tasksById.get(entry.taskId);

    if (!task) {
      throw new EndDayError('Task not found in this tasklist.');
    }

    if (task.parentTaskId) {
      throw new EndDayError(
        "Time is entered on main tasks; a subtask's time is part of its parent's.",
      );
    }

    if (entry.finishesSprintTask && !task.sprintTaskId) {
      throw new EndDayError(
        'Only a task linked to a sprint task can finish it.',
      );
    }
  }

  // Per linked sprint task: was time logged today, and is it finished?
  // Several daily tasks can point at the same sprint task.
  const linked = new Map<string, { loggedTime: boolean; finished: boolean }>();

  for (const entry of entries) {
    const sprintTaskId = tasksById.get(entry.taskId)?.sprintTaskId;

    if (!sprintTaskId) continue;

    const current = linked.get(sprintTaskId) ?? {
      loggedTime: false,
      finished: false,
    };

    linked.set(sprintTaskId, {
      loggedTime: current.loggedTime || entry.spentMins > 0,
      finished: current.finished || entry.finishesSprintTask === true,
    });
  }

  return prisma.$transaction(async (tx) => {
    const now = new Date();

    // Locked first, so two End Day requests cannot both go through.
    const locked = await tx.dailyTasklist.updateMany({
      where: { id: tasklist.id, eodCapturedAt: null },
      data: { eodCapturedAt: now },
    });

    if (locked.count === 0) {
      throw new AlreadyEndedError(
        'EOD has already been captured for this tasklist.',
      );
    }

    for (const entry of entries) {
      await tx.tasklistTask.update({
        where: { id: entry.taskId },
        data: { spentMins: entry.spentMins },
      });
    }

    const sprintTasks = await tx.sprintTask.findMany({
      where: { id: { in: [...linked.keys()] } },
      select: {
        id: true,
        taskId: true,
        status: true,
        assignedToId: true,
        sprint: { select: { status: true } },
      },
    });

    const changes: SprintTaskChange[] = [];
    const skipped: SkippedSprintTaskChange[] = [];

    for (const sprintTask of sprintTasks) {
      const from = sprintTask.status as TaskStatus;
      const to = getStatusAfterEndDay(
        from,
        linked.get(sprintTask.id) ?? { loggedTime: false, finished: false },
      );

      if (to === from) continue;

      const change = { sprintTaskId: sprintTask.id, taskId: sprintTask.taskId, from, to };

      if (sprintTask.sprint.status !== 'ACTIVE') {
        skipped.push({ ...change, reason: 'SPRINT_ENDED' });
      } else if (sprintTask.assignedToId !== tasklist.memberId) {
        skipped.push({ ...change, reason: 'REASSIGNED' });
      } else {
        await tx.sprintTask.update({
          where: { id: sprintTask.id },
          data: { status: to },
        });

        changes.push(change);
      }
    }

    const snapshotTasks = await tx.tasklistTask.findMany({
      where: { tasklistId: tasklist.id },
      orderBy: { order: 'asc' },
    });

    await tx.tasklistSnapshot.create({
      data: {
        tasklistId: tasklist.id,
        type: 'EOD',
        capturedAt: now,
        tasks: snapshotTasks,
      },
    });

    const updated = await tx.dailyTasklist.findUniqueOrThrow({
      where: { id: tasklist.id },
    });

    return {
      tasklist: updated,
      sprintTaskChanges: changes,
      skippedSprintTaskChanges: skipped,
    };
  });
}

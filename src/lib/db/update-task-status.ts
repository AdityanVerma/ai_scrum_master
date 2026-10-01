import { prisma } from '@/lib/prisma';
import { allowedTransitions, type TaskStatus } from '@/lib/sprint-task-status';

export type { TaskStatus };

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const task = await prisma.sprintTask.findUnique({
    where: {
      id: taskId,
    },
  });

  if (!task) {
    throw new Error('Task not found.');
  }

  const currentStatus = task.status as TaskStatus;

  if (!allowedTransitions[currentStatus].includes(status)) {
    throw new Error(`Task cannot move from ${currentStatus} to ${status}.`);
  }

  return prisma.sprintTask.update({
    where: {
      id: taskId,
    },
    data: {
      status,
    },
  });
}

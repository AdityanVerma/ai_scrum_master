import { prisma } from '@/lib/prisma';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';

const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
  TODO: ['IN_PROGRESS', 'BLOCKED'],
  IN_PROGRESS: ['TODO', 'DONE', 'BLOCKED'],
  DONE: [],
  BLOCKED: ['TODO', 'IN_PROGRESS'],
};

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

import { prisma } from '@/lib/prisma';

export async function getSprintProgress(sprintId: string) {
  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
    select: {
      id: true,
      status: true,
    },
  });

  if (!sprint) {
    throw new Error('Sprint not found.');
  }

  const tasks = await prisma.sprintTask.findMany({
    where: {
      sprintId,
    },
    select: {
      status: true,
    },
  });

  const totalTasks = tasks.length;

  const todoTasks = tasks.filter((task) => task.status === 'TODO').length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === 'IN_PROGRESS',
  ).length;

  const doneTasks = tasks.filter((task) => task.status === 'DONE').length;

  const blockedTasks = tasks.filter((task) => task.status === 'BLOCKED').length;

  const progressPercentage =
    totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  return {
    sprintId: sprint.id,
    sprintStatus: sprint.status,
    totalTasks,
    todoTasks,
    inProgressTasks,
    doneTasks,
    blockedTasks,
    progressPercentage,
  };
}

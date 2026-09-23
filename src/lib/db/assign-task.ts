import { prisma } from '@/lib/prisma';

export async function assignTask(taskId: string, memberId: string) {
  const task = await prisma.sprintTask.findUnique({
    where: {
      id: taskId,
    },
  });

  if (!task) {
    throw new Error('Task not found.');
  }

  const member = await prisma.teamMember.findUnique({
    where: {
      id: memberId,
    },
  });

  if (!member) {
    throw new Error('Team member not found.');
  }

  return prisma.sprintTask.update({
    where: {
      id: taskId,
    },
    data: {
      assignedToId: memberId,
    },
    include: {
      assignedTo: {
        include: {
          skills: true,
        },
      },
    },
  });
}

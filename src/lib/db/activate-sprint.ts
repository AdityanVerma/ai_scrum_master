import { prisma } from '@/lib/prisma';

export async function activateSprint(id: string) {
  const sprint = await prisma.sprint.findUnique({
    where: {
      id,
    },
  });

  if (!sprint) {
    throw new Error('Sprint not found.');
  }

  if (sprint.status !== 'PLANNED') {
    throw new Error(
      `Sprint cannot be activated because it is currently ${sprint.status}.`,
    );
  }

  return prisma.sprint.update({
    where: {
      id,
    },
    data: {
      status: 'ACTIVE',
    },
  });
}

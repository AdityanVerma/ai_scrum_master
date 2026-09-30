import { prisma } from '@/lib/prisma';

// Ending a sprint is always the Scrum Master's decision; a sprint is never
// closed just because its end date has passed. Unfinished tasks stay in the
// sprint with their current status, as the record of what was not done.
export async function completeSprint(id: string) {
  const sprint = await prisma.sprint.findUnique({
    where: {
      id,
    },
  });

  if (!sprint) {
    throw new Error('Sprint not found.');
  }

  if (sprint.status !== 'ACTIVE') {
    throw new Error(
      `Sprint cannot be ended because it is currently ${sprint.status}.`,
    );
  }

  return prisma.sprint.update({
    where: {
      id,
    },
    data: {
      status: 'COMPLETED',
    },
  });
}

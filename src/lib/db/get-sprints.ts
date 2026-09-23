import { prisma } from '@/lib/prisma';

export async function getSprints() {
  return prisma.sprint.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      tasks: {
        include: {
          skills: true,
          dependencies: true,
          dependedOnBy: true,
        },
      },
    },
  });
}

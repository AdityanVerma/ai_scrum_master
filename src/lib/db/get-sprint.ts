import { prisma } from '@/lib/prisma';

export async function getSprint(id: string) {
  return prisma.sprint.findUnique({
    where: {
      id,
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

import { prisma } from '@/lib/prisma';

export async function getDocuments(sprintId?: string) {
  return prisma.document.findMany({
    where: sprintId
      ? {
          sprintId,
        }
      : undefined,

    orderBy: {
      createdAt: 'desc',
    },

    include: {
      tags: {
        include: {
          tag: true,
        },
      },

      sprint: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

import { prisma } from '@/lib/prisma';

export async function getDocuments() {
  return prisma.document.findMany({
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

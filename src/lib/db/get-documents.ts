import { prisma } from '@/lib/prisma';
import { documentInclude } from '@/lib/db/create-document';

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

    include: documentInclude,
  });
}

import { prisma } from '@/lib/prisma';

export async function getSprint(id: string) {
  return prisma.sprint.findUnique({
    where: { id },
    include: {
      // In the order they were entered when the sprint was planned.
      functions: {
        select: { id: true, name: true },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      },
      tasks: {
        include: {
          skills: true,
          dependencies: {
            include: {
              dependsOn: true,
            },
          },
          dependedOnBy: {
            include: {
              task: true,
            },
          },
          assignedTo: {
            include: {
              skills: true,
            },
          },
        },
      },
    },
  });
}

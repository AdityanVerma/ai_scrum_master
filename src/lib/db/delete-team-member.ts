import { prisma } from '@/lib/prisma';

// Hard delete, only for members with no history (for example one added by
// mistake). Anyone with sprint tasks, tasklists or documents is deactivated
// instead, so that history stays intact.
export async function deleteTeamMember(id: string) {
  const existingMember = await prisma.teamMember.findUnique({
    where: { id },
    select: {
      _count: {
        select: {
          assignedTasks: true,
          tasklists: true,
          createdDocuments: true,
        },
      },
    },
  });

  if (!existingMember) {
    throw new Error('Team member not found.');
  }

  const { assignedTasks, tasklists, createdDocuments } = existingMember._count;

  if (assignedTasks + tasklists + createdDocuments > 0) {
    throw new Error(
      'This member has sprint tasks, tasklists or documents, so they cannot be deleted. Deactivate them instead.',
    );
  }

  return prisma.teamMember.delete({
    where: { id },
  });
}

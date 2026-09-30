import { prisma } from '@/lib/prisma';

// A deactivated member cannot sign in, and any session they still have is
// rejected on its next request (see getCurrentMember in lib/auth/dal.ts).
// Their tasks, tasklists and documents are kept.
export async function setTeamMemberActive(id: string, isActive: boolean) {
  const existingMember = await prisma.teamMember.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingMember) {
    throw new Error('Team member not found.');
  }

  return prisma.teamMember.update({
    where: { id },
    data: { isActive },
    include: {
      skills: true,
    },
  });
}

import { prisma } from '@/lib/prisma';

// Sets a temporary password that the member must change at their next login.
export async function resetTeamMemberPassword(id: string, passwordHash: string) {
  const existingMember = await prisma.teamMember.findUnique({
    where: { id },
    select: { email: true },
  });

  if (!existingMember) {
    throw new Error('Team member not found.');
  }

  if (!existingMember.email) {
    throw new Error('This member has no login email yet.');
  }

  await prisma.teamMember.update({
    where: { id },
    data: {
      passwordHash,
      mustChangePassword: true,
    },
  });
}

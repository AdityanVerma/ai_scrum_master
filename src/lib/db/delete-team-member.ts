import { prisma } from '@/lib/prisma';

export async function deleteTeamMember(id: string) {
  const existingMember = await prisma.teamMember.findUnique({
    where: { id },
  });

  if (!existingMember) {
    throw new Error('Team member not found.');
  }

  return prisma.teamMember.delete({
    where: { id },
  });
}

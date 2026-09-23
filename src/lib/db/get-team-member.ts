import { prisma } from '@/lib/prisma';

export async function getTeamMember(id: string) {
  return prisma.teamMember.findUnique({
    where: {
      id,
    },
    include: {
      skills: true,
    },
  });
}

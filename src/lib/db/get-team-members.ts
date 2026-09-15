import { prisma } from '@/lib/prisma';

export async function getTeamMembers() {
  return prisma.teamMember.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      skills: true,
    },
  });
}

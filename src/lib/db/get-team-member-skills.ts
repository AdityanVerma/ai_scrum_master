import { prisma } from '@/lib/prisma';

export async function getTeamMemberSkills(memberId: string) {
  const member = await prisma.teamMember.findUnique({
    where: {
      id: memberId,
    },
    select: {
      id: true,
      skills: {
        select: {
          skill: true,
        },
      },
    },
  });

  if (!member) {
    throw new Error('Team member not found.');
  }

  return member.skills.map((skill) => skill.skill);
}

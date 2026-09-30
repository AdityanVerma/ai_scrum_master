import { prisma } from '@/lib/prisma';
import { normalizeSkill } from '@/lib/assignment/normalize-skill';

export async function findMembersBySkills(requiredSkills: string[]) {
  const members = await prisma.teamMember.findMany({
    where: { isActive: true },
    include: {
      skills: true,
    },
  });

  const normalizedRequiredSkills = requiredSkills
    .map(normalizeSkill)
    .filter(Boolean);

  return members.filter((member) => {
    const memberSkills = member.skills.map((skill) =>
      normalizeSkill(skill.skill),
    );

    return normalizedRequiredSkills.some((requiredSkill) =>
      memberSkills.includes(requiredSkill),
    );
  });
}

import { prisma } from '@/lib/prisma';
import { calculateSkillMatch } from '@/lib/assignment/calculate-skill-match';

export async function getAssignmentCandidates(requiredSkills: string[]) {
  const members = await prisma.teamMember.findMany({
    include: {
      skills: true,
    },
  });

  const candidates = members.map((member) => {
    const memberSkills = member.skills.map((skill) => skill.skill);

    const match = calculateSkillMatch(requiredSkills, memberSkills);

    return {
      memberId: member.id,
      name: member.name,
      role: member.role,
      ...match,
    };
  });

  return candidates.sort((a, b) => b.matchPercentage - a.matchPercentage);
}

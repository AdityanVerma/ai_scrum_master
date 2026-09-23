import { prisma } from '@/lib/prisma';

export type CreateTeamMemberInput = {
  name: string;
  role: string;
  skills: string[];
};

export async function createTeamMember(input: CreateTeamMemberInput) {
  const name = input.name.trim();
  const role = input.role.trim();

  if (!name || !role) {
    throw new Error('Name and role are required.');
  }

  const skills = input.skills.map((skill) => skill.trim()).filter(Boolean);

  return prisma.teamMember.create({
    data: {
      name,
      role,
      skills: {
        create: skills.map((skill) => ({
          skill,
        })),
      },
    },
    include: {
      skills: true,
    },
  });
}

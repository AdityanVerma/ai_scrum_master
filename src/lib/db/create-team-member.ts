import type { AccessRole } from '@/generated/prisma/enums';
import { prisma } from '@/lib/prisma';

export type CreateTeamMemberInput = {
  name: string;
  role: string;
  skills: string[];
  email: string;
  passwordHash: string;
  accessRole: AccessRole;
};

// The member must choose their own password at first login
// (mustChangePassword defaults to true).
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
      email: input.email,
      passwordHash: input.passwordHash,
      accessRole: input.accessRole,
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

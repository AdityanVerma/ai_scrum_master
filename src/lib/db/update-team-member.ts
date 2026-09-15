import { prisma } from '@/lib/prisma';

export type UpdateTeamMemberInput = {
  name?: string;
  role?: string;
  skills?: string[];
};

export async function updateTeamMember(
  id: string,
  input: UpdateTeamMemberInput,
) {
  const existingMember = await prisma.teamMember.findUnique({
    where: { id },
  });

  if (!existingMember) {
    throw new Error('Team member not found.');
  }

  const name = input.name?.trim();
  const role = input.role?.trim();

  if (name !== undefined && !name) {
    throw new Error('Name cannot be empty.');
  }

  if (role !== undefined && !role) {
    throw new Error('Role cannot be empty.');
  }

  const skills = input.skills?.map((skill) => skill.trim()).filter(Boolean);

  return prisma.$transaction(async (tx) => {
    const teamMember = await tx.teamMember.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(role !== undefined && { role }),
      },
    });

    if (skills !== undefined) {
      await tx.teamMemberSkill.deleteMany({
        where: {
          memberId: id,
        },
      });

      if (skills.length > 0) {
        await tx.teamMemberSkill.createMany({
          data: skills.map((skill) => ({
            memberId: id,
            skill,
          })),
        });
      }
    }

    return tx.teamMember.findUniqueOrThrow({
      where: { id: teamMember.id },
      include: {
        skills: true,
      },
    });
  });
}

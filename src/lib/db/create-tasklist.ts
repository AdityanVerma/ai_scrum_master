import { prisma } from '@/lib/prisma';

export type CreateTasklistInput = {
  memberId: string;
  date: Date;
};

export async function createTasklist(input: CreateTasklistInput) {
  const { memberId, date } = input;

  return prisma.dailyTasklist.create({
    data: {
      memberId,
      date,
    },
    include: {
      tasks: true,
      member: true,
    },
  });
}

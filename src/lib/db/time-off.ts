import type { TimeOffType } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';

const timeOffInclude = {
  member: { select: { id: true, name: true, isActive: true } },
} as const;

// Entries that have not finished before `from` (today or later), soonest
// first.
export async function getUpcomingTimeOff(from: Date) {
  return prisma.timeOff.findMany({
    where: { endDate: { gte: from } },
    include: timeOffInclude,
    orderBy: [{ startDate: 'asc' }, { endDate: 'asc' }, { createdAt: 'asc' }],
  });
}

export type CreateTimeOffInput = {
  memberIds: string[];
  type: TimeOffType;
  // "YYYY-MM-DD", stored as midnight UTC like tasklist dates.
  startDate: string;
  endDate: string;
  note?: string;
};

// One entry per member, so a public holiday can be added for several people
// at once and each person's entry can be removed on its own.
export async function createTimeOff(input: CreateTimeOffInput) {
  const memberIds = [...new Set(input.memberIds)];
  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);

  if (endDate < startDate) {
    throw new Error('End date cannot be before start date.');
  }

  const days = (endDate.getTime() - startDate.getTime()) / 86_400_000 + 1;

  if (days > 366) {
    throw new Error('Time off can be at most a year long.');
  }

  const activeMembers = await prisma.teamMember.count({
    where: { id: { in: memberIds }, isActive: true },
  });

  if (activeMembers !== memberIds.length) {
    throw new Error('Choose active team members only.');
  }

  const note = input.note?.trim() || null;

  const created = await prisma.timeOff.createManyAndReturn({
    data: memberIds.map((memberId) => ({
      memberId,
      type: input.type,
      startDate,
      endDate,
      note,
    })),
    select: { id: true },
  });

  return prisma.timeOff.findMany({
    where: { id: { in: created.map((entry) => entry.id) } },
    include: timeOffInclude,
    orderBy: { member: { name: 'asc' } },
  });
}

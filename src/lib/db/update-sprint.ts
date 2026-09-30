import { prisma } from '@/lib/prisma';
import { isSprintLocked } from '@/lib/sprint-status';

export type UpdateSprintInput = {
  name?: string;
  goal?: string;
  // "YYYY-MM-DD", stored as midnight UTC like sprints created by planning.
  startDate?: string;
  endDate?: string;
};

// Completed and cancelled sprints are history, so they cannot be edited.
// Active sprints can, for example to move the end date.
export async function updateSprint(id: string, input: UpdateSprintInput) {
  const sprint = await prisma.sprint.findUnique({
    where: { id },
  });

  if (!sprint) {
    throw new Error('Sprint not found.');
  }

  if (isSprintLocked(sprint.status)) {
    throw new Error(
      `Sprint cannot be edited because it is ${sprint.status}.`,
    );
  }

  const name = input.name?.trim();
  const goal = input.goal?.trim();

  if (name !== undefined && !name) {
    throw new Error('Name cannot be empty.');
  }

  if (goal !== undefined && !goal) {
    throw new Error('Goal cannot be empty.');
  }

  const startDate = input.startDate
    ? new Date(input.startDate)
    : sprint.startDate;
  const endDate = input.endDate ? new Date(input.endDate) : sprint.endDate;

  if (endDate < startDate) {
    throw new Error('End date cannot be before start date.');
  }

  return prisma.sprint.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(goal !== undefined && { goal }),
      startDate,
      endDate,
    },
  });
}

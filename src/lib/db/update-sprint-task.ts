import { prisma } from '@/lib/prisma';
import type { WorkType } from '@/lib/work-types';

export type UpdateSprintTaskInput = {
  // null takes the task out of its function.
  functionId?: string | null;
  category?: WorkType;
};

// The Scrum Master sets the function (feature) and work type of a task, for
// sprints planned before tasks had them or to correct the AI's choice. The
// caller checks the task is in this sprint and the sprint is not locked.
export async function updateSprintTask(
  sprintId: string,
  taskId: string,
  input: UpdateSprintTaskInput,
) {
  if (input.functionId) {
    const sprintFunction = await prisma.sprintFunction.findUnique({
      where: { id: input.functionId },
      select: { sprintId: true },
    });

    if (!sprintFunction || sprintFunction.sprintId !== sprintId) {
      throw new Error('Function not found in this sprint.');
    }
  }

  return prisma.sprintTask.update({
    where: { id: taskId },
    data: {
      ...(input.functionId !== undefined && { functionId: input.functionId }),
      ...(input.category !== undefined && { category: input.category }),
    },
    select: {
      id: true,
      functionId: true,
      category: true,
    },
  });
}

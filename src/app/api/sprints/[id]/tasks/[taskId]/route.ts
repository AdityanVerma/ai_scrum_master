import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole } from '@/lib/auth/dal';
import { updateSprintTask } from '@/lib/db/update-sprint-task';
import { prisma } from '@/lib/prisma';
import { isSprintLocked } from '@/lib/sprint-status';
import { WORK_TYPES } from '@/lib/work-types';

type RouteContext = {
  params: Promise<{
    id: string;
    taskId: string;
  }>;
};

// Only the fields sent are changed.
const updateTaskSchema = z
  .object({
    functionId: z.string().min(1).nullable().optional(),
    category: z.enum(WORK_TYPES, 'Choose one of the work types.').optional(),
  })
  .refine(
    (input) => input.functionId !== undefined || input.category !== undefined,
    'Send a function or a work type to change.',
  );

// Set a task's function and work type. Scrum Master only.
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireRole('SCRUM_MASTER');

    if (!auth.ok) {
      return auth.response;
    }

    const { id, taskId } = await context.params;

    const parsed = updateTaskSchema.safeParse(
      await request.json().catch(() => null),
    );

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? 'Invalid task details.',
        },
        { status: 400 },
      );
    }

    // Checked before writing, so a wrong sprint id cannot change the task.
    const existing = await prisma.sprintTask.findUnique({
      where: { id: taskId },
      select: { sprintId: true, sprint: { select: { status: true } } },
    });

    if (!existing || existing.sprintId !== id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task not found in this sprint.',
        },
        { status: 404 },
      );
    }

    if (isSprintLocked(existing.sprint.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Tasks in a ${existing.sprint.status} sprint cannot be changed.`,
        },
        { status: 400 },
      );
    }

    const task = await updateSprintTask(id, taskId, parsed.data);

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Failed to update task:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update task.',
      },
      { status: 400 },
    );
  }
}

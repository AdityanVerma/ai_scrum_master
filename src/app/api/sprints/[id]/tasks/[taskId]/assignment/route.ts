import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/dal';
import { assignTask } from '@/lib/db/assign-task';
import { prisma } from '@/lib/prisma';
import { isSprintLocked } from '@/lib/sprint-status';

type RouteContext = {
  params: Promise<{
    id: string;
    taskId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireRole('SCRUM_MASTER');

    if (!auth.ok) {
      return auth.response;
    }

    const { id, taskId } = await context.params;

    const body = await request.json();
    const memberId = body.memberId;

    if (!memberId) {
      return NextResponse.json(
        {
          success: false,
          error: 'memberId is required.',
        },
        { status: 400 },
      );
    }

    // Checked before assigning, so a wrong sprint id cannot change the task.
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
          error: `Tasks in a ${existing.sprint.status} sprint cannot be reassigned.`,
        },
        { status: 400 },
      );
    }

    const task = await assignTask(taskId, memberId);

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Failed to assign task:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to assign task.',
      },
      { status: 400 },
    );
  }
}

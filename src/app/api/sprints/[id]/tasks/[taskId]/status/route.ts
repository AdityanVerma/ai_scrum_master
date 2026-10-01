import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/dal';
import { updateTaskStatus } from '@/lib/db/update-task-status';
import { isSprintLocked } from '@/lib/sprint-status';
import { TASK_STATUSES, type TaskStatus } from '@/lib/sprint-task-status';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{
    id: string;
    taskId: string;
  }>;
};

// Scrum Master: any task, and reopening a DONE task. Member: only tasks
// assigned to them, and not once they are DONE.
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireSession();

    if (!auth.ok) {
      return auth.response;
    }

    const { id, taskId } = await context.params;
    const body = await request.json();

    const status = body.status as TaskStatus;

    if (!TASK_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid task status.',
        },
        { status: 400 },
      );
    }

    const existing = await prisma.sprintTask.findUnique({
      where: { id: taskId },
      select: {
        sprintId: true,
        assignedToId: true,
        status: true,
        sprint: { select: { status: true } },
      },
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

    if (
      auth.member.accessRole !== 'SCRUM_MASTER' &&
      existing.assignedToId !== auth.member.id
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'You can only change the status of tasks assigned to you.',
        },
        { status: 403 },
      );
    }

    if (
      existing.status === 'DONE' &&
      auth.member.accessRole !== 'SCRUM_MASTER'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only the Scrum Master can reopen a done task.',
        },
        { status: 403 },
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

    const task = await updateTaskStatus(taskId, status);

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Failed to update task status:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update task status.',
      },
      { status: 400 },
    );
  }
}

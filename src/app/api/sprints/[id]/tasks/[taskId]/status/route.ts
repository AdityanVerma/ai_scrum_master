import { NextResponse } from 'next/server';
import { updateTaskStatus, type TaskStatus } from '@/lib/db/update-task-status';

type RouteContext = {
  params: Promise<{
    id: string;
    taskId: string;
  }>;
};

const validStatuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED'];

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id, taskId } = await context.params;
    const body = await request.json();

    const status = body.status as TaskStatus;

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid task status.',
        },
        { status: 400 },
      );
    }

    const task = await updateTaskStatus(taskId, status);

    if (task.sprintId !== id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task does not belong to this sprint.',
        },
        { status: 400 },
      );
    }

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

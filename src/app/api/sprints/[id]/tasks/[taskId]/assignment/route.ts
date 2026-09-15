import { NextResponse } from 'next/server';
import { assignTask } from '@/lib/db/assign-task';

type RouteContext = {
  params: Promise<{
    id: string;
    taskId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
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

    const task = await assignTask(taskId, memberId);

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

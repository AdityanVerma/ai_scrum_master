import { NextResponse } from 'next/server';
import { recommendTaskAssignee } from '@/lib/assignment/recommend-task-assignee';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const taskId = body.taskId;

    if (!taskId) {
      return NextResponse.json(
        {
          success: false,
          error: 'taskId is required.',
        },
        { status: 400 },
      );
    }

    const recommendation = await recommendTaskAssignee(taskId);

    return NextResponse.json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    console.error('Failed to recommend task assignee:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to recommend task assignee.',
      },
      { status: 400 },
    );
  }
}

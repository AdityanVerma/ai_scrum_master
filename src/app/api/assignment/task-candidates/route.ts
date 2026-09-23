import { NextResponse } from 'next/server';
import { getTaskAssignmentCandidates } from '@/lib/assignment/get-task-assignment-candidates';

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

    const candidates = await getTaskAssignmentCandidates(taskId);

    return NextResponse.json({
      success: true,
      data: candidates,
    });
  } catch (error) {
    console.error('Failed to get task assignment candidates:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get assignment candidates.',
      },
      { status: 400 },
    );
  }
}

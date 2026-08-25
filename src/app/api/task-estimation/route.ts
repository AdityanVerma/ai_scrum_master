import { NextResponse } from 'next/server';

import { estimateTasks } from '@/lib/ai/sprint-planning/task-estimation';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!Array.isArray(body.tasks)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tasks are required.',
        },
        { status: 400 },
      );
    }

    if (!Array.isArray(body.taskSkills)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Task skills are required.',
        },
        { status: 400 },
      );
    }

    const result = await estimateTasks(body.tasks, body.taskSkills);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Task estimation failed:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Task estimation failed.',
      },
      { status: 500 },
    );
  }
}

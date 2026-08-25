import { NextResponse } from 'next/server';

import { breakDownTasks } from '@/lib/ai/sprint-planning/task-breakdown';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await breakDownTasks(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Task breakdown failed:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Task breakdown failed.',
      },
      { status: 500 },
    );
  }
}

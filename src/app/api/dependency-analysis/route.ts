import { NextResponse } from 'next/server';

import { analyzeDependencies } from '@/lib/ai/sprint-planning/dependency-analysis';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.tasks || !Array.isArray(body.tasks)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tasks are required.',
        },
        { status: 400 },
      );
    }

    const result = await analyzeDependencies(body.tasks);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Dependency analysis failed:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Dependency analysis failed.',
      },
      { status: 500 },
    );
  }
}

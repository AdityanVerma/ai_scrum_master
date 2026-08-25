import { NextResponse } from 'next/server';

import { identifySkills } from '@/lib/ai/sprint-planning/skill-identification';

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

    const result = await identifySkills(body.tasks);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Skill identification failed:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Skill identification failed.',
      },
      { status: 500 },
    );
  }
}

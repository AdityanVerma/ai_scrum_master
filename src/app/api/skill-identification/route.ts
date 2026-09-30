import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/dal';

import { identifySkills } from '@/lib/ai/sprint-planning/skill-identification';

export async function POST(request: Request) {
  try {
    const auth = await requireRole('SCRUM_MASTER');

    if (!auth.ok) {
      return auth.response;
    }

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

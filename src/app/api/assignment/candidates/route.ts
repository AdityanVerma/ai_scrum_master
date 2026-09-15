import { NextResponse } from 'next/server';
import { getAssignmentCandidates } from '@/lib/assignment/get-assignment-candidates';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      !Array.isArray(body.requiredSkills) ||
      body.requiredSkills.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'requiredSkills must be a non-empty array.',
        },
        { status: 400 },
      );
    }

    const candidates = await getAssignmentCandidates(body.requiredSkills);

    return NextResponse.json({
      success: true,
      data: candidates,
    });
  } catch (error) {
    console.error('Failed to get assignment candidates:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get assignment candidates.',
      },
      { status: 500 },
    );
  }
}

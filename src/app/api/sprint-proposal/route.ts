import { NextResponse } from 'next/server';

import { generateSprintProposal } from '@/lib/ai/sprint-proposal';

type SprintInput = {
  name: string;
  goal: string;
  duration: {
    startDate: string;
    endDate: string;
  };
  functions: string[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SprintInput;

    if (
      !body.name ||
      !body.goal ||
      !body.duration?.startDate ||
      !body.duration?.endDate ||
      !body.functions?.length
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'All sprint information is required.',
        },
        { status: 400 },
      );
    }

    const proposal = await generateSprintProposal(body);

    return NextResponse.json({
      success: true,
      data: proposal,
    });
  } catch (error) {
    console.error('Sprint proposal generation failed:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate sprint proposal.',
      },
      { status: 500 },
    );
  }
}

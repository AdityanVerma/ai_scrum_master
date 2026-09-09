import { NextResponse } from 'next/server';
import {
  planSprint,
  type SprintInput,
} from '@/lib/ai/sprint-planning/sprint-planning';
import { saveSprintProposal } from '@/lib/db/save-sprint-proposal';

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

    const result = await planSprint(body);

    if (result.status === 'READY') {
      const savedSprint = await saveSprintProposal(result.sprintProposal);

      return NextResponse.json({
        success: true,
        data: {
          ...result,
          savedSprint,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Sprint planning failed:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Sprint planning failed.',
      },
      { status: 500 },
    );
  }
}

import { NextResponse } from 'next/server';

import { analyzeRequirements } from '@/lib/ai/sprint-planning/requirement-analysis';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await analyzeRequirements(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Requirement analysis failed:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Requirement analysis failed.',
      },
      { status: 500 },
    );
  }
}

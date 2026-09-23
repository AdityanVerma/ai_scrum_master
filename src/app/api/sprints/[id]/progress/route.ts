import { NextResponse } from 'next/server';
import { getSprintProgress } from '@/lib/db/get-sprint-progress';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const progress = await getSprintProgress(id);

    return NextResponse.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Failed to get sprint progress:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get sprint progress.',
      },
      { status: 404 },
    );
  }
}

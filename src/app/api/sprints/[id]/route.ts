import { NextResponse } from 'next/server';
import { getSprint } from '@/lib/db/get-sprint';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const sprint = await getSprint(id);

    if (!sprint) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sprint not found.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: sprint,
    });
  } catch (error) {
    console.error('Failed to fetch sprint:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch sprint.',
      },
      { status: 500 },
    );
  }
}

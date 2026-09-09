import { NextResponse } from 'next/server';
import { getSprints } from '@/lib/db/get-sprints';

export async function GET() {
  try {
    const sprints = await getSprints();

    return NextResponse.json({
      success: true,
      data: sprints,
    });
  } catch (error) {
    console.error('Failed to fetch sprints:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch sprints.',
      },
      { status: 500 },
    );
  }
}

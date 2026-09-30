import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/dal';
import { getSprints } from '@/lib/db/get-sprints';

export async function GET() {
  try {
    const auth = await requireSession();

    if (!auth.ok) {
      return auth.response;
    }

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

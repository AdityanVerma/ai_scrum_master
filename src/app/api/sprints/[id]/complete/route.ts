import { NextResponse } from 'next/server';
import { completeSprint } from '@/lib/db/complete-sprint';
import { requireRole } from '@/lib/auth/dal';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// End Sprint: ACTIVE -> COMPLETED. Scrum Master only.
export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const auth = await requireRole('SCRUM_MASTER');

    if (!auth.ok) {
      return auth.response;
    }

    const { id } = await context.params;

    const sprint = await completeSprint(id);

    return NextResponse.json({
      success: true,
      data: sprint,
    });
  } catch (error) {
    console.error('Failed to end sprint:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to end sprint.',
      },
      { status: 400 },
    );
  }
}

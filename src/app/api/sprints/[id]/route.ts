import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, requireSession } from '@/lib/auth/dal';
import { getSprint } from '@/lib/db/get-sprint';
import { updateSprint } from '@/lib/db/update-sprint';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// Every field is optional: only the fields sent are changed.
const updateSprintSchema = z.object({
  name: z.string().max(200).optional(),
  goal: z.string().max(5000).optional(),
  startDate: z.iso.date('Start date must be a date (YYYY-MM-DD).').optional(),
  endDate: z.iso.date('End date must be a date (YYYY-MM-DD).').optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await requireSession();

    if (!auth.ok) {
      return auth.response;
    }

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

// Edit name, goal and dates. Scrum Master only.
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireRole('SCRUM_MASTER');

    if (!auth.ok) {
      return auth.response;
    }

    const { id } = await context.params;

    const parsed = updateSprintSchema.safeParse(
      await request.json().catch(() => null),
    );

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? 'Invalid sprint details.',
        },
        { status: 400 },
      );
    }

    const sprint = await updateSprint(id, parsed.data);

    return NextResponse.json({
      success: true,
      data: sprint,
    });
  } catch (error) {
    console.error('Failed to update sprint:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update sprint.',
      },
      { status: 400 },
    );
  }
}

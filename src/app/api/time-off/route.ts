import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole } from '@/lib/auth/dal';
import { createTimeOff, getUpcomingTimeOff } from '@/lib/db/time-off';

const createTimeOffSchema = z.object({
  memberIds: z
    .array(z.string().min(1))
    .min(1, 'Choose at least one team member.')
    .max(100),
  type: z.enum(['LEAVE', 'PUBLIC_HOLIDAY'], 'Choose leave or public holiday.'),
  startDate: z.iso.date('Start date must be a date (YYYY-MM-DD).'),
  endDate: z.iso.date('End date must be a date (YYYY-MM-DD).'),
  note: z.string().max(200, 'Keep the note under 200 characters.').optional(),
});

const fromSchema = z.iso.date('from must be a date (YYYY-MM-DD).');

// Upcoming public holidays and leave: entries ending on or after `from`
// (the viewer's today; the server's UTC date if not given). Scrum Master only.
export async function GET(request: Request) {
  try {
    const auth = await requireRole('SCRUM_MASTER');

    if (!auth.ok) {
      return auth.response;
    }

    const from =
      new URL(request.url).searchParams.get('from') ??
      new Date().toISOString().slice(0, 10);

    const parsed = fromSchema.safeParse(from);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message },
        { status: 400 },
      );
    }

    const entries = await getUpcomingTimeOff(new Date(parsed.data));

    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error('Failed to fetch time off:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to fetch time off.' },
      { status: 500 },
    );
  }
}

// Add leave or a public holiday for one or more members. Scrum Master only.
export async function POST(request: Request) {
  try {
    const auth = await requireRole('SCRUM_MASTER');

    if (!auth.ok) {
      return auth.response;
    }

    const parsed = createTimeOffSchema.safeParse(
      await request.json().catch(() => null),
    );

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? 'Invalid time off.',
        },
        { status: 400 },
      );
    }

    const entries = await createTimeOff(parsed.data);

    return NextResponse.json(
      { success: true, data: entries },
      { status: 201 },
    );
  } catch (error) {
    console.error('Failed to add time off:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to add time off.',
      },
      { status: 400 },
    );
  }
}

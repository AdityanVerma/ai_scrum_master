import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/dal';
import {
  DiaryPublishedError,
  getDiary,
  saveDiaryHeader,
} from '@/lib/db/sprint-diary';
import { buildDiaryParts } from '@/lib/sprint-diary/build-diary';
import { diaryDateSchema, diaryHeaderSchema } from '@/lib/sprint-diary/schemas';

type RouteContext = {
  params: Promise<{
    date: string;
  }>;
};

function badRequest(error: string) {
  return NextResponse.json({ success: false, error }, { status: 400 });
}

// The diary for a date: its header (saved, or copied from the previous
// diary), the generated parts, and the published text once published.
// Scrum Master only.
export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await requireRole('SCRUM_MASTER');

    if (!auth.ok) {
      return auth.response;
    }

    const parsed = diaryDateSchema.safeParse((await context.params).date);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? 'Invalid date.');
    }

    const date = parsed.data;
    const diary = await getDiary(new Date(date));
    const parts = await buildDiaryParts(date);

    return NextResponse.json({
      success: true,
      data: {
        date,
        ...diary,
        copiedFrom: diary.copiedFrom?.toISOString().slice(0, 10) ?? null,
        parts,
      },
    });
  } catch (error) {
    console.error('Failed to build sprint diary:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to build the sprint diary.' },
      { status: 500 },
    );
  }
}

// Save the header for a date. Refused once the diary is published.
export async function PUT(request: Request, context: RouteContext) {
  try {
    const auth = await requireRole('SCRUM_MASTER');

    if (!auth.ok) {
      return auth.response;
    }

    const date = diaryDateSchema.safeParse((await context.params).date);

    if (!date.success) {
      return badRequest(date.error.issues[0]?.message ?? 'Invalid date.');
    }

    const header = diaryHeaderSchema.safeParse(
      await request.json().catch(() => null),
    );

    if (!header.success) {
      return badRequest(header.error.issues[0]?.message ?? 'Invalid header.');
    }

    await saveDiaryHeader(new Date(date.data), header.data);

    return NextResponse.json({ success: true, data: { header: header.data } });
  } catch (error) {
    if (error instanceof DiaryPublishedError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 },
      );
    }

    console.error('Failed to save sprint diary header:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to save the diary header.' },
      { status: 500 },
    );
  }
}

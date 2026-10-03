import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/dal';
import { DiaryPublishedError, publishDiary } from '@/lib/db/sprint-diary';
import {
  diaryDateSchema,
  publishDiarySchema,
} from '@/lib/sprint-diary/schemas';

type RouteContext = {
  params: Promise<{
    date: string;
  }>;
};

// Publish: saves the header and the exact text that was posted. A published
// diary never changes afterwards. Scrum Master only.
export async function POST(request: Request, context: RouteContext) {
  try {
    const auth = await requireRole('SCRUM_MASTER');

    if (!auth.ok) {
      return auth.response;
    }

    const date = diaryDateSchema.safeParse((await context.params).date);

    if (!date.success) {
      return NextResponse.json(
        {
          success: false,
          error: date.error.issues[0]?.message ?? 'Invalid date.',
        },
        { status: 400 },
      );
    }

    const body = publishDiarySchema.safeParse(
      await request.json().catch(() => null),
    );

    if (!body.success) {
      return NextResponse.json(
        {
          success: false,
          error: body.error.issues[0]?.message ?? 'Invalid diary.',
        },
        { status: 400 },
      );
    }

    const { text, ...header } = body.data;

    await publishDiary(new Date(date.data), header, text, auth.member.id);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof DiaryPublishedError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 },
      );
    }

    console.error('Failed to publish sprint diary:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to publish the diary.' },
      { status: 500 },
    );
  }
}

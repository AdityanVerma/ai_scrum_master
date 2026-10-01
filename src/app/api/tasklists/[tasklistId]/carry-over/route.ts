import { NextResponse } from 'next/server';
import { requireTasklistAccess } from '@/lib/auth/tasklist-access';
import { carryOverUnfinishedTasks } from '@/lib/db/carry-over-tasks';

// "Carry over unfinished tasks": copies the unfinished tasks of the owner's
// previous tasklist into this one. Owner only, while the list is open.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ tasklistId: string }> },
) {
  try {
    const { tasklistId } = await params;

    const access = await requireTasklistAccess(tasklistId, 'write');

    if (!access.ok) {
      return access.response;
    }

    if (access.tasklist.eodCapturedAt) {
      return NextResponse.json(
        {
          error:
            'This tasklist is locked because EOD has already been captured.',
        },
        { status: 409 },
      );
    }

    const result = await carryOverUnfinishedTasks(access.tasklist);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Carry over tasks error:', error);

    return NextResponse.json(
      { error: 'Failed to carry over tasks.' },
      { status: 500 },
    );
  }
}

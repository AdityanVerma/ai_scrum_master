import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/dal';
import { getLinkableSprintTasks } from '@/lib/db/sprint-task-links';

// The sprint tasks the signed-in member can link a daily task to: assigned
// to them, in an active sprint, not done yet. Each has the time left on it.
export async function GET() {
  try {
    const auth = await requireSession();

    if (!auth.ok) {
      return auth.response;
    }

    const tasks = await getLinkableSprintTasks(auth.member.id);

    return NextResponse.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error('Get linkable sprint tasks error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch your sprint tasks.' },
      { status: 500 },
    );
  }
}

import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/dal';
import { listDiaries } from '@/lib/db/sprint-diary';

// Past diaries (saved or published), newest first. Scrum Master only.
export async function GET() {
  try {
    const auth = await requireRole('SCRUM_MASTER');

    if (!auth.ok) {
      return auth.response;
    }

    const diaries = await listDiaries();

    return NextResponse.json({
      success: true,
      data: diaries.map((diary) => ({
        ...diary,
        date: diary.date.toISOString().slice(0, 10),
      })),
    });
  } catch (error) {
    console.error('Failed to list sprint diaries:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to list sprint diaries.' },
      { status: 500 },
    );
  }
}

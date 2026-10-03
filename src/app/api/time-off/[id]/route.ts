import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/dal';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// Remove one time-off entry. Scrum Master only.
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const auth = await requireRole('SCRUM_MASTER');

    if (!auth.ok) {
      return auth.response;
    }

    const { id } = await context.params;

    const deleted = await prisma.timeOff.deleteMany({ where: { id } });

    if (deleted.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Time off not found.' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete time off:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to delete time off.' },
      { status: 500 },
    );
  }
}

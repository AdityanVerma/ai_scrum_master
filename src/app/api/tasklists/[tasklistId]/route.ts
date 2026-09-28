import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tasklistId: string }> },
) {
  try {
    const { tasklistId } = await params;
    const body = await request.json();

    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'action is required.' },
        { status: 400 },
      );
    }

    if (!['SOD', 'EOD'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be SOD or EOD.' },
        { status: 400 },
      );
    }

    const tasklist = await prisma.dailyTasklist.findUnique({
      where: { id: tasklistId },
      include: {
        snapshots: true,
      },
    });

    if (!tasklist) {
      return NextResponse.json(
        { error: 'Tasklist not found.' },
        { status: 404 },
      );
    }

    if (action === 'SOD' && tasklist.sodCapturedAt) {
      return NextResponse.json(
        { error: 'SOD has already been captured for this tasklist.' },
        { status: 409 },
      );
    }

    if (action === 'EOD' && tasklist.eodCapturedAt) {
      return NextResponse.json(
        { error: 'EOD has already been captured for this tasklist.' },
        { status: 409 },
      );
    }

    const updatedTasklist = await prisma.$transaction(async (tx) => {
      const now = new Date();

      const updated = await tx.dailyTasklist.update({
        where: { id: tasklistId },
        data:
          action === 'SOD' ? { sodCapturedAt: now } : { eodCapturedAt: now },
      });

      const tasks = await tx.tasklistTask.findMany({
        where: { tasklistId },
        orderBy: { order: 'asc' },
      });

      await tx.tasklistSnapshot.create({
        data: {
          tasklistId,
          type: action,
          capturedAt: now,
          tasks,
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      data: updatedTasklist,
    });
  } catch (error) {
    console.error('SOD/EOD tracking error:', error);

    return NextResponse.json(
      { error: 'Failed to update SOD/EOD tracking.' },
      { status: 500 },
    );
  }
}

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
    });

    if (!tasklist) {
      return NextResponse.json(
        { error: 'Tasklist not found.' },
        { status: 404 },
      );
    }

    const updatedTasklist = await prisma.dailyTasklist.update({
      where: { id: tasklistId },
      data:
        action === 'SOD'
          ? { sodCapturedAt: new Date() }
          : { eodCapturedAt: new Date() },
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

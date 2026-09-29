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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tasklistId: string }> },
) {
  try {
    const { tasklistId } = await params;

    const tasklist = await prisma.dailyTasklist.findUnique({
      where: { id: tasklistId },
      include: {
        snapshots: {
          orderBy: {
            capturedAt: 'asc',
          },
        },
      },
    });

    if (!tasklist) {
      return NextResponse.json(
        { error: 'Tasklist not found.' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: tasklist.id,
        sodCapturedAt: tasklist.sodCapturedAt,
        eodCapturedAt: tasklist.eodCapturedAt,
        snapshots: tasklist.snapshots,
      },
    });
  } catch (error) {
    console.error('Get tasklist snapshots error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch tasklist snapshots.' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tasklistId: string }> },
) {
  try {
    const { tasklistId } = await params;
    const body = await request.json();

    const { sourceTaskId } = body;

    if (!sourceTaskId) {
      return NextResponse.json(
        { error: 'sourceTaskId is required.' },
        { status: 400 },
      );
    }

    const targetTasklist = await prisma.dailyTasklist.findUnique({
      where: { id: tasklistId },
    });

    if (!targetTasklist) {
      return NextResponse.json(
        { error: 'Target tasklist not found.' },
        { status: 404 },
      );
    }

    if (targetTasklist.eodCapturedAt) {
      return NextResponse.json(
        {
          error:
            'This tasklist is locked because EOD has already been captured.',
        },
        { status: 409 },
      );
    }

    const sourceTask = await prisma.tasklistTask.findUnique({
      where: { id: sourceTaskId },
    });

    if (!sourceTask) {
      return NextResponse.json(
        { error: 'Source task not found.' },
        { status: 404 },
      );
    }

    if (sourceTask.status === 'DONE') {
      return NextResponse.json(
        { error: 'Completed tasks cannot be carried forward.' },
        { status: 400 },
      );
    }

    const existingTasks = await prisma.tasklistTask.findMany({
      where: {
        tasklistId,
        parentTaskId: null,
      },
      orderBy: {
        order: 'desc',
      },
      take: 1,
    });

    const nextOrder = existingTasks.length > 0 ? existingTasks[0].order + 1 : 1;

    const carriedTask = await prisma.tasklistTask.create({
      data: {
        tasklistId,
        title: sourceTask.title,
        category: sourceTask.category,
        estimatedMins: sourceTask.estimatedMins,
        order: nextOrder,
        status: 'PENDING',
        priority: sourceTask.priority,
        carriedForwardFromId: sourceTask.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: carriedTask,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Carry forward task error:', error);

    return NextResponse.json(
      { error: 'Failed to carry forward task.' },
      { status: 500 },
    );
  }
}

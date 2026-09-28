import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tasklistId: string }> },
) {
  try {
    const { tasklistId } = await params;
    const body = await request.json();

    const { title, category, estimatedMins, order, parentTaskId } = body;

    if (!title || !category || !estimatedMins || order === undefined) {
      return NextResponse.json(
        {
          error: 'title, category, estimatedMins, and order are required.',
        },
        { status: 400 },
      );
    }

    const tasklist = await prisma.dailyTasklist.findUnique({
      where: {
        id: tasklistId,
      },
    });

    if (!tasklist) {
      return NextResponse.json(
        { error: 'Tasklist not found.' },
        { status: 404 },
      );
    }

    const task = await prisma.tasklistTask.create({
      data: {
        tasklistId,
        title,
        category,
        estimatedMins,
        order,
        parentTaskId: parentTaskId || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: task,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Create tasklist task error:', error);

    return NextResponse.json(
      { error: 'Failed to create task.' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tasklistId: string }> },
) {
  try {
    const { tasklistId } = await params;

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required.' },
        { status: 400 },
      );
    }

    const task = await prisma.tasklistTask.findFirst({
      where: {
        id: taskId,
        tasklistId,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
    }

    await prisma.tasklistTask.delete({
      where: {
        id: taskId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    console.error('Delete task error:', error);

    return NextResponse.json(
      { error: 'Failed to delete task.' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ tasklistId: string }> },
) {
  try {
    const { tasklistId } = await params;
    const body = await request.json();

    const { taskId, title, category, estimatedMins, status } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required.' },
        { status: 400 },
      );
    }

    const task = await prisma.tasklistTask.findFirst({
      where: {
        id: taskId,
        tasklistId,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
    }

    const updatedTask = await prisma.tasklistTask.update({
      where: {
        id: taskId,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(category !== undefined && { category }),
        ...(estimatedMins !== undefined && {
          estimatedMins: Number(estimatedMins),
        }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    console.error('Update task error:', error);

    return NextResponse.json(
      { error: 'Failed to update task.' },
      { status: 500 },
    );
  }
}

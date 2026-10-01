import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireTasklistAccess } from '@/lib/auth/tasklist-access';
import {
  isLinkableSprintTask,
  linkedSprintTaskSelect,
} from '@/lib/db/sprint-task-links';
import { prisma } from '@/lib/prisma';

// The optional link to a sprint task and the total estimate for multi-day
// work outside the sprint (PHASE-8 section 5). Both belong on a main task:
// subtasks follow their parent. A linked task uses the sprint task's
// estimate, so it has no total estimate of its own.
const linkFieldsSchema = z.object({
  sprintTaskId: z.string().min(1).nullable().optional(),
  totalEstimateMins: z
    .number('Total estimate must be a number of minutes.')
    .int('Total estimate must be whole minutes.')
    .positive('Total estimate must be more than 0.')
    .max(100_000)
    .nullable()
    .optional(),
});

const NOT_LINKABLE =
  'You can only link a sprint task that is assigned to you in an active sprint and is not done yet.';
const SUBTASK_LINK =
  "A subtask belongs to its parent's sprint task. Link the main task instead.";
const SUBTASK_TOTAL = 'Only a main task can have a total estimate.';
const LINKED_TOTAL =
  "A task linked to a sprint task uses the sprint task's estimate, so it has no total estimate.";

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tasklistId: string }> },
) {
  try {
    const { tasklistId } = await params;

    const access = await requireTasklistAccess(tasklistId, 'write');

    if (!access.ok) {
      return access.response;
    }
    const body = await request.json();

    const tasklist = await prisma.dailyTasklist.findUnique({
      where: { id: tasklistId },
    });

    if (!tasklist) {
      return NextResponse.json(
        { error: 'Tasklist not found.' },
        { status: 404 },
      );
    }

    if (tasklist.eodCapturedAt) {
      return NextResponse.json(
        {
          error:
            'This tasklist is locked because EOD has already been captured.',
        },
        { status: 409 },
      );
    }

    const { title, category, estimatedMins, order, parentTaskId, priority } =
      body;

    if (!title || !category || !estimatedMins || order === undefined) {
      return NextResponse.json(
        {
          error: 'title, category, estimatedMins, and order are required.',
        },
        { status: 400 },
      );
    }

    const links = linkFieldsSchema.safeParse(body);

    if (!links.success) {
      return badRequest(links.error.issues[0]?.message ?? 'Invalid task link.');
    }

    const { sprintTaskId, totalEstimateMins } = links.data;

    if (parentTaskId && sprintTaskId) {
      return badRequest(SUBTASK_LINK);
    }

    if (parentTaskId && totalEstimateMins) {
      return badRequest(SUBTASK_TOTAL);
    }

    if (sprintTaskId && totalEstimateMins) {
      return badRequest(LINKED_TOTAL);
    }

    if (
      sprintTaskId &&
      !(await isLinkableSprintTask(tasklist.memberId, sprintTaskId))
    ) {
      return badRequest(NOT_LINKABLE);
    }

    // A subtask's parent must be in the same list, never in someone else's.
    if (parentTaskId) {
      const parentTask = await prisma.tasklistTask.findFirst({
        where: { id: parentTaskId, tasklistId },
        select: { id: true },
      });

      if (!parentTask) {
        return NextResponse.json(
          { error: 'Parent task not found.' },
          { status: 404 },
        );
      }
    }

    const task = await prisma.tasklistTask.create({
      data: {
        tasklistId,
        title,
        category,
        estimatedMins,
        order,
        parentTaskId: parentTaskId || null,
        ...(priority !== undefined && { priority }),
        sprintTaskId: sprintTaskId ?? null,
        totalEstimateMins: totalEstimateMins ?? null,
      },
      include: { sprintTask: { select: linkedSprintTaskSelect } },
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

    const access = await requireTasklistAccess(tasklistId, 'write');

    if (!access.ok) {
      return access.response;
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required.' },
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

    if (tasklist.eodCapturedAt) {
      return NextResponse.json(
        {
          error:
            'This tasklist is locked because EOD has already been captured.',
        },
        { status: 409 },
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

    const access = await requireTasklistAccess(tasklistId, 'write');

    if (!access.ok) {
      return access.response;
    }
    const body = await request.json();

    const { taskId, title, category, estimatedMins, status, priority } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required.' },
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

    if (tasklist.eodCapturedAt) {
      return NextResponse.json(
        {
          error:
            'This tasklist is locked because EOD has already been captured.',
        },
        { status: 409 },
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

    const links = linkFieldsSchema.safeParse(body);

    if (!links.success) {
      return badRequest(links.error.issues[0]?.message ?? 'Invalid task link.');
    }

    const { sprintTaskId, totalEstimateMins } = links.data;

    // Fields that are not sent keep their current value.
    const nextLink =
      sprintTaskId === undefined ? task.sprintTaskId : sprintTaskId;

    if (task.parentTaskId && sprintTaskId) {
      return badRequest(SUBTASK_LINK);
    }

    if (task.parentTaskId && totalEstimateMins) {
      return badRequest(SUBTASK_TOTAL);
    }

    if (nextLink && totalEstimateMins) {
      return badRequest(LINKED_TOTAL);
    }

    // Only a new link is checked, so a task linked earlier can still be
    // edited after its sprint task was reassigned or finished.
    if (
      sprintTaskId &&
      sprintTaskId !== task.sprintTaskId &&
      !(await isLinkableSprintTask(tasklist.memberId, sprintTaskId))
    ) {
      return badRequest(NOT_LINKABLE);
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
        ...(priority !== undefined && { priority }),
        ...(sprintTaskId !== undefined && { sprintTaskId }),
        // Linking a task clears its total estimate.
        ...(nextLink
          ? { totalEstimateMins: null }
          : totalEstimateMins !== undefined && { totalEstimateMins }),
      },
      include: { sprintTask: { select: linkedSprintTaskSelect } },
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

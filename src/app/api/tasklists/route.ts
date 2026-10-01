import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/dal';
import { prisma } from '@/lib/prisma';
import { createTasklist } from '@/lib/db/create-tasklist';
import { linkedSprintTaskSelect } from '@/lib/db/sprint-task-links';

export async function GET(request: Request) {
  try {
    const auth = await requireSession();

    if (!auth.ok) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);

    // A member always reads their own list. Only the Scrum Master may ask
    // for someone else's.
    const memberId = searchParams.get('memberId') ?? auth.member.id;
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'date is required.' },
        { status: 400 },
      );
    }

    if (
      memberId !== auth.member.id &&
      auth.member.accessRole !== 'SCRUM_MASTER'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'You can only view your own tasklist.',
        },
        { status: 403 },
      );
    }

    const tasklist = await prisma.dailyTasklist.findUnique({
      where: {
        memberId_date: {
          memberId,
          date: new Date(date),
        },
      },
      include: {
        member: true,
        tasks: {
          orderBy: {
            order: 'asc',
          },
          include: {
            sprintTask: { select: linkedSprintTaskSelect },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: tasklist,
    });
  } catch (error) {
    console.error('Get tasklist error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch tasklist.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireSession();

    if (!auth.ok) {
      return auth.response;
    }

    const body = await request.json();

    const { date } = body;

    // The list always belongs to the signed-in member, never to whoever the
    // request body names.
    const memberId = auth.member.id;

    if (!date) {
      return NextResponse.json(
        { error: 'date is required.' },
        { status: 400 },
      );
    }

    if (body.memberId && body.memberId !== memberId) {
      return NextResponse.json(
        {
          success: false,
          error: 'You can only create your own tasklist.',
        },
        { status: 403 },
      );
    }

    const existingTasklist = await prisma.dailyTasklist.findUnique({
      where: {
        memberId_date: {
          memberId,
          date: new Date(date),
        },
      },
    });

    if (existingTasklist) {
      return NextResponse.json({
        success: true,
        data: existingTasklist,
      });
    }

    const tasklist = await createTasklist({
      memberId,
      date: new Date(date),
    });

    return NextResponse.json(
      {
        success: true,
        data: tasklist,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Create tasklist error:', error);

    return NextResponse.json(
      { error: 'Failed to create tasklist.' },
      { status: 500 },
    );
  }
}

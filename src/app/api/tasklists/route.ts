import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTasklist } from '@/lib/db/create-tasklist';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const memberId = searchParams.get('memberId');
    const date = searchParams.get('date');

    if (!memberId || !date) {
      return NextResponse.json(
        { error: 'memberId and date are required.' },
        { status: 400 },
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
    const body = await request.json();

    const { memberId, date } = body;

    if (!memberId || !date) {
      return NextResponse.json(
        { error: 'memberId and date are required.' },
        { status: 400 },
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

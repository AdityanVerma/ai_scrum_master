import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sprints = await prisma.sprint.findMany({
      include: {
        tasks: {
          include: {
            skills: true,
            dependencies: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: sprints.length,
      sprints,
    });
  } catch (error) {
    console.error('Database test failed:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Database query failed.',
      },
      { status: 500 },
    );
  }
}

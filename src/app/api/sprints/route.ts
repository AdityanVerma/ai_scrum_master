import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, requireSession } from '@/lib/auth/dal';
import { getSprints } from '@/lib/db/get-sprints';
import { saveSprintProposal } from '@/lib/db/save-sprint-proposal';
import { WORK_TYPES } from '@/lib/work-types';

const proposalTaskSchema = z.object({
  id: z.string().trim().min(1).max(50),
  title: z.string().trim().min(1, 'Every task needs a title.').max(300),
  description: z.string().trim().max(5000),
  functionName: z.string().trim().max(200).nullable(),
  category: z.enum(WORK_TYPES, 'Choose one of the work types.'),
  skills: z.array(z.string().trim().min(1).max(100)).max(30),
  complexity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  estimatedHours: z.number().positive().max(1000),
  dependsOn: z.array(z.string()).max(200),
});

// The proposal from POST /api/sprint-planning, minus any tasks the Scrum
// Master removed on the preview.
const sprintProposalSchema = z.object({
  name: z.string().trim().min(1, 'Sprint name is required.').max(200),
  goal: z.string().trim().min(1, 'Sprint goal is required.').max(5000),
  duration: z.object({
    startDate: z.iso.date('Start date must be a date (YYYY-MM-DD).'),
    endDate: z.iso.date('End date must be a date (YYYY-MM-DD).'),
  }),
  functions: z
    .array(z.string().trim().min(1).max(200))
    .min(1, 'A sprint needs at least one function.')
    .max(50),
  tasks: z
    .array(proposalTaskSchema)
    .min(1, 'A sprint needs at least one task.')
    .max(200),
});

export async function GET() {
  try {
    const auth = await requireSession();

    if (!auth.ok) {
      return auth.response;
    }

    const sprints = await getSprints();

    return NextResponse.json({
      success: true,
      data: sprints,
    });
  } catch (error) {
    console.error('Failed to fetch sprints:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch sprints.',
      },
      { status: 500 },
    );
  }
}

// Save a planned sprint. Scrum Master only.
export async function POST(request: Request) {
  try {
    const auth = await requireRole('SCRUM_MASTER');

    if (!auth.ok) {
      return auth.response;
    }

    const parsed = sprintProposalSchema.safeParse(
      await request.json().catch(() => null),
    );

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? 'Invalid sprint proposal.',
        },
        { status: 400 },
      );
    }

    const sprint = await saveSprintProposal(parsed.data);

    return NextResponse.json(
      {
        success: true,
        data: sprint,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Failed to save sprint:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to save sprint.',
      },
      { status: 400 },
    );
  }
}

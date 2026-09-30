import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, requireSession } from '@/lib/auth/dal';
import { getTeamMember } from '@/lib/db/get-team-member';
import {
  updateTeamMember,
  type UpdateTeamMemberInput,
} from '@/lib/db/update-team-member';
import { deleteTeamMember } from '@/lib/db/delete-team-member';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// Every field is optional: only the fields sent are changed.
const updateMemberSchema = z.object({
  name: z.string().max(100).optional(),
  role: z.string().max(100).optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email('Enter a valid email address.').max(200))
    .optional(),
  skills: z.array(z.string().max(100)).max(50).optional(),
});

// Get Member
export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await requireSession();

    if (!auth.ok) {
      return auth.response;
    }

    const { id } = await context.params;

    const teamMember = await getTeamMember(id);

    if (!teamMember) {
      return NextResponse.json(
        {
          success: false,
          error: 'Team member not found.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: teamMember,
    });
  } catch (error) {
    console.error('Failed to get team member:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to get team member.',
      },
      { status: 500 },
    );
  }
}

// Update Member
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireSession();

    if (!auth.ok) {
      return auth.response;
    }

    const { id } = await context.params;
    const isScrumMaster = auth.member.accessRole === 'SCRUM_MASTER';

    if (!isScrumMaster && auth.member.id !== id) {
      return NextResponse.json(
        {
          success: false,
          error: 'You can only edit your own profile.',
        },
        { status: 403 },
      );
    }

    const parsed = updateMemberSchema.safeParse(
      await request.json().catch(() => null),
    );

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? 'Invalid profile details.',
        },
        { status: 400 },
      );
    }

    const body: UpdateTeamMemberInput = parsed.data;

    if (!isScrumMaster && body.role !== undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only the Scrum Master can change a job title.',
        },
        { status: 403 },
      );
    }

    // The email is the sign-in name, so only the Scrum Master changes it.
    if (!isScrumMaster && body.email !== undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only the Scrum Master can change an email address.',
        },
        { status: 403 },
      );
    }

    if (body.email !== undefined) {
      const emailTaken = await prisma.teamMember.findFirst({
        where: { email: body.email, NOT: { id } },
        select: { id: true },
      });

      if (emailTaken) {
        return NextResponse.json(
          {
            success: false,
            error: 'A team member with this email already exists.',
          },
          { status: 409 },
        );
      }
    }

    const teamMember = await updateTeamMember(id, body);

    return NextResponse.json({
      success: true,
      data: teamMember,
    });
  } catch (error) {
    console.error('Failed to update team member:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update team member.',
      },
      { status: 400 },
    );
  }
}

// Delete Member
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const auth = await requireRole('SCRUM_MASTER');

    if (!auth.ok) {
      return auth.response;
    }

    const { id } = await context.params;

    // The caller is an active Scrum Master, so refusing self-deletion also
    // guarantees at least one active Scrum Master remains.
    if (id === auth.member.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'You cannot delete your own account.',
        },
        { status: 400 },
      );
    }

    await deleteTeamMember(id);

    return NextResponse.json({
      success: true,
      message: 'Team member deleted successfully.',
    });
  } catch (error) {
    console.error('Failed to delete team member:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete team member.',
      },
      { status: 400 },
    );
  }
}

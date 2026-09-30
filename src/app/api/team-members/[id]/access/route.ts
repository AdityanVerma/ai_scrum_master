import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole } from '@/lib/auth/dal';
import { setTeamMemberActive } from '@/lib/db/set-team-member-active';

type RouteContext = {
  params: Promise<{ id: string }>;
};

const accessSchema = z.object({
  isActive: z.boolean(),
});

// Deactivate / reactivate a member. Scrum Master only.
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireRole('SCRUM_MASTER');

    if (!auth.ok) {
      return auth.response;
    }

    const { id } = await context.params;

    const parsed = accessSchema.safeParse(
      await request.json().catch(() => null),
    );

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'isActive must be true or false.',
        },
        { status: 400 },
      );
    }

    // The caller is an active Scrum Master, so refusing self-deactivation also
    // guarantees at least one active Scrum Master remains.
    if (id === auth.member.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'You cannot deactivate your own account.',
        },
        { status: 400 },
      );
    }

    const teamMember = await setTeamMemberActive(id, parsed.data.isActive);

    return NextResponse.json({
      success: true,
      data: teamMember,
    });
  } catch (error) {
    console.error('Failed to change team member access:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to change team member access.',
      },
      { status: 400 },
    );
  }
}

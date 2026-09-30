import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole } from '@/lib/auth/dal';
import { hashPassword, validateNewPassword } from '@/lib/auth/password';
import { resetTeamMemberPassword } from '@/lib/db/reset-team-member-password';

type RouteContext = {
  params: Promise<{ id: string }>;
};

const resetPasswordSchema = z.object({
  temporaryPassword: z.string().max(200),
});

// Scrum Master sets a temporary password; the member must change it at their
// next login. Scrum Masters change their own password on /change-password.
export async function POST(request: Request, context: RouteContext) {
  try {
    const auth = await requireRole('SCRUM_MASTER');

    if (!auth.ok) {
      return auth.response;
    }

    const { id } = await context.params;

    if (id === auth.member.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Use Change Password to change your own password.',
        },
        { status: 400 },
      );
    }

    const parsed = resetPasswordSchema.safeParse(
      await request.json().catch(() => null),
    );

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'A temporary password is required.',
        },
        { status: 400 },
      );
    }

    const { temporaryPassword } = parsed.data;

    const passwordError = validateNewPassword(temporaryPassword);

    if (passwordError) {
      return NextResponse.json(
        { success: false, error: passwordError },
        { status: 400 },
      );
    }

    await resetTeamMemberPassword(id, await hashPassword(temporaryPassword));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reset team member password:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to reset password.',
      },
      { status: 400 },
    );
  }
}

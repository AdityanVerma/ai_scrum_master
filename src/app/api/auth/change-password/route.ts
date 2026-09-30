import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth/dal';
import {
  hashPassword,
  validateNewPassword,
  verifyPassword,
} from '@/lib/auth/password';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  try {
    const auth = await requireSession();

    if (!auth.ok) {
      return auth.response;
    }

    const parsed = changePasswordSchema.safeParse(
      await request.json().catch(() => null),
    );

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Current password and new password are required.',
        },
        { status: 400 },
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    const passwordError = validateNewPassword(newPassword);

    if (passwordError) {
      return NextResponse.json(
        { success: false, error: passwordError },
        { status: 400 },
      );
    }

    if (newPassword === currentPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'New password must be different from the current one.',
        },
        { status: 400 },
      );
    }

    const member = await prisma.teamMember.findUnique({
      where: { id: auth.member.id },
      select: { passwordHash: true },
    });

    const currentMatches = await verifyPassword(
      currentPassword,
      member?.passwordHash,
    );

    if (!currentMatches) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect.' },
        { status: 400 },
      );
    }

    await prisma.teamMember.update({
      where: { id: auth.member.id },
      data: {
        passwordHash: await hashPassword(newPassword),
        mustChangePassword: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to change password:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to change password.' },
      { status: 500 },
    );
  }
}

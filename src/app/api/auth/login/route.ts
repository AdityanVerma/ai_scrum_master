import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth/session';
import { verifyPassword } from '@/lib/auth/password';
import {
  checkLoginAllowed,
  clearLoginFailures,
  recordLoginFailure,
} from '@/lib/auth/login-limiter';

const loginSchema = z.object({
  email: z.string().min(1).max(200),
  password: z.string().min(1).max(200),
});

function getClientIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
}

export async function POST(request: Request) {
  try {
    const parsed = loginSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 },
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const { password } = parsed.data;
    const key = `${email}|${getClientIp(request)}`;

    const limit = checkLoginAllowed(key);

    if (!limit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed attempts. Try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minute(s).`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(limit.retryAfterSeconds) },
        },
      );
    }

    const member = await prisma.teamMember.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        accessRole: true,
        isActive: true,
        mustChangePassword: true,
        passwordHash: true,
      },
    });

    // Always compare, even when there is no such member, so timing does not
    // reveal whether an email exists.
    const passwordMatches = await verifyPassword(
      password,
      member?.passwordHash,
    );

    if (!member || !member.isActive || !passwordMatches) {
      recordLoginFailure(key);

      return NextResponse.json(
        { success: false, error: 'Incorrect email or password.' },
        { status: 401 },
      );
    }

    clearLoginFailures(key);

    await createSession({
      memberId: member.id,
      accessRole: member.accessRole,
    });

    return NextResponse.json({
      success: true,
      data: {
        member: {
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role,
          accessRole: member.accessRole,
          mustChangePassword: member.mustChangePassword,
        },
      },
    });
  } catch (error) {
    console.error('Failed to log in:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to log in.' },
      { status: 500 },
    );
  }
}

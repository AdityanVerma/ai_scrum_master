import { NextResponse } from 'next/server';
import type { AccessRole } from '@/generated/prisma/enums';
import { prisma } from '@/lib/prisma';
import { readSession } from '@/lib/auth/session';

export type CurrentMember = {
  id: string;
  name: string;
  email: string | null;
  role: string;
  accessRole: AccessRole;
  mustChangePassword: boolean;
};

export type AuthResult =
  | { ok: true; member: CurrentMember }
  | { ok: false; response: NextResponse };

function fail(status: number, error: string): AuthResult {
  return {
    ok: false,
    response: NextResponse.json({ success: false, error }, { status }),
  };
}

// The signed-in member, read fresh from the database on every call, so a
// deactivated member is rejected immediately even if their cookie is still valid.
export async function getCurrentMember(): Promise<CurrentMember | null> {
  const session = await readSession();

  if (!session) {
    return null;
  }

  const member = await prisma.teamMember.findUnique({
    where: { id: session.memberId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      accessRole: true,
      isActive: true,
      mustChangePassword: true,
    },
  });

  if (!member || !member.isActive) {
    return null;
  }

  return {
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    accessRole: member.accessRole,
    mustChangePassword: member.mustChangePassword,
  };
}

// For route handlers. Usage:
//   const auth = await requireSession();
//   if (!auth.ok) return auth.response;
//   const member = auth.member;
export async function requireSession(): Promise<AuthResult> {
  const member = await getCurrentMember();

  if (!member) {
    return fail(401, 'Not signed in.');
  }

  return { ok: true, member };
}

export async function requireRole(role: AccessRole): Promise<AuthResult> {
  const auth = await requireSession();

  if (!auth.ok) {
    return auth;
  }

  if (auth.member.accessRole !== role) {
    return fail(403, 'You do not have permission to do this.');
  }

  return auth;
}

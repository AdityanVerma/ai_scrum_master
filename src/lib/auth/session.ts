import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import type { AccessRole } from '@/generated/prisma/enums';
import { SESSION_COOKIE } from '@/lib/auth/constants';

const SESSION_DAYS = 7;

export type SessionPayload = {
  memberId: string;
  accessRole: AccessRole;
};

function getKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      'AUTH_SECRET must be set to a random string of at least 32 characters.',
    );
  }

  return new TextEncoder().encode(secret);
}

// Signs a session token and stores it in an httpOnly cookie.
// Only call this from a route handler or server function.
export async function createSession({ memberId, accessRole }: SessionPayload) {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  const token = await new SignJWT({ accessRole })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(memberId)
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getKey());

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

// Returns the payload of a valid, unexpired session cookie, otherwise null.
// This only proves the cookie is genuine: use getCurrentMember() in dal.ts to
// check the member still exists and is active.
export async function readSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const key = getKey();

  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });

    if (
      !payload.sub ||
      (payload.accessRole !== 'SCRUM_MASTER' && payload.accessRole !== 'MEMBER')
    ) {
      return null;
    }

    return { memberId: payload.sub, accessRole: payload.accessRole };
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

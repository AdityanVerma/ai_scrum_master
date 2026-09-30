import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/dal';

export async function GET() {
  const auth = await requireSession();

  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json({
    success: true,
    data: { member: auth.member },
  });
}

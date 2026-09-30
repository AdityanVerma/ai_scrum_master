import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, requireSession } from '@/lib/auth/dal';
import { hashPassword, validateNewPassword } from '@/lib/auth/password';
import { createTeamMember } from '@/lib/db/create-team-member';
import { getTeamMembers } from '@/lib/db/get-team-members';
import { prisma } from '@/lib/prisma';

const addMemberSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(100),
  role: z.string().trim().min(1, 'Job title is required.').max(100),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email('Enter a valid email address.').max(200)),
  skills: z.array(z.string().max(100)).max(50).default([]),
  temporaryPassword: z.string().max(200),
  accessRole: z.enum(['SCRUM_MASTER', 'MEMBER']).default('MEMBER'),
});

// Add/Create Team-Member
export async function POST(request: Request) {
  try {
    const auth = await requireRole('SCRUM_MASTER');

    if (!auth.ok) {
      return auth.response;
    }

    const parsed = addMemberSchema.safeParse(
      await request.json().catch(() => null),
    );

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsed.error.issues[0]?.message ?? 'Invalid team member details.',
        },
        { status: 400 },
      );
    }

    const { name, role, email, skills, temporaryPassword, accessRole } =
      parsed.data;

    const passwordError = validateNewPassword(temporaryPassword);

    if (passwordError) {
      return NextResponse.json(
        { success: false, error: passwordError },
        { status: 400 },
      );
    }

    const emailTaken = await prisma.teamMember.findUnique({
      where: { email },
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

    const teamMember = await createTeamMember({
      name,
      role,
      skills,
      email,
      passwordHash: await hashPassword(temporaryPassword),
      accessRole,
    });

    return NextResponse.json(
      {
        success: true,
        data: teamMember,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Failed to create team member:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create team member.',
      },
      { status: 500 },
    );
  }
}

// Get all Team-Members
export async function GET() {
  try {
    const auth = await requireSession();

    if (!auth.ok) {
      return auth.response;
    }

    const teamMembers = await getTeamMembers();

    return NextResponse.json({
      success: true,
      data: teamMembers,
    });
  } catch (error) {
    console.error('Failed to get team members:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get team members.',
      },
      { status: 500 },
    );
  }
}

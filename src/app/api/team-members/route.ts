import { NextResponse } from 'next/server';
import {
  createTeamMember,
  type CreateTeamMemberInput,
} from '@/lib/db/create-team-member';
import { getTeamMembers } from '@/lib/db/get-team-members';

// Add/Create Team-Member
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateTeamMemberInput;

    if (!body.name || !body.role) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and role are required.',
        },
        { status: 400 },
      );
    }

    const teamMember = await createTeamMember({
      name: body.name,
      role: body.role,
      skills: body.skills ?? [],
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

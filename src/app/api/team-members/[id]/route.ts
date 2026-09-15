import { NextResponse } from 'next/server';
import { getTeamMember } from '@/lib/db/get-team-member';
import {
  updateTeamMember,
  type UpdateTeamMemberInput,
} from '@/lib/db/update-team-member';
import { deleteTeamMember } from '@/lib/db/delete-team-member';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// Get Member
export async function GET(_request: Request, context: RouteContext) {
  try {
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
    const { id } = await context.params;

    const body = (await request.json()) as UpdateTeamMemberInput;

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
    const { id } = await context.params;

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

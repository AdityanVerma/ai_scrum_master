import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession, type AuthResult } from '@/lib/auth/dal';
import { updateDocument } from '@/lib/db/update-document';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// Every field is optional: only the fields sent are changed.
const updateDocumentSchema = z.object({
  title: z.string().max(200).optional(),
  type: z.string().max(100).optional(),
  content: z.string().max(200_000).optional(),
  url: z.string().max(2000).optional(),
  sprintId: z.string().nullable().optional(),
  tagNames: z.array(z.string().max(50)).max(30).optional(),
});

function fail(status: number, error: string): AuthResult {
  return {
    ok: false,
    response: NextResponse.json({ success: false, error }, { status }),
  };
}

// Members may change only documents they added. The Scrum Master may change
// any, including older documents that have no recorded author.
async function requireDocumentAccess(id: string): Promise<AuthResult> {
  const auth = await requireSession();

  if (!auth.ok) {
    return auth;
  }

  const document = await prisma.document.findUnique({
    where: { id },
    select: { createdById: true },
  });

  if (!document) {
    return fail(404, 'Document not found.');
  }

  if (
    auth.member.accessRole !== 'SCRUM_MASTER' &&
    document.createdById !== auth.member.id
  ) {
    return fail(403, 'You can only change documents you added.');
  }

  return auth;
}

// Edit Document
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const access = await requireDocumentAccess(id);

    if (!access.ok) {
      return access.response;
    }

    const parsed = updateDocumentSchema.safeParse(
      await request.json().catch(() => null),
    );

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? 'Invalid document details.',
        },
        { status: 400 },
      );
    }

    const document = await updateDocument(id, parsed.data);

    return NextResponse.json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error('Failed to update document:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update document.',
      },
      { status: 400 },
    );
  }
}

// Delete Document
export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const access = await requireDocumentAccess(id);

    if (!access.ok) {
      return access.response;
    }

    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully.',
    });
  } catch (error) {
    console.error('Failed to delete document:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete document.',
      },
      { status: 400 },
    );
  }
}

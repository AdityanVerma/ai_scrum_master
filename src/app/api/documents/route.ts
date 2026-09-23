import { NextResponse } from 'next/server';
import { getDocuments } from '@/lib/db/get-documents';
import {
  createDocument,
  type CreateDocumentInput,
} from '@/lib/db/create-document';

// GET Documents
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sprintId = searchParams.get('sprintId') ?? undefined;

    const documents = await getDocuments(sprintId);

    return NextResponse.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error('Document retrieval failed:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Document retrieval failed.',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const title = String(formData.get('title') ?? '');
    const type = String(formData.get('type') ?? '');
    const sourceType = String(formData.get('sourceType') ?? 'DOCUMENT') as
      'DOCUMENT' | 'LINK' | 'UPLOAD';

    const sprintId = String(formData.get('sprintId') ?? '');
    const tagNames = String(formData.get('tagNames') ?? '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    const content =
      sourceType === 'DOCUMENT'
        ? String(formData.get('content') ?? '')
        : undefined;

    const url =
      sourceType === 'LINK' ? String(formData.get('url') ?? '') : undefined;

    const file =
      sourceType === 'UPLOAD' ? (formData.get('file') as File | null) : null;

    if (sourceType === 'UPLOAD' && !file) {
      return NextResponse.json(
        { error: 'Document file is required.' },
        { status: 400 },
      );
    }

    if (sourceType === 'UPLOAD') {
      return NextResponse.json(
        {
          error:
            'File storage and document extraction are not implemented yet.',
        },
        { status: 501 },
      );
    }

    const document = await createDocument({
      title,
      type,
      sourceType: sourceType as 'DOCUMENT' | 'LINK',
      content,
      url,
      sprintId: sprintId || undefined,
      tagNames,
    });

    return NextResponse.json(
      {
        success: true,
        data: document,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Document upload error:', error);

    return NextResponse.json(
      { error: 'Failed to process document.' },
      { status: 500 },
    );
  }
}

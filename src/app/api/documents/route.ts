import { NextResponse } from 'next/server';
import { getDocuments } from '@/lib/db/get-documents';
import {
  createDocument,
  type CreateDocumentInput,
} from '@/lib/db/create-document';

// GET Documents
export async function GET() {
  try {
    const documents = await getDocuments();

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
    const body = (await request.json()) as CreateDocumentInput;

    const document = await createDocument(body);

    return NextResponse.json(
      {
        success: true,
        data: document,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Document creation failed:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Document creation failed.',
      },
      { status: 400 },
    );
  }
}

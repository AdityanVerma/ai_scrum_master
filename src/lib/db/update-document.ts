import { prisma } from '@/lib/prisma';
import { isHttpUrl } from '@/lib/http-url';
import { buildTagRelations, documentInclude } from '@/lib/db/create-document';

export type UpdateDocumentInput = {
  title?: string;
  type?: string;
  content?: string;
  url?: string;
  // null moves the document to general documentation.
  sprintId?: string | null;
  // Replaces all tags.
  tagNames?: string[];
};

// Only the fields sent are changed. The source type (text or link) cannot
// change, so content is only accepted for text and url only for links.
export async function updateDocument(id: string, input: UpdateDocumentInput) {
  const document = await prisma.document.findUnique({
    where: { id },
    select: { sourceType: true },
  });

  if (!document) {
    throw new Error('Document not found.');
  }

  const title = input.title?.trim();
  const type = input.type?.trim();
  const content = input.content?.trim();
  const url = input.url?.trim();

  if (title !== undefined && !title) {
    throw new Error('Document title is required.');
  }

  if (type !== undefined && !type) {
    throw new Error('Document type is required.');
  }

  if (content !== undefined) {
    if (document.sourceType !== 'DOCUMENT') {
      throw new Error('This document is a link, so it has no content.');
    }

    if (!content) {
      throw new Error('Document content is required.');
    }
  }

  if (url !== undefined) {
    if (document.sourceType !== 'LINK') {
      throw new Error('This document is not a link.');
    }

    if (!isHttpUrl(url)) {
      throw new Error('Document URL must start with http:// or https://.');
    }
  }

  if (input.sprintId) {
    const sprint = await prisma.sprint.findUnique({
      where: { id: input.sprintId },
      select: { id: true },
    });

    if (!sprint) {
      throw new Error('Sprint not found.');
    }
  }

  const tags =
    input.tagNames === undefined
      ? undefined
      : await buildTagRelations(input.tagNames);

  return prisma.document.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(type !== undefined && { type }),
      ...(content !== undefined && { content }),
      ...(url !== undefined && { url }),
      ...(input.sprintId !== undefined && { sprintId: input.sprintId }),
      ...(tags !== undefined && { tags: { deleteMany: {}, create: tags } }),
    },
    include: documentInclude,
  });
}

import { prisma } from '@/lib/prisma';

export type CreateDocumentInput = {
  title: string;
  type: string;
  sourceType: 'DOCUMENT' | 'LINK';
  content?: string;
  url?: string;
  source?: 'MANUAL' | 'AI_GENERATED';
  sprintId?: string;
  tagNames?: string[];
};

export async function createDocument(input: CreateDocumentInput) {
  const {
    title,
    type,
    sourceType,
    content,
    url,
    source = 'MANUAL',
    sprintId,
    tagNames = [],
  } = input;

  if (!title.trim()) {
    throw new Error('Document title is required.');
  }

  if (!type.trim()) {
    throw new Error('Document type is required.');
  }

  if (sourceType === 'DOCUMENT' && !content?.trim()) {
    throw new Error('Document content is required.');
  }

  if (sourceType === 'LINK' && !url?.trim()) {
    throw new Error('Document URL is required.');
  }

  if (sprintId) {
    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
    });

    if (!sprint) {
      throw new Error('Sprint not found.');
    }
  }

  const normalizedTags = [
    ...new Set(tagNames.map((tag) => tag.trim().toLowerCase()).filter(Boolean)),
  ];

  return prisma.document.create({
    data: {
      title: title.trim(),
      type: type.trim(),
      sourceType,
      content: sourceType === 'DOCUMENT' ? content?.trim() : null,
      url: sourceType === 'LINK' ? url?.trim() : null,
      source,
      sprintId,
      tags: {
        create: await Promise.all(
          normalizedTags.map(async (name) => {
            const tag = await prisma.documentTag.upsert({
              where: { name },
              update: {},
              create: { name },
            });

            return {
              tag: {
                connect: { id: tag.id },
              },
            };
          }),
        ),
      },
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });
}

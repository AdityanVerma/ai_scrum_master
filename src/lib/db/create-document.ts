import { prisma } from '@/lib/prisma';
import { isHttpUrl } from '@/lib/http-url';

// What every document response includes, so pages can show the tags, the
// sprint and who added it (which decides who may edit or delete it).
export const documentInclude = {
  tags: {
    include: {
      tag: true,
    },
  },
  sprint: {
    select: {
      id: true,
      name: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

export type CreateDocumentInput = {
  title: string;
  type: string;
  sourceType: 'DOCUMENT' | 'LINK';
  content?: string;
  url?: string;
  source?: 'MANUAL' | 'AI_GENERATED';
  sprintId?: string;
  tagNames?: string[];
  createdById?: string;
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
    createdById,
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

  if (sourceType === 'LINK' && !isHttpUrl(url!.trim())) {
    throw new Error('Document URL must start with http:// or https://.');
  }

  if (sprintId) {
    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
    });

    if (!sprint) {
      throw new Error('Sprint not found.');
    }
  }

  return prisma.document.create({
    data: {
      title: title.trim(),
      type: type.trim(),
      sourceType,
      content: sourceType === 'DOCUMENT' ? content?.trim() : null,
      url: sourceType === 'LINK' ? url?.trim() : null,
      source,
      sprintId,
      createdById,
      tags: {
        create: await buildTagRelations(tagNames),
      },
    },
    include: documentInclude,
  });
}

// Tag names are stored lower-case and unique; missing tags are created.
export async function buildTagRelations(tagNames: string[]) {
  const normalizedTags = [
    ...new Set(tagNames.map((tag) => tag.trim().toLowerCase()).filter(Boolean)),
  ];

  return Promise.all(
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
  );
}

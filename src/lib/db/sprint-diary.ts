import { prisma } from '@/lib/prisma';
import type { DiaryHeader } from '@/lib/sprint-diary/format';

// Thrown when a published diary would be changed; the routes answer 409.
export class DiaryPublishedError extends Error {
  constructor() {
    super('This diary is published and can no longer be changed.');
  }
}

function toHeader(diary: DiaryHeader): DiaryHeader {
  return {
    phase: diary.phase,
    macroScope: diary.macroScope,
    microScope: diary.microScope,
    status: diary.status,
  };
}

// The header for a date: the one saved for that date; otherwise a copy of the
// latest earlier diary (the header changes slowly); otherwise a new header
// with one macro-scope line per active sprint.
export async function getDiary(date: Date) {
  const saved = await prisma.sprintDiary.findUnique({
    where: { date },
    include: { publishedBy: { select: { id: true, name: true } } },
  });

  if (saved) {
    return {
      header: toHeader(saved),
      headerSource: 'saved' as const,
      copiedFrom: null,
      published:
        saved.publishedAt && saved.publishedText !== null
          ? {
              text: saved.publishedText,
              publishedAt: saved.publishedAt,
              publishedBy: saved.publishedBy,
            }
          : null,
    };
  }

  const previous = await prisma.sprintDiary.findFirst({
    where: { date: { lt: date } },
    orderBy: { date: 'desc' },
  });

  if (previous) {
    return {
      header: toHeader(previous),
      headerSource: 'previous' as const,
      copiedFrom: previous.date,
      published: null,
    };
  }

  const sprints = await prisma.sprint.findMany({
    where: { status: 'ACTIVE' },
    select: { name: true, goal: true },
    orderBy: { startDate: 'asc' },
  });

  return {
    header: {
      phase: '',
      macroScope: sprints
        .map(
          (sprint) =>
            `${sprint.name} - ${sprint.goal.replace(/\s+/g, ' ').trim()}`,
        )
        .join('\n'),
      microScope: '',
      status: null,
    },
    headerSource: 'new' as const,
    copiedFrom: null,
    published: null,
  };
}

// Saves the header; refused once the diary is published.
export async function saveDiaryHeader(date: Date, header: DiaryHeader) {
  await prisma.sprintDiary.upsert({
    where: { date },
    create: { date, ...header },
    update: {},
  });

  const updated = await prisma.sprintDiary.updateMany({
    where: { date, publishedAt: null },
    data: header,
  });

  if (updated.count === 0) {
    throw new DiaryPublishedError();
  }
}

// Saves the header and the exact text that was posted. Only the first
// publish goes through, so two clicks cannot store two different texts.
export async function publishDiary(
  date: Date,
  header: DiaryHeader,
  text: string,
  publishedById: string,
) {
  await prisma.sprintDiary.upsert({
    where: { date },
    create: { date, ...header },
    update: {},
  });

  const updated = await prisma.sprintDiary.updateMany({
    where: { date, publishedAt: null },
    data: {
      ...header,
      publishedText: text,
      publishedAt: new Date(),
      publishedById,
    },
  });

  if (updated.count === 0) {
    throw new DiaryPublishedError();
  }
}

// Diaries with a saved header, newest first; published ones have the time
// and who published them.
export async function listDiaries() {
  return prisma.sprintDiary.findMany({
    select: {
      date: true,
      status: true,
      publishedAt: true,
      publishedBy: { select: { id: true, name: true } },
    },
    orderBy: { date: 'desc' },
    take: 100,
  });
}

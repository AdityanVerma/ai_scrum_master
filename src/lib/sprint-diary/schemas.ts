import { z } from 'zod';
import { DIARY_STATUSES } from '@/lib/sprint-diary/format';

// Shared by the diary routes.

export const diaryDateSchema = z.iso.date(
  'The diary date must be a date (YYYY-MM-DD).',
);

export const diaryHeaderSchema = z.object({
  phase: z
    .string()
    .max(500, 'Keep the phase under 500 characters.')
    .default(''),
  macroScope: z
    .string()
    .max(5000, 'Keep the macro scope under 5000 characters.')
    .default(''),
  microScope: z
    .string()
    .max(5000, 'Keep the micro scope under 5000 characters.')
    .default(''),
  status: z
    .enum(DIARY_STATUSES, 'Status must be RED, ORANGE or GREEN.')
    .nullable()
    .default(null),
});

export const publishDiarySchema = diaryHeaderSchema.extend({
  // Stored exactly as sent: the text the Scrum Master copied and posted.
  text: z
    .string('Send the diary text.')
    .max(100_000, 'The diary text is too long.')
    .refine((text) => text.trim().length > 0, 'The diary text is empty.'),
});

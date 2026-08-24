export type { SprintProposal, sprintTaskSchema } from './schemas';

import type { z } from 'zod';

import { sprintTaskSchema } from './schemas';

export type SprintTask = z.infer<typeof sprintTaskSchema>;

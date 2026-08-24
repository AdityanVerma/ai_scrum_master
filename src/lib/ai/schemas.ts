import { z } from 'zod';

export const sprintTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  skills: z.array(z.string()),
  dependencies: z.array(z.string()),
  complexity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

export const sprintProposalSchema = z.object({
  sprintGoal: z.string().min(1),
  summary: z.string().min(1),
  tasks: z.array(sprintTaskSchema).min(1),
  risks: z.array(z.string()),
});

export type SprintProposal = z.infer<typeof sprintProposalSchema>;

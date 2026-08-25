import { z } from 'zod';

import { openrouter } from '@/lib/ai/openrouter';

const sprintTaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
});

const taskBreakdownSchema = z.object({
  tasks: z.array(sprintTaskSchema).min(1),
});

export type SprintTask = z.infer<typeof sprintTaskSchema>;
export type TaskBreakdown = z.infer<typeof taskBreakdownSchema>;

type SprintInput = {
  name: string;
  goal: string;
  duration: {
    startDate: string;
    endDate: string;
  };
  functions: string[];
};

export async function breakDownTasks(
  sprintInput: SprintInput,
): Promise<TaskBreakdown> {
  const prompt = `
You are a Sprint Task Breakdown specialist.

Break the following sprint requirements into practical, actionable
development tasks.

Sprint Name:
${sprintInput.name}

Sprint Goal:
${sprintInput.goal}

Sprint Start Date:
${sprintInput.duration.startDate}

Sprint End Date:
${sprintInput.duration.endDate}

Functions / Features:
${sprintInput.functions.map((item) => `- ${item}`).join('\n')}

Create tasks that are:

- Specific
- Actionable
- Small enough to be completed within a sprint
- Clear enough for a developer to understand
- Directly related to the requested functions

For each task provide:

- A unique ID
- A clear title
- A concise description

Do NOT:
- Identify skills
- Create dependencies
- Estimate hours
- Assign team members
- Invent requirements that were not provided
- Combine unrelated features into one task

Return ONLY valid JSON in exactly this structure:

{
  "tasks": [
    {
      "id": "TASK-001",
      "title": "string",
      "description": "string"
    }
  ]
}
`;

  const completion = await openrouter.chat.completions.create({
    model: 'openai/gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an experienced software engineering sprint planner.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.1,
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error('Task breakdown returned an empty response.');
  }

  const parsedResult = JSON.parse(content);

  return taskBreakdownSchema.parse(parsedResult);
}

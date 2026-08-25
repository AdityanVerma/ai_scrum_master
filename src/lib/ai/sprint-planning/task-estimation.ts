import { z } from 'zod';

import { openrouter } from '@/lib/ai/openrouter';

const taskEstimateSchema = z.object({
  taskId: z.string(),
  complexity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  estimatedHours: z.number().positive(),
  reasoning: z.string(),
});

const taskEstimationSchema = z.object({
  estimates: z.array(taskEstimateSchema).min(1),
});

export type TaskEstimate = z.infer<typeof taskEstimateSchema>;

export type TaskEstimation = z.infer<typeof taskEstimationSchema>;

type SprintTask = {
  id: string;
  title: string;
  description: string;
};

type TaskSkills = {
  taskId: string;
  skills: string[];
};

export async function estimateTasks(
  tasks: SprintTask[],
  taskSkills: TaskSkills[],
): Promise<TaskEstimation> {
  const taskList = tasks
    .map((task) => {
      const skills =
        taskSkills.find((item) => item.taskId === task.id)?.skills ?? [];

      return `
ID: ${task.id}
Title: ${task.title}
Description: ${task.description}
Skills: ${skills.join(', ')}
`;
    })
    .join('\n');

  const prompt = `
You are an experienced software sprint estimation specialist.

Estimate the effort required for each development task below.

Tasks:

${taskList}

For every task provide:

- The task ID
- Complexity: LOW, MEDIUM, or HIGH
- Estimated effort in hours
- Brief reasoning explaining the estimate

Estimation guidelines:

LOW:
- Small and straightforward change
- Usually 1-4 hours

MEDIUM:
- Requires multiple implementation steps
- Usually 4-8 hours

HIGH:
- Complex implementation or multiple technical concerns
- Usually 8-16 hours

Do not estimate more than 16 hours for a single task.
Do not create new tasks.
Do not assign team members.
Do not modify the requirements.

Return ONLY valid JSON in exactly this structure:

{
  "estimates": [
    {
      "taskId": "TASK-001",
      "complexity": "MEDIUM",
      "estimatedHours": 6,
      "reasoning": "..."
    }
  ]
}
`;

  const completion = await openrouter.chat.completions.create({
    model: 'openai/gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are an experienced software engineering sprint estimation specialist.',
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
    throw new Error('Task estimation returned an empty response.');
  }

  const parsedResult = JSON.parse(content);

  return taskEstimationSchema.parse(parsedResult);
}

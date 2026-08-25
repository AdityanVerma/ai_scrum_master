import { z } from 'zod';

import { openrouter } from '@/lib/ai/openrouter';

const dependencySchema = z.object({
  taskId: z.string(),
  dependsOn: z.array(z.string()),
  reason: z.string(),
});

const dependencyAnalysisSchema = z.object({
  dependencies: z.array(dependencySchema),
});

export type Dependency = z.infer<typeof dependencySchema>;
export type DependencyAnalysis = z.infer<typeof dependencyAnalysisSchema>;

type SprintTask = {
  id: string;
  title: string;
  description: string;
};

export async function analyzeDependencies(
  tasks: SprintTask[],
): Promise<DependencyAnalysis> {
  const taskList = tasks
    .map(
      (task) => `
ID: ${task.id}
Title: ${task.title}
Description: ${task.description}
`,
    )
    .join('\n');

  const prompt = `
You are a Sprint Dependency Analysis specialist.

Analyze the following development tasks and identify dependencies
between them.

Tasks:

${taskList}

For every task, determine whether it depends on another task.

Rules:

- A task should only depend on another task if the other task must
  reasonably be completed first.
- Do not create dependencies just because tasks are related.
- Do not create circular dependencies.
- A task can have multiple dependencies.
- If a task has no dependencies, return an empty array.
- Only reference task IDs that actually exist.
- Do not create new tasks.
- Do not assign team members.
- Do not estimate time.

Return ONLY valid JSON in exactly this structure:

{
  "dependencies": [
    {
      "taskId": "TASK-002",
      "dependsOn": ["TASK-001"],
      "reason": "TASK-002 requires functionality created by TASK-001."
    }
  ]
}
`;

  const completion = await openrouter.chat.completions.create({
    model: 'openai/gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an experienced software sprint dependency analyst.',
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
    throw new Error('Dependency analysis returned an empty response.');
  }

  const parsedResult = JSON.parse(content);

  return dependencyAnalysisSchema.parse(parsedResult);
}

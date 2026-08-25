import { z } from 'zod';

import { openrouter } from '@/lib/ai/openrouter';

const correctedDependencySchema = z.object({
  taskId: z.string(),
  dependsOn: z.array(z.string()),
  reason: z.string(),
});

const dependencyCorrectionSchema = z.object({
  dependencies: z.array(correctedDependencySchema),
});

export type DependencyCorrection = z.infer<typeof dependencyCorrectionSchema>;

type SprintTask = {
  id: string;
  title: string;
  description: string;
};

type Dependency = {
  taskId: string;
  dependsOn: string[];
  reason: string;
};

type ValidationIssue = {
  taskId: string;
  dependsOn: string[];
  issue: string;
  severity: 'WARNING' | 'ERROR';
};

export async function correctDependencies(
  tasks: SprintTask[],
  dependencies: Dependency[],
  issues: ValidationIssue[],
): Promise<DependencyCorrection> {
  const taskList = tasks
    .map(
      (task) => `
ID: ${task.id}
Title: ${task.title}
Description: ${task.description}
`,
    )
    .join('\n');

  const dependencyList = dependencies
    .map(
      (dependency) => `
Task: ${dependency.taskId}
Depends On: ${dependency.dependsOn.join(', ')}
Reason: ${dependency.reason}
`,
    )
    .join('\n');

  const issueList = issues
    .map(
      (issue) => `
Task: ${issue.taskId}
Depends On: ${issue.dependsOn.join(', ')}
Issue: ${issue.issue}
Severity: ${issue.severity}
`,
    )
    .join('\n');

  const prompt = `
You are a Sprint Dependency Correction specialist.

Correct the proposed task dependencies using the validation issues.

TASKS:

${taskList}

CURRENT DEPENDENCIES:

${dependencyList || 'No dependencies.'}

VALIDATION ISSUES:

${issueList || 'No validation issues.'}

Your job is to return the corrected dependency graph.

Rules:

- Keep valid dependencies unchanged.
- Remove dependencies identified as invalid.
- Fix ERROR-level dependency problems.
- Remove unjustified dependencies.
- Do not create dependencies merely because tasks are related.
- Do not create dependencies unless one task genuinely needs another
  completed first.
- Do not create circular dependencies.
- Do not create self-dependencies.
- Only reference task IDs that exist.
- Do not create or modify tasks.
- Do not assign skills.
- Do not estimate effort.

If a task has no dependencies, it does not need to appear in the
dependencies array.

Example:

If:

TASK-005 depends on TASK-004

but TASK-005 only displays poll results and TASK-004 creates a
poll preview, remove that dependency.

Return ONLY valid JSON:

{
  "dependencies": [
    {
      "taskId": "TASK-004",
      "dependsOn": ["TASK-001", "TASK-002"],
      "reason": "..."
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
          'You are an experienced sprint dependency correction specialist.',
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
    throw new Error('Dependency correction returned an empty response.');
  }

  const parsedResult = JSON.parse(content);

  return dependencyCorrectionSchema.parse(parsedResult);
}

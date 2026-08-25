import { z } from 'zod';

import { openrouter } from '@/lib/ai/openrouter';

const validationIssueSchema = z.object({
  taskId: z.string(),
  dependsOn: z.array(z.string()),
  issue: z.string(),
  severity: z.enum(['WARNING', 'ERROR']),
});

const dependencyValidationSchema = z.object({
  isValid: z.boolean(),
  issues: z.array(validationIssueSchema),
});

export type DependencyValidation = z.infer<typeof dependencyValidationSchema>;

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

export async function validateDependencies(
  tasks: SprintTask[],
  dependencies: Dependency[],
): Promise<DependencyValidation> {
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

  const prompt = `
You are a Sprint Dependency Validation specialist.

Your job is to validate whether the proposed task dependencies
are logically justified.

TASKS:

${taskList}

PROPOSED DEPENDENCIES:

${dependencyList || 'No dependencies were identified.'}

Check every dependency for:

1. NONEXISTENT TASK
The referenced dependency task does not exist.

2. SELF DEPENDENCY
A task depends on itself.

3. CIRCULAR DEPENDENCY
A dependency chain creates a cycle.

Example:
TASK-001 → TASK-002
TASK-002 → TASK-001

4. UNJUSTIFIED DEPENDENCY
The dependent task does not actually require the other task
to be completed first based on the task descriptions.

Important:

Related tasks do NOT automatically depend on each other.

For example:

"Create poll preview"

and

"Display poll results"

are related to polls but one does not necessarily need
the other to be completed first.

Only mark a dependency as invalid when there is a clear
lack of prerequisite relationship.

Severity rules:

ERROR:
- Nonexistent task
- Self dependency
- Circular dependency

WARNING:
- Dependency appears unjustified

If there are no issues:

{
  "isValid": true,
  "issues": []
}

If issues exist:

{
  "isValid": false,
  "issues": [
    {
      "taskId": "TASK-005",
      "dependsOn": ["TASK-004"],
      "issue": "TASK-005 does not require TASK-004 to be completed first.",
      "severity": "WARNING"
    }
  ]
}

Return ONLY valid JSON.
`;

  const completion = await openrouter.chat.completions.create({
    model: 'openai/gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are an experienced sprint dependency validation specialist.',
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
    throw new Error('Dependency validation returned an empty response.');
  }

  const parsedResult = JSON.parse(content);

  return dependencyValidationSchema.parse(parsedResult);
}

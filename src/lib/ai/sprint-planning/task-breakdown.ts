import { z } from 'zod';

import { openrouter } from '@/lib/ai/openrouter';
import { parseAiJson } from '@/lib/ai/parse-json';
import { normalizeFunctionName } from '@/lib/sprint-functions';
import { DEFAULT_WORK_TYPE, WORK_TYPES, type WorkType } from '@/lib/work-types';

const breakdownTaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  // Checked against the function list and the work types in organizeTasks,
  // so a wrong or missing value is corrected instead of failing the plan.
  function: z.string().nullish(),
  workType: z.string().nullish(),
});

const taskBreakdownSchema = z.object({
  tasks: z.array(breakdownTaskSchema).min(1),
});

type BreakdownTask = z.infer<typeof breakdownTaskSchema>;

export type SprintTask = {
  id: string;
  title: string;
  description: string;
  // One of the sprint's functions, or null when the AI's answer matched none.
  functionName: string | null;
  category: WorkType;
};

export type TaskBreakdown = {
  tasks: SprintTask[];
};

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
tasks.

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

Every function needs documentation as well as development. For every
function, add exactly ONE task that documents it (what it does, how to
use it and how to maintain it), with the work type "Documentation".

For each task provide:

- A unique ID
- A clear title
- A concise description
- The function it belongs to, copied exactly from the list above
- A work type, exactly one of: ${WORK_TYPES.join(', ')}

Do NOT:
- Identify skills
- Create dependencies
- Estimate hours
- Assign team members
- Invent requirements that were not provided
- Combine unrelated features into one task
- Put one task under more than one function

Return ONLY valid JSON in exactly this structure:

{
  "tasks": [
    {
      "id": "TASK-001",
      "title": "string",
      "description": "string",
      "function": "string",
      "workType": "Development"
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

  const parsedResult = taskBreakdownSchema.parse(parseAiJson(content));

  return {
    tasks: organizeTasks(parsedResult.tasks, sprintInput.functions),
  };
}

// Matches the AI's function names to the sprint's list (ignoring case and
// spacing) and its work types to WORK_TYPES. Makes sure every function has a
// documentation task (PHASE-8 decision P2), then numbers the tasks in function
// order, so the ids are unique and follow the grouping on the preview.
export function organizeTasks(
  tasks: BreakdownTask[],
  functions: string[],
): SprintTask[] {
  const functionsByKey = new Map(
    functions.map((name) => [normalizeFunctionName(name), name]),
  );

  const matched = tasks.map((task) => ({
    title: task.title,
    description: task.description,
    functionName:
      functionsByKey.get(normalizeFunctionName(task.function ?? '')) ?? null,
    category: toWorkType(task.workType),
  }));

  const byFunction = [...functionsByKey.values()].flatMap((name) => {
    const own = matched.filter((task) => task.functionName === name);
    const development = own.filter((task) => task.category !== 'Documentation');
    const documentation = own.filter(
      (task) => task.category === 'Documentation',
    );

    if (documentation.length === 0) {
      documentation.push({
        title: `Document ${name}`,
        description: `Write the documentation for "${name}": what it does, how to use it and what the team needs to know to maintain it.`,
        functionName: name,
        category: 'Documentation',
      });
    }

    return [...development, ...documentation];
  });

  const unmatched = matched.filter((task) => task.functionName === null);

  return [...byFunction, ...unmatched].map((task, index) => ({
    id: `TASK-${String(index + 1).padStart(3, '0')}`,
    ...task,
  }));
}

function toWorkType(value: string | null | undefined): WorkType {
  const key = value?.trim().toLowerCase();

  return (
    WORK_TYPES.find((type) => type.toLowerCase() === key) ?? DEFAULT_WORK_TYPE
  );
}

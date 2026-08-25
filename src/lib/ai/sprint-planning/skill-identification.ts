import { z } from 'zod';

import { openrouter } from '@/lib/ai/openrouter';

const taskSkillsSchema = z.object({
  taskId: z.string(),
  skills: z.array(z.string()).min(1),
  reasoning: z.string(),
});

const skillIdentificationSchema = z.object({
  taskSkills: z.array(taskSkillsSchema).min(1),
});

export type TaskSkills = z.infer<typeof taskSkillsSchema>;

export type SkillIdentification = z.infer<typeof skillIdentificationSchema>;

type SprintTask = {
  id: string;
  title: string;
  description: string;
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
};

export async function identifySkills(
  tasks: SprintTask[],
): Promise<SkillIdentification> {
  const taskList = tasks
    .map(
      (task) => `
ID: ${task.id}
Title: ${task.title}
Description: ${task.description}
Complexity: ${task.complexity}
`,
    )
    .join('\n');

  const prompt = `
You are a Technical Skill Identification specialist.

Identify the technical skills required to complete each sprint task.

Tasks:

${taskList}

For every task:

- Identify the practical technical skills needed.
- Keep skills specific enough to be useful for assigning team members.
- Do not assign people.
- Do not estimate time.
- Do not create new tasks.
- Do not invent technologies that are clearly unrelated to the task.
- If a task requires multiple skills, include all relevant skills.
- Keep the skill names consistent across tasks.

Examples of useful skills:

- React
- Next.js
- TypeScript
- Node.js
- PostgreSQL
- Prisma
- REST API
- UI/UX
- Testing
- API Integration
- Database Design

Return ONLY valid JSON in exactly this structure:

{
  "taskSkills": [
    {
      "taskId": "TASK-001",
      "skills": [
        "Next.js",
        "TypeScript"
      ],
      "reasoning": "This task requires frontend development using Next.js and TypeScript."
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
          'You are an experienced technical skill identification specialist.',
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
    throw new Error('Skill identification returned an empty response.');
  }

  const parsedResult = JSON.parse(content);

  return skillIdentificationSchema.parse(parsedResult);
}

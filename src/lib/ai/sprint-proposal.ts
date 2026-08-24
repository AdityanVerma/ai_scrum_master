import { openrouter } from '@/lib/ai/openrouter';
import { sprintProposalSchema } from '@/lib/ai/schemas';

type SprintInput = {
  name: string;
  goal: string;
  duration: {
    startDate: string;
    endDate: string;
  };
  functions: string[];
};

export async function generateSprintProposal(sprintInput: SprintInput) {
  const prompt = `
You are a Sprint Planning Assistant.

Create a sprint proposal based on the following sprint information.

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

Your job is to:

1. Understand the sprint goal.
2. Break the requested functions into practical development tasks.
3. Identify the skills required for each task.
4. Identify dependencies between tasks.
5. Estimate task complexity as LOW, MEDIUM, or HIGH.
6. Identify potential sprint risks.
7. Provide a concise sprint summary.

Return ONLY valid JSON.

The JSON must follow exactly this structure:

{
  "sprintGoal": "string",
  "summary": "string",
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "skills": ["string"],
      "dependencies": ["string"],
      "complexity": "LOW"
    }
  ],
  "risks": ["string"]
}

Do not add markdown.
Do not wrap the JSON in a code block.
Do not add any explanation outside the JSON.
`;

  const completion = await openrouter.chat.completions.create({
    model: 'openai/gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an experienced Scrum and Sprint Planning assistant.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.2,
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error('AI returned an empty response.');
  }

  const parsedProposal = JSON.parse(content);

  return sprintProposalSchema.parse(parsedProposal);
}

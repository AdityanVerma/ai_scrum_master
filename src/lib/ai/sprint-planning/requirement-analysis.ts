import { z } from 'zod';

import { openrouter } from '@/lib/ai/openrouter';

const requirementAnalysisSchema = z.object({
  isSufficient: z.boolean(),
  summary: z.string(),
  missingInformation: z.array(z.string()),
});

export type RequirementAnalysis = z.infer<typeof requirementAnalysisSchema>;

type SprintInput = {
  name: string;
  goal: string;
  duration: {
    startDate: string;
    endDate: string;
  };
  functions: string[];
};

export async function analyzeRequirements(
  sprintInput: SprintInput,
): Promise<RequirementAnalysis> {
  const prompt = `
You are a Sprint Requirement Analyst.

Your job is to determine whether the sprint requirements contain
ENOUGH INFORMATION to begin breaking the work into development tasks.

You are NOT checking whether the requirements contain every
implementation detail.

The following information is normally NOT required at this stage:

- Exact UI/UX design
- Colors, spacing, or visual design
- Exact technical implementation
- Database schema
- API endpoint design
- Accessibility implementation details
- Mobile responsive implementation details
- Exact libraries or frameworks
- Exact architecture
- Exact test cases

Those details can be determined during development planning.

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

Determine whether the requirements are sufficiently clear to
identify and break down the major pieces of work.

A requirement is SUFFICIENT when:

- The intended outcome is understandable.
- The feature or functionality to be built is identifiable.
- The main user or system behavior is understandable.
- The scope is reasonably clear.
- A development team could begin creating tasks without making
  major assumptions about WHAT needs to be built.

A requirement is INSUFFICIENT only when important information about
the actual requested functionality is missing.

For example:

"Improve poll creation"

is INSUFFICIENT because we don't know what improvement is required.

But:

"Allow admins to create polls with multiple-choice and
multiple-select questions."

is SUFFICIENT because the functionality is clear, even though
the exact UI and implementation are not specified.

Another example:

"Add poll notifications"

is INSUFFICIENT because the notification behavior is unclear.

But:

"Notify users in-app when a mandatory poll is assigned to them."

is SUFFICIENT because the expected behavior is clear.

IMPORTANT:

Do NOT ask for:
- UI designs
- accessibility requirements
- responsive design details
- database details
- API details
- implementation choices

unless the sprint requirement explicitly depends on them.

Do NOT invent requirements.

If the requirements are sufficient, return:

{
  "isSufficient": true,
  "summary": "string",
  "missingInformation": []
}

If the requirements are insufficient, return:

{
  "isSufficient": false,
  "summary": "string",
  "missingInformation": [
    "Only list information required to understand WHAT must be built."
  ]
}

Return ONLY valid JSON.
Do not return markdown.
Do not return explanations outside the JSON.
`;

  const completion = await openrouter.chat.completions.create({
    model: 'openai/gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a professional sprint requirement analyst.',
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
    throw new Error('Requirement analysis returned an empty response.');
  }

  const parsedResult = JSON.parse(content);

  return requirementAnalysisSchema.parse(parsedResult);
}

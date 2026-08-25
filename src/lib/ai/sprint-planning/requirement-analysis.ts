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

Analyze the following sprint requirement and determine whether there
is enough information to begin breaking the sprint into development tasks.

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

Determine whether the information is sufficient for sprint planning.

Consider:
- Is the sprint goal clear?
- Are the requested functions understandable?
- Is there enough information to understand the expected scope?
- Is the sprint duration provided?
- Are there important ambiguities that would prevent reasonable task breakdown?

Do not invent missing requirements.

If information is missing, explicitly list what is missing.

Return ONLY valid JSON in exactly this structure:

{
  "isSufficient": true,
  "summary": "string",
  "missingInformation": ["string"]
}

If the information is sufficient, return an empty missingInformation array.
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

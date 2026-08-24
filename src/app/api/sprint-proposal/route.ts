import { NextResponse } from 'next/server';

import { openrouter } from '@/lib/ai/openrouter';
import type { SprintProposal } from '@/lib/ai/types';

type SprintInput = {
  name: string;
  goal: string;
  duration: {
    startDate: string;
    endDate: string;
  };
  functions: string[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SprintInput;

    if (
      !body.name ||
      !body.goal ||
      !body.duration?.startDate ||
      !body.duration?.endDate ||
      !body.functions?.length
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'All sprint information is required.',
        },
        { status: 400 },
      );
    }

    const prompt = `
You are a Sprint Planning Assistant.

Create a sprint proposal based on the following sprint information.

Sprint Name:
${body.name}

Sprint Goal:
${body.goal}

Sprint Start Date:
${body.duration.startDate}

Sprint End Date:
${body.duration.endDate}

Functions / Features:
${body.functions.map((item) => `- ${item}`).join('\n')}

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
          content:
            'You are an experienced Scrum and Sprint Planning assistant.',
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

    const proposal = JSON.parse(content) as SprintProposal;

    return NextResponse.json({
      success: true,
      data: proposal,
    });
  } catch (error) {
    console.error('Sprint proposal generation failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate sprint proposal.',
      },
      { status: 500 },
    );
  }
}

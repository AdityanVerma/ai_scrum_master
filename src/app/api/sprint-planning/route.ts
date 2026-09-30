import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole } from '@/lib/auth/dal';
import { planSprint } from '@/lib/ai/sprint-planning/sprint-planning';
import { uniqueFunctionNames } from '@/lib/sprint-functions';

const sprintInputSchema = z.object({
  name: z.string().trim().min(1, 'Sprint name is required.').max(200),
  goal: z.string().trim().min(1, 'Sprint goal is required.').max(5000),
  duration: z.object({
    startDate: z.iso.date('Start date must be a date (YYYY-MM-DD).'),
    endDate: z.iso.date('End date must be a date (YYYY-MM-DD).'),
  }),
  // Repeated names are dropped: a sprint cannot have two functions with the
  // same name.
  functions: z
    .array(z.string().max(200))
    .max(50)
    .transform(uniqueFunctionNames)
    .pipe(z.array(z.string()).min(1, 'Enter at least one function.')),
});

// Generates a sprint proposal. Nothing is saved: the Scrum Master checks it
// on the Plan Sprint preview, removes any tasks they do not want, and saves it
// with POST /api/sprints.
export async function POST(request: Request) {
  try {
    const auth = await requireRole('SCRUM_MASTER');

    if (!auth.ok) {
      return auth.response;
    }

    const parsed = sprintInputSchema.safeParse(
      await request.json().catch(() => null),
    );

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsed.error.issues[0]?.message ??
            'All sprint information is required.',
        },
        { status: 400 },
      );
    }

    if (parsed.data.duration.endDate < parsed.data.duration.startDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'End date cannot be before start date.',
        },
        { status: 400 },
      );
    }

    const result = await planSprint(parsed.data);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Sprint planning failed:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Sprint planning failed.',
      },
      { status: 500 },
    );
  }
}

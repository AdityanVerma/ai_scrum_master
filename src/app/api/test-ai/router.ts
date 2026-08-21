import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'nvidia/nemotron-3-ultra-550b-a55b:free',
          messages: [
            {
              role: 'user',
              content:
                'You are an AI Scrum Master. Introduce yourself in one short sentence.',
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();

      return NextResponse.json(
        {
          error,
        },
        {
          status: response.status,
        },
      );
    }

    const data = await response.json();

    return NextResponse.json({
      message: data.choices?.[0]?.message?.content,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: 'Failed to connect to OpenRouter.',
      },
      {
        status: 500,
      },
    );
  }
}

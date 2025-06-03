import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import {NextResponse} from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { articleContent, numTitles } = await req.json();

    if (!articleContent) {
      return NextResponse.json({ error: 'Article content is required' }, { status: 400 });
    }
    if (typeof numTitles !== 'number' || numTitles <= 0 || numTitles > 10) {
      return NextResponse.json({ error: 'Number of titles must be between 1 and 10.' }, { status: 400 });
    }

    const result = await generateObject({
      model: openai('gpt-4-turbo'), // Or your preferred model
      schema: z.object({
        titles: z.array(z.string()).length(numTitles).describe(`Array de ${numTitles} títulos atractivos y optimizados para SEO en español.`)
      }),
      prompt: `Basándote en el siguiente contenido de artículo, genera ${numTitles} títulos únicos, atractivos y optimizados para SEO en español. Cada título debe reflejar con precisión el tema central del artículo. Enfócate en la claridad, concisión y el engagement del lector. Evita títulos genéricos.

IMPORTANTE: Los títulos deben estar completamente en español, ser periodísticos y profesionales.

Contenido del Artículo:
---
${articleContent}
---

Genera exactamente ${numTitles} títulos en español.
`,
      temperature: 0.7,
      maxTokens: 200 * numTitles, // Estimate tokens needed
    });

    return NextResponse.json(result.object);

  } catch (error) {
    console.error('Error generating titles:', error);
    let errorMessage = 'Failed to generate titles.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    if (errorMessage.includes('quota')) {
        return NextResponse.json({ error: 'OpenAI API quota exceeded. Please check your plan and billing details.' }, { status: 429 });
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 
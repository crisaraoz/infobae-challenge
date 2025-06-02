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
        titles: z.array(z.string()).length(numTitles).describe(`Array of ${numTitles} compelling and SEO-friendly titles for an article.`)
      }),
      prompt: `Based on the following article content, generate ${numTitles} unique, compelling, and SEO-friendly titles. Each title should accurately reflect the core subject of the article. Focus on clarity, conciseness, and reader engagement. Avoid generic titles.

Article Content:
---
${articleContent}
---

Generate exactly ${numTitles} titles.
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
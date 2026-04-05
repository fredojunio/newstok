import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

const OutputSchema = z.object({
  storytelling: z.object({
    hook: z.string().describe("A compelling opening that hooks the reader using storytelling"),
    bridge: z.string().describe("Connecting the hook to the main value/insight"),
    value: z.string().describe("The core insight or benefit derived from the news"),
    cta: z.string().describe("Call to action encouraging the user to engage"),
  }),
  dataDriven: z.object({
    hook: z.string().describe("A compelling opening focusing on shocking facts or data"),
    bridge: z.string().describe("Connecting the data hook to the main value/insight"),
    value: z.string().describe("The core insight with logical and analytical points"),
    cta: z.string().describe("Call to action emphasizing analytical next steps"),
  }),
  inspiratif: z.object({
    hook: z.string().describe("A compelling inspirational opening that touches emotions"),
    bridge: z.string().describe("Connecting the emotional hook to the main value/insight"),
    value: z.string().describe("The core insight emphasizing positive impact and hope"),
    cta: z.string().describe("Call to action encouraging positive change or sharing"),
  }),
});

export const maxDuration = 60; // Set max duration for vercel hobby tier if deployed

export async function POST(request: Request) {
  try {
    const { content, modelUsed } = await request.json();

    if (!content || !modelUsed) {
      return NextResponse.json({ error: 'Content and modelUsed are required' }, { status: 400 });
    }

    let selectedModel;
    if (modelUsed === 'openai') {
      selectedModel = openai('gpt-4o');
    } else if (modelUsed === 'gemini') {
      selectedModel = google('gemini-2.5-flash-lite');
    } else if (modelUsed === 'claude') {
      selectedModel = anthropic('claude-3-5-sonnet-latest'); // Ensure the standard anthropic model string
    } else {
      return NextResponse.json({ error: 'Invalid model chosen' }, { status: 400 });
    }

    const { object } = await generateObject({
      model: selectedModel,
      schema: OutputSchema,
      prompt: `You are an expert copywriter fluent in Indonesian. Read the following news content and generate 3 different versions (storytelling, data-driven, and inspiratif) following the Hook, Bridge, Value, CTA structure. 

ALL output MUST be in Indonesian language using a casual and engaging accent (bahasa santai/gaul) that is friendly and relatable. Use popular Indonesian slang or informal terms where appropriate to make it feel authentic, but keep it readable.

Make each section impactful and highly engaging.

News Content:
${content.substring(0, 15000)}`, // Limit to prevent massive token usage
    });

    return NextResponse.json(object);
  } catch (error: any) {
    console.error('Error generating:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

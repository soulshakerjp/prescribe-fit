import { NextRequest, NextResponse } from 'next/server';
import { AppState, CoachInsight, Prescription, SetupFeedback, UserProfile } from '@/types';
import { buildDailyPrompt, buildFallbackCoachInsight, buildSetupFeedback, buildSetupPrompt } from '@/lib/coach';

function extractJson(text: string) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1];
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first >= 0 && last >= 0 && last > first) return text.slice(first, last + 1);
  return text;
}

async function askOpenAi(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: 'You are a precise Japanese personal trainer and nutrition coach. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('OpenAI response did not include message content.');
  }

  return {
    model,
    raw: extractJson(content)
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const type = body?.type as 'setup' | 'daily';

    if (type === 'setup') {
      const profile = body.profile as UserProfile;
      const fallback = buildSetupFeedback(profile);

      try {
        const { raw, model } = await askOpenAi(buildSetupPrompt(profile, fallback));
        const parsed = JSON.parse(raw) as Omit<SetupFeedback, 'generatedBy'>;
        const result: SetupFeedback = {
          summary: parsed.summary || fallback.summary,
          trainingSuggestion: parsed.trainingSuggestion || fallback.trainingSuggestion,
          nutritionSuggestion: parsed.nutritionSuggestion || fallback.nutritionSuggestion,
          suggestions: Array.isArray(parsed.suggestions) && parsed.suggestions.length ? parsed.suggestions : fallback.suggestions,
          warnings: Array.isArray(parsed.warnings) ? parsed.warnings : fallback.warnings,
          generatedBy: 'openai',
          model
        };
        return NextResponse.json(result);
      } catch (error) {
        console.error(error);
        return NextResponse.json(fallback);
      }
    }

    if (type === 'daily') {
      const state = body.state as AppState;
      const prescription = body.prescription as Prescription;
      const fallback = buildFallbackCoachInsight(state, prescription);

      try {
        const { raw, model } = await askOpenAi(buildDailyPrompt(state, prescription));
        const parsed = JSON.parse(raw) as Omit<CoachInsight, 'generatedBy'>;
        const result: CoachInsight = {
          overall: parsed.overall || fallback.overall,
          dinner: parsed.dinner || fallback.dinner,
          workout: parsed.workout || fallback.workout,
          recovery: parsed.recovery || fallback.recovery,
          actionItems: Array.isArray(parsed.actionItems) && parsed.actionItems.length ? parsed.actionItems : fallback.actionItems,
          warnings: Array.isArray(parsed.warnings) ? parsed.warnings : fallback.warnings,
          generatedBy: 'openai',
          model
        };
        return NextResponse.json(result);
      } catch (error) {
        console.error(error);
        return NextResponse.json(fallback);
      }
    }

    return NextResponse.json({ error: 'Invalid request type.' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate coach advice.' }, { status: 500 });
  }
}

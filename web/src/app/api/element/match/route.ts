import { NextRequest, NextResponse } from 'next/server';

const basetenApiKey = process.env.BASETEN_API_KEY || '';
const basetenBaseUrl = process.env.BASETEN_BASE_URL || 'https://inference.baseten.co/v1';
const modelName = process.env.MUSE_SPARK_MODEL_NAME || 'meta-models/muse-spark-open-1026';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, candidates, pageTitle = '', pageUrl = '', language = 'en' } = body;

    const isEn = language === 'en';

    if (!query || !candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return NextResponse.json({
        matchedIndex: null,
        confidence: 0,
        reason: isEn ? 'No candidate elements provided' : 'Tidak ada kandidat elemen',
      });
    }

    const systemPrompt = `You are an element matcher agent for the Owly browser companion.
Task: Given a user query seeking an element on a webpage, analyze the candidate HTML elements and pick the single best match.

Candidate elements on the page:
${JSON.stringify(candidates.slice(0, 20))}

User Query: "${query}"
Page Context: "${pageTitle}" (${pageUrl})

Evaluation Instructions:
1. Determine if one of the candidate elements semantically matches the user's intent.
2. Provide a confidence score between 0.0 and 1.0.
3. If no element matches or confidence is below 0.8, set "matchedIndex" to null and confidence to a value < 0.8.
4. Output STRICT JSON ONLY matching this schema:
{"matchedIndex": number | null, "confidence": number, "reason": "Concise technical explanation in English"}
Do NOT output codeblocks, markdown fences, or other commentary.`;

    const response = await fetch(`${basetenBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${basetenApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Locate matching interactive element for: "${query}"` },
        ],
        temperature: 0.1,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.warn('[Element Match Baseten Error]', err);
      return NextResponse.json({
        matchedIndex: null,
        confidence: 0,
        reason: isEn ? 'Failed to contact AI reasoning model' : 'Gagal menghubungi model AI',
      });
    }

    const completion = await response.json();
    const content = completion.choices?.[0]?.message?.content || '{}';

    let parsed = { matchedIndex: null, confidence: 0, reason: '' };
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch (_) {}

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error('[Element Match API Error]', err);
    return NextResponse.json({ matchedIndex: null, confidence: 0, reason: err.message }, { status: 500 });
  }
}

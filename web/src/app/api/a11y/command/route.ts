import { NextRequest, NextResponse } from 'next/server';

const basetenApiKey = process.env.BASETEN_API_KEY || '';
const basetenBaseUrl = process.env.BASETEN_BASE_URL || 'https://inference.baseten.co/v1';
const modelName = process.env.MUSE_SPARK_MODEL_NAME || 'meta-models/muse-spark-open-1026';

const A11Y_TOOLS_SCHEMAS = [
  {
    type: 'function',
    function: {
      name: 'set_accessibility_feature',
      description: 'Menetapkan nilai pasti fitur aksesibilitas pada halaman web. Idempoten.',
      parameters: {
        type: 'object',
        properties: {
          feature: {
            type: 'string',
            enum: [
              'spotlight', 'tts', 'contrast', 'links', 'textSize', 'textSpacing',
              'pauseAnim', 'hideImages', 'dyslexiaFont', 'bigCursor', 'liveTooltips',
              'lineHeight', 'textAlign', 'colorSat'
            ],
            description: 'ID fitur aksesibilitas Owly.'
          },
          value: {
            type: 'string',
            description: "Nilai target (contoh: 'On', 'Off', '+25%', '+50%', '+75%', '+100%', 'High', 'Invert', 'Monochrome', 'Large (Black)', 'Paused', 'Left', 'Center', 'Justify')"
          }
        },
        required: ['feature', 'value']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'step_accessibility_feature',
      description: 'Menaikkan atau menurunkan tingkat fitur level bertahap (textSize, textSpacing, lineHeight).',
      parameters: {
        type: 'object',
        properties: {
          feature: {
            type: 'string',
            enum: ['textSize', 'textSpacing', 'lineHeight']
          },
          direction: {
            type: 'string',
            enum: ['increase', 'decrease']
          }
        },
        required: ['feature', 'direction']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'apply_accessibility_profile',
      description: 'Menerapkan profil preset kebutuhan khusus pengguna (adhd, dyslexia, low_vision, senior).',
      parameters: {
        type: 'object',
        properties: {
          profile: {
            type: 'string',
            enum: ['adhd', 'dyslexia', 'low_vision', 'senior']
          }
        },
        required: ['profile']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'reset_accessibility',
      description: 'Mereset semua fitur aksesibilitas atau satu fitur tertentu ke bawaan normal.',
      parameters: {
        type: 'object',
        properties: {
          scope: {
            type: 'string',
            description: "'all' untuk semua fitur, atau ID fitur spesifik."
          }
        },
        required: ['scope']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'undo_last_change',
      description: 'Membatalkan perubahan aksesibilitas terakhir.',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  }
];

// Clean markdown fenced JSON blocks
function extractCleanJson(text: string): any {
  if (!text) return null;
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { utterance = '', currentState = {}, lang = 'en' } = body;

    if (!utterance || typeof utterance !== 'string') {
      return NextResponse.json({ error: 'Utterance is required' }, { status: 400 });
    }

    const isEn = lang === 'en';

    // Fallback rule-based matching if Baseten API key is not configured
    if (!basetenApiKey) {
      const lower = utterance.toLowerCase();
      const toolCalls: any[] = [];
      let explanation = isEn ? 'Adjusting page accessibility settings.' : 'Menyesuaikan tampilan aksesibilitas halaman.';

      if (lower.includes('eye') || lower.includes('tired') || lower.includes('glare') || lower.includes('hurt') || lower.includes('capek') || lower.includes('lelah') || lower.includes('silau')) {
        toolCalls.push({
          name: 'set_accessibility_feature',
          arguments: { feature: 'contrast', value: 'High' },
        });
        toolCalls.push({
          name: 'set_accessibility_feature',
          arguments: { feature: 'textSize', value: '+50%' },
        });
        explanation = isEn
          ? 'Increased contrast and enlarged text size to alleviate visual strain.'
          : 'Kontras ditingkatkan dan ukuran teks diperbesar agar mata tidak cepat lelah.';
      } else if (lower.includes('dyslexia') || lower.includes('disleksia') || lower.includes('scramble')) {
        toolCalls.push({
          name: 'apply_accessibility_profile',
          arguments: { profile: 'dyslexia' },
        });
        explanation = isEn ? 'Activated Dyslexia-friendly reading profile.' : 'Mengaktifkan profil ramah disleksia.';
      } else if (lower.includes('focus') || lower.includes('adhd') || lower.includes('distract') || lower.includes('fokus')) {
        toolCalls.push({
          name: 'apply_accessibility_profile',
          arguments: { profile: 'adhd' },
        });
        explanation = isEn ? 'Activated ADHD focus mode.' : 'Mengaktifkan mode fokus ADHD.';
      } else if (lower.includes('read') || lower.includes('speak') || lower.includes('audio') || lower.includes('baca')) {
        toolCalls.push({
          name: 'set_accessibility_feature',
          arguments: { feature: 'tts', value: 'On' },
        });
        explanation = isEn ? 'Reading page aloud with Text-to-Speech.' : 'Membacakan isi halaman dengan Text-to-Speech.';
      } else {
        toolCalls.push({
          name: 'step_accessibility_feature',
          arguments: { feature: 'textSize', direction: 'increase' },
        });
        explanation = isEn ? 'Enlarged text size for reading comfort.' : 'Memperbesar ukuran teks untuk kenyamanan membaca.';
      }

      return NextResponse.json({
        success: true,
        source: 'local_rule_fallback',
        tool_calls: toolCalls,
        explanation,
      });
    }

    // Call Meta Muse Spark Open via Baseten with Function Calling
    const systemPrompt = `You are an accessibility intent translator for the Owly browser companion.
Your primary task is to translate user complaints, accessibility needs, or voice commands into exact accessibility tool calls (Function Calling).

Available Owly Tools (14 Tools):
- spotlight: Reading Spotlight bar (On / Off)
- tts: Text to Speech (On / Off)
- contrast: Normal, High, Invert, Monochrome
- links: Off, Highlight, Underline, High Contrast
- textSize: Normal, +25%, +50%, +75%, +100%
- textSpacing: Normal, Light (+10%), Medium (+25%), Heavy (+50%)
- pauseAnim: Normal, Paused
- hideImages: Normal, Hidden, Grayscale
- dyslexiaFont: Off, On
- bigCursor: Normal, Large (Black), Large (White), Highlighter
- liveTooltips: Off, On
- lineHeight: Normal, 1.5x, 1.8x, 2.2x
- textAlign: Normal, Left, Center, Justify
- colorSat: Normal, High (+50%), Low (-50%), Monochrome

Special Needs Presets:
- adhd: spotlight On + pauseAnim Paused
- dyslexia: dyslexiaFont On + lineHeight 1.8x + textSpacing Medium (+25%)
- low_vision: contrast High + textSize +50% + bigCursor Large (Black)
- senior: textSize +25% + lineHeight 1.5x + bigCursor Large (Black) + links Highlight

Rules:
1. Return STRICT JSON matching:
{
  "tool_calls": [
    { "name": "set_accessibility_feature", "arguments": { "feature": "...", "value": "..." } }
  ],
  "explanation": "Concise 1-sentence technical explanation in ${isEn ? 'English' : 'Indonesian'}"
}
2. If user mentions "eyes hurt / screen glare", set contrast: High and enlarge textSize.
3. If user says "bigger / make it larger", call step_accessibility_feature with direction: "increase".
4. Output STRICT JSON ONLY without markdown fences.`;

    const userPrompt = `User Command / Complaint: "${utterance}"
Current Feature State: ${JSON.stringify(currentState)}`;

    const response = await fetch(`${basetenBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${basetenApiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 500,
        tools: A11Y_TOOLS_SCHEMAS,
      }),
    });

    if (!response.ok) {
      console.warn(`[A11y API] Baseten returned ${response.status}. Using fallback.`);
      return NextResponse.json({
        success: true,
        source: 'api_status_fallback',
        tool_calls: [
          { name: 'step_accessibility_feature', arguments: { feature: 'textSize', direction: 'increase' } },
        ],
        explanation: isEn ? 'Adjusted text display for readability.' : 'Menyesuaikan tampilan teks untuk Anda.',
      });
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    // Cek jika model langsung mengembalikan tool_calls resmi
    if (choice?.message?.tool_calls && choice.message.tool_calls.length > 0) {
      const toolCalls = choice.message.tool_calls.map((tc: any) => ({
        name: tc.function.name,
        arguments: typeof tc.function.arguments === 'string' ? JSON.parse(tc.function.arguments) : tc.function.arguments
      }));
      return NextResponse.json({
        success: true,
        source: 'baseten_meta_tool_calls',
        tool_calls: toolCalls,
        explanation: choice.message.content || 'Pengaturan aksesibilitas berhasil disesuaikan.'
      });
    }

    // Jika model mengembalikan JSON dalam teks
    const parsed = extractCleanJson(choice?.message?.content || '');
    if (parsed && Array.isArray(parsed.tool_calls)) {
      return NextResponse.json({
        success: true,
        source: 'baseten_meta_parsed_json',
        tool_calls: parsed.tool_calls,
        explanation: parsed.explanation || 'Pengaturan aksesibilitas berhasil disesuaikan.'
      });
    }

    return NextResponse.json({
      success: true,
      source: 'baseten_meta_default',
      tool_calls: [
        { name: 'step_accessibility_feature', arguments: { feature: 'textSize', direction: 'increase' } }
      ],
      explanation: 'Tampilan teks diperbesar.'
    });
  } catch (error: any) {
    console.error('[A11y API Error]:', error);
    return NextResponse.json({
      success: true,
      source: 'catch_fallback',
      tool_calls: [
        { name: 'step_accessibility_feature', arguments: { feature: 'textSize', direction: 'increase' } }
      ],
      explanation: 'Menyesuaikan tampilan halaman.'
    });
  }
}

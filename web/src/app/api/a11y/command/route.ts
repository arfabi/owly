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
            description: 'ID fitur aksesibilitas Savvy.'
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
    const { utterance = '', currentState = {}, lang = 'id' } = body;

    if (!utterance || typeof utterance !== 'string') {
      return NextResponse.json({ error: 'Utterance is required' }, { status: 400 });
    }

    // Fallback rule-based matching jika Baseten API key tidak tersedia
    if (!basetenApiKey) {
      const lower = utterance.toLowerCase();
      const toolCalls: any[] = [];
      let explanation = 'Menyesuaikan tampilan aksesibilitas halaman.';

      if (lower.includes('capek') || lower.includes('lelah') || lower.includes('perih') || lower.includes('silau')) {
        toolCalls.push({
          name: 'set_accessibility_feature',
          arguments: { feature: 'contrast', value: 'High' }
        });
        toolCalls.push({
          name: 'set_accessibility_feature',
          arguments: { feature: 'textSize', value: '+50%' }
        });
        explanation = 'Kontras ditingkatkan dan ukuran teks diperbesar agar mata tidak cepat lelah.';
      } else if (lower.includes('disleksia') || lower.includes('dyslexia') || lower.includes('tertukar')) {
        toolCalls.push({
          name: 'apply_accessibility_profile',
          arguments: { profile: 'dyslexia' }
        });
        explanation = 'Mengaktifkan profil ramah disleksia.';
      } else if (lower.includes('fokus') || lower.includes('ramai') || lower.includes('adhd')) {
        toolCalls.push({
          name: 'apply_accessibility_profile',
          arguments: { profile: 'adhd' }
        });
        explanation = 'Mengaktifkan mode fokus ADHD.';
      } else if (lower.includes('bacakan') || lower.includes('baca')) {
        toolCalls.push({
          name: 'set_accessibility_feature',
          arguments: { feature: 'tts', value: 'On' }
        });
        explanation = 'Membacakan isi halaman dengan Text-to-Speech.';
      } else {
        toolCalls.push({
          name: 'step_accessibility_feature',
          arguments: { feature: 'textSize', direction: 'increase' }
        });
        explanation = 'Memperbesar ukuran teks untuk kenyamanan membaca.';
      }

      return NextResponse.json({
        success: true,
        source: 'local_rule_fallback',
        tool_calls: toolCalls,
        explanation
      });
    }

    // Panggil Meta Muse Spark Open via Baseten dengan system instruction Function Calling
    const systemPrompt = `Kamu adalah penerjemah niat aksesibilitas untuk ekstensi browser Savvy.AI.
Tugas utamamu adalah menerjemahkan keluhan, kebutuhan, atau perintah pengguna ke pemanggilan tool aksesibilitas (Function Calling).

Daftar Fitur Savvy (14 Tools):
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

Profil:
- adhd: spotlight On + pauseAnim Paused
- dyslexia: dyslexiaFont On + lineHeight 1.8x + textSpacing Medium (+25%)
- low_vision: contrast High + textSize +50% + bigCursor Large (Black)
- senior: textSize +25% + lineHeight 1.5x + bigCursor Large (Black) + links Highlight

Aturan:
1. Kembalikan HANYA JSON berformat:
{
  "tool_calls": [
    { "name": "set_accessibility_feature", "arguments": { "feature": "...", "value": "..." } }
  ],
  "explanation": "Penjelasan singkat dalam bahasa ${lang} (maksimal 1 kalimat)"
}
2. Jika pengguna mengeluh "mata capek / silau", gunakan contrast: High dan perbesar textSize.
3. Jika pengguna meminta "lebih besar lagi", panggil step_accessibility_feature dengan direction: "increase".
4. Jawab HANYA objek JSON valid tanpa markdown lain.`;

    const userPrompt = `Perintah/Keluhan Pengguna: "${utterance}"
Status Fitur Saat Ini: ${JSON.stringify(currentState)}`;

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
          { name: 'step_accessibility_feature', arguments: { feature: 'textSize', direction: 'increase' } }
        ],
        explanation: 'Menyesuaikan tampilan teks untuk Anda.'
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

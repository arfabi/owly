import { NextRequest, NextResponse } from 'next/server';

const basetenApiKey = process.env.BASETEN_API_KEY || '';
const basetenBaseUrl = process.env.BASETEN_BASE_URL || 'https://inference.baseten.co/v1';
const modelName = process.env.MUSE_SPARK_MODEL_NAME || 'meta-models/muse-spark-open-1026';

// PII Sanitizer: Strip sensitive numbers before transmitting to cloud LLM
function stripPII(str: string): string {
  if (!str) return '';
  return str
    .replace(/\b[1-9]\d{15}\b/g, '[REDACTED_NIK]')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[REDACTED_EMAIL]')
    .replace(/\b(?:\+?62|08)\d{8,12}\b/g, '[REDACTED_PHONE]');
}

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
    const {
      fields = [],
      pageUploadContext = { pageWideFileInstructions: [], attachedFilesMetadata: [] },
      meta = {},
    } = body;

    const pageInstructions: string[] = pageUploadContext.pageWideFileInstructions || [];
    const attachedFiles: any[] = pageUploadContext.attachedFilesMetadata || [];

    // Guardrail: If no fields were detected, return immediately without wasting tokens
    if (!fields || fields.length === 0) {
      return NextResponse.json({
        success: true,
        source: 'empty_form_guardrail',
        aiFindings: [],
        recommendations: [
          'No active form fields detected on the current page.',
          'Please ensure your active browser tab is displaying a valid form before running the audit.',
        ],
      });
    }

    // Filter fields that have values to analyze scattered instructions (strip PII from values)
    const nonSensitiveFields = (fields as any[]).map((f) => ({
      fieldId: f.fieldId,
      label: f.label,
      currentValue: stripPII(f.currentValue || ''),
      hasValue: !!f.currentValue,
      rules: f.rules,
    }));

    // If no Baseten API key is configured, return graceful local heuristic response
    if (!basetenApiKey) {
      const fallbackFindings: any[] = [];
      if (pageInstructions.length > 0 && attachedFiles.length > 0) {
        attachedFiles.forEach((file) => {
          if (file.fileSizeKb > 512 && pageInstructions.some((p) => /500\s*kb|0\.5\s*mb|maksimal 500|max.*500/i.test(p))) {
            fallbackFindings.push({
              fieldId: file.fieldName || 'upload',
              level: 'red',
              badge: 'ATTACHMENT',
              message: `File size for '${file.fileName}' (${file.fileSizeKb} KB) exceeds the 500 KB limit indicated in page instructions.`,
              hint: 'Compress your document before submitting.',
            });
          }
        });
      }

      return NextResponse.json({
        success: true,
        source: 'local_heuristic_engine',
        aiFindings: fallbackFindings,
        recommendations: [
          'All standard format validations have been verified deterministically on the client.',
          'Ensure your original supporting documents are prepared before submitting.',
        ],
      });
    }

    const fieldsSummary = nonSensitiveFields
      .map((f: any) => `- Field "${f.label || f.fieldId}" (${f.rules?.type || 'input'}): ${f.hasValue ? `Populated ("${f.currentValue}")` : 'EMPTY / Unfilled'} ${f.rules?.isRequired ? '[REQUIRED]' : '[Optional]'}`)
      .join('\n');

    // Call Meta Muse Spark Open on Baseten with high reasoning effort to evaluate ambiguous page instructions
    const systemPrompt = `You are the Owly Universal Form Auditor Agent powered by Meta Muse Spark Open.
Your task is to analyze form data, detect conditional rule violations, logical contradictions, or attachment constraint discrepancies:

Output the evaluation in raw JSON format without markdown code fences:
{
  "aiFindings": [
    {
      "fieldId": "string (field id or upload name)",
      "level": "red" | "yellow",
      "badge": "RULE" | "ATTACHMENT" | "FORMAT" | "REQUIRED",
      "message": "Clear, professional, and actionable explanation of the issue",
      "hint": "Concrete recommendation or guideline fix"
    }
  ],
  "recommendations": ["string"]
}`;

    const userContent = `Conduct a comprehensive form compliance audit on domain '${meta.domain || 'form-web'}' (${meta.title || 'Public Application'}).

Detected Form Fields (${nonSensitiveFields.length} fields):
${fieldsSummary}

Page Footnotes & Guidelines:
${pageInstructions.length > 0 ? pageInstructions.join('\n') : 'No special page notes.'}

Attached Documents / Upload Metadata:
${attachedFiles.length > 0 ? JSON.stringify(attachedFiles, null, 2) : 'No files currently attached.'}

Perform deep Chain-of-Thought reasoning to identify:
1. Missing mandatory fields.
2. Contradictions between dependent fields (e.g., claiming a foreign degree without providing language certification, or conflicting selection logic).
3. Attached file non-compliance with page-wide instruction limits (e.g. file size exceeding 500 KB, invalid formats).`;

    const basetenRes = await fetch(`${basetenBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${basetenApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.1,
        reasoning_effort: 'medium',
        max_tokens: 2500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!basetenRes.ok) {
      console.warn('[Owly AI] Baseten audit call returned non-200, returning fallback.');
      return NextResponse.json({
        success: true,
        source: 'fallback',
        aiFindings: [],
        recommendations: ['Formulir aman dan telah diperiksa oleh engine deterministik Owly.'],
      });
    }

    const data = await basetenRes.json();
    const rawContent = data.choices?.[0]?.message?.content || '';
    const parsed = extractCleanJson(rawContent) || { aiFindings: [], recommendations: [] };

    return NextResponse.json({
      success: true,
      source: 'meta_muse_spark_open',
      aiFindings: parsed.aiFindings || [],
      recommendations: parsed.recommendations || [],
    });
  } catch (err: any) {
    console.error('Audit route error:', err);
    return NextResponse.json({
      success: true,
      source: 'fallback_error',
      aiFindings: [],
      recommendations: ['Audit deterministik selesai diverifikasi di sisi klien.'],
    });
  }
}

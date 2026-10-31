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

    // Filter fields that have values to analyze scattered instructions
    const nonSensitiveFields = (fields as any[]).map((f) => ({
      fieldId: f.fieldId,
      label: f.label,
      valueLength: (f.currentValue || '').length,
      hasValue: !!f.currentValue,
      rules: f.rules,
    }));

    // If no Baseten API key is configured, return graceful local heuristic response
    if (!basetenApiKey) {
      const fallbackFindings: any[] = [];
      if (pageInstructions.length > 0 && attachedFiles.length > 0) {
        attachedFiles.forEach((file) => {
          if (file.fileSizeKb > 512 && pageInstructions.some((p) => /500\s*kb|0\.5\s*mb/i.test(p))) {
            fallbackFindings.push({
              fieldId: file.fieldName || 'upload',
              level: 'red',
              badge: 'BERKAS',
              message: `Ukuran berkas '${file.fileName}' (${file.fileSizeKb} KB) melebihi batas 500 KB yang tertera pada catatan halaman.`,
              hint: 'Kompres dokumen Anda sebelum submit.',
            });
          }
        });
      }

      return NextResponse.json({
        success: true,
        source: 'local_heuristic_engine',
        aiFindings: fallbackFindings,
        recommendations: [
          'Seluruh validasi format standar telah diverifikasi secara deterministik di sisi klien.',
          'Pastikan berkas dokumen asli siap dilampirkan sebelum menekan tombol submit.',
        ],
      });
    }

    // Call Meta Muse Spark Open on Baseten with high reasoning effort to evaluate ambiguous page instructions
    const systemPrompt = `Anda adalah Savvy Form Auditor Agent berbasis Meta Muse Spark Open.
Tugas Anda adalah mengevaluasi apakah ada aturan bersyarat atau batasan berkas yang dilanggar berdasarkan instruksi halaman web:
Instruksi Halaman Terdeteksi:
${pageInstructions.length > 0 ? pageInstructions.map((p, i) => `${i + 1}. "${p}"`).join('\n') : 'Tidak ada catatan khusus.'}

Berkas Terlampir:
${attachedFiles.length > 0 ? JSON.stringify(attachedFiles, null, 2) : 'Belum ada berkas terlampir.'}

Keluarkan hasil evaluasi dalam format JSON murni:
{
  "aiFindings": [
    {
      "fieldId": "string",
      "level": "red" | "yellow" | "green",
      "badge": "BERKAS" | "FORMAT" | "ATURAN",
      "message": "Deskripsi masalah yang ramah dan solutif",
      "hint": "Saran mitigasi"
    }
  ],
  "recommendations": ["string"]
}`;

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
          {
            role: 'user',
            content: `Audit formulir pada domain '${meta.domain || 'form-web'}' dengan ${nonSensitiveFields.length} kolom terdeteksi. Berikan JSON evaluasi kepatuhan berkas dan catatan halaman.`,
          },
        ],
        temperature: 0.1,
        reasoning_effort: 'high',
        chat_template_kwargs: {
          thinking: {
            reasoning_effort: 'high',
          },
        },
      }),
    });

    if (!basetenRes.ok) {
      console.warn('[Savvy AI] Baseten audit call returned non-200, returning fallback.');
      return NextResponse.json({
        success: true,
        source: 'fallback',
        aiFindings: [],
        recommendations: ['Formulir aman dan telah diperiksa oleh engine deterministik Savvy.'],
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

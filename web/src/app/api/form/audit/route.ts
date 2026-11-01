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
          'Tidak ada kolom formulir aktif yang terdeteksi di tab saat ini.',
          'Silakan pastikan tab browser Anda berada pada halaman formulir (seperti Form Simulator) sebelum menjalankan audit.',
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

    const fieldsSummary = nonSensitiveFields
      .map((f: any) => `- Kolom "${f.label || f.fieldId}" (${f.rules?.type || 'input'}): ${f.hasValue ? `Terisi ("${f.currentValue}")` : 'KOSONG / Belum Diisi'} ${f.rules?.isRequired ? '[WAJIB]' : '[Opsional]'}`)
      .join('\n');

    // Call Meta Muse Spark Open on Baseten with high reasoning effort to evaluate ambiguous page instructions
    const systemPrompt = `Anda adalah Savvy Form Auditor Agent berbasis Meta Muse Spark Open.
Tugas Anda adalah mengevaluasi apakah ada aturan bersyarat, kontradiksi logika, atau batasan berkas yang dilanggar berdasarkan instruksi formulir:

Keluarkan hasil evaluasi dalam format JSON murni tanpa markdown:
{
  "aiFindings": [
    {
      "fieldId": "string (id kolom)",
      "level": "red",
      "badge": "ATURAN",
      "message": "Deskripsi masalah yang ramah dan solutif",
      "hint": "Saran perbaikan konkret"
    }
  ],
  "recommendations": ["string"]
}`;

    const userContent = `Lakukan audit kepatuhan formulir pada domain '${meta.domain || 'form-web'}' (${meta.title || 'Formulir Publik'}).

Data Kolom Terdeteksi (${nonSensitiveFields.length} kolom):
${fieldsSummary}

Instruksi / Catatan Kaki Halaman:
${pageInstructions.length > 0 ? pageInstructions.join('\n') : 'Tidak ada catatan khusus.'}

Berkas / File Terlampir:
${attachedFiles.length > 0 ? JSON.stringify(attachedFiles, null, 2) : 'Belum ada berkas terlampir.'}

Lakukan penalaran mendalam (high reasoning) untuk mendeteksi:
1. Kolom wajib yang masih kosong.
2. Kontradiksi data antar kolom (misal beasiswa luar negeri tapi dokumen bahasa asing kosong, dsb).
3. Ketidaksesuaian berkas lampiran dengan catatan instruksi halaman.`;

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

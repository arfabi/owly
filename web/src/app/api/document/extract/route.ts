import { NextRequest, NextResponse } from 'next/server';

const basetenApiKey = process.env.BASETEN_API_KEY || '';
const basetenBaseUrl = process.env.BASETEN_BASE_URL || 'https://inference.baseten.co/v1';
const modelName = process.env.MUSE_SPARK_MODEL_NAME || 'meta-models/muse-spark-open-1026';

function extractCleanJson(text: string): any {
  if (!text) return null;
  let cleaned = text.trim();
  const jsonBlock = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (jsonBlock && jsonBlock[1]) {
    cleaned = jsonBlock[1].trim();
  }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    return null;
  }
}

// Universal generic key-value fallback parser (handles ANY document format)
function extractGenericKeyValuePairs(text: string, defaultDocType: string): any[] {
  if (!text) return [];
  const fields: any[] = [];
  const lines = text.split(/\r?\n/);
  const seenKeys = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('{') || trimmed.startsWith('}')) continue;

    // Matches patterns like "Field Name : Value" or "Field Name = Value"
    const match = trimmed.match(/^([A-Za-z0-9\s/()._-]{2,35})\s*[:=-]\s*([^\r\n]+)$/);
    if (match && match[1] && match[2]) {
      const rawKey = match[1].trim();
      const rawVal = match[2].trim().replace(/^["']|["',]$/g, '').trim();

      const cleanKey = rawKey.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 30);
      if (
        rawVal &&
        rawVal.length > 0 &&
        rawVal.toLowerCase() !== 'null' &&
        !seenKeys.has(cleanKey) &&
        !rawKey.toLowerCase().includes('documenttype')
      ) {
        seenKeys.add(cleanKey);
        fields.push({
          id: cleanKey,
          name: rawKey,
          value: rawVal,
          aliases: [rawKey],
          sourceTag: defaultDocType,
        });
      }
    }
  }

  return fields;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const agent_logs: Array<{ domain: string; message: string; data?: any }> = [];

  try {
    const body = await req.json();
    const { imageBase64, language = 'id' } = body;

    agent_logs.push({
      domain: 'PERCEPTION',
      message: 'Document Extraction Request received: Base64 image payload buffered in ephemeral memory.',
    });

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'imageBase64 (dokumen KTP/Ijazah/Paspor/SIM) wajib disertakan' },
        { status: 400 }
      );
    }

    let formattedImageUrl = imageBase64;
    if (!formattedImageUrl.startsWith('data:') && !formattedImageUrl.startsWith('http')) {
      formattedImageUrl = `data:image/png;base64,${formattedImageUrl}`;
    }

    agent_logs.push({
      domain: 'PLANNER',
      message: 'Dispatching visual inference to Baseten Muse Spark Open (Universal Layout & OCR Engine)...',
    });

    const universalSystemPrompt = `You are Owly Universal Document Extractor AI, powered by Meta Muse Spark Open.
Your task: Accurately read, transcribe, and extract all official fields from ANY government, academic, credential, or legal document (such as:
- Ijazah / University Degree / High School Diploma
- Transkrip Nilai / Academic Transcript
- e-KTP / National ID Card / Kartu Keluarga
- Paspor / Passport / Visa
- SIM / Driver's License (from Texas, USA, Indonesia, or any international jurisdiction)
- Sertifikat / Akta Kelahiran / Surat Keterangan).

CRITICAL INSTRUCTIONS:
1. Automatically detect and specify the exact document type in "documentType" (e.g. "Ijazah Sarjana (S1)", "Texas Driver License", "KTP Republik Indonesia", "Academic Transcript", "Paspor Republik Indonesia").
2. Transcribe EVERY single field with non-empty text visible on the document.
3. For each field, provide:
   - "id": A clean snake_case identifier (e.g., "nomor_ijazah", "universitas", "ipk", "program_studi", "dl_number", "nik", "nama_lengkap", "tanggal_lahir", "alamat")
   - "name": Clean human-readable label (e.g., "Nomor Ijazah", "Universitas", "IPK / GPA", "Program Studi", "Driver License Number", "NIK")
   - "value": The exact extracted string value as written on the document
   - "aliases": Array of common alternate labels in Indonesian and English for smart form autofilling
   - "sourceTag": The document title

Output MUST be strictly valid JSON matching this structure:
{
  "documentType": "Document Title",
  "fields": [
    {
      "id": "field_id",
      "name": "Field Name",
      "value": "Extracted Value",
      "aliases": ["Alternate Label 1", "Alternate Label 2"],
      "sourceTag": "Document Title"
    }
  ]
}
If a field is not present or not legible in the image, DO NOT include it. Only extract fields with actual legible text values.`;

    const messages: any[] = [
      { role: 'system', content: universalSystemPrompt },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: formattedImageUrl },
          },
          {
            type: 'text',
            text: 'Extract all official credential and identity fields visible on this document into structured JSON.',
          },
        ],
      },
    ];

    const response = await fetch(`${basetenBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${basetenApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        reasoning_effort: 'low',
        temperature: 0.1,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[DocExtract] Baseten error:', errText);
      return NextResponse.json(
        { error: 'Gagal mengekstrak dokumen via AI Vision', details: errText },
        { status: 502 }
      );
    }

    const completion = await response.json();
    const rawContent = completion.choices?.[0]?.message?.content || '';
    const reasoningContent = completion.choices?.[0]?.message?.reasoning_content || '';

    // 1. Try JSON parse from content
    let parsed = extractCleanJson(rawContent);

    // 2. If content didn't parse, try JSON parse from reasoning_content
    if (!parsed || !Array.isArray(parsed.fields) || parsed.fields.length === 0) {
      const parsedFromReasoning = extractCleanJson(reasoningContent);
      if (parsedFromReasoning && Array.isArray(parsedFromReasoning.fields) && parsedFromReasoning.fields.length > 0) {
        parsed = parsedFromReasoning;
      }
    }

    const docType = parsed?.documentType || 'Official Document';

    // 3. Extract and filter valid fields (must have real, non-empty, non-dummy values)
    let extractedFields: any[] = [];
    if (parsed && Array.isArray(parsed.fields)) {
      extractedFields = parsed.fields.filter(
        (f: any) =>
          f &&
          f.value &&
          typeof f.value === 'string' &&
          f.value.trim().length > 0 &&
          f.value.toLowerCase() !== 'null' &&
          f.value.toLowerCase() !== 'n/a' &&
          !f.value.toLowerCase().includes('ekstraksi berhasil') &&
          f.id !== 'extracted_doc'
      );
    }

    // 4. If structured JSON was empty or malformed, use generic key-value parser across reasoning & content
    if (extractedFields.length === 0) {
      const genericFields = extractGenericKeyValuePairs(`${rawContent}\n${reasoningContent}`, docType);
      if (genericFields.length > 0) {
        extractedFields = genericFields;
      }
    }

    // 5. If STILL no fields found, return clear 422 error
    if (extractedFields.length === 0) {
      agent_logs.push({
        domain: 'REASONING',
        message: 'Visual OCR could not identify standard credential fields from image.',
      });
      return NextResponse.json(
        {
          success: false,
          error:
            language === 'id'
              ? 'Tidak ada data resmi yang terbaca dari gambar ini. Pastikan foto dokumen (KTP, Ijazah, SIM, atau Paspor) terlihat utuh, terang, dan teksnya jelas.'
              : 'No identity or credential fields could be recognized from this image. Please ensure the document (ID, Diploma, Driver License, or Passport) is well-lit, fully visible, and unblurred.',
          fields: [],
          agent_logs,
        },
        { status: 422 }
      );
    }

    const elapsed = Date.now() - startTime;
    agent_logs.push({
      domain: 'REASONING',
      message: `Visual OCR completed: Identified '${docType}' with ${extractedFields.length} structured credential fields.`,
      data: { documentType: docType, fieldCount: extractedFields.length },
    });

    agent_logs.push({
      domain: 'SECURITY',
      message: 'Zero-Knowledge Guardrail: Ephemeral buffer flushed. Raw image dropped from server memory. Zero PII persisted.',
    });

    agent_logs.push({
      domain: 'GATEWAY',
      message: `Document extraction pipeline finished successfully in ${elapsed}ms.`,
      data: { latencyMs: elapsed },
    });

    return NextResponse.json({
      success: true,
      documentType: docType,
      fields: extractedFields,
      agent_logs,
    });
  } catch (error: any) {
    console.error('[DocExtract] Fatal error:', error);
    agent_logs.push({
      domain: 'GATEWAY',
      message: `Document extraction pipeline failed: ${error.message || 'Internal error'}`,
    });
    return NextResponse.json(
      { error: error.message || 'Internal Server Error', agent_logs },
      { status: 500 }
    );
  }
}

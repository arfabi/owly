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

// Fallback regex extractor from OCR / reasoning text
function extractFieldsFromText(text: string): any[] {
  if (!text) return [];
  const fields: any[] = [];

  // NIK (16 digits)
  const nikMatch = text.match(/(?:NIK|Nomor Induk Kependudukan)\D*(\d{16})/i) || text.match(/\b(\d{16})\b/);
  if (nikMatch && nikMatch[1]) {
    fields.push({
      id: 'nik',
      name: 'NIK',
      value: nikMatch[1].trim(),
      aliases: ['Nomor Induk Kependudukan', 'ID Number'],
      sourceTag: 'KTP Republik Indonesia',
    });
  }

  // Nama Lengkap
  const namaMatch = text.match(/Nama(?:\s*Lengkap)?\s*[:=\-]?\s*([A-Za-z\s.,']+?)(?:\n|\r|Tempat|Tgl|Lahir|Jenis|Alamat|NIK|$)/i);
  if (namaMatch && namaMatch[1] && namaMatch[1].trim().length > 2) {
    const cleanNama = namaMatch[1].trim().replace(/\s+/g, ' ');
    if (!cleanNama.toLowerCase().includes('ktp') && !cleanNama.toLowerCase().includes('republik')) {
      fields.push({
        id: 'nama_lengkap',
        name: 'Nama Lengkap',
        value: cleanNama.toUpperCase(),
        aliases: ['Nama', 'Full Name'],
        sourceTag: 'KTP Republik Indonesia',
      });
    }
  }

  // Tempat / Tanggal Lahir
  const ttlMatch = text.match(/(?:Tempat\/Tgl Lahir|Tempat[,\s]+Tanggal Lahir)\s*[:=\-]?\s*([A-Za-z\s]+)[,\/]\s*(\d{2}[-\/]\d{2}[-\/]\d{4})/i);
  if (ttlMatch) {
    if (ttlMatch[1]) {
      fields.push({
        id: 'tempat_lahir',
        name: 'Tempat Lahir',
        value: ttlMatch[1].trim().toUpperCase(),
        aliases: ['Place of Birth'],
        sourceTag: 'KTP Republik Indonesia',
      });
    }
    if (ttlMatch[2]) {
      fields.push({
        id: 'tanggal_lahir',
        name: 'Tanggal Lahir',
        value: ttlMatch[2].replace(/\//g, '-').trim(),
        aliases: ['Date of Birth'],
        sourceTag: 'KTP Republik Indonesia',
      });
    }
  }

  // Jenis Kelamin
  const genderMatch = text.match(/(?:Jenis Kelamin|Gender)\s*[:=\-]?\s*(LAKI-LAKI|PEREMPUAN)/i);
  if (genderMatch && genderMatch[1]) {
    fields.push({
      id: 'jenis_kelamin',
      name: 'Jenis Kelamin',
      value: genderMatch[1].toUpperCase(),
      aliases: ['Gender', 'Sex'],
      sourceTag: 'KTP Republik Indonesia',
    });
  }

  // Alamat KTP
  const alamatMatch = text.match(/Alamat\s*[:=\-]?\s*([^\n\r]+)/i);
  if (alamatMatch && alamatMatch[1] && alamatMatch[1].trim().length > 5) {
    fields.push({
      id: 'alamat',
      name: 'Alamat KTP',
      value: alamatMatch[1].trim().toUpperCase(),
      aliases: ['Address', 'Domisili'],
      sourceTag: 'KTP Republik Indonesia',
    });
  }

  // Agama
  const agamaMatch = text.match(/Agama\s*[:=\-]?\s*(ISLAM|KRISTEN|KATOLIK|HINDU|BUDDHA|KONGHUCU)/i);
  if (agamaMatch && agamaMatch[1]) {
    fields.push({
      id: 'agama',
      name: 'Agama',
      value: agamaMatch[1].toUpperCase(),
      aliases: ['Religion'],
      sourceTag: 'KTP Republik Indonesia',
    });
  }

  // Status Perkawinan
  const statusMatch = text.match(/Status\s*Perkawinan\s*[:=\-]?\s*(BELUM KAWIN|KAWIN|CERAI HIDUP|CERAI MATI)/i);
  if (statusMatch && statusMatch[1]) {
    fields.push({
      id: 'status_perkawinan',
      name: 'Status Perkawinan',
      value: statusMatch[1].toUpperCase(),
      aliases: ['Marital Status'],
      sourceTag: 'KTP Republik Indonesia',
    });
  }

  // Kewarganegaraan
  const wniMatch = text.match(/Kewarganegaraan\s*[:=\-]?\s*(WNI|WNA)/i);
  if (wniMatch && wniMatch[1]) {
    fields.push({
      id: 'kewarganegaraan',
      name: 'Kewarganegaraan',
      value: wniMatch[1].toUpperCase(),
      aliases: ['Citizenship'],
      sourceTag: 'KTP Republik Indonesia',
    });
  }

  return fields;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, language = 'id' } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'imageBase64 (dokumen KTP/Paspor) wajib disertakan' },
        { status: 400 }
      );
    }

    let formattedImageUrl = imageBase64;
    if (!formattedImageUrl.startsWith('data:') && !formattedImageUrl.startsWith('http')) {
      formattedImageUrl = `data:image/png;base64,${formattedImageUrl}`;
    }

    const systemPrompt = `You are Owly Multimodal Document Extractor AI, powered by Meta Muse Spark Open.
Your task: Accurately read and transcribe citizen identity fields from this official identity card (KTP Republik Indonesia, Passport, KK).
Read all text clearly visible on the document.
Fields to extract:
- NIK (16 digits)
- Nama Lengkap (Full Name)
- Tempat Lahir (Place of birth, strictly city/regency)
- Tanggal Lahir (Date of birth, formatted as DD-MM-YYYY)
- Jenis Kelamin (Gender: LAKI-LAKI or PEREMPUAN)
- Alamat KTP (Complete street address with RT/RW, Kel/Desa, Kecamatan)
- Agama (Religion)
- Status Perkawinan (Marital status)
- Pekerjaan (Occupation)
- Kewarganegaraan (Citizenship: WNI or WNA)
- Golongan Darah (Blood type: A, B, AB, O)

CRITICAL INSTRUCTION:
Return ONLY valid JSON matching this exact structure:
{
  "documentType": "KTP Republik Indonesia",
  "fields": [
    { "id": "nik", "name": "NIK", "value": "3171...", "aliases": ["Nomor Induk Kependudukan", "ID Number"], "sourceTag": "KTP Republik Indonesia" },
    { "id": "nama_lengkap", "name": "Nama Lengkap", "value": "...", "aliases": ["Nama", "Full Name"], "sourceTag": "KTP Republik Indonesia" }
  ]
}
If a field is not present or not legible in the image, DO NOT include it in the fields list. Only include fields with actual legible text values.`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: formattedImageUrl },
          },
          {
            type: 'text',
            text: 'Extract all official citizen identity fields visible on this document into structured JSON.',
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

    // 4. If structured JSON had no valid fields, use regex text parser on both content & reasoning
    if (extractedFields.length === 0) {
      const fallbackRegexFields = extractFieldsFromText(`${rawContent} ${reasoningContent}`);
      if (fallbackRegexFields.length > 0) {
        extractedFields = fallbackRegexFields;
      }
    }

    // 5. If STILL no fields found, return clear 422 error (do NOT return fake placeholder)
    if (extractedFields.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            language === 'id'
              ? 'Tidak ada data identitas yang terbaca dari gambar ini. Pastikan foto e-KTP / Paspor terang, teks terlihat jelas, dan tidak terpotong.'
              : 'No identity fields could be recognized from this image. Please ensure the ID card or passport photo is well-lit, fully visible, and not blurred.',
          fields: [],
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      documentType: parsed?.documentType || 'KTP Republik Indonesia',
      fields: extractedFields,
    });
  } catch (error: any) {
    console.error('[DocExtract] Fatal error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

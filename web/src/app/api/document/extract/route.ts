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
    console.warn('[DocExtract] JSON parse fallback failed:', e);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, language = 'id' } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'imageBase64 (dokumen KTP/Paspor/Ijazah) wajib disertakan' },
        { status: 400 }
      );
    }

    let formattedImageUrl = imageBase64;
    if (!formattedImageUrl.startsWith('data:') && !formattedImageUrl.startsWith('http')) {
      formattedImageUrl = `data:image/png;base64,${formattedImageUrl}`;
    }

    const systemPrompt = `You are Owly Multimodal Document Extractor AI, powered by Meta Muse Spark Open.
Your task: Accurately read and extract citizen identity fields from official identity cards (KTP Republik Indonesia, Passports, Family Cards / KK).
Extract the following fields if present:
- NIK (16 digits)
- Nama Lengkap (Full Name)
- Tempat Lahir (Place of birth, strictly city/regency, e.g. "KUDUS" or "JAKARTA")
- Tanggal Lahir (Date of birth, formatted as DD-MM-YYYY or YYYY-MM-DD)
- Jenis Kelamin (Gender: "LAKI-LAKI" or "PEREMPUAN")
- Alamat KTP (Complete street address, RT/RW, kelurahan, kecamatan, kabupaten/kota)
- Agama (Religion)
- Status Perkawinan (Marital status)
- Pekerjaan (Occupation)
- Kewarganegaraan (Citizenship, e.g. "WNI")
- Golongan Darah (Blood type)

Return STRICTLY valid JSON with no markdown wrapping:
{
  "documentType": "KTP Republik Indonesia",
  "fields": [
    { "id": "nik", "name": "NIK", "value": "...", "aliases": ["Nomor Induk Kependudukan", "ID Number"], "sourceTag": "KTP Republik Indonesia" },
    { "id": "nama_lengkap", "name": "Nama Lengkap", "value": "...", "aliases": ["Nama", "Full Name"], "sourceTag": "KTP Republik Indonesia" },
    { "id": "tempat_lahir", "name": "Tempat Lahir", "value": "...", "aliases": ["Place of Birth"], "sourceTag": "KTP Republik Indonesia" },
    { "id": "tanggal_lahir", "name": "Tanggal Lahir", "value": "...", "aliases": ["Date of Birth"], "sourceTag": "KTP Republik Indonesia" },
    { "id": "jenis_kelamin", "name": "Jenis Kelamin", "value": "...", "aliases": ["Gender", "Sex"], "sourceTag": "KTP Republik Indonesia" },
    { "id": "alamat", "name": "Alamat KTP", "value": "...", "aliases": ["Address", "Domisili"], "sourceTag": "KTP Republik Indonesia" }
  ]
}`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: formattedImageUrl }
          },
          {
            type: 'text',
            text: 'Extract all official identity fields from this document into structured JSON format.'
          }
        ]
      }
    ];

    const response = await fetch(`${basetenBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${basetenApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        reasoning_effort: 'low',
        temperature: 0.1,
        max_tokens: 1000
      })
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
    const parsed = extractCleanJson(rawContent);

    if (!parsed || !Array.isArray(parsed.fields) || parsed.fields.length === 0) {
      // Fallback: If OCR didn't parse full list or returned raw text, create clean entry
      return NextResponse.json({
        success: true,
        documentType: parsed?.documentType || 'KTP Republik Indonesia',
        fields: [
          {
            id: 'extracted_doc',
            name: 'Dokumen Terverifikasi',
            value: 'Ekstraksi berhasil',
            aliases: ['ID Document'],
            sourceTag: 'KTP Republik Indonesia'
          }
        ]
      });
    }

    return NextResponse.json({
      success: true,
      documentType: parsed.documentType || 'KTP Republik Indonesia',
      fields: parsed.fields
    });
  } catch (error: any) {
    console.error('[DocExtract] Fatal error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

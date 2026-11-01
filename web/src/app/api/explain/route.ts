import { NextRequest, NextResponse } from 'next/server';

const basetenApiKey = process.env.BASETEN_API_KEY || '';
const basetenBaseUrl = process.env.BASETEN_BASE_URL || 'https://inference.baseten.co/v1';
const modelName = process.env.MUSE_SPARK_MODEL_NAME || 'meta-models/muse-spark-open-1026';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      imageBase64,
      contextLabel = 'Form Section / Document',
      portalUrl = 'official-portal.gov',
      language = 'en',
    } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'imageBase64 (visual snip image buffer) is required' },
        { status: 400 }
      );
    }

    // Format Data URI
    let formattedImageUrl = imageBase64;
    if (!formattedImageUrl.startsWith('data:') && !formattedImageUrl.startsWith('http')) {
      formattedImageUrl = `data:image/png;base64,${formattedImageUrl}`;
    }

    const isEn = language === 'en';

    const systemPrompt = isEn
      ? `You are the Owly Universal Visual Explainer & Jargon Buster — an intelligent multimodal AI assistant for applicants navigating complex government, visa, scholarship, and administrative portals.
Your task: Analyze cropped visual snips of web forms, official stamps, seal specimens, document clauses, or confusing bureaucratic terminology, and explain them clearly in plain language without intimidating jargon.`
      : `Kamu adalah Owly Visual Explainer & Jargon Buster — asisten AI multimodal untuk pendaftar formulir publik dan beasiswa resmi.
Tugasmu: Menganalisis potongan visual gambar (snip) dari formulir, stempel, dokumen, atau istilah birokrasi, lalu menjelaskannya secara gamblang kepada warga biasa tanpa bahasa birokrasi yang rumit.`;

    const userInstruction = isEn
      ? `Carefully analyze this visual crop (snip) from an official portal:
- Section Context: "${contextLabel}"
- Portal: "${portalUrl}"
- Language: English

Provide a clear, structured JSON explanation without markdown code fences:
{
  "title": "Identified Term / Document Element Name",
  "plain_explanation": "Plain-language explanation of what this element or clause means (1-2 clear paragraphs).",
  "legal_implication": "Why authorities mandate this element and the regulatory consequences if it is omitted or incorrect.",
  "specimen_tips": "Physical or digital verification markers of a genuine document (e.g., official colored seals, digital signatures, valid registration numbers).",
  "action_recommendation": "Concrete, actionable step the applicant should take right now."
}`
      : `Analisis gambar cuplikan (snip) ini dengan seksama.
- Konteks Bagian: "${contextLabel}"
- Portal: "${portalUrl}"
- Bahasa: Bahasa Indonesia

Berikan penjelasan terstruktur dalam format JSON valid tanpa tanda markdown dengan struktur persis berikut:
{
  "title": "Nama Istilah / Elemen Dokumen yang Teridentifikasi",
  "plain_explanation": "Penjelasan arti istilah/elemen ini dalam bahasa awam yang sangat mudah dipahami (1-2 paragraf).",
  "legal_implication": "Mengapa elemen/dokumen ini diwajibkan oleh panitia dan apa akibatnya jika salah unggah atau tidak memenuhi syarat.",
  "specimen_tips": "Ciri-ciri fisik dokumen yang sah (misal: stempel basah berwarna, tanda tangan basah/elektronik, nomor registrasi resmi).",
  "action_recommendation": "Langkah konkret yang harus dilakukan pendaftar saat ini."
}`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: formattedImageUrl,
            },
          },
          {
            type: 'text',
            text: userInstruction,
          },
        ],
      },
    ];

    const response = await fetch(`${basetenBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${basetenApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        reasoning_effort: 'medium',
        temperature: 0.2,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Baseten Multimodal Vision API Error:', errText);
      return NextResponse.json(
        { error: 'Failed to analyze document visual snip via AI vision model', details: errText },
        { status: 502 }
      );
    }

    const completion = await response.json();
    let rawContent = completion.choices?.[0]?.message?.content || '{}';

    // Bersihkan markdown codeblocks jika ada
    rawContent = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();

    let parsedResult: any = {};
    try {
      parsedResult = JSON.parse(rawContent);
    } catch (parseErr) {
      console.warn('Fallback regex parsing for explain result:', rawContent);
      parsedResult = {
        title: contextLabel || (isEn ? 'Visual Analysis Result' : 'Hasil Analisis Visual'),
        plain_explanation: rawContent,
        legal_implication: isEn
          ? 'Ensure the document meets all official verification and submission criteria.'
          : 'Pastikan dokumen memenuhi seluruh kriteria verifikasi berkas resmi.',
        specimen_tips: isEn
          ? 'Check the validity of signatures, official seals, and issuance dates.'
          : 'Periksa keaslian tanda tangan, stempel resmi, dan tanggal penerbitan dokumen.',
        action_recommendation: isEn
          ? 'Upload a high-resolution, uncompressed file within portal size limits.'
          : 'Unggah file dengan resolusi jernih dan ukuran tidak melebihi batas portal.',
      };
    }

    return NextResponse.json({
      success: true,
      analysis: parsedResult,
      agent_logs: [
        {
          domain: 'PERCEPTION',
          message: `Multimodal Vision: Processed cropped visual snip (${Math.round(imageBase64.length / 1024)} KB)`
        },
        {
          domain: 'REASONING',
          message: `Meta Muse Spark Multimodal parsed jargon: "${parsedResult.title || contextLabel}"`,
          data: { model: modelName }
        }
      ]
    });

  } catch (error: any) {
    console.error('Explain endpoint error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

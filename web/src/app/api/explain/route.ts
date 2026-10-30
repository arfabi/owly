import { NextRequest, NextResponse } from 'next/server';

const basetenApiKey = process.env.BASETEN_API_KEY || '';
const basetenBaseUrl = process.env.BASETEN_BASE_URL || 'https://inference.baseten.co/v1';
const modelName = process.env.MUSE_SPARK_MODEL_NAME || 'meta-models/muse-spark-open-1026';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      imageBase64,
      contextLabel = 'Bagian Formulir / Dokumen',
      portalUrl = 'beasiswalpdp.kemenkeu.go.id',
      language = 'id'
    } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'imageBase64 (potongan gambar cuplikan) wajib disertakan' },
        { status: 400 }
      );
    }

    // Format Data URI
    let formattedImageUrl = imageBase64;
    if (!formattedImageUrl.startsWith('data:') && !formattedImageUrl.startsWith('http')) {
      formattedImageUrl = `data:image/png;base64,${formattedImageUrl}`;
    }

    const systemPrompt = `Kamu adalah Savvy Visual Explainer & Jargon Buster — asisten AI multimodal untuk pendaftar formulir publik dan beasiswa resmi.
Tugasmu: Menganalisis potongan visual gambar (snip) dari formulir, stempel, dokumen, atau istilah birokrasi, lalu menjelaskannya secara gamblang kepada warga biasa tanpa bahasa birokrasi yang rumit.`;

    const userInstruction = `Analisis gambar cuplikan (snip) ini dengan seksama.
- Konteks Bagian: "${contextLabel}"
- Portal: "${portalUrl}"
- Bahasa: ${language === 'en' ? 'English' : 'Bahasa Indonesia'}

Berikan penjelasan terstruktur dalam format JSON valid tanpa tanda markdown dengan struktur persis berikut:
{
  "title": "Nama Istilah / Elemen Dokumen yang Teridentifikasi",
  "plain_explanation": "Penjelasan arti istilah/elemen ini dalam bahasa awam yang sangat mudah dipahami (1-2 paragraf).",
  "legal_implication": "Mengapa elemen/dokumen ini diwajibkan oleh panitia dan apa akibatnya jika salah unggah atau tidak memenuhi syarat.",
  "specimen_tips": "Ciri-ciri fisik dokumen yang sah (misal: stempel basah berwarna, tanda tangan basah/elektronik BSrE, nomor registrasi resmi).",
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
              url: formattedImageUrl
            }
          },
          {
            type: 'text',
            text: userInstruction
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
        reasoning_effort: 'medium',
        temperature: 0.2,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Baseten Multimodal Vision API Error:', errText);
      return NextResponse.json(
        { error: 'Gagal menganalisis visual dokumen via model AI', details: errText },
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
        title: contextLabel || 'Hasil Analisis Visual',
        plain_explanation: rawContent,
        legal_implication: 'Pastikan dokumen memenuhi seluruh kriteria verifikasi berkas resmi.',
        specimen_tips: 'Periksa keaslian tanda tangan, stempel resmi, dan tanggal penerbitan dokumen.',
        action_recommendation: 'Unggah file dengan resolusi jernih dan ukuran tidak melebihi batas portal.'
      };
    }

    return NextResponse.json({
      success: true,
      analysis: parsedResult
    });

  } catch (error: any) {
    console.error('Explain endpoint error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

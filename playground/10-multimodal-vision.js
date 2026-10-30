import { callOpenSparkMessage } from './client.js';

console.log('=== [10] TEST MULTIMODAL VISION (Image Understanding) ===\n');

/**
 * Uji Native Multimodal Vision sesuai panduan Meta Muse Spark Open:
 * Mengirim array partisi multimodal pada pesan user:
 * [
 *   { type: "image_url", image_url: { url: "..." } }, // di-render sebagai token <|patch|>
 *   { type: "text", text: "..." }
 * ]
 * 
 * Skenario Savvy.AI: Inspeksi visual dokumen identitas / KTP pendaftar.
 */

async function testMultimodalVision() {
  // Contoh URL gambar publik sampel form / dokumen
  const sampleImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/220px-QR_code_for_mobile_English_Wikipedia.svg.png';

  console.log(`Mengirim gambar ke model via type: "image_url":\nURL: ${sampleImageUrl}\n`);

  const messages = [
    {
      role: 'system',
      content: 'Anda adalah Document Vision Auditor di Savvy.AI. Lakukan analisis visual dan identifikasi elemen gambar dengan presisi tinggi.'
    },
    {
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: {
            url: sampleImageUrl
          }
        },
        {
          type: 'text',
          text: 'Jelaskan apa yang terlihat pada gambar ini, fungsinya dalam verifikasi dokumen digital atau tiket antrean, dan sebutkan 3 pola kotak pemosisian (position detection patterns) yang ada pada sudut-sudutnya.'
        }
      ]
    }
  ];

  try {
    const res = await callOpenSparkMessage({
      messages,
      temperature: 0.1,
    });

    console.log('--- HASIL ANALISIS MULTIMODAL VISION ---');
    console.log(res.content);
    if (res.usage) {
      console.log('\n[Token Usage]:', res.usage);
    }
  } catch (error) {
    console.error('❌ Error Multimodal Vision:', error.message);
  }
}

testMultimodalVision();

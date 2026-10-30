import { callOpenSparkMessage } from './client.js';

console.log('=== [11] TEST MULTIMODAL AUDIO & VIDEO (Direct Media URL) ===\n');

/**
 * Uji Native Multimodal Audio & Video sesuai panduan Meta Muse Spark Open:
 * Mengirim array partisi multimodal pada pesan user:
 * [
 *   { type: "audio_url", audio_url: { url: "..." } }, // di-render sebagai token <|audio|>
 *   { type: "text", text: "..." }
 * ]
 * 
 * Aturan Meta untuk Media:
 * - Audio: format standar wav / mp3 / m4a via public URL.
 * - Video: durasi > beberapa detik dengan resolusi >= 448 px pada sisi terpendek.
 */

async function testMultimodalAudio() {
  // Sampel audio speech publik singkat
  const sampleAudioUrl = 'https://actions.google.com/sounds/v1/speech/announcement_attention.ogg';

  console.log(`Mengirim file audio ke model via type: "audio_url":\nURL: ${sampleAudioUrl}\n`);

  const messages = [
    {
      role: 'system',
      content: 'Anda adalah Voice Assistant di Savvy.AI yang mampu mendengarkan rekaman suara secara langsung tanpa memerlukan transkripsi pihak ketiga.'
    },
    {
      role: 'user',
      content: [
        {
          type: 'audio_url',
          audio_url: {
            url: sampleAudioUrl
          }
        },
        {
          type: 'text',
          text: 'Dengarkan rekaman audio di atas. Apa pesan yang diumumkan dan bagaimana nada bicara pembicara?'
        }
      ]
    }
  ];

  try {
    const res = await callOpenSparkMessage({
      messages,
      temperature: 0.1,
    });

    console.log('--- HASIL ANALISIS NATIVE AUDIO ---');
    console.log(res.content);
    if (res.usage) {
      console.log('\n[Token Usage]:', res.usage);
    }
  } catch (error) {
    console.log('ℹ️ Catatan: Jika endpoint hosted provider belum mengaktifkan modul audio processor, error berikut akan tampil:');
    console.error('❌ Error Multimodal Audio:', error.message);
  }
}

testMultimodalAudio();

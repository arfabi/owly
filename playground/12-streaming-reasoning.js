import { callOpenSpark } from './client.js';

console.log('=== [12] TEST STREAMING REASONING & CONTENT SEPARATION ===\n');

/**
 * Uji Real-time Streaming SSE untuk Muse Spark Open:
 * Menangani token nalar panjang pada `reasoning_effort: "high"` atau "xhigh"
 * Memisahkan secara visual:
 * - [Reasoning Stream]: `delta.reasoning_content` (tampilan warna redup/kuning)
 * - [Answer Stream]: `delta.content` (tampilan warna hijau/terang)
 */

async function runStreamingReasoning() {
  const prompt = 'Jelaskan analisis Anda mengenai potensi kerentanan validasi form jika input tanggal lahir diizinkan bernilai masa depan (future date), dan bagaimana skema mitigasinya di backend.';

  console.log('Mengirim permintaan streaming dengan reasoning_effort: "high"...\n');

  const stream = await callOpenSpark({
    messages: [
      { role: 'system', content: 'Anda adalah Security & Logic Auditor di Savvy.AI. Tunjukkan alur penalaran Anda secara transparan.' },
      { role: 'user', content: prompt }
    ],
    reasoning_effort: 'high',
    temperature: 0.2,
    stream: true,
  });

  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let inReasoningPhase = false;
  let inContentPhase = false;

  for await (const chunk of stream) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // simpan sisa baris yang belum utuh

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(':')) continue;
      if (trimmed === 'data: [DONE]') {
        console.log('\n\n🏁 [Stream Selesai]');
        return;
      }

      if (trimmed.startsWith('data: ')) {
        const jsonStr = trimmed.slice(6);
        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta || {};

          // 1. Tangani token nalar (reasoning_content)
          if (delta.reasoning_content) {
            if (!inReasoningPhase) {
              console.log('🧠 --- [REASONING TRACE (Model sedang berpikir)] ---');
              process.stdout.write('\x1b[33m'); // Warna kuning terminal
              inReasoningPhase = true;
            }
            process.stdout.write(delta.reasoning_content);
          }

          // 2. Tangani token jawaban akhir (content)
          if (delta.content) {
            if (!inContentPhase) {
              if (inReasoningPhase) {
                process.stdout.write('\x1b[0m\n\n'); // Reset warna & newline
              }
              console.log('💡 --- [JAWABAN AKHIR (Model menjawab)] ---');
              process.stdout.write('\x1b[32m'); // Warna hijau terminal
              inContentPhase = true;
            }
            process.stdout.write(delta.content);
          }
        } catch (e) {
          // Lewati chunk jika formatting parsial
        }
      }
    }
  }

  // Reset styling terminal
  process.stdout.write('\x1b[0m\n');
}

runStreamingReasoning().catch((err) => {
  console.error('\x1b[0m❌ Error Streaming:', err.message);
});

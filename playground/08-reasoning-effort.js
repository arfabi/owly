import { callOpenSparkMessage } from './client.js';

console.log('=== [08] TEST REASONING EFFORT & STRENGTH CONTROL ===\n');

/**
 * Menguji kontrol reasoning Muse Spark Open sesuai dokumentasi resmi Meta:
 * 1. Parameter `reasoning_effort`: "low" (8), "medium" (32), "high" (256), "xhigh" (512 - default)
 * 2. System prompt override: "Reasoning strength: <number>" (mengabaikan reasoning_effort)
 * 3. Menampilkan field nalar terpisah (reasoning_content) vs jawaban akhir (content)
 */

const testPrompt = `
Kasus Hukum Administrasi:
Pendaftar bernama Budi lahir tanggal 29 Februari 2000 di Kupang.
Ia mendaftar paspor pada tanggal 28 Februari 2026.
Jika masa berlaku KTP-nya tertulis 'Seumur Hidup' tapi diterbitkan pada tahun 2011 (sebelum aturan e-KTP seumur hidup UU No. 24/2013 disahkan):
Apakah petugas wajib meminta pembaruan fisik KTP terlebih dahulu menurut regulasi Dukcapil dan Imigrasi?
Jawab dengan ringkas dan sertakan dasar pertimbangannya.
`;

async function testReasoningEffort() {
  // Test 1: Menggunakan reasoning_effort: "low"
  console.log('▶ [Test 1] Menguji reasoning_effort: "low" (cepat, nalar minimal ~8 token)...');
  try {
    const resLow = await callOpenSparkMessage({
      messages: [
        { role: 'system', content: 'Anda adalah konsultan hukum administrasi kependudukan Indonesia.' },
        { role: 'user', content: testPrompt }
      ],
      reasoning_effort: 'low',
      temperature: 0.1,
    });

    console.log('[Low Reasoning Trace]:', resLow.reasoning ? resLow.reasoning.slice(0, 200) + '...' : '(Nalar di-stream / inline)');
    console.log('[Low Output Jawaban]:\n', resLow.content);
    if (resLow.usage) console.log('[Token Usage]:', resLow.usage);
  } catch (err) {
    console.error('❌ Error Test 1:', err.message);
  }

  console.log('\n------------------------------------------------------------\n');

  // Test 2: Override reasoning via System Prompt "Reasoning strength: 256"
  console.log('▶ [Test 2] Menguji System Prompt Override: "Reasoning strength: 256"...');
  try {
    const systemPrompt = `Anda adalah konsultan hukum administrasi kependudukan Indonesia.
Reasoning strength: 256.
Analisis dengan seksama hirarki regulasi SE Mendagri No. 470/296/SJ dan UU 24/2013.`;

    const resOverride = await callOpenSparkMessage({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: testPrompt }
      ],
      reasoning_effort: 'low', // Ini akan di-override oleh "Reasoning strength: 256" di system prompt
      temperature: 0.1,
    });

    console.log('[Override System Prompt Reasoning Trace]:', resOverride.reasoning ? resOverride.reasoning.slice(0, 300) + '...' : '(Nalar di-stream / inline)');
    console.log('[Override Output Jawaban]:\n', resOverride.content);
  } catch (err) {
    console.error('❌ Error Test 2:', err.message);
  }
}

testReasoningEffort();

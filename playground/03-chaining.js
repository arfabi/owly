import { callOpenSpark } from './client.js';

console.log('=== [03] TEST CHAINING (Multi-Step Sequential Processing) ===\n');

/**
 * Pengujian pola rantai nalar bertahap (Prompt Chaining):
 * Step 1: Analisis persyaratan esai dari prompt formulir.
 * Step 2: Gunakan hasil Step 1 untuk menyusun outline esai 3 paragraf.
 * Step 3: Gunakan hasil Step 2 untuk membuat draf esai resmi.
 */
async function runChaining() {
  const formQuestion = "Jelaskan rencana kontribusi Anda bagi pembangunan daerah asal setelah menyelesaikan studi magister (Maksimal 300 kata).";

  console.log(`[Input Form]: "${formQuestion}"\n`);

  // Step 1: Analisis Kriteria & Rubrik
  console.log('⏳ Langkah 1: Menganalisis kriteria rubrik esai...');
  const step1Response = await callOpenSpark({
    messages: [
      { role: 'system', content: 'Anda adalah Essay Coach Savvy.AI. Ekstrak kriteria penilaian penting secara ringkas.' },
      { role: 'user', content: `Analisis pertanyaan esai berikut dan sebutkan 3 poin utama yang dinilai oleh tim penyeleksi: "${formQuestion}"` }
    ],
    temperature: 0.2
  });
  console.log('✅ Langkah 1 Selesai:\n' + step1Response.trim() + '\n');

  // Step 2: Buat Kerangka / Outline berdasarkan kriteria Langkah 1
  console.log('⏳ Langkah 2: Menyusun kerangka esai berdasar poin kriteria...');
  const step2Response = await callOpenSpark({
    messages: [
      { role: 'system', content: 'Anda adalah arsitek narasi esai formal.' },
      { role: 'user', content: `Berdasarkan kriteria berikut:\n${step1Response}\n\nBuat outline 3 bagian (Pendahuluan, Solusi Nyata, Dampak Jangka Panjang) untuk calon mahasiswa bidang Teknologi Pertanian di NTT.` }
    ],
    temperature: 0.3
  });
  console.log('✅ Langkah 2 Selesai:\n' + step2Response.trim() + '\n');

  // Step 3: Menulis Draf Final berdasarkan outline Langkah 2
  console.log('⏳ Langkah 3: Menulis draf esai final...');
  const step3Response = await callOpenSpark({
    messages: [
      { role: 'system', content: 'Anda adalah penulis draf esai profesional. Batasi maksimal 200 kata, bahasa Indonesia formal dan meyakinkan.' },
      { role: 'user', content: `Tulis esai final berdasarkan kerangka ini:\n${step2Response}` }
    ],
    temperature: 0.3
  });
  console.log('✅ Langkah 3 Selesai (Draf Akhir):\n' + step3Response.trim() + '\n');

  console.log('🎉 Selesai! Chaining 3 langkah berhasil dirangkai.');
}

runChaining().catch(err => console.error('❌ Error Chaining:', err.message));

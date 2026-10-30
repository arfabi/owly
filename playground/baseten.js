import { callOpenSpark, MODEL_NAME } from './client.js';

console.log(`[Baseten Playground] Menguji koneksi ke ${MODEL_NAME}...`);

try {
  const result = await callOpenSpark({
    messages: [
      { role: 'system', content: 'Anda adalah asisten AI ramah dan ringkas.' },
      { role: 'user', content: 'Halo! Tolong konfirmasi apakah API Key dan koneksi kamu berfungsi dengan baik.' },
    ],
  });

  console.log('\n--- Hasil Respons dari Muse Spark Open ---');
  console.log(result);
  console.log('------------------------------------------');
} catch (error) {
  console.error('\n❌ Gagal memanggil Baseten API:');
  console.error(error.message);
}
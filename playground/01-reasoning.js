import { callOpenSpark } from './client.js';

console.log('=== [01] TEST REASONING (Deep Reasoning & Sanity Check) ===\n');

/**
 * Pengujian nalar logis multi-variabel (Consistency Checker Agent)
 * Skenario: Memeriksa apakah data formulir konsisten dan aman sebelum submit.
 */
const prompt = `
Anda adalah Consistency Checker Agent untuk pendaftaran visa dan dokumen resmi.
Lakukan penalaran langkah-demi-langkah (step-by-step reasoning) untuk memeriksa data pendaftar berikut:

Data Pendaftar:
- NIK: 3273010508950002
- Tanggal Lahir di Form: 05 September 1995
- Tanggal Rencana Terbang: 15 Desember 2026
- Tanggal Kadaluarsa Paspor: 10 Januari 2027

Tugas Reasoning Anda:
1. Periksa kesesuaian digit tanggal lahir pada NIK vs Tanggal Lahir yang diisi (Format NIK: DDMMYY di digit 7-12).
2. Periksa aturan internasional masa berlaku paspor (harus aktif minimal 6 bulan saat tanggal keberangkatan).
3. Buat kesimpulan dan daftar peringatan jika ada inkonsistensi.
`;

try {
  console.log('Mengirim prompt penalaran ke Muse Spark Open...');
  const result = await callOpenSpark({
    messages: [
      { role: 'system', content: 'Anda adalah pakar audit data formulir pemerintah yang teliti dan berpegang pada logika aturan.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
  });

  console.log('\n--- HASIL ANALISIS REASONING ---');
  console.log(result);
} catch (error) {
  console.error('❌ Error:', error.message);
}

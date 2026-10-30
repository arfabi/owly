import { callOpenSpark } from './client.js';

console.log('=== [02] TEST DECISION (Classification & Decision Making) ===\n');

/**
 * Pengujian pengambilan keputusan terstruktur (Decision Agent)
 * Skenario: Menganalisis field formulir yang sedang dihadapi user dan memutuskan:
 * - Kategori Risiko: (LOW / MEDIUM / CRITICAL)
 * - Tindakan: (AUTO_FILL / GUIDANCE_ONLY / BLOCK_SUBMIT_WARNING)
 * - Format output: JSON keputusan tegas.
 */
const fieldData = {
  form_name: "Aplikasi Paspor Baru RI",
  field_label: "Surat Rekomendasi Instansi / Paspor Lama",
  user_input_type: "file_upload",
  context: "Pemohon memilih opsi Paspor Hilang / Rusak tanpa melampirkan Surat Kehilangan dari Kepolisian",
};

const prompt = `
Evaluasi data field formulir berikut dan tentukan keputusan tindakan sistem:
${JSON.stringify(fieldData, null, 2)}

Aturan Keputusan:
- Jika dokumen legalitas wajib (surat kehilangan kepolisian) hilang pada kasus paspor hilang, maka Risiko = CRITICAL dan Tindakan = BLOCK_SUBMIT_WARNING.
- Format respon WAJIB berupa JSON murni dengan format:
{
  "risk_level": "LOW" | "MEDIUM" | "CRITICAL",
  "action": "AUTO_FILL" | "GUIDANCE_ONLY" | "BLOCK_SUBMIT_WARNING",
  "reason": "Penjelasan singkat keputusan",
  "recommendation": "Saran mitigasi bagi pendaftar"
}
`;

try {
  console.log('Mengirim evaluasi keputusan ke Muse Spark Open...');
  const result = await callOpenSpark({
    messages: [
      { role: 'system', content: 'Anda adalah mesin pembuat keputusan (decision engine) sistem Savvy.AI. Keluarkan JSON yang valid.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
  });

  console.log('\n--- HASIL KEPUTUSAN (DECISION) ---');
  console.log(result);
} catch (error) {
  console.error('❌ Error:', error.message);
}

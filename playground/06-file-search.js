import { callOpenSpark } from './client.js';

console.log('=== [06] TEST FILE SEARCH RAG (Field Coach 4-Element Card) ===\n');

/**
 * Pengujian pola File Search / Vector Store RAG:
 * Menyimulasikan retrieval chunk dari dokumen juknis resmi (PDF)
 * lalu menyusun Kartu Panduan 4-Elemen standar Savvy.AI disertai sitasi bab & halaman.
 */
async function runFileSearchRAG() {
  // Simulasi chunk yang ditemukan oleh Vector Store
  const retrievedChunks = [
    {
      document: "Juknis_Pendaftaran_Beasiswa_LPDP_2026.pdf",
      bab: "Bab IV: Kelengkapan Dokumen",
      halaman: 42,
      konten: "LoA Unconditional (Letter of Acceptance) adalah surat penerimaan resmi tanpa syarat dari perguruan tinggi tujuan. Surat yang masih mencantumkan syarat bahasa (TOEFL/IELTS) atau syarat IPK digolongkan sebagai LoA Conditional dan tidak memenuhi syarat jalur ini."
    }
  ];

  const fieldBeingEdited = {
    field_id: "loa_attachment_type",
    label: "Jenis Dokumen Penerimaan Kampus (LoA)",
    section: "Unggah Berkas Pendidikan"
  };

  const prompt = `
Anda adalah Field Coach Agent Savvy.AI.
Berdasarkan potongan dokumen resmi berikut:
${JSON.stringify(retrievedChunks, null, 2)}

Susun Kartu Panduan 4-Elemen untuk field "${fieldBeingEdited.label}":
1. 💡 Arti Istilah: (Penjelasan sederhana tanpa jargon)
2. 📝 Cara Mengisi: (Langkah praktis yang harus dilakukan pengguna)
3. 🎯 Contoh Valid Fiktif: (Beri contoh dummy yang tepat)
4. ⚠️ Jebakan Umum: (Kesalahan fatal yang sering membuat berkas gugur)

Wajib sertakan sitasi persis: Nama Dokumen, Bab, dan Halaman di bagian bawah kartu!
`;

  console.log('Menyusun Kartu Panduan 4-Elemen dengan Muse Spark Open...');
  const response = await callOpenSpark({
    messages: [
      { role: 'system', content: 'Anda adalah Field Coach Savvy.AI yang memandu pengisian form secara ramah dan akurat.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2
  });

  console.log('\n--- KARTU PANDUAN 4-ELEMEN (HASIL RAG) ---');
  console.log(response);
}

runFileSearchRAG().catch(err => console.error('❌ Error File Search RAG:', err.message));

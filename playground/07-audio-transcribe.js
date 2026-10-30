import { callOpenSpark } from './client.js';

console.log('=== [07] TEST AUDIO TRANSCRIBE & VOICE EXTRACTION ===\n');

/**
 * Pengujian pola Voice Transcribe / Handsfree Voicebot:
 * Mengubah ucapan verbal pendaftar (hasil transkrip suara) menjadi entitas data formulir
 * terstruktur yang siap dimasukkan ke dalam field input web secara otomatis.
 */
async function runVoiceExtraction() {
  // Simulasi hasil ucapan warga via suara:
  const simulatedVoiceTranscript = `
"Halo mbak Savvy, saya mau isi formulir paspor. Nama lengkap saya Siti Rahmawati, 
tempat lahir saya di Surabaya tanggal sembilan Agustus seribu sembilan ratus delapan puluh delapan. 
Sekarang saya tinggal di Jalan Pemuda nomor empat puluh lima RT dua RW tiga, Surabaya. 
Pekerjaan saya saat ini wiraswasta di bidang kuliner."
  `;

  console.log(`[Transkrip Suara Masuk]:\n${simulatedVoiceTranscript.trim()}\n`);

  const formSchema = {
    nama_lengkap: "string",
    tempat_lahir: "string",
    tanggal_lahir: "format YYYY-MM-DD",
    alamat_lengkap: "string",
    pekerjaan: "string"
  };

  const prompt = `
Anda adalah Voice-to-Form Parser Agent di Savvy.AI.
Tugas Anda adalah mengekstrak entitas data dari rekaman ucapan pengguna berikut:

"${simulatedVoiceTranscript}"

Target Skema Formulir:
${JSON.stringify(formSchema, null, 2)}

Aturan:
1. Konversi format tanggal bahasa lisan menjadi format standar ISO "YYYY-MM-DD".
2. Keluarkan respon dalam format JSON murni:
{
  "extracted_data": { ... },
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "missing_fields": [ ... ]
}
`;

  console.log('Memproses transkrip suara dengan Muse Spark Open...');
  const response = await callOpenSpark({
    messages: [
      { role: 'system', content: 'Anda adalah parser entitas form suara yang presisi dan mengembalikan JSON valid.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1
  });

  console.log('\n--- HASIL EKSTRAKSI FORM DARI SUARA (JSON) ---');
  console.log(response);
}

runVoiceExtraction().catch(err => console.error('❌ Error Voice Extraction:', err.message));

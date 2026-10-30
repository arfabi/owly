import { callOpenSpark } from './client.js';

console.log('=== [05] TEST WEB SEARCH GROUNDING (Manual Researcher Agent) ===\n');

/**
 * Pengujian pola Web Search Grounding:
 * Menggabungkan cuplikan data regulasi eksternal (misal: edaran kementerian imigrasi.go.id terbaru 2026)
 * ke dalam prompt agar model memberikan panduan yang berdasar fakta hukum resmi (grounded)
 * serta menyertakan sitasi domain tepercaya.
 */
async function runWebGrounding() {
  // Simulasi hasil web search engine eksternal terhadap domain resmi pemerintah
  const mockWebSearchResults = [
    {
      domain: "evisa.imigrasi.go.id",
      title: "Ketentuan Foto Paspor & Visa Kunjungan 2026",
      snippet: "Mulai Januari 2026, foto digital untuk e-Visa wajib berlatar belakang putih polos, format JPEG/PNG, ukuran 400x600 piksel, dan tidak boleh memakai kacamata atau penutup kepala kecuali hijab syar'i tanpa menutupi dagu dan dahi.",
      url: "https://evisa.imigrasi.go.id/rules/photo-2026"
    },
    {
      domain: "kemlu.go.id",
      title: "Edaran Biometrik Foto Dokumen Perjalanan",
      snippet: "Kualitas resolusi minimal 300 DPI, ekspresi wajah netral, mulut tertutup, dan diambil maksimal 6 bulan terakhir.",
      url: "https://kemlu.go.id/id/berita/edaran-biometrik-2026"
    }
  ];

  const userQuestion = "Apa saja syarat foto yang diunggah untuk pengajuan e-Visa terbaru?";

  const prompt = `
Anda adalah Manual Researcher Agent Savvy.AI.
Tugas Anda adalah menjawab pertanyaan pendaftar HANYA berdasarkan hasil pencarian web resmi berikut:

HASIL PENCARIAN WEB RESMI:
${JSON.stringify(mockWebSearchResults, null, 2)}

PERTANYAAN PENDAFTAR:
"${userQuestion}"

Instruksi:
1. Susun panduan poin-poin yang mudah dimengerti warga.
2. Cantumkan sitasi URL sumber resmi di akhir setiap poin.
3. Berikan label lencana kepercayaan: [🟢 Official .go.id]
`;

  console.log('Mengirim query grounding web ke Muse Spark Open...');
  const response = await callOpenSpark({
    messages: [
      { role: 'system', content: 'Anda adalah peneliti regulasi resmi yang berpatokan ketat pada data grounding dan anti-halusinasi.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1
  });

  console.log('\n--- HASIL PANDUAN BERDASARKAN WEB GROUNDING ---');
  console.log(response);
}

runWebGrounding().catch(err => console.error('❌ Error Web Grounding:', err.message));

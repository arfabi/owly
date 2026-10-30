import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://szrhbxuewoppjawqutlw.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6cmhieHVld29wcGphd3F1dGx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzMxMzMzNSwiZXhwIjoyMTA4ODg5MzM1fQ.We4B1pnG-8cQ8a6Y5LiLA0ztgiv9iFnc4yHuyKY6y6w';

const supabase = createClient(supabaseUrl, serviceRoleKey);

const juknisData = [
  // 1. BEASISWA LPDP 2026
  {
    portal_key: 'lpdp',
    document_title: 'Buku Panduan Pendaftaran Beasiswa LPDP 2026',
    section_title: 'Bab II: Persyaratan Umum Pendaftar Beasiswa Reguler',
    page_number: 14,
    chunk_text: 'Pendaftar program Magister (S2) Beasiswa Reguler wajib memiliki Indeks Prestasi Kumulatif (IPK) pada jenjang sarjana minimal 3.00 pada skala 4.00 atau yang setara, yang dibuktikan dengan transkrip nilai asli atau salinan yang telah dilegalisir resmi oleh perguruan tinggi asal.',
    tags: ['ipk', 'reguler', 'transkrip', 's2', 'sarjana']
  },
  {
    portal_key: 'lpdp',
    document_title: 'Buku Panduan Pendaftaran Beasiswa LPDP 2026',
    section_title: 'Bab IV: Relaksasi Persyaratan Beasiswa Daerah Afirmasi 3T',
    page_number: 22,
    chunk_text: 'Pendaftar kategori Afirmasi Daerah 3T (Tertinggal, Terdepan, dan Terluar) memperoleh relaksasi batas minimal IPK sebesar 2.50 pada skala 4.00 untuk jenjang Magister. Pendaftar wajib melampirkan e-KTP dan Kartu Keluarga yang membuktikan domisili resmi berturut-turut minimal 3 tahun di wilayah 3T sesuai Keputusan Presiden.',
    tags: ['afirmasi', '3t', 'ipk', 'ktp', 'kartu keluarga', 'domisili']
  },
  {
    portal_key: 'lpdp',
    document_title: 'Buku Panduan Pendaftaran Beasiswa LPDP 2026',
    section_title: 'Bab V: Ketentuan Standar Sertifikat Bahasa Asing',
    page_number: 18,
    chunk_text: 'Untuk pendaftar universitas luar negeri, sertifikat kemampuan bahasa Inggris yang sah adalah TOEFL iBT (skor minimal 80), IELTS Academic (skor minimal 6.5), atau PTE Academic (skor minimal 58). TOEFL ITP (Institutional Testing Program) atau sertifikat Prediction TIDAK DIPERBOLEHKAN untuk tujuan luar negeri dan hanya diterima untuk tujuan dalam negeri dengan skor minimal 500.',
    tags: ['toefl', 'ielts', 'bahasa', 'skor', 'itp', 'ibt', 'luar negeri']
  },
  {
    portal_key: 'lpdp',
    document_title: 'Buku Panduan Pendaftaran Beasiswa LPDP 2026',
    section_title: 'Bab VI: Format Surat Rekomendasi Akademisi / Tokoh',
    page_number: 29,
    chunk_text: 'Surat rekomendasi wajib diterbitkan paling lama 1 (satu) tahun sebelum penutupan pendaftaran. Rekomendasi harus berasal dari atasan langsung di tempat kerja atau akademisi (Dosen Pembimbing/Dekan/Guru Besar) bergelar minimal Magister, lengkap dengan tanda tangan basah atau tanda tangan elektronik tersertifikasi (BSrE/Kominfo) dan stempel resmi instansi.',
    tags: ['surat rekomendasi', 'tokoh', 'dosen', 'tanda tangan', 'legalisir']
  },
  {
    portal_key: 'lpdp',
    document_title: 'Buku Panduan Pendaftaran Beasiswa LPDP 2026',
    section_title: 'Bab VII: Ketentuan Esai Komitmen Kontribusi',
    page_number: 35,
    chunk_text: 'Esai komitmen kembali ke Indonesia dan rencana pasca studi harus ditulis dalam rentang 1.500 hingga 2.000 kata. Isi esai harus mendeskripsikan: 1) Masalah strategis nasional yang dihadapi, 2) Peran program studi pilihan dalam menjawab masalah tersebut, dan 3) Rencana aksi kontribusi nyata dalam 5 tahun pertama pasca lulus di instansi/masyarakat Indonesia.',
    tags: ['esai', 'komitmen', 'kontribusi', 'rencana studi', 'pasca studi']
  },

  // 2. VISA SCHENGEN (KEDUTAAN EROPA)
  {
    portal_key: 'schengen',
    document_title: 'Schengen Visa Harmonised Guidelines 2026',
    section_title: 'Article 12: Travel Document Passport Validity',
    page_number: 8,
    chunk_text: 'Paspor pemohon visa Schengen wajib memiliki masa berlaku minimal 3 (tiga) bulan terhitung setelah tanggal kepulangan yang direncanakan dari wilayah Schengen. Paspor harus diterbitkan dalam kurun waktu 10 tahun terakhir dan memiliki minimal 2 (dua) halaman kosong tanpa stempel untuk penempelan stiker visa.',
    tags: ['paspor', 'schengen', 'visa', 'masa berlaku', 'halaman kosong']
  },
  {
    portal_key: 'schengen',
    document_title: 'Schengen Visa Harmonised Guidelines 2026',
    section_title: 'Article 15: Mandatory Travel Medical Insurance',
    page_number: 12,
    chunk_text: 'Pemohon wajib melampirkan polis asuransi kesehatan perjalanan yang mencakup seluruh wilayah negara anggota Schengen dengan nilai pertanggungan minimal 30.000 EUR (tiga puluh ribu Euro). Asuransi harus menanggung biaya rawat inap darurat dan evakuasi repatriasi jenazah/medis selama durasi kunjungan penuh.',
    tags: ['asuransi', 'travel insurance', 'pertanggungan', 'repatriasi', 'medis']
  },
  {
    portal_key: 'schengen',
    document_title: 'Schengen Visa Harmonised Guidelines 2026',
    section_title: 'Article 14: Proof of Sufficient Financial Means',
    page_number: 17,
    chunk_text: 'Bukti keuangan wajib dibuktikan melalui rekening koran buku tabungan bank atas nama pemohon selama 3 (tiga) bulan terakhir yang dilegalisir basah oleh pihak bank. Rata-rata saldo mengendap harus mencukupi standar biaya hidup minimal per hari di negara tujuan (rata-rata 70 s/d 100 EUR per hari per orang).',
    tags: ['rekening koran', 'keuangan', 'bank', 'saldo', 'sponsor']
  },

  // 3. CASN / CPNS 2026 (BKN)
  {
    portal_key: 'casn',
    document_title: 'Petunjuk Teknis Pendaftaran CASN BKN 2026',
    section_title: 'Bagian IV: Ketentuan Pembubuhan e-Meterai Peruri',
    page_number: 11,
    chunk_text: 'Setiap dokumen surat lamaran dan surat pernyataan wajib dibubuhi e-Meterai resmi nominal Rp 10.000 dari distributor resmi Peruri. Posisi e-meterai diletakkan di sebelah kiri tanda tangan pelamar dan DILARANG KERAS menimpa/menutupi goresan tanda tangan atau tulisan nama jelas pelamar.',
    tags: ['emeterai', 'peruri', 'meterai', 'tanda tangan', 'surat lamaran']
  },
  {
    portal_key: 'casn',
    document_title: 'Petunjuk Teknis Pendaftaran CASN BKN 2026',
    section_title: 'Bagian V: Akreditasi Program Studi dan Perguruan Tinggi',
    page_number: 16,
    chunk_text: 'Bukti akreditasi perguruan tinggi dan program studi yang diakui adalah akreditasi dari BAN-PT atau Lembaga Akreditasi Mandiri (LAM) yang berlaku PADA SAAT TAHUN KELULUSAN pelamar yang tertera pada ijazah, bukan akreditasi tahun berjalan saat mendaftar.',
    tags: ['akreditasi', 'ban-pt', 'ijazah', 'kelulusan', 'lam']
  }
];

async function seedJuknis() {
  console.log(`--- Seeding Juknis Chunks ke Supabase (${juknisData.length} entri) ---`);

  for (const item of juknisData) {
    const { error } = await supabase
      .from('juknis_chunks')
      .upsert(item, { onConflict: 'portal_key,document_title,section_title' });

    if (error) {
      // Jika conflict key tidak unik, gunakan insert
      const { error: insErr } = await supabase.from('juknis_chunks').insert(item);
      if (insErr) {
        console.warn(`Gagal insert [${item.portal_key}]:`, insErr.message);
      } else {
        console.log(`✅ Inserted: [${item.portal_key}] ${item.section_title}`);
      }
    } else {
      console.log(`✅ Upserted: [${item.portal_key}] ${item.section_title}`);
    }
  }

  const { count } = await supabase
    .from('juknis_chunks')
    .select('*', { count: 'exact', head: true });

  console.log(`\n🎉 SEEDING SELESAI! Total Juknis Chunks di Supabase: ${count} baris.`);
}

seedJuknis().catch(console.error);

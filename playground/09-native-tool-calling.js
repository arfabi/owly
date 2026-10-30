import { callOpenSparkMessage } from './client.js';

console.log('=== [09] TEST NATIVE TOOL CALLING & PARALLEL EXECUTION ===\n');

/**
 * Uji Native Tool Calling (OpenAI Function Calling format):
 * 1. Mendaftarkan definisi tools di payload API
 * 2. Model mengembalikan `tool_calls`
 * 3. Loop eksekusi tool lokal dan kirim balik pesan `role: "tool"` dengan `tool_call_id`
 * 4. Mendukung Parallel Tool Calls (beberapa fungsi dipanggil sekaligus dalam 1 turn)
 */

// Simulasi database / API eksternal
const mockDukcapilDB = {
  '3273010508950002': { status: 'AKTIF', nama: 'Ahmad Fauzi', kota: 'Bandung', status_ktp: 'KTP-el Berlaku Seumur Hidup' },
  '3171011203900001': { status: 'TIDAK_AKTIF', nama: 'Dewi Lestari', kota: 'Jakarta Pusat', catatan: 'Perlu sinkronisasi biometrik di kecamatan' }
};

const mockQuotaDB = {
  'Kanim Bandung': { kuota_tersedia: 42, tanggal_terdekat: '2026-11-03' },
  'Kanim Jakarta Selatan': { kuota_tersedia: 0, tanggal_terdekat: 'Penuh hingga akhir bulan' }
};

// Implementasi fungsi lokal
function verifyDukcapilNik({ nik }) {
  console.log(`  ⚡ [Tool Executed] verifyDukcapilNik(nik: "${nik}")`);
  const record = mockDukcapilDB[nik];
  if (!record) return JSON.stringify({ error: 'NIK tidak ditemukan di database pusat' });
  return JSON.stringify(record);
}

function checkPassportQuota({ kanim_name }) {
  console.log(`  ⚡ [Tool Executed] checkPassportQuota(kanim: "${kanim_name}")`);
  const quota = mockQuotaDB[kanim_name];
  if (!quota) return JSON.stringify({ error: 'Kantor imigrasi tidak dikenali' });
  return JSON.stringify(quota);
}

const toolsMap = {
  verify_dukcapil_nik: verifyDukcapilNik,
  check_passport_quota: checkPassportQuota,
};

// Definisi Tools (OpenAI Specification)
const tools = [
  {
    type: 'function',
    function: {
      name: 'verify_dukcapil_nik',
      description: 'Memeriksa keabsahan dan status aktif NIK warga di database pusat Dukcapil Kemendagri.',
      parameters: {
        type: 'object',
        properties: {
          nik: {
            type: 'string',
            description: '16 digit Nomor Induk Kependudukan (NIK)'
          }
        },
        required: ['nik']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'check_passport_quota',
      description: 'Memeriksa sisa kuota dan jadwal antrean pembuatan paspor di Kantor Imigrasi tertentu.',
      parameters: {
        type: 'object',
        properties: {
          kanim_name: {
            type: 'string',
            description: 'Nama Kantor Imigrasi, contoh: "Kanim Bandung" atau "Kanim Jakarta Selatan"'
          }
        },
        required: ['kanim_name']
      }
    }
  }
];

async function runToolCallingLoop() {
  const userQuery = 'Halo Savvy, tolong cek status NIK 3273010508950002 dan NIK 3171011203900001, serta periksa sisa kuota paspor di Kanim Bandung dan Kanim Jakarta Selatan.';
  console.log(`[User Query]: "${userQuery}"\n`);

  const messages = [
    {
      role: 'system',
      content: 'Anda adalah asisten cerdas Savvy.AI. Gunakan native tool calling untuk mengambil data sebelum memberikan jawaban.'
    },
    {
      role: 'user',
      content: userQuery
    }
  ];

  let turn = 1;
  const MAX_TURNS = 5;

  while (turn <= MAX_TURNS) {
    console.log(`--- [Turn ${turn}] Mengirim permintaan ke Muse Spark Open ---`);

    const response = await callOpenSparkMessage({
      messages,
      tools,
      tool_choice: 'auto',
      temperature: 0.1,
    });

    const assistantMsg = response.message;
    messages.push(assistantMsg);

    // Cek apakah model meminta eksekusi tool
    if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
      console.log('\n✅ [Selesai] Model memberikan jawaban akhir:\n');
      console.log(assistantMsg.content);
      break;
    }

    console.log(`\nModel meminta ${assistantMsg.tool_calls.length} panggilan tool secara paralel:`);

    // Eksekusi semua tool calls (Parallel execution)
    for (const toolCall of assistantMsg.tool_calls) {
      const funcName = toolCall.function.name;
      const funcArgs = JSON.parse(toolCall.function.arguments || '{}');
      const toolFn = toolsMap[funcName];

      let toolOutput = '';
      if (toolFn) {
        toolOutput = toolFn(funcArgs);
      } else {
        toolOutput = JSON.stringify({ error: `Function ${funcName} tidak ditemukan` });
      }

      // Sesuai panduan Meta: balasan tiap call harus dikirim dengan role: "tool" & tool_call_id
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: toolOutput
      });
    }

    console.log('\nSemua tool output telah dimasukkan ke percakapan. Melanjutkan siklus...\n');
    turn++;
  }
}

runToolCallingLoop().catch((err) => {
  console.error('❌ Error Tool Calling:', err.message);
});

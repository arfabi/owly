import { callOpenSpark } from './client.js';

console.log('=== [04] TEST LAST RESPONSE (Conversational Context Threading) ===\n');

/**
 * Pengujian mempertahankan riwayat pesan terakhir (Context Retention / Rolling History):
 * Menyimulasikan percakapan interaktif di mana pertanyaan kedua merujuk pada respons pertama ("last response").
 */
async function runContextThread() {
  const history = [
    {
      role: 'system',
      content: 'Anda adalah Form Companion AI di Side Panel Savvy.AI yang membantu warga mengisi formulir beasiswa.',
    },
  ];

  // Turn 1: Pertanyaan umum pertama
  const userMsg1 = "Saya bingung dengan kolom 'Nomor Apostille Ijazah'. Apa maksudnya?";
  console.log(`[User]: ${userMsg1}`);
  history.push({ role: 'user', content: userMsg1 });

  console.log('⏳ Mengirim pesan 1...');
  const reply1 = await callOpenSpark({ messages: history });
  console.log(`\n[Savvy AI - Response 1]:\n${reply1}\n`);
  history.push({ role: 'assistant', content: reply1 });

  // Turn 2: Pertanyaan lanjutan yang merujuk pada "Last Response" (respons sebelumnya)
  const userMsg2 = "Lalu bagaimana jika kampus luar negeri tujuan saya belum meratifikasi konvensi tersebut? Apa penggantinya?";
  console.log(`[User]: ${userMsg2}`);
  history.push({ role: 'user', content: userMsg2 });

  console.log('⏳ Mengirim pesan 2 dengan membawa konteks pesan sebelumnya...');
  const reply2 = await callOpenSpark({ messages: history });
  console.log(`\n[Savvy AI - Response 2]:\n${reply2}\n`);

  console.log('✅ Context continuity berhasil diuji!');
}

runContextThread().catch(err => console.error('❌ Error Context Thread:', err.message));

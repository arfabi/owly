import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const basetenApiKey = process.env.BASETEN_API_KEY || '';
const basetenBaseUrl = process.env.BASETEN_BASE_URL || 'https://inference.baseten.co/v1';
const modelName = process.env.MUSE_SPARK_MODEL_NAME || 'meta-models/muse-spark-open-1026';

// 1. Regex Scrubber untuk Deteksi PII Sensitif
const PII_REGEX_NIK = /\b[1-9]\d{15}\b/g;
const PII_REGEX_NPWP = /\b\d{2}\.?\d{3}\.?\d{3}\.?\d{1}-?\d{3}\.?\d{3}\b/g;
const PII_REGEX_CARD = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;

function sanitizePII(text: string): { cleanText: string; hasPII: boolean } {
  let hasPII = false;
  let cleanText = text.replace(PII_REGEX_NIK, () => {
    hasPII = true;
    return '[NIK_DISENSOR]';
  });
  cleanText = cleanText.replace(PII_REGEX_NPWP, () => {
    hasPII = true;
    return '[NPWP_DISENSOR]';
  });
  cleanText = cleanText.replace(PII_REGEX_CARD, () => {
    hasPII = true;
    return '[NOMOR_KARTU_DISENSOR]';
  });
  return { cleanText, hasPII };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, userId, message, portalDomain = 'web-page', pageUrl = '', pageTitle = '' } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 });
    }

    // 1. Sensor PII (UU PDP Guard)
    const { cleanText, hasPII } = sanitizePII(message);
    if (hasPII) {
      return NextResponse.json({
        reply: 'Demi keamanan dan privasi datamu (UU PDP), mohon untuk tidak mengirimkan nomor identitas pribadi (seperti NIK, NPWP, atau nomor kartu) ke dalam kolom chat. Silakan simpan dan enkripsi data tersebut di Vault Data Pribadi kamu.',
        piiBlocked: true
      });
    }

    // 2. Ambil atau buat sesi chat
    let activeSessionId = sessionId;
    let compactedSummary: string | null = null;
    let currentMessageCount = 0;

    if (activeSessionId) {
      const { data: session } = await supabase
        .from('chat_sessions')
        .select('id, compacted_summary, message_count')
        .eq('id', activeSessionId)
        .maybeSingle();

      if (session) {
        compactedSummary = session.compacted_summary;
        currentMessageCount = session.message_count || 0;
      } else {
        activeSessionId = null;
      }
    }

    // Jika sesi belum ada, buat sesi baru
    if (!activeSessionId) {
      // Gunakan user ID yang valid atau fallback anonim
      let targetUserId = userId;
      if (!targetUserId) {
        // Ambil ID user pertama atau biarkan null jika anon
        const { data: existingUser } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
        targetUserId = existingUser?.id;
      }

      if (targetUserId) {
        const { data: newSession } = await supabase
          .from('chat_sessions')
          .insert({
            user_id: targetUserId,
            tab_id: `tab_${Date.now()}`,
            portal_domain: portalDomain,
            title: cleanText.substring(0, 40) + '...'
          })
          .select('id')
          .single();

        if (newSession) {
          activeSessionId = newSession.id;
        }
      }
    }

    // 3. Ambil 10 pesan terakhir dari database (Sliding Window)
    let historyMessages: { role: string; content: string }[] = [];
    if (activeSessionId) {
      const { data: history } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('session_id', activeSessionId)
        .order('created_at', { ascending: true })
        .limit(10);

      if (history) {
        historyMessages = history.map(h => ({
          role: h.role,
          content: h.content
        }));
      }
    }

    // 4. Susun Context Payload adaptif untuk Muse Spark Open di Baseten
    const isScholarshipPortal = portalDomain.toLowerCase().includes('lpdp') || portalDomain.toLowerCase().includes('beasiswa');
    const isImmigrationPortal = portalDomain.toLowerCase().includes('paspor') || portalDomain.toLowerCase().includes('visa') || portalDomain.toLowerCase().includes('imigrasi');

    const systemPromptContent = `Kamu adalah Savvy AI — Smart Form & Public Service Web Companion yang ramah, solutif, empatik, dan cerdas.
Konteks Halaman Pengguna Saat Ini:
- Website / Domain: "${portalDomain || 'Halaman Web'}"
${pageUrl ? `- URL Halaman: "${pageUrl}"` : ''}
${pageTitle ? `- Judul Halaman: "${pageTitle}"` : ''}

Pedoman Asisten:
1. Bantulah pengguna secara relevan dan adaptif sesuai konteks website atau formulir yang sedang mereka akses saat ini.
2. JANGAN mengasumsikan pengguna sedang mendaftar beasiswa KECUALI domain/halaman yang dibuka memang tentang beasiswa (${isScholarshipPortal ? 'aktif: portal beasiswa' : 'bukan portal beasiswa'}) atau pengguna sendiri yang spesifik bertanya tentang beasiswa!
3. Jika pengguna membuka portal imigrasi/paspor, OSS, perizinan, formulir pendaftaran kerja, atau website umum lainnya, jawablah secara tepat sasaran sesuai konteks topik tersebut.
4. Jika ada informasi yang membutuhkan data identitas pribadi (seperti NIK, NPWP, atau nomor kartu), ingatkan pengguna bahwa data tersebut dapat disimpan dan diisi otomatis melalui fitur Vault Data Pribadi terenkripsi (UU PDP).
5. Berikan jawaban yang tepat, lugas, dan ringkas dalam Bahasa Indonesia.`;

    const messagesPayload: any[] = [
      {
        role: 'system',
        content: systemPromptContent
      }
    ];

    // Injeksi memori ringkasan jika ada
    if (compactedSummary) {
      messagesPayload.push({
        role: 'system',
        content: `[Memori Profil Pendaftar]: ${compactedSummary}`
      });
    }

    // Tambahkan 10 pesan percakapan terakhir
    if (historyMessages.length > 0) {
      messagesPayload.push(...historyMessages);
    }

    // Tambahkan pesan user saat ini
    messagesPayload.push({ role: 'user', content: cleanText });

    // 5. Panggil Baseten Inference API
    const response = await fetch(`${basetenBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${basetenApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelName,
        messages: messagesPayload,
        reasoning_effort: 'medium',
        temperature: 0.3,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Baseten API Error:', errText);
      return NextResponse.json({ error: 'Gagal menghubungi model AI', details: errText }, { status: 502 });
    }

    const completion = await response.json();
    const reply = completion.choices?.[0]?.message?.content || 'Maaf, saya tidak dapat memproses jawaban saat ini.';

    // 6. Simpan percakapan ke database Supabase
    if (activeSessionId) {
      await supabase.from('chat_messages').insert([
        { session_id: activeSessionId, role: 'user', content: cleanText },
        { session_id: activeSessionId, role: 'assistant', content: reply }
      ]);

      const updatedCount = currentMessageCount + 2;
      await supabase
        .from('chat_sessions')
        .update({
          message_count: updatedCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeSessionId);

      // 7. Auto-Compacting Background: Jika pesan > 10, buat ringkasan profil user
      if (updatedCount > 10 && updatedCount % 6 === 0) {
        triggerCompacting(activeSessionId, messagesPayload);
      }
    }

    return NextResponse.json({
      reply,
      sessionId: activeSessionId
    });

  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// Background Task: Memperbarui ringkasan konteks pendaftar tanpa memblokir chat utama
async function triggerCompacting(sessionId: string, fullContext: any[]) {
  try {
    const compactRes = await fetch(`${basetenBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${basetenApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          ...fullContext,
          {
            role: 'user',
            content: 'Ekstrak dan rangkum fakta profil pendaftar ini (nama, tujuan beasiswa, latar belakang pendidikan, IPK, skor bahasa, dan kendala) dalam maksimal 2 kalimat padat untuk memori konteks sesi mendatang.'
          }
        ],
        temperature: 0.1,
        max_tokens: 150
      })
    });

    const data = await compactRes.json();
    const summary = data.choices?.[0]?.message?.content;
    if (summary) {
      await supabase
        .from('chat_sessions')
        .update({ compacted_summary: summary })
        .eq('id', sessionId);
      console.log(`[Compacting] Session ${sessionId} summary updated:`, summary);
    }
  } catch (err) {
    console.error('[Compacting] Error generating summary:', err);
  }
}

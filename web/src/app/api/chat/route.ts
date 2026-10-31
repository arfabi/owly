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
  const startTime = Date.now();
  const agent_logs: Array<{ domain: string; message: string; data?: any }> = [];

  try {
    const body = await req.json();
    const {
      sessionId,
      userId,
      message,
      portalDomain = 'web-page',
      pageUrl = '',
      pageTitle = '',
      imageBase64 = null,
      meta = null,
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 });
    }

    // 1. Sensor PII (UU PDP Guard)
    const { cleanText, hasPII } = sanitizePII(message);
    if (hasPII) {
      agent_logs.push({
        domain: 'SECURITY',
        message: 'UU PDP Scrubber: Blocked sensitive PII in prompt (NIK/NPWP/Card).'
      });
      return NextResponse.json({
        reply: 'Demi keamanan dan privasi datamu (UU PDP), mohon untuk tidak mengirimkan nomor identitas pribadi (seperti NIK, NPWP, atau nomor kartu) ke dalam kolom chat. Silakan simpan dan enkripsi data tersebut di Vault Data Pribadi kamu.',
        piiBlocked: true,
        agent_logs
      });
    }

    agent_logs.push({
      domain: 'SECURITY',
      message: 'UU PDP Scrubber: Verified clean prompt, 0 PII leaks detected.'
    });

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

    const metaInfoLines: string[] = [];
    if (meta?.description) metaInfoLines.push(`- Meta Deskripsi Halaman: "${meta.description}"`);
    if (meta?.keywords) metaInfoLines.push(`- Meta Keywords: "${meta.keywords}"`);
    if (meta?.ogTitle && meta.ogTitle !== pageTitle) metaInfoLines.push(`- OpenGraph Title: "${meta.ogTitle}"`);
    if (meta?.ogDescription && meta.ogDescription !== meta.description) metaInfoLines.push(`- OpenGraph Deskripsi: "${meta.ogDescription}"`);
    if (meta?.lang) metaInfoLines.push(`- Bahasa Halaman: "${meta.lang}"`);
    if (imageBase64) metaInfoLines.push(`- Lampiran Gambar: Tangkapan layar area visual berhasil dilampirkan.`);

    const systemPromptContent = `Kamu adalah Savvy AI — Smart Form & Public Service Web Companion yang ramah, solutif, empatik, dan cerdas.
Konteks Halaman Pengguna Saat Ini:
- Website / Domain: "${portalDomain || 'Halaman Web'}"
${pageUrl ? `- URL Halaman: "${pageUrl}"` : ''}
${pageTitle ? `- Judul Halaman: "${pageTitle}"` : ''}
${metaInfoLines.length > 0 ? metaInfoLines.join('\n') : ''}

Pedoman Asisten:
1. Bantulah pengguna secara relevan dan adaptif sesuai konteks website, meta informasi, dan tangkapan layar area yang mereka tanyakan saat ini (baik berupa tabel, perbandingan data, instruksi formulir, diagram, teks regulasi, foto/gambar, atau konten web lainnya).
2. Jika pengguna bertanya tentang tampilan visual, gambar, foto, warna pakaian/baju/objek di layar, tombol, atau tata letak yang belum Anda lihat gambarnya, Anda memiliki TOOL 'capture_current_screen' untuk meminta tangkapan layar otomatis.
3. JANGAN mengasumsikan pengguna sedang mendaftar beasiswa KECUALI domain/halaman yang dibuka memang tentang beasiswa (${isScholarshipPortal ? 'aktif: portal beasiswa' : 'bukan portal beasiswa'}) atau pengguna sendiri yang spesifik bertanya tentang beasiswa!
4. Jika pengguna membuka portal imigrasi/paspor, visa, OSS, perizinan, formulir pendaftaran kerja, atau website umum lainnya, jawablah secara tepat sasaran sesuai konteks topik tersebut.
5. Jika ada informasi yang membutuhkan data identitas pribadi (seperti NIK, NPWP, atau nomor kartu), ingatkan pengguna bahwa data tersebut dapat disimpan dan diisi otomatis melalui fitur Vault Data Pribadi terenkripsi (UU PDP).
6. Berikan jawaban yang tepat, lugas, dan ringkas dalam Bahasa Indonesia.`;

    const AVAILABLE_TOOLS = [
      {
        type: "function",
        function: {
          name: "capture_current_screen",
          description: "Ambil tangkapan layar (screenshot) halaman web aktif pengguna saat ini. Panggil tool ini JIKA pengguna menanyakan tentang foto, gambar, warna baju/pakaian, objek visual, diagram, tombol/elemen tertentu di layar, atau apa pun yang membutuhkan pengamatan visual langsung pada layar pengguna.",
          parameters: {
            type: "object",
            properties: {
              reason: {
                type: "string",
                description: "Alasan mengapa screenshot layar pengguna dibutuhkan untuk menjawab pertanyaan."
              }
            },
            required: ["reason"]
          }
        }
      }
    ];

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

    // 5. Eksekusi Model — Cek apakah ini Turn 2 (Tool Execution Return) atau Turn 1
    const { toolExecution = null } = body;
    let response: Response;

    if (toolExecution && imageBase64) {
      // ======================================================================
      // TURN 2: Tool Execution Return (Client completed capture_current_screen)
      // ======================================================================
      agent_logs.push({
        domain: 'ACTION',
        message: `Agentic Tool Loop [Turn 2]: Received '${toolExecution.toolName}' result from extension client.`,
        data: { toolCallId: toolExecution.toolCallId }
      });

      // Tambahkan history pesan dari Turn 1
      messagesPayload.push({
        role: 'user',
        content: cleanText
      });

      // Asisten memanggil tool
      messagesPayload.push({
        role: 'assistant',
        content: null,
        tool_calls: [
          {
            id: toolExecution.toolCallId || 'call_capture_screen',
            type: 'function',
            function: {
              name: toolExecution.toolName || 'capture_current_screen',
              arguments: typeof toolExecution.toolArgs === 'string'
                ? toolExecution.toolArgs
                : JSON.stringify(toolExecution.toolArgs || { reason: 'Observasi visual layar' })
            }
          }
        ]
      });

      // Respons dari tool
      messagesPayload.push({
        role: 'tool',
        tool_call_id: toolExecution.toolCallId || 'call_capture_screen',
        content: 'Tangkapan layar halaman aktif berhasil diambil dan dilampirkan oleh Savvy Agent.'
      });

      // Pesan multimodal dengan gambar screenshot yang diminta
      messagesPayload.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Berikut adalah tangkapan layar (screenshot) halaman saat ini yang diminta. Silakan amati dan jawab pertanyaan saya secara akurat: "${cleanText}"`
          },
          {
            type: 'image_url',
            image_url: {
              url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
            }
          }
        ]
      });

      agent_logs.push({
        domain: 'PERCEPTION',
        message: 'Multimodal Vision: Meta Muse Spark Open analyzing active screen capture.'
      });

      response = await fetch(`${basetenBaseUrl}/chat/completions`, {
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

    } else if (imageBase64) {
      // ======================================================================
      // Visual Snip / Lightshot crop terlampir langsung dari pengguna
      // ======================================================================
      agent_logs.push({
        domain: 'PERCEPTION',
        message: 'Multimodal Vision: Attached Lightshot visual snip for Muse Spark reasoning.'
      });
      messagesPayload.push({
        role: 'user',
        content: [
          { type: 'text', text: cleanText },
          {
            type: 'image_url',
            image_url: {
              url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
            }
          }
        ]
      });

      response = await fetch(`${basetenBaseUrl}/chat/completions`, {
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

    } else {
      // ======================================================================
      // TURN 1: Text Prompt with Tool Calling capability (OpenAI-compatible)
      // ======================================================================
      messagesPayload.push({ role: 'user', content: cleanText });

      agent_logs.push({
        domain: 'PLANNER',
        message: 'Agentic Tool Loop [Turn 1]: Providing tools [capture_current_screen] to Meta Muse Spark Open.'
      });

      try {
        response = await fetch(`${basetenBaseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${basetenApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: modelName,
            messages: messagesPayload,
            tools: AVAILABLE_TOOLS,
            tool_choice: 'auto',
            reasoning_effort: 'medium',
            temperature: 0.2,
            max_tokens: 800
          })
        });

        // Fallback jika provider tidak mendukung parameter tools
        if (!response.ok && response.status === 400) {
          console.warn('[Tool Calling Fallback] Retrying without tools parameter');
          response = await fetch(`${basetenBaseUrl}/chat/completions`, {
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
        }
      } catch (err: any) {
        console.error('Baseten call error:', err);
        throw err;
      }
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('Baseten API Error:', errText);
      return NextResponse.json({ error: 'Gagal menghubungi model AI', details: errText }, { status: 502 });
    }

    const completion = await response.json();
    const choice = completion.choices?.[0];
    const toolCalls = choice?.message?.tool_calls;

    // Cek apakah Muse Spark Open memutuskan untuk memanggil tool!
    if (toolCalls && toolCalls.length > 0) {
      const primaryTool = toolCalls[0];
      let parsedArgs: any = {};
      try {
        parsedArgs = typeof primaryTool.function?.arguments === 'string'
          ? JSON.parse(primaryTool.function.arguments)
          : (primaryTool.function?.arguments || {});
      } catch (_) {
        parsedArgs = { raw: primaryTool.function?.arguments };
      }

      const toolName = primaryTool.function?.name || 'capture_current_screen';
      agent_logs.push({
        domain: 'PLANNER',
        message: `Agentic Decision: Muse Spark opted to invoke tool '${toolName}' (${parsedArgs.reason || 'Visual context needed'})`,
        data: {
          toolCallId: primaryTool.id,
          name: toolName,
          arguments: parsedArgs
        }
      });

      return NextResponse.json({
        requiresAction: true,
        toolCall: {
          id: primaryTool.id || `call_${Date.now()}`,
          name: toolName,
          arguments: parsedArgs
        },
        sessionId: activeSessionId,
        agent_logs
      });
    }

    const reply = choice?.message?.content || 'Maaf, saya tidak dapat memproses jawaban saat ini.';
    const latency = Date.now() - startTime;

    agent_logs.push({
      domain: 'REASONING',
      message: `Meta Muse Spark Open inference completed in ${latency}ms`,
      data: {
        model: modelName,
        totalTokens: completion.usage?.total_tokens,
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens
      }
    });

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
        agent_logs.push({
          domain: 'PLANNER',
          message: 'Background Compactor: Triggered 10-message sliding window summarization.'
        });
        triggerCompacting(activeSessionId, messagesPayload);
      }
    }

    return NextResponse.json({
      reply,
      sessionId: activeSessionId,
      agent_logs
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

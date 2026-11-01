import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const basetenApiKey = process.env.BASETEN_API_KEY || '';
const basetenBaseUrl = process.env.BASETEN_BASE_URL || 'https://inference.baseten.co/v1';
const modelName = process.env.MUSE_SPARK_MODEL_NAME || 'meta-models/muse-spark-open-1026';

// 1. Universal PII Regex Scrubber (GDPR / Privacy Shield / Global Data Protection)
const PII_REGEX_NATIONAL_ID = /\b[1-9]\d{15}\b/g; // 16-digit National IDs / NIK
const PII_REGEX_SSN = /\b\d{3}-\d{2}-\d{4}\b/g; // US SSN
const PII_REGEX_TAX = /\b\d{2}\.?\d{3}\.?\d{3}\.?\d{1}-?\d{3}\.?\d{3}\b/g; // Tax IDs / NPWP
const PII_REGEX_CARD = /\b(?:\d{4}[ -]?){3}\d{4}\b/g; // Credit/Debit Card Numbers

function sanitizePII(text: string): { cleanText: string; hasPII: boolean } {
  let hasPII = false;
  let cleanText = text.replace(PII_REGEX_NATIONAL_ID, () => {
    hasPII = true;
    return '[NATIONAL_ID_REDACTED]';
  });
  cleanText = cleanText.replace(PII_REGEX_SSN, () => {
    hasPII = true;
    return '[SSN_REDACTED]';
  });
  cleanText = cleanText.replace(PII_REGEX_TAX, () => {
    hasPII = true;
    return '[TAX_ID_REDACTED]';
  });
  cleanText = cleanText.replace(PII_REGEX_CARD, () => {
    hasPII = true;
    return '[CARD_NUMBER_REDACTED]';
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
      lang = 'en',
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const isEn = lang !== 'id';

    // 1. Privacy Scrubber (GDPR / Data Protection Acts)
    const { cleanText, hasPII } = sanitizePII(message);
    if (hasPII) {
      agent_logs.push({
        domain: 'SECURITY',
        message: 'Data Privacy Guard: Blocked sensitive PII in prompt (SSN/National ID/Card/Tax ID).'
      });
      return NextResponse.json({
        reply: isEn
          ? 'For your security and privacy (GDPR / Data Protection Compliance), please do not paste sensitive personal credentials (such as SSN, National ID, or credit card numbers) into the chat. Please securely store and autofill them from your encrypted Zero-Knowledge Vault.'
          : 'Demi keamanan dan privasi data Anda (Kepatuhan UU PDP / Perlindungan Data), mohon untuk tidak mengirimkan nomor identitas sensitif (seperti NIK, SSN, NPWP, atau nomor kartu kredit) ke dalam chat. Anda dapat menyimpannya dengan aman di Vault Data Pribadi terenkripsi.',
        piiBlocked: true,
        agent_logs
      });
    }

    agent_logs.push({
      domain: 'SECURITY',
      message: 'Data Privacy Guard: Clean prompt verified, 0 PII leaks detected.'
    });

    // 2. Retrieve or initialize chat session
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

    // 4. Construct adaptive Context Payload for Meta Muse Spark Open on Baseten
    const metaInfoLines: string[] = [];
    if (meta?.description) metaInfoLines.push(`- Meta Description: "${meta.description}"`);
    if (meta?.keywords) metaInfoLines.push(`- Meta Keywords: "${meta.keywords}"`);
    if (meta?.ogTitle && meta.ogTitle !== pageTitle) metaInfoLines.push(`- OpenGraph Title: "${meta.ogTitle}"`);
    if (meta?.ogDescription && meta.ogDescription !== meta.description) metaInfoLines.push(`- OpenGraph Description: "${meta.ogDescription}"`);
    if (meta?.lang) metaInfoLines.push(`- Page Language: "${meta.lang}"`);
    if (imageBase64) metaInfoLines.push(`- Visual Attachment: Active screen capture / snip attached.`);

    const systemPromptContent = isEn
      ? `You are Owly AI — an intelligent, empathetic, and knowledgeable Public Service & Form Companion.
Current User Web Page Context:
- Domain: "${portalDomain || 'Web Page'}"
${pageUrl ? `- URL: "${pageUrl}"` : ''}
${pageTitle ? `- Page Title: "${pageTitle}"` : ''}
${metaInfoLines.length > 0 ? metaInfoLines.join('\n') : ''}

Assistant Guidelines:
1. Provide highly relevant, contextual, and clear guidance based on the active website, form instructions, metadata, and visual attachments.
2. If the user asks about visual elements, images, button locations, layout styling, or clothing/photo requirements that you cannot currently see, call the deterministic tool 'capture_current_screen' to request an automatic screen capture.
3. Maintain universal applicability across official global portals (visa applications like US DS-160/UKVI, university admissions like Common App/UCAS, government services, or employment registries).
4. If personal credentials or sensitive identity records are needed, remind the user to securely store and autofill them from their encrypted Zero-Knowledge Vault.
5. Provide concise, direct, and well-structured answers in English.`
      : `Kamu adalah Owly AI — Smart Form & Public Service Web Companion yang ramah, solutif, empatik, dan cerdas.
Konteks Halaman Pengguna Saat Ini:
- Website / Domain: "${portalDomain || 'Halaman Web'}"
${pageUrl ? `- URL Halaman: "${pageUrl}"` : ''}
${pageTitle ? `- Judul Halaman: "${pageTitle}"` : ''}
${metaInfoLines.length > 0 ? metaInfoLines.join('\n') : ''}

Pedoman Asisten:
1. Bantulah pengguna secara relevan dan adaptif sesuai konteks website, meta informasi, dan tangkapan layar area yang mereka tanyakan saat ini.
2. Jika pengguna bertanya tentang tampilan visual, gambar, foto, warna pakaian/baju/objek di layar, tombol, atau tata letak yang belum Anda lihat gambarnya, panggil tool 'capture_current_screen' untuk meminta tangkapan layar otomatis.
3. Berlaku universal untuk seluruh portal publik, pendaftaran visa, universitas, perizinan, dan formulir administratif.
4. Jika membutuhkan data identitas pribadi, ingatkan pengguna bahwa data tersebut dapat disimpan dan diisi otomatis melalui fitur Vault Data Pribadi terenkripsi.
5. Berikan jawaban yang tepat, lugas, dan ringkas dalam Bahasa Indonesia.`;

    const AVAILABLE_TOOLS = [
      {
        type: "function",
        function: {
          name: "capture_current_screen",
          description: "Captures a screenshot of the user's active viewport. Call this tool IF the user asks about photos, images, visual elements, button locations, page layout, or anything requiring visual observation of the screen.",
          parameters: {
            type: "object",
            properties: {
              reason: {
                type: "string",
                description: "Reason why a screenshot of the user's viewport is necessary to answer the inquiry."
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

    // Inject compacted memory summary if available
    if (compactedSummary) {
      messagesPayload.push({
        role: 'system',
        content: `[Applicant Profile Context Memory]: ${compactedSummary}`
      });
    }

    // Add sliding window of last 10 conversation turns
    if (historyMessages.length > 0) {
      messagesPayload.push(...historyMessages);
    }

    // 5. Model Execution — Turn 2 (Tool Execution Return) or Turn 1 (Initial Prompt)
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

      // Add user message from Turn 1
      messagesPayload.push({
        role: 'user',
        content: cleanText
      });

      // Assistant tool call
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
                : JSON.stringify(toolExecution.toolArgs || { reason: 'Visual viewport observation' })
            }
          }
        ]
      });

      // Tool response
      messagesPayload.push({
        role: 'tool',
        tool_call_id: toolExecution.toolCallId || 'call_capture_screen',
        content: 'Screenshot of active viewport captured and attached successfully.'
      });

      // Multimodal vision message with attached screenshot
      messagesPayload.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: isEn
              ? `Here is the requested screenshot of the active viewport. Please observe it carefully and answer my inquiry: "${cleanText}"`
              : `Berikut adalah tangkapan layar (screenshot) halaman saat ini yang diminta. Silakan amati dan jawab pertanyaan saya secara akurat: "${cleanText}"`
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
            content: 'Extract and summarize key applicant profile facts (name, application goal, educational background, GPA, language test scores, and constraints) in at most 2 dense sentences for future session context memory.'
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


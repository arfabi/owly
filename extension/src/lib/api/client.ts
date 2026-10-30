// ============================================================================
// SAVVY.AI — Cloud API Client (Next.js Backend Bridge)
// Production endpoint: https://savvy-companion.vercel.app/
// ============================================================================

import { agentLog } from "../agentLogger";

export const API_BASE_URL = "https://savvy-companion.vercel.app";

// 1. CHAT API: Multi-turn sliding context + Meta Muse Spark Open via Baseten
export async function sendChatMessage(
  message: string,
  sessionId?: string | null,
  portalDomain: string = "web-page",
  pageUrl?: string,
  pageTitle?: string
): Promise<{ reply: string; sessionId?: string; piiBlocked?: boolean }> {
  const startTime = Date.now();
  agentLog.reasoning(`🚀 [API Request] POST ${API_BASE_URL}/api/chat`, {
    portalDomain,
    pageUrl,
    pageTitle,
    message: message.substring(0, 60) + (message.length > 60 ? "..." : ""),
    sessionId: sessionId || "new_session",
  });

  try {
    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        sessionId,
        portalDomain,
        pageUrl,
        pageTitle,
      }),
    });

    const elapsed = Date.now() - startTime;

    if (!res.ok) {
      const errText = await res.text();
      agentLog.reasoning(`⚠️ [API Error] POST /api/chat returned HTTP ${res.status} (${elapsed}ms)`, { errText });
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    agentLog.reasoning(`✅ [API Success] POST /api/chat responded (${elapsed}ms)`, {
      sessionId: data.sessionId,
      replyPreview: data.reply?.substring(0, 80) + "...",
      piiBlocked: data.piiBlocked || false,
    });

    return data;
  } catch (error: any) {
    agentLog.reasoning(`❌ [API Failed] POST /api/chat failed to fetch, using grounded fallback.`, {
      error: error.message,
    });
    throw error;
  }
}

// 2. COACH FIELD GUIDANCE API: 4-Element Card (Juknis RAG + Muse Spark)
export interface FieldGuidanceResponse {
  meaning: string;
  how_to_fill: string;
  example: string;
  pitfalls: string;
  confirmation_ref?: string;
  source_type?: string;
  cached?: boolean;
}

export async function fetchFieldCoachGuidance(
  fieldKey: string,
  fieldName: string = "",
  portalDomain: string = "beasiswalpdp.kemenkeu.go.id",
  contextText: string = ""
): Promise<FieldGuidanceResponse> {
  const startTime = Date.now();
  agentLog.reasoning(`🚀 [API Request] POST ${API_BASE_URL}/api/coach/field`, {
    fieldKey,
    fieldName,
    portalDomain,
  });

  try {
    const res = await fetch(`${API_BASE_URL}/api/coach/field`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fieldKey,
        fieldName,
        portalDomain,
        contextText,
        language: "id",
      }),
    });

    const elapsed = Date.now() - startTime;

    if (!res.ok) {
      const errText = await res.text();
      agentLog.reasoning(`⚠️ [API Error] POST /api/coach/field returned HTTP ${res.status} (${elapsed}ms)`);
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    agentLog.reasoning(`✅ [API Success] POST /api/coach/field responded (${elapsed}ms)`, {
      cached: data.cached || false,
      source: data.source_type,
      ref: data.confirmation_ref,
    });

    return data;
  } catch (error: any) {
    agentLog.reasoning(`❌ [API Failed] POST /api/coach/field failed, using fallback.`, { error: error.message });
    throw error;
  }
}

// 3. VOICE TRANSCRIBE API: Meta Muse Voice / Whisper Transcription
export async function transcribeVoiceAudio(
  audioBase64: string,
  prompt: string = "Transkripsikan ucapan pendaftar formulir beasiswa ini secara akurat."
): Promise<{ text: string }> {
  const startTime = Date.now();
  agentLog.voice(`🚀 [API Request] POST ${API_BASE_URL}/api/voice/transcribe`, {
    payloadSize: `${Math.round(audioBase64.length / 1024)} KB`,
  });

  try {
    const res = await fetch(`${API_BASE_URL}/api/voice/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audioBase64,
        prompt,
      }),
    });

    const elapsed = Date.now() - startTime;

    if (!res.ok) {
      const errText = await res.text();
      agentLog.voice(`⚠️ [API Error] POST /api/voice/transcribe returned HTTP ${res.status} (${elapsed}ms)`);
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    agentLog.voice(`✅ [API Success] POST /api/voice/transcribe responded (${elapsed}ms)`, {
      transcription: data.text,
    });

    return data;
  } catch (error: any) {
    agentLog.voice(`❌ [API Failed] POST /api/voice/transcribe failed.`, { error: error.message });
    throw error;
  }
}

// 4. EXPLAIN VISUAL SNIP API: Native Multimodal Vision
export async function explainVisualSnip(
  imageBase64: string,
  contextLabel: string = "Bagian Formulir / Dokumen",
  portalUrl: string = "beasiswalpdp.kemenkeu.go.id"
): Promise<any> {
  const startTime = Date.now();
  agentLog.reasoning(`🚀 [API Request] POST ${API_BASE_URL}/api/explain`, {
    contextLabel,
    portalUrl,
  });

  try {
    const res = await fetch(`${API_BASE_URL}/api/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64,
        contextLabel,
        portalUrl,
        language: "id",
      }),
    });

    const elapsed = Date.now() - startTime;

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    agentLog.reasoning(`✅ [API Success] POST /api/explain responded (${elapsed}ms)`, {
      title: data.title,
    });

    return data;
  } catch (error: any) {
    agentLog.reasoning(`❌ [API Failed] POST /api/explain failed.`, { error: error.message });
    throw error;
  }
}

// 5. ESSAY COACH API: Zero-Hallucination Prompt Chaining
export async function generateEssayDraft(
  bulletPoints: string[],
  promptTopic: string = "Komitmen Kembali ke Indonesia dan Rencana Pasca Studi"
): Promise<{ essay: string; word_count: number; key_strengths: string[]; coherence_score: number }> {
  const startTime = Date.now();
  agentLog.reasoning(`🚀 [API Request] POST ${API_BASE_URL}/api/essay/coach`, {
    promptTopic,
    pointsCount: bulletPoints.length,
  });

  try {
    const res = await fetch(`${API_BASE_URL}/api/essay/coach`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        promptTopic,
        bulletPoints,
        language: "id",
      }),
    });

    const elapsed = Date.now() - startTime;

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    agentLog.reasoning(`✅ [API Success] POST /api/essay/coach responded (${elapsed}ms)`, {
      words: data.word_count,
      coherence: data.coherence_score,
    });

    return data;
  } catch (error: any) {
    agentLog.reasoning(`❌ [API Failed] POST /api/essay/coach failed.`, { error: error.message });
    throw error;
  }
}

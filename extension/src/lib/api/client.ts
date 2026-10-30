// ============================================================================
// SAVVY.AI — Cloud API Client (Next.js Backend Bridge)
// Production endpoint: https://savvy-companion.vercel.app/
// ============================================================================

import { agentLog } from "../agentLogger";

export const API_BASE_URL = "https://savvy-companion.vercel.app";

export interface PageMetadata {
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  lang?: string;
  author?: string;
  canonicalUrl?: string;
  viewport?: { width: number; height: number; devicePixelRatio: number };
}

// Helper to bridge and display backend logs in client Chrome DevTools
function processBackendAgentLogs(data: any) {
  if (data && Array.isArray(data.agent_logs)) {
    data.agent_logs.forEach((log: any) => {
      const domain = (log.domain || "GATEWAY").toUpperCase();
      switch (domain) {
        case "SECURITY":
          agentLog.security(`[Cloud Gateway] ${log.message}`, log.data);
          break;
        case "REASONING":
          agentLog.reasoning(`[Cloud Gateway] ${log.message}`, log.data);
          break;
        case "PERCEPTION":
          agentLog.perception(`[Cloud Gateway] ${log.message}`, log.data);
          break;
        case "PLANNER":
          agentLog.planner(`[Cloud Gateway] ${log.message}`, log.data);
          break;
        case "VOICE":
          agentLog.voice(`[Cloud Gateway] ${log.message}`, log.data);
          break;
        case "ACTION":
          agentLog.action(`[Cloud Gateway] ${log.message}`, log.data);
          break;
        default:
          agentLog.gateway(`[Cloud Gateway] ${log.message}`, log.data);
          break;
      }
    });
  }
}

// 1. CHAT API: Multi-turn sliding context + Meta Muse Spark Open via Baseten
export async function sendChatMessage(
  message: string,
  sessionId?: string | null,
  portalDomain: string = "web-page",
  pageUrl?: string,
  pageTitle?: string,
  imageBase64?: string | null,
  meta?: PageMetadata | null
): Promise<{ reply: string; sessionId?: string; piiBlocked?: boolean }> {
  const startTime = Date.now();
  agentLog.reasoning(`🚀 [API Request] POST ${API_BASE_URL}/api/chat`, {
    portalDomain,
    pageUrl,
    pageTitle,
    hasImage: !!imageBase64,
    imageSizeKb: imageBase64 ? Math.round(imageBase64.length / 1024) : 0,
    metaKeys: meta ? Object.keys(meta).filter((k) => !!(meta as any)[k]) : [],
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
        imageBase64,
        meta,
      }),
    });

    const elapsed = Date.now() - startTime;

    if (!res.ok) {
      const errText = await res.text();
      agentLog.reasoning(`⚠️ [API Error] POST /api/chat returned HTTP ${res.status} (${elapsed}ms)`, { errText });
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    processBackendAgentLogs(data);
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
    processBackendAgentLogs(data);
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
    processBackendAgentLogs(data);
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
    processBackendAgentLogs(data);
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
    processBackendAgentLogs(data);
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

// 6. MULTI-AGENT FORM ANALYZER: Triad Input (DOM + Meta + Vision) -> 3-Agent CMAS Pipeline
export interface FormFieldPayload {
  id: string;
  name?: string;
  type?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export interface FormAnalysisResult {
  formId: string;
  formTitle: string;
  institution: string;
  targetOutcome: string;
  category: string;
  difficultyLevel: string;
  estimatedTime: string;
  officialSource?: {
    url: string;
    badge: string;
    title: string;
  };
  prerequisites: string[];
  traps: string[];
  roadmap: string;
  fieldsGuide: Array<{
    fieldId: string;
    action: string;
    vaultKey: string | null;
    confidenceScore: number;
    validation?: string;
  }>;
}

export interface AnalyzeFormResponse {
  success: boolean;
  cached?: boolean;
  analysis: FormAnalysisResult;
  agentTrace?: Array<{ agent: string; status: string; durationMs: number }>;
  agent_logs?: Array<{ domain: string; message: string; data?: any }>;
}

export async function analyzeForm(payload: {
  meta: { url?: string; domain?: string; title?: string; description?: string; keywords?: string[] };
  dom: { fieldCount: number; fields: FormFieldPayload[] };
  screenshotBase64?: string | null;
  options?: { language?: string; streamTelemetry?: boolean };
}): Promise<AnalyzeFormResponse> {
  const startTime = Date.now();
  agentLog.planner(`🚀 [CMAS Multi-Agent Request] POST ${API_BASE_URL}/api/form/analyze`, {
    domain: payload.meta.domain,
    fieldCount: payload.dom.fieldCount,
    hasScreenshot: !!payload.screenshotBase64,
  });

  try {
    const res = await fetch(`${API_BASE_URL}/api/form/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const elapsed = Date.now() - startTime;

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data: AnalyzeFormResponse = await res.json();
    processBackendAgentLogs(data);

    if (data.cached) {
      agentLog.reasoning(`⚡ [Cache L2 Hit] Form analysis retrieved in ${elapsed}ms`, {
        formTitle: data.analysis?.formTitle,
      });
    } else {
      agentLog.reasoning(`✅ [CMAS Multi-Agent Success] 3-Agent pipeline completed (${elapsed}ms)`, {
        formTitle: data.analysis?.formTitle,
        institution: data.analysis?.institution,
        traceCount: data.agentTrace?.length || 0,
      });
    }

    return data;
  } catch (error: any) {
    agentLog.reasoning(`❌ [CMAS Multi-Agent Failed] POST /api/form/analyze failed.`, { error: error.message });
    throw error;
  }
}


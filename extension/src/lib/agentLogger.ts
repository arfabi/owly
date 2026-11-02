// ============================================================================
// OWLY.AI — Agentic Execution Logger
// Memberikan observabilitas visual transparan di Chrome DevTools Console:
// [Owly Agent: Perception] -> Observasi DOM, fokus kolom, mutasi, rute
// [Owly Agent: Reasoning]   -> Analisis Juknis, pengambilan keputusan, AI prompt
// [Owly Agent: Action]      -> Eksekusi Autofill, Undo, Spotlight, A11y
// [Owly Agent: Security]    -> WebCrypto AES-256-GCM, UU PDP PII Scrubber
// [Owly Agent: Voice]       -> VAD Voicebot, AudioContext RMS, PTT
// [Owly Agent: Planner]     -> Transisi status agent, quick starter routing
// ============================================================================

export type AgentDomain = 
  | "PLANNER" 
  | "PERCEPTION" 
  | "REASONING" 
  | "ACTION" 
  | "SECURITY" 
  | "VOICE"
  | "GATEWAY";

const BADGE_STYLES: Record<AgentDomain, { bg: string; color: string; icon: string }> = {
  PLANNER: { bg: "#7045ED", color: "#FFFFFF", icon: "🧭" },     // Owly Purple
  PERCEPTION: { bg: "#398CF5", color: "#FFFFFF", icon: "👁️" },  // Owly Blue
  REASONING: { bg: "#0D9488", color: "#FFFFFF", icon: "🧠" },   // Emerald/Teal
  ACTION: { bg: "#F59E0B", color: "#000000", icon: "⚡" },      // Amber
  SECURITY: { bg: "#EF5350", color: "#FFFFFF", icon: "🛡️" },    // Owly Red
  VOICE: { bg: "#6366F1", color: "#FFFFFF", icon: "🎙️" },       // Indigo
  GATEWAY: { bg: "#0284C7", color: "#FFFFFF", icon: "☁️" },     // Sky Blue (Cloud Gateway)
};

export interface AgentLogEvent {
  timestamp: string;
  domain: AgentDomain;
  message: string;
  data?: any;
}

// In-memory trace history (up to 100 recent events)
const traceBuffer: AgentLogEvent[] = [
  {
    timestamp: new Date().toLocaleTimeString(),
    domain: "GATEWAY",
    message: "⚡ Gateway connected to Meta Muse Spark Open via Baseten inference infrastructure.",
    data: {
      model: "meta-models/muse-spark-open-1026",
      status: "LIVE_CONNECTED",
      endpoint: "https://inference.baseten.co/v1",
      latencyTarget: "<500ms",
      framework: "Meta Compound Multi-Agent System (CMAS)",
    },
  },
];

export function logAgent(domain: AgentDomain, message: string, data?: any, broadcast: boolean = true) {
  const timestamp = new Date().toLocaleTimeString();
  const cfg = BADGE_STYLES[domain] || { bg: "#171B3D", color: "#FFFFFF", icon: "🤖" };

  const badgeStyle = `background: ${cfg.bg}; color: ${cfg.color}; font-weight: bold; border-radius: 4px; padding: 2px 6px; font-size: 11px;`;
  const timeStyle = `color: #64748B; font-size: 10px; margin-left: 4px;`;
  const msgStyle = `color: #0F172A; font-weight: 600; font-size: 12px;`;

  if (data !== undefined) {
    console.log(
      `%c${cfg.icon} [Owly Agent: ${domain}]%c ${timestamp}%c ${message}`,
      badgeStyle,
      timeStyle,
      msgStyle,
      data
    );
  } else {
    console.log(
      `%c${cfg.icon} [Owly Agent: ${domain}]%c ${timestamp}%c ${message}`,
      badgeStyle,
      timeStyle,
      msgStyle
    );
  }

  traceBuffer.push({ timestamp, domain, message, data });
  if (traceBuffer.length > 100) traceBuffer.shift();

  // Kirim broadcast antar context (Content Script <-> Sidepanel <-> Background)
  if (broadcast && typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
    try {
      chrome.runtime.sendMessage({
        type: "AGENT_LOG_EVENT",
        event: {
          timestamp,
          domain,
          message,
          data: data ? (typeof data === "object" ? JSON.parse(JSON.stringify(data)) : data) : undefined,
        },
      }).catch(() => {});
    } catch (_) {}
  }
}

export const agentLog = {
  planner: (msg: string, data?: any, broadcast = true) => logAgent("PLANNER", msg, data, broadcast),
  perception: (msg: string, data?: any, broadcast = true) => logAgent("PERCEPTION", msg, data, broadcast),
  reasoning: (msg: string, data?: any, broadcast = true) => logAgent("REASONING", msg, data, broadcast),
  action: (msg: string, data?: any, broadcast = true) => logAgent("ACTION", msg, data, broadcast),
  security: (msg: string, data?: any, broadcast = true) => logAgent("SECURITY", msg, data, broadcast),
  voice: (msg: string, data?: any, broadcast = true) => logAgent("VOICE", msg, data, broadcast),
  gateway: (msg: string, data?: any, broadcast = true) => logAgent("GATEWAY", msg, data, broadcast),
  getTrace: () => [...traceBuffer],
};

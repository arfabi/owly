import React, { useState, useEffect, useRef } from "react";
import {
  Terminal,
  X,
  Trash2,
  Copy,
  Check,
  Search,
  ChevronDown,
  ChevronRight,
  Cpu,
  Workflow,
  Activity,
  ShieldCheck,
  Layers,
  Sparkles,
  Lock,
  ArrowRight,
  Eye,
  Brain,
} from "lucide-react";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { agentLog, AgentDomain, AgentLogEvent } from "../lib/agentLogger";

interface LogConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DOMAIN_CONFIG: Record<
  AgentDomain,
  { label: string; icon: string; badgeClass: string; borderClass: string }
> = {
  REASONING: {
    label: "Reasoning",
    icon: "🧠",
    badgeClass: "bg-teal-950 text-teal-300 border-teal-700/60",
    borderClass: "border-teal-800/40",
  },
  PERCEPTION: {
    label: "Perception",
    icon: "👁️",
    badgeClass: "bg-blue-950 text-blue-300 border-blue-700/60",
    borderClass: "border-blue-800/40",
  },
  PLANNER: {
    label: "Planner",
    icon: "🧭",
    badgeClass: "bg-purple-950 text-purple-300 border-purple-700/60",
    borderClass: "border-purple-800/40",
  },
  ACTION: {
    label: "Action",
    icon: "⚡",
    badgeClass: "bg-amber-950 text-amber-300 border-amber-700/60",
    borderClass: "border-amber-800/40",
  },
  SECURITY: {
    label: "Security",
    icon: "🛡️",
    badgeClass: "bg-red-950 text-red-300 border-red-700/60",
    borderClass: "border-red-800/40",
  },
  VOICE: {
    label: "Voice",
    icon: "🎙️",
    badgeClass: "bg-indigo-950 text-indigo-300 border-indigo-700/60",
    borderClass: "border-indigo-800/40",
  },
  GATEWAY: {
    label: "Gateway",
    icon: "☁️",
    badgeClass: "bg-sky-950 text-sky-300 border-sky-700/60",
    borderClass: "border-sky-800/40",
  },
};

export function LogConsoleModal({ isOpen, onClose }: LogConsoleModalProps) {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<AgentLogEvent[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<AgentDomain | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedLogIndices, setExpandedLogIndices] = useState<Record<number, boolean>>({});
  const [activeView, setActiveView] = useState<"terminal" | "architecture">("terminal");

  const logsEndRef = useRef<HTMLDivElement>(null);

  // 1. Initial load from in-memory log buffer
  useEffect(() => {
    if (isOpen) {
      setLogs(agentLog.getTrace());
    }
  }, [isOpen]);

  // 2. Real-time live listener for AGENT_LOG_EVENT
  useEffect(() => {
    if (!isOpen) return;

    const listener = (msg: any) => {
      if (msg?.type === "AGENT_LOG_EVENT" && msg.event) {
        setLogs((prev) => [...prev.slice(-150), msg.event]);
      }
    };

    if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(listener);
    }

    return () => {
      if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
        chrome.runtime.onMessage.removeListener(listener);
      }
    };
  }, [isOpen]);

  // 3. Auto Scroll
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  if (!isOpen) return null;

  // Filter logs by Domain and Search Query
  const filteredLogs = logs.filter((log) => {
    const matchesDomain = selectedDomain === "ALL" || log.domain === selectedDomain;
    const matchesSearch =
      searchQuery === "" ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.data && JSON.stringify(log.data).toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDomain && matchesSearch;
  });

  const handleCopyLogs = () => {
    const jsonStr = JSON.stringify(filteredLogs, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const toggleExpand = (index: number) => {
    setExpandedLogIndices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="absolute inset-0 bg-slate-950 text-slate-100 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 duration-200 font-sans">
      {/* 1. Header Terminal Bar */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            {activeView === "terminal" ? <Terminal className="w-4 h-4" /> : <Workflow className="w-4 h-4 text-blue-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-xs text-white tracking-tight flex items-center gap-1.5">
                <span>{activeView === "terminal" ? t.logConsole.title : "CMAS Agentic Architecture"}</span>
              </h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-600/50 text-emerald-400 text-[9px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t.logConsole.liveBadge}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {activeView === "terminal" ? t.logConsole.subtitle : "Meta Muse Spark Open • 9 Cognitive Agents + 10 Deterministic Subsystems"}
            </p>
          </div>
        </div>

        {/* View Switcher Pill */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveView("terminal")}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9.5px] font-bold transition-all cursor-pointer ${
              activeView === "terminal"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3 h-3" />
            <span>Terminal</span>
          </button>
          <button
            onClick={() => setActiveView("architecture")}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9.5px] font-bold transition-all cursor-pointer ${
              activeView === "architecture"
                ? "bg-blue-600 text-white shadow-2xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Workflow className="w-3 h-3" />
            <span>Architecture HUD</span>
          </button>
        </div>

        {/* Actions Button */}
        <div className="flex items-center gap-1.5">
          {activeView === "terminal" && (
            <>
              <button
                onClick={handleCopyLogs}
                className="flex items-center gap-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10px] font-semibold transition-all cursor-pointer"
                title={t.logConsole.copyTooltip}
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? t.logConsole.copied : t.logConsole.copyJson}</span>
              </button>

              <button
                onClick={handleClearLogs}
                className="p-1 rounded-lg bg-slate-800 hover:bg-red-950/80 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-800/60 transition-all cursor-pointer"
                title={t.logConsole.clearTooltip}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={t.logConsole.closeTooltip}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Banner Info */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-3 py-1.5 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-amber-400">💡</span>
          <span className="truncate">
            <b className="text-slate-200">{t.logConsole.infoBannerTitle}:</b>{" "}
            {activeView === "terminal"
              ? t.logConsole.infoBannerDesc
              : "Compound Multi-Agent System (CMAS) with Hybrid Probabilistic-Deterministic Boundary"}
          </span>
        </div>
        <span className="text-slate-500 font-mono text-[9px] hidden sm:inline shrink-0">
          {activeView === "terminal" ? "DevTools: F12 > Console" : "feature/agentic.md"}
        </span>
      </div>

      {/* 2b. Live Meta Model Status Bar */}
      <div className="bg-gradient-to-r from-blue-950/70 via-indigo-950/40 to-slate-950 border-b border-blue-900/40 px-3 py-1.5 flex items-center justify-between text-[10px] shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-400 font-mono text-[10px]">Active Model:</span>
          <span className="px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/60 font-mono font-bold text-[9.5px]">
            meta-models/muse-spark-open-1026
          </span>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-mono">
          <span className="text-emerald-400 font-semibold">Baseten Serverless</span>
          <span className="text-slate-600">•</span>
          <span className="text-purple-300 font-semibold">CMAS Multi-Agent</span>
        </div>
      </div>

      {/* 3. BODY VIEW SWITCHER */}
      {activeView === "terminal" ? (
        <>
          {/* Filter Bar & Search */}
          <div className="p-2.5 bg-slate-950 border-b border-slate-800/80 space-y-2 shrink-0">
            {/* Domain Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar text-[10px] font-bold">
              <button
                onClick={() => setSelectedDomain("ALL")}
                className={`px-2 py-0.5 rounded-md transition-all shrink-0 cursor-pointer ${
                  selectedDomain === "ALL"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {t.logConsole.allLogs} ({logs.length})
              </button>

              {(Object.keys(DOMAIN_CONFIG) as AgentDomain[]).map((dom) => {
                const cfg = DOMAIN_CONFIG[dom];
                const count = logs.filter((l) => l.domain === dom).length;
                const isSelected = selectedDomain === dom;
                return (
                  <button
                    key={dom}
                    onClick={() => setSelectedDomain(dom)}
                    className={`px-2 py-0.5 rounded-md transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? "bg-slate-100 text-slate-950 font-black shadow-2xs"
                        : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    <span>{cfg.icon}</span>
                    <span>{cfg.label}</span>
                    <span className="text-[9px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input & Auto-scroll toggle */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.logConsole.searchPlaceholder}
                  className="w-full pl-7 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500/60 font-mono"
                />
              </div>

              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`px-2 py-1 rounded-lg border text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
                  autoScroll
                    ? "bg-slate-900 text-emerald-400 border-emerald-500/40"
                    : "bg-slate-900 text-slate-500 border-slate-800"
                }`}
                title={t.logConsole.autoScrollTooltip || "Auto-scroll to bottom on new log arrival"}
              >
                {t.logConsole.autoScroll || "Auto-scroll"}: {autoScroll ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          {/* Terminal Log Stream Body */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-[11px] select-text">
            {filteredLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
                <Cpu className="w-8 h-8 text-slate-700 mb-2 animate-pulse" />
                <p className="font-bold text-xs text-slate-400">{t.logConsole.noLogsTitle || "No logs recorded yet"}</p>
                <p className="text-[10px] text-slate-600 max-w-[240px] mt-1">
                  {t.logConsole.noLogsDesc || "Interact with the extension, ask questions, or run Auto Fill to view agent actions in real time."}
                </p>
              </div>
            ) : (
              filteredLogs.map((log, idx) => {
                const cfg = DOMAIN_CONFIG[log.domain] || {
                  label: log.domain,
                  icon: "🤖",
                  badgeClass: "bg-slate-800 text-slate-200 border-slate-700",
                  borderClass: "border-slate-800",
                };
                const isExpanded = !!expandedLogIndices[idx];
                const hasData = log.data !== undefined && log.data !== null;

                return (
                  <div
                    key={idx}
                    className={`bg-slate-900/90 rounded-lg p-2.5 border ${cfg.borderClass} hover:border-slate-700 transition-colors space-y-1.5`}
                  >
                    {/* Meta Header */}
                    <div className="flex items-center justify-between text-[10px] gap-1 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-black border uppercase tracking-wider flex items-center gap-1 ${cfg.badgeClass}`}
                        >
                          <span>{cfg.icon}</span>
                          <span>{log.domain}</span>
                        </span>

                        {/* Direct Meta Model Badge if present */}
                        {log.data?.model && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-950/90 text-blue-300 border border-blue-800/80 text-[8.5px] font-mono font-bold flex items-center gap-1 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                            <span>{String(log.data.model)}</span>
                          </span>
                        )}

                        {/* Latency Badge if present */}
                        {typeof log.data?.latencyMs === "number" && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-800/80 text-[8.5px] font-mono font-bold">
                            ⚡ {log.data.latencyMs}ms
                          </span>
                        )}

                        {/* Live connected badge */}
                        {log.data?.status === "LIVE_CONNECTED" && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-800/80 text-[8.5px] font-mono font-bold">
                            ● LIVE GATEWAY
                          </span>
                        )}

                        <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                      </div>

                      {hasData && (
                        <button
                          onClick={() => toggleExpand(idx)}
                          className="text-slate-400 hover:text-white flex items-center gap-0.5 text-[10px] cursor-pointer ml-auto"
                        >
                          <span>{isExpanded ? (t.logConsole.collapse || "Collapse") : (t.logConsole.payload || "Payload")}</span>
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Message Body */}
                    <div className="text-slate-200 leading-relaxed font-sans text-xs break-words">
                      {log.message}
                    </div>

                    {/* Data Accordion (JSON Payload) */}
                    {hasData && isExpanded && (
                      <div className="mt-2 p-2 bg-slate-950 rounded border border-slate-800/80 overflow-x-auto">
                        <pre className="text-[10px] text-emerald-400/90 leading-tight">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={logsEndRef} />
          </div>
        </>
      ) : (
        /* ARCHITECTURE & AGENTIC HUD VIEW */
        <div className="flex-1 overflow-y-auto p-3 space-y-3 font-sans text-xs select-text">
          {/* 1. Core Thesis Card */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 via-blue-950/30 to-purple-950/20 border border-blue-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="font-extrabold text-white text-xs tracking-tight">Compound Multi-Agent System (CMAS)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[9px] font-mono font-bold">
                Hybrid Architecture
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <strong className="text-emerald-400">"Models Propose; Validators Dispose":</strong> Separation between probabilistic AI reasoning (Meta Muse Spark Open) and deterministic client-side execution (0ms, zero token cost).
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-[10px] font-mono">
              <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800 flex flex-col">
                <span className="text-slate-500 text-[9px]">COGNITIVE MODEL</span>
                <span className="text-blue-300 font-bold truncate">Muse Spark Open</span>
              </div>
              <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800 flex flex-col">
                <span className="text-slate-500 text-[9px]">TOTAL AGENTS</span>
                <span className="text-emerald-300 font-bold">9 Meta Agents</span>
              </div>
              <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800 flex flex-col">
                <span className="text-slate-500 text-[9px]">LOCAL ENGINES</span>
                <span className="text-amber-300 font-bold">10 Subsystems</span>
              </div>
              <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800 flex flex-col">
                <span className="text-slate-500 text-[9px]">PRIVACY PARADIGM</span>
                <span className="text-rose-300 font-bold">Zero-PII In Cloud</span>
              </div>
            </div>
          </div>

          {/* 2. Interactive ReAct Loop Diagram */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <Workflow className="w-3.5 h-3.5 text-emerald-400" />
                <span>Autonomous ReAct Tool-Calling Loop</span>
              </div>
              <span className="text-[9px] font-mono text-slate-500">Real-Time Flow</span>
            </div>

            <div className="space-y-1.5 text-[10px] font-mono">
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[9px]">1</span>
                  <span>User Utterance / Form State</span>
                </div>
                <span className="text-slate-500">Input</span>
              </div>

              <div className="flex justify-center text-slate-600">
                <ArrowRight className="w-3 h-3 rotate-90" />
              </div>

              <div className="p-2 rounded bg-red-950/30 border border-red-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-[9px]">2</span>
                  <div>
                    <span className="text-red-300 font-bold">Client PII Scrubber (Regex Interceptor)</span>
                    <p className="text-[9px] text-slate-400 font-sans">Redacts 16-digit NIK, Tax IDs, and PINs before network request</p>
                  </div>
                </div>
                <span className="text-red-400 text-[9px] font-bold">0ms</span>
              </div>

              <div className="flex justify-center text-slate-600">
                <ArrowRight className="w-3 h-3 rotate-90" />
              </div>

              <div className="p-2.5 rounded bg-blue-950/40 border border-blue-800/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[9px]">3</span>
                    <span className="text-blue-200 font-bold">Meta Muse Spark Open (Baseten Serverless)</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 text-[8.5px]">REASONING</span>
                </div>
                <p className="text-[9.5px] text-slate-300 font-sans">
                  Evaluates DOM context, official regulations, and decides whether to output direct advice or invoke tools.
                </p>
                <div className="flex flex-wrap gap-1 text-[8.5px]">
                  <span className="px-1 py-0.5 rounded bg-slate-900 text-teal-300 border border-teal-800/50">tool: audit_form_fields</span>
                  <span className="px-1 py-0.5 rounded bg-slate-900 text-teal-300 border border-teal-800/50">tool: match_vault</span>
                  <span className="px-1 py-0.5 rounded bg-slate-900 text-teal-300 border border-teal-800/50">tool: query_juknis</span>
                  <span className="px-1 py-0.5 rounded bg-slate-900 text-teal-300 border border-teal-800/50">tool: toggle_a11y</span>
                </div>
              </div>

              <div className="flex justify-center text-slate-600">
                <ArrowRight className="w-3 h-3 rotate-90" />
              </div>

              <div className="p-2 rounded bg-amber-950/30 border border-amber-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[9px]">4</span>
                  <div>
                    <span className="text-amber-300 font-bold">Deterministic Execution & Validation</span>
                    <p className="text-[9px] text-slate-400 font-sans">WebCrypto AES-256 decryption, DOM highlight, synthetic events</p>
                  </div>
                </div>
                <span className="text-amber-400 text-[9px] font-bold">Local</span>
              </div>
            </div>
          </div>

          {/* 3. The 9 Meta Cognitive Agents */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>The 9 Meta Cognitive Agents</span>
              </div>
              <span className="text-[9px] font-mono text-purple-300">feature/agentic.md</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 text-[10px]">
              <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-start gap-2">
                <span className="text-sm">👁️</span>
                <div>
                  <div className="font-bold text-slate-200">1. Perception & Form Profiler Agent</div>
                  <div className="text-[9.5px] text-slate-400 font-sans">Scans DOM hierarchy & viewport snips to identify portal type, category, and requirements.</div>
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-start gap-2">
                <span className="text-sm">📚</span>
                <div>
                  <div className="font-bold text-slate-200">2. Regulation Researcher Agent</div>
                  <div className="text-[9.5px] text-slate-400 font-sans">Grounds public scholarship rules & government juknis without leaking any applicant data.</div>
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-start gap-2">
                <span className="text-sm">🧭</span>
                <div>
                  <div className="font-bold text-slate-200">3. Decision & Synthesis Agent (Triad Leader)</div>
                  <div className="text-[9.5px] text-slate-400 font-sans">Prompt chaining & strict JSON schemas: generates step-by-step roadmap and traps warning.</div>
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-start gap-2">
                <span className="text-sm">🚦</span>
                <div>
                  <div className="font-bold text-slate-200">4. Pre-Submit Traffic Light Auditor</div>
                  <div className="text-[9.5px] text-slate-400 font-sans">High CoT contradiction reasoning across conditional criteria (affirmative vs regular GPA cutoffs).</div>
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-start gap-2">
                <span className="text-sm">💡</span>
                <div>
                  <div className="font-bold text-slate-200">5. Field-by-Field Coach Agent</div>
                  <div className="text-[9.5px] text-slate-400 font-sans">Generates 4-element card (Meaning, How to Fill, Example, Pitfalls) with official citations.</div>
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-start gap-2">
                <span className="text-sm">🔍</span>
                <div>
                  <div className="font-bold text-slate-200">6. Show Me Semantic Reasoner & Visual BBox</div>
                  <div className="text-[9.5px] text-slate-400 font-sans">Finds obscure buttons across 20+ candidates via semantic matching and bounding box fallback.</div>
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-start gap-2">
                <span className="text-sm">✂️</span>
                <div>
                  <div className="font-bold text-slate-200">7. Visual Snip Explainer Agent</div>
                  <div className="text-[9.5px] text-slate-400 font-sans">Multimodal vision OCR translating fine-print bureaucratic jargon into simple, actionable steps.</div>
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-start gap-2">
                <span className="text-sm">♿</span>
                <div>
                  <div className="font-bold text-slate-200">8. A11y Intent Router Agent</div>
                  <div className="text-[9.5px] text-slate-400 font-sans">Translates natural speech ("my eyes hurt") into 14 discrete WCAG 2.2 AAA accessibility tweaks.</div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Deterministic Subsystems (0ms / $0) */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>10 Deterministic Browser Subsystems (0ms · $0 Cost)</span>
              </div>
              <span className="text-[9px] font-mono text-emerald-400">Zero-Knowledge</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="text-emerald-400 font-bold block">WebCrypto Vault</span>
                <span className="text-slate-400 text-[9px] font-sans">AES-256-GCM + PBKDF2 local decryption</span>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="text-emerald-400 font-bold block">PII Scrubber</span>
                <span className="text-slate-400 text-[9px] font-sans">16-digit regex client-side interceptor</span>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="text-emerald-400 font-bold block">FSM Validators</span>
                <span className="text-slate-400 text-[9px] font-sans">Indonesian NIK date+40 & RFC email math</span>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="text-emerald-400 font-bold block">Closed Shadow DOM</span>
                <span className="text-slate-400 text-[9px] font-sans">#savvy-root isolated Ghost Cursor</span>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="text-emerald-400 font-bold block">1-Click Autofill</span>
                <span className="text-slate-400 text-[9px] font-sans">Synthetic event dispatcher (React/Vue state)</span>
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-800">
                <span className="text-emerald-400 font-bold block">Lossless Undo Stack</span>
                <span className="text-slate-400 text-[9px] font-sans">20-step instant field value rollback</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Terminal Footer Bar */}
      <div className="p-2 bg-slate-900/80 border-t border-slate-800/90 flex items-center justify-between text-[10px] text-slate-400 shrink-0 font-mono">
        <div className="flex items-center gap-2">
          <span>{t.logConsole.activeThreads || "Active Threads"}: <b>1 ({t.logConsole.workerLabel || "Worker"})</b></span>
          <span>•</span>
          <span>{t.logConsole.logsCount || "Logs"}: <b>{filteredLogs.length}</b></span>
          <span>•</span>
          <span className="text-blue-400 font-bold">View: {activeView.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 text-[9.5px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Baseten: <strong className="text-emerald-300 font-semibold">meta-models/muse-spark-open-1026</strong></span>
        </div>
      </div>
    </div>
  );
}

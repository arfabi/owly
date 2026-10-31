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
} from "lucide-react";
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
  const [logs, setLogs] = useState<AgentLogEvent[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<AgentDomain | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedLogIndices, setExpandedLogIndices] = useState<Record<number, boolean>>({});

  const logsEndRef = useRef<HTMLDivElement>(null);

  // 1. Inisialisasi awal log dari in-memory buffer
  useEffect(() => {
    if (isOpen) {
      setLogs(agentLog.getTrace());
    }
  }, [isOpen]);

  // 2. Real-time Live Listener untuk pesan AGENT_LOG_EVENT dari Content/Sidepanel/Background
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

  // 3. Auto Scroll saat ada log baru
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  if (!isOpen) return null;

  // Filter logs berdasarkan Domain dan Search Query
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
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-xs text-white tracking-tight flex items-center gap-1.5">
                <span>Owly.AI • Agentic Log Console</span>
              </h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-600/50 text-emerald-400 text-[9px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Real-time reasoning, perception, & action trace</p>
          </div>
        </div>

        {/* Actions Button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyLogs}
            className="flex items-center gap-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10px] font-semibold transition-all cursor-pointer"
            title="Salin semua log dalam format JSON"
          >
            {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{isCopied ? "Copied" : "Copy JSON"}</span>
          </button>

          <button
            onClick={handleClearLogs}
            className="p-1 rounded-lg bg-slate-800 hover:bg-red-950/80 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-800/60 transition-all cursor-pointer"
            title="Bersihkan log saat ini"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup Console"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Hackathon Judge Banner Info */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-3 py-1.5 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-amber-400">💡</span>
          <span className="truncate">
            <b className="text-slate-200">Panduan Juri:</b> Menampilkan jejak pemanggilan model Meta Muse Spark, VAD Voice, serta eksekusi AES-256 Vault.
          </span>
        </div>
        <span className="text-slate-500 font-mono text-[9px] hidden sm:inline shrink-0">
          DevTools: F12 &gt; Console
        </span>
      </div>

      {/* 3. Filter Bar & Search */}
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
            ALL ({logs.length})
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
              placeholder="Cari log (misal: 'Muse Spark', 'DOM', 'NIK', 'tool')..."
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
            title="Otomatis scroll ke baris terbawah saat log baru masuk"
          >
            Auto-scroll: {autoScroll ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* 4. Terminal Log Stream Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-[11px] select-text">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
            <Cpu className="w-8 h-8 text-slate-700 mb-2 animate-pulse" />
            <p className="font-bold text-xs text-slate-400">Belum ada trace log</p>
            <p className="text-[10px] text-slate-600 max-w-[220px] mt-1">
              Buka website, ketik chat, atau klik tombol tindakan untuk melihat alur proses agen AI secara live.
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
                {/* Meta Header baris */}
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-black border uppercase tracking-wider flex items-center gap-1 ${cfg.badgeClass}`}
                    >
                      <span>{cfg.icon}</span>
                      <span>{log.domain}</span>
                    </span>
                    <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                  </div>

                  {hasData && (
                    <button
                      onClick={() => toggleExpand(idx)}
                      className="text-slate-400 hover:text-white flex items-center gap-0.5 text-[10px] cursor-pointer"
                    >
                      <span>{isExpanded ? "Collapse" : "Payload"}</span>
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

      {/* 5. Terminal Footer Bar */}
      <div className="p-2 bg-slate-900/80 border-t border-slate-800/90 flex items-center justify-between text-[10px] text-slate-400 shrink-0 font-mono">
        <div className="flex items-center gap-2">
          <span>Active Threads: <b>1 (Worker)</b></span>
          <span>•</span>
          <span>Logs: <b>{filteredLogs.length}</b></span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <span>Baseten: Muse Spark Open</span>
        </div>
      </div>
    </div>
  );
}

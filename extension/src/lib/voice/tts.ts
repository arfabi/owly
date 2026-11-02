// ============================================================================
// OWLY.AI — Native Browser TTS Engine (Web Speech API)
// Zero latency, zero cloud cost, 100% on-device speech synthesis
// ============================================================================

import { selectVoiceForLanguage } from "../i18n/types";

export interface TtsOptions {
  lang?: "id-ID" | "en-US" | string;
  rate?: number;  // 0.5 to 2.0 (default 1.0)
  pitch?: number; // 0.5 to 2.0 (default 1.0)
  volume?: number;// 0.0 to 1.0 (default 1.0)
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

class BrowserTtsEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
      this.synth.onvoiceschanged = () => {
        this.synth?.getVoices();
      };
    }
  }

  public isSupported(): boolean {
    return this.synth !== null;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  public stop(): void {
    if (!this.synth) return;
    this.synth.cancel();
    this.currentUtterance = null;
  }

  public pause(): void {
    if (!this.synth) return;
    this.synth.pause();
  }

  public resume(): void {
    if (!this.synth) return;
    this.synth.resume();
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }

  public speak(text: string, options: TtsOptions = {}): void {
    if (!this.synth) {
      console.warn("[Owly.AI TTS] Web Speech API not supported in this browser.");
      options.onError?.(new Error("Web Speech API not supported"));
      return;
    }

    // Cancel any previous speech
    this.stop();

    const cleanText = text.replace(/[*#_`~]/g, "").trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = options.lang || "en-US";
    utterance.rate = options.rate ?? 1.05;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;

    // Pick strictly matching voice for target language
    const voices = this.getVoices();
    const langCode = utterance.lang.split("-")[0];
    const matchedVoice = selectVoiceForLanguage(voices, langCode);

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      options.onError?.(e);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }
}

export const ttsEngine = new BrowserTtsEngine();

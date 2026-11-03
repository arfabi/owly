// ============================================================================
// OWLY.AI — Audio Recorder & Speech Processor
// Encodes microphone input into standard Mono 16-bit PCM WAV at 16,000 Hz
// Strict requirement for Meta Muse Voice Transcribe (Voyager Engine)
// ============================================================================

export interface RecordingResult {
  blob: Blob;
  base64: string;
  durationMs: number;
}

export function encodeWav16BitMono(samples: Float32Array, sampleRate = 16000): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  // RIFF Chunk
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');

  // fmt Sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // SampleRate (16000 Hz)
  view.setUint32(28, sampleRate * 2, true); // ByteRate (16000 * 1 * 2)
  view.setUint16(32, 2, true); // BlockAlign (1 * 2)
  view.setUint16(34, 16, true); // BitsPerSample (16-bit)

  // data Sub-chunk
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  // Write 16-bit signed PCM samples
  let pcmOffset = 44;
  for (let i = 0; i < samples.length; i++, pcmOffset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(pcmOffset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

export class AudioRecorder {
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private audioStream: MediaStream | null = null;
  private pcmSamples: Float32Array[] = [];
  private startTime: number = 0;
  private isRecording: boolean = false;

  public async start(): Promise<void> {
    if (this.isRecording) return;
    this.pcmSamples = [];

    this.audioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioCtx({ sampleRate: 16000 });

    const source = this.audioContext.createMediaStreamSource(this.audioStream);

    let useWorklet = false;
    if (this.audioContext.audioWorklet && typeof chrome !== "undefined" && chrome.runtime?.getURL) {
      try {
        const workletUrl = chrome.runtime.getURL("audio-processor.js");
        await this.audioContext.audioWorklet.addModule(workletUrl);
        const workletNode = new AudioWorkletNode(this.audioContext, "pcm-capture-processor");
        workletNode.port.onmessage = (event) => {
          if (!this.isRecording) return;
          this.pcmSamples.push(new Float32Array(event.data));
        };
        source.connect(workletNode);
        workletNode.connect(this.audioContext.destination);
        this.workletNode = workletNode;
        useWorklet = true;
      } catch (err) {
        console.warn("[AudioRecorder] AudioWorklet init failed, falling back to ScriptProcessor:", err);
      }
    }

    if (!useWorklet) {
      // Graceful fallback for environments where AudioWorklet is not available
      this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
      this.scriptProcessor.onaudioprocess = (e) => {
        if (!this.isRecording) return;
        const inputData = e.inputBuffer.getChannelData(0);
        this.pcmSamples.push(new Float32Array(inputData));
      };
      source.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext.destination);
    }

    this.startTime = Date.now();
    this.isRecording = true;
  }

  public async stop(): Promise<RecordingResult> {
    if (!this.isRecording) {
      throw new Error('Recorder is not active');
    }

    const durationMs = Date.now() - this.startTime;
    this.isRecording = false;

    if (this.workletNode) {
      try {
        this.workletNode.port.onmessage = null;
        this.workletNode.disconnect();
      } catch (_) {}
      this.workletNode = null;
    }
    if (this.scriptProcessor) {
      try {
        this.scriptProcessor.disconnect();
      } catch (_) {}
      this.scriptProcessor = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (_) {}
      this.audioContext = null;
    }
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
      this.audioStream = null;
    }

    // Merge collected Float32 PCM samples
    const totalLength = this.pcmSamples.reduce((acc, s) => acc + s.length, 0);
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const s of this.pcmSamples) {
      merged.set(s, offset);
      offset += s.length;
    }

    // Encode to compliant mono 16-bit PCM WAV at 16,000 Hz
    const wavBlob = encodeWav16BitMono(merged, 16000);
    const base64 = await blobToBase64(wavBlob);

    return {
      blob: wavBlob,
      base64,
      durationMs,
    };
  }

  public cancel(): void {
    this.isRecording = false;
    if (this.workletNode) {
      try {
        this.workletNode.port.onmessage = null;
        this.workletNode.disconnect();
      } catch (_) {}
      this.workletNode = null;
    }
    if (this.scriptProcessor) {
      try {
        this.scriptProcessor.disconnect();
      } catch (_) {}
      this.scriptProcessor = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (_) {}
      this.audioContext = null;
    }
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((t) => t.stop());
      this.audioStream = null;
    }
    this.pcmSamples = [];
  }

  public active(): boolean {
    return this.isRecording;
  }
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

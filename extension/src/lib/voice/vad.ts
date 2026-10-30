// ============================================================================
// SAVVY.AI — Client-Side Voice Activity Detection (VAD) Engine
// Zero latency speech energy detector using Web Audio API AnalyserNode
// ============================================================================

export interface VadCallbacks {
  onSpeechStart?: () => void;
  onSpeechEnd?: (audioBlob?: Blob) => void;
  onVolumeChange?: (volume: number) => void; // 0 to 100
  onError?: (err: any) => void;
}

export class SimpleVadDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isListening = false;
  private isSpeaking = false;
  private silenceTimer: any = null;
  private animationFrameId: number | null = null;

  // Thresholds
  private energyThreshold = 18; // RMS sensitivity
  private silenceDurationMs = 1400; // ms of silence before declaring speech end

  public async start(callbacks: VadCallbacks = {}): Promise<void> {
    if (this.isListening) return;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      source.connect(this.analyser);

      // Setup MediaRecorder for capturing speech snippet
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(this.mediaStream);
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };

      this.isListening = true;
      this.isSpeaking = false;

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      const checkAudio = () => {
        if (!this.isListening || !this.analyser) return;

        this.analyser.getByteFrequencyData(dataArray);

        // Compute average energy / volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        callbacks.onVolumeChange?.(Math.min(100, Math.round((average / 128) * 100)));

        if (average > this.energyThreshold) {
          // Detected active speech
          if (!this.isSpeaking) {
            this.isSpeaking = true;
            this.audioChunks = [];
            if (this.mediaRecorder && this.mediaRecorder.state === "inactive") {
              this.mediaRecorder.start();
            }
            callbacks.onSpeechStart?.();
          }

          // Reset silence timer
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
          }
        } else if (this.isSpeaking) {
          // In silence after speaking
          if (!this.silenceTimer) {
            this.silenceTimer = setTimeout(() => {
              this.isSpeaking = false;
              this.silenceTimer = null;

              if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
                this.mediaRecorder.stop();
                setTimeout(() => {
                  const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
                  callbacks.onSpeechEnd?.(audioBlob);
                }, 100);
              } else {
                callbacks.onSpeechEnd?.();
              }
            }, this.silenceDurationMs);
          }
        }

        this.animationFrameId = requestAnimationFrame(checkAudio);
      };

      checkAudio();
    } catch (err) {
      this.stop();
      callbacks.onError?.(err);
      throw err;
    }
  }

  public stop(): void {
    this.isListening = false;
    this.isSpeaking = false;

    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  public getStatus(): { isListening: boolean; isSpeaking: boolean } {
    return {
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
    };
  }
}

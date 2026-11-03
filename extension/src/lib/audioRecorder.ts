// ============================================================================
// OWLY.AI — Audio Recorder & Speech Processor
// Captures microphone input for Meta Muse Voice Transcribe Gateway
// ============================================================================

export interface RecordingResult {
  blob: Blob;
  base64: string;
  durationMs: number;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private recordedChunks: Blob[] = [];
  private startTime: number = 0;
  private isRecording: boolean = false;

  public async start(): Promise<void> {
    if (this.isRecording) return;
    this.recordedChunks = [];

    // Request microphone access
    this.audioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    // Determine supported mimeType
    let mimeType = 'audio/webm;codecs=opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else {
        mimeType = '';
      }
    }

    const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
    this.mediaRecorder = new MediaRecorder(this.audioStream, options);

    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.startTime = Date.now();
    this.isRecording = true;
    this.mediaRecorder.start(250); // Slice chunks every 250ms
  }

  public async stop(): Promise<RecordingResult> {
    if (!this.isRecording || !this.mediaRecorder) {
      throw new Error('Recorder is not active');
    }

    return new Promise<RecordingResult>((resolve, reject) => {
      const recorder = this.mediaRecorder!;
      const stream = this.audioStream!;

      recorder.onstop = async () => {
        try {
          const durationMs = Date.now() - this.startTime;
          const mimeType = recorder.mimeType || 'audio/webm';
          const combinedBlob = new Blob(this.recordedChunks, { type: mimeType });

          // Convert blob to base64
          const base64 = await blobToBase64(combinedBlob);

          // Stop all audio tracks to release microphone hardware indicator
          stream.getTracks().forEach((track) => track.stop());
          this.audioStream = null;
          this.mediaRecorder = null;
          this.isRecording = false;

          resolve({
            blob: combinedBlob,
            base64,
            durationMs,
          });
        } catch (err) {
          reject(err);
        }
      };

      try {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  public cancel(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (_) {}
    }
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((t) => t.stop());
      this.audioStream = null;
    }
    this.mediaRecorder = null;
    this.isRecording = false;
    this.recordedChunks = [];
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


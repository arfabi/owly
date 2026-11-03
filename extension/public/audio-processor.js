// ============================================================================
// OWLY.AI - AudioWorklet Processor for High-Fidelity 16kHz PCM Capture
// Runs in background audio rendering thread for zero-latency turn taking
// Replaces deprecated ScriptProcessorNode
// ============================================================================

class PcmCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // 2048 samples = ~128ms at 16kHz, ideal low-latency chunk for voice detection
    this.bufferSize = 2048;
    this.buffer = new Float32Array(this.bufferSize);
    this.index = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (input && input.length > 0) {
      const channel = input[0];
      for (let i = 0; i < channel.length; i++) {
        this.buffer[this.index++] = channel[i];
        if (this.index >= this.bufferSize) {
          this.port.postMessage(this.buffer.slice(0));
          this.index = 0;
        }
      }
    }
    return true;
  }
}

registerProcessor("pcm-capture-processor", PcmCaptureProcessor);


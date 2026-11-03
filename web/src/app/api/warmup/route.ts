import { NextResponse } from 'next/server';

const basetenApiKey = process.env.BASETEN_API_KEY || '';
const basetenBaseUrl = process.env.BASETEN_BASE_URL || 'https://inference.baseten.co/v1';
const modelName = process.env.MUSE_SPARK_MODEL_NAME || 'meta-models/muse-spark-open-1026';

let lastWarmupTime = 0;
const WARMUP_INTERVAL_MS = 60000; // Warm at most once every 60s

export async function GET() {
  const now = Date.now();
  const shouldPingBaseten = now - lastWarmupTime > WARMUP_INTERVAL_MS;

  if (shouldPingBaseten && basetenApiKey) {
    lastWarmupTime = now;
    // Fire-and-forget lightweight ping to wake up Baseten container if scaled to zero
    fetch(`${basetenBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${basetenApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1,
      }),
      signal: AbortSignal.timeout(6000),
    }).catch((e: any) => {
      // Non-blocking log
      console.log('[Owly Warmup] Pre-warm initiated:', e.message);
    });
  }

  return NextResponse.json({
    status: 'ok',
    warmed: shouldPingBaseten,
    timestamp: now,
  });
}


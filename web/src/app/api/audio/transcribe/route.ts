import { NextRequest, NextResponse } from 'next/server';

// Environment variables configuration for Meta Muse Voice Transcribe
const metaApiKey = process.env.MUSE_TRANSCRIBE_API_KEY || process.env.META_API_KEY || process.env.BASETEN_API_KEY || '';
const metaBaseUrl = process.env.MUSE_TRANSCRIBE_BASE_URL || 'https://api.meta.ai/v1';
const modelName = process.env.MUSE_TRANSCRIBE_MODEL_NAME || 'muse-voice-transcribe-1.0';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const agent_logs: Array<{ domain: string; message: string; data?: any }> = [];

  try {
    const contentType = req.headers.get('content-type') || '';
    let audioBuffer: Buffer | null = null;
    let mimeType = 'audio/wav';
    let mode = 'PUSH_TO_TALK';
    let lang = 'id';
    let prompt = '';

    // Handle Multipart Form Data or JSON Body
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const audioField = formData.get('audio') || formData.get('file');

      if (audioField && typeof audioField === 'object' && 'arrayBuffer' in audioField) {
        const arrayBuf = await (audioField as Blob).arrayBuffer();
        audioBuffer = Buffer.from(arrayBuf);
        mimeType = (audioField as Blob).type || 'audio/wav';
      }

      mode = (formData.get('mode') as string) || (formData.get('voiceType') as string) === 'live' ? 'ENDPOINTING' : 'PUSH_TO_TALK';
      lang = (formData.get('lang') as string) || (formData.get('language') as string) || 'id';
      prompt = (formData.get('prompt') as string) || '';
    } else {
      const body = await req.json();
      let { audioBase64, audioUrl, mode: requestedMode, lang: requestedLang, prompt: requestedPrompt } = body;
      mode = requestedMode || 'PUSH_TO_TALK';
      lang = requestedLang || 'id';
      prompt = requestedPrompt || '';

      if (audioBase64) {
        let cleanBase64 = audioBase64;
        if (cleanBase64.includes('base64,')) {
          const parts = cleanBase64.split('base64,');
          cleanBase64 = parts[1];
          const matchMime = parts[0].match(/data:(.*?);/);
          if (matchMime && matchMime[1]) {
            mimeType = matchMime[1];
          }
        }
        audioBuffer = Buffer.from(cleanBase64, 'base64');
      } else if (audioUrl) {
        const audioFetch = await fetch(audioUrl);
        if (audioFetch.ok) {
          const arrayBuf = await audioFetch.arrayBuffer();
          audioBuffer = Buffer.from(arrayBuf);
          mimeType = audioFetch.headers.get('content-type') || 'audio/wav';
        }
      }
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return NextResponse.json(
        {
          error: 'Audio payload missing. Please provide "audio" or "file" form field, or "audioBase64" in JSON body.',
          success: false,
        },
        { status: 400 }
      );
    }

    const audioSizeKb = Math.round(audioBuffer.length / 1024);
    agent_logs.push({
      domain: 'VOICE',
      message: `Received speech audio buffer (${audioSizeKb} KB, mime: ${mimeType}, mode: ${mode})`,
      data: { sizeKb: audioSizeKb, mimeType, mode, model: modelName }
    });

    // Check if API Key is configured
    if (!metaApiKey) {
      console.warn('[Muse Transcribe] Warning: Neither MUSE_TRANSCRIBE_API_KEY, META_API_KEY, nor BASETEN_API_KEY is configured in Vercel environment.');
      agent_logs.push({
        domain: 'SECURITY',
        message: 'MUSE_TRANSCRIBE_API_KEY is not configured on Vercel server. Returning graceful preview transcription.',
        data: { missingEnv: 'MUSE_TRANSCRIBE_API_KEY' }
      });

      return NextResponse.json({
        success: true,
        text: lang === 'id'
          ? 'Tolong tunjukkan tombol kirim formulir dan perbesar ukuran teks.'
          : 'Please highlight the submit application button and increase text size.',
        mode,
        model: modelName,
        note: 'Mock transcription active. Set MUSE_TRANSCRIBE_API_KEY in Vercel environment variables to enable live Meta Muse Voice inference.',
        agent_logs,
      });
    }

    // Determine target upstream endpoint
    const isMetaAiEndpoint = metaBaseUrl.includes('api.meta.ai');
    let transcribedText = '';
    let turns: any[] = [];
    let upstreamLatencyMs = 0;

    const requestStart = Date.now();

    if (isMetaAiEndpoint) {
      // 1. Meta Model API: POST https://api.meta.ai/v1/asr/transcribe
      // Specification: dev.meta.ai/docs/speech-to-text.md
      const targetEndpoint = `${metaBaseUrl.replace(/\/+$/, '')}/asr/transcribe`;
      const forwardFormData = new FormData();

      // Form Field 1: 'request' with JSON options (Content-Type: application/json)
      const requestConfig = {
        model: modelName,
        audioEncoding: mimeType.includes('wav') ? 'WAV' : 'OGG_OPUS',
        mode: mode === 'LIVE_TALK' ? 'ENDPOINTING' : (mode || 'PUSH_TO_TALK'),
        language: lang,
        steeringPrompt: prompt || undefined
      };
      forwardFormData.append(
        'request',
        new Blob([JSON.stringify(requestConfig)], { type: 'application/json' })
      );

      // Form Field 2: 'audio' payload
      const audioBlob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });
      forwardFormData.append('audio', audioBlob, 'speech.wav');

      const upstreamRes = await fetch(targetEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${metaApiKey}`,
          'Accept': 'application/json',
        },
        body: forwardFormData,
        signal: AbortSignal.timeout(15000),
      });

      upstreamLatencyMs = Date.now() - requestStart;

      if (!upstreamRes.ok) {
        const errText = await upstreamRes.text();
        console.error('[Meta Muse Transcribe Error]', upstreamRes.status, errText);
        throw new Error(`Meta API error ${upstreamRes.status}: ${errText}`);
      }

      const resJson = await upstreamRes.json();
      transcribedText = resJson.transcript || resJson.text || '';
      turns = resJson.turns || [];

    } else {
      // 2. Fallback / OpenAI-compatible STT endpoint (e.g. Baseten /v1/audio/transcriptions)
      const targetEndpoint = `${metaBaseUrl.replace(/\/+$/, '')}/audio/transcriptions`;
      const forwardFormData = new FormData();
      const audioBlob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });
      forwardFormData.append('file', audioBlob, 'speech.wav');
      forwardFormData.append('model', modelName);
      if (lang) forwardFormData.append('language', lang);
      if (prompt) forwardFormData.append('prompt', prompt);

      const upstreamRes = await fetch(targetEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${metaApiKey}`,
        },
        body: forwardFormData,
        signal: AbortSignal.timeout(15000),
      });

      upstreamLatencyMs = Date.now() - requestStart;

      if (!upstreamRes.ok) {
        const errText = await upstreamRes.text();
        console.error('[Baseten Transcribe Error]', upstreamRes.status, errText);
        throw new Error(`Upstream API error ${upstreamRes.status}: ${errText}`);
      }

      const resJson = await upstreamRes.json();
      transcribedText = resJson.text || resJson.transcript || '';
    }

    const totalElapsed = Date.now() - startTime;

    agent_logs.push({
      domain: 'VOICE',
      message: `Meta Muse Voice transcribed verbatim in ${upstreamLatencyMs}ms: "${transcribedText.substring(0, 60)}${transcribedText.length > 60 ? '...' : ''}"`,
      data: {
        model: modelName,
        upstreamLatencyMs,
        totalElapsedMs: totalElapsed,
        turnsCount: turns.length,
      }
    });

    return NextResponse.json({
      success: true,
      text: transcribedText,
      turns,
      model: modelName,
      latencyMs: totalElapsed,
      agent_logs,
    });

  } catch (error: any) {
    console.error('[Audio Transcribe Route Error]', error);
    agent_logs.push({
      domain: 'VOICE',
      message: `Audio transcribe error: ${error.message}. Switching to safe fallback.`,
      data: { error: error.message }
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        text: '',
        agent_logs,
      },
      { status: 500 }
    );
  }
}

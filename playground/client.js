import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper sederhana untuk membaca file .env tanpa ketergantungan library luar
export function loadEnv() {
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...vals] = trimmed.split('=');
      const val = vals.join('=').trim().replace(/^["']|["']$/g, '');
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
  return process.env.APIKEY || process.env.BASETEN_API_KEY || '';
}

export const BASE_URL = 'https://inference.baseten.co/v1';
export const MODEL_NAME = 'meta-models/muse-spark-open-1026';

/**
 * Fungsi pembantu untuk memanggil endpoint chat completions Baseten Open Spark
 * Mendukung parameter standar Meta: reasoning_effort, tools, chat_template_kwargs, dsb.
 */
export async function callOpenSpark({
  messages,
  stream = false,
  temperature = 0.2,
  top_p,
  reasoning_effort,
  tools,
  tool_choice,
  chat_template_kwargs,
  fullResponse = false,
}) {
  const apiKey = loadEnv();

  if (!apiKey) {
    throw new Error('API Key tidak ditemukan di playground/.env! Pastikan variabel APIKEY terisi.');
  }

  const payload = {
    model: MODEL_NAME,
    messages,
    temperature,
    stream,
  };

  if (top_p !== undefined) payload.top_p = top_p;
  if (reasoning_effort) payload.reasoning_effort = reasoning_effort;
  if (tools) payload.tools = tools;
  if (tool_choice) payload.tool_choice = tool_choice;
  if (chat_template_kwargs) payload.chat_template_kwargs = chat_template_kwargs;

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Baseten API Error (${response.status}): ${errText}`);
  }

  if (stream) {
    return response.body; // ReadableStream
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  const message = choice?.message || {};

  if (fullResponse) {
    return {
      message,
      usage: data.usage,
      reasoning: message.reasoning_content || '',
      content: message.content || '',
      tool_calls: message.tool_calls || null,
      raw: data,
    };
  }

  return message.content || '';
}

/**
 * Memanggil Open Spark dengan hasil respons lengkap (message, reasoning, tool_calls, usage)
 */
export async function callOpenSparkMessage(options) {
  return callOpenSpark({ ...options, fullResponse: true });
}

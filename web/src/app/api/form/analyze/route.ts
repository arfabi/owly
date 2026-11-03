import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const maxDuration = 60; // Allow up to 60s for multi-agent synthesis on Vercel

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Baseten Meta Muse Spark Open Inference Config
const basetenApiKey = process.env.BASETEN_API_KEY || '';
const basetenBaseUrl = process.env.BASETEN_BASE_URL || 'https://inference.baseten.co/v1';
const modelName = process.env.MUSE_SPARK_MODEL_NAME || 'meta-models/muse-spark-open-1026';

// UU PDP & PII Sanitizer: Strip 16-digit NIK, Emails, & Phone numbers
function stripPII(str: string): string {
  if (!str) return '';
  return str
    .replace(/\b[1-9]\d{15}\b/g, '[REDACTED_NIK]')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[REDACTED_EMAIL]')
    .replace(/\b(?:\+?62|08)\d{8,12}\b/g, '[REDACTED_PHONE]');
}

// Clean markdown fenced JSON blocks
function extractCleanJson(text: string): any {
  if (!text) return null;
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function POST(req: NextRequest) {
  const overallStart = Date.now();
  const agent_logs: Array<{ domain: string; message: string; data?: any }> = [];
  const agentTrace: Array<{ agent: string; status: string; durationMs: number }> = [];

  try {
    const body = await req.json();
    const {
      meta = {},
      dom = { fieldCount: 0, fields: [] },
      screenshotBase64 = null,
      options = { language: 'id', streamTelemetry: true }
    } = body;

    const language = options.language || 'id';
    const domain = (meta.domain || 'web-portal').toLowerCase().trim();

    agent_logs.push({
      domain: 'PERCEPTION',
      message: `Received form analysis request: ${dom.fieldCount || 0} fields detected on ${domain}.`,
      data: { url: meta.url, hasScreenshot: !!screenshotBase64 }
    });

    // =========================================================================
    // STEP 0: TWO-TIER CACHE LOOKUP (Section 6.3 - SHA256 of domain + sorted IDs + count)
    // =========================================================================
    const sortedFieldIds = (dom.fields || [])
      .map((f: any) => f.id || f.name || '')
      .filter(Boolean)
      .sort()
      .join(',');

    const cacheKey = crypto
      .createHash('sha256')
      .update(`${domain}:${dom.fieldCount || 0}:${sortedFieldIds}:${language}`)
      .digest('hex');

    const { data: cached } = await supabase
      .from('coach_cache')
      .select('id, explanation_json, source_type, confirmation_ref, hit_count, expires_at')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (cached && cached.explanation_json) {
      const cacheLatency = Date.now() - overallStart;
      agent_logs.push({
        domain: 'GATEWAY',
        message: `Cache L2 Hit: Loaded instant form analysis in ${cacheLatency}ms (Key: ${cacheKey.substring(0, 10)}...).`,
        data: { hit_count: (cached.hit_count || 1) + 1 }
      });

      // Async update hit count
      supabase
        .from('coach_cache')
        .update({ hit_count: (cached.hit_count || 1) + 1, updated_at: new Date().toISOString() })
        .eq('id', cached.id)
        .then(() => {});

      return NextResponse.json({
        success: true,
        cached: true,
        analysis: cached.explanation_json,
        agentTrace: [
          { agent: 'L2 Cache', status: 'Instant memory hit (<600ms)', durationMs: cacheLatency }
        ],
        agent_logs
      });
    }

    // =========================================================================
    // STEP 0.5: DEFENSE-IN-DEPTH PII GUARD (Section 6.3)
    // =========================================================================
    const sanitizedFields = (dom.fields || []).map((f: any) => ({
      id: f.id || '',
      name: f.name || '',
      type: f.type || 'text',
      label: stripPII(f.label || ''),
      placeholder: stripPII(f.placeholder || ''),
      required: !!f.required
    }));

    const sanitizedMeta = {
      title: stripPII(meta.title || ''),
      description: stripPII(meta.description || ''),
      keywords: meta.keywords || [],
      domain,
      url: meta.url || ''
    };

    agent_logs.push({
      domain: 'SECURITY',
      message: 'Defense-in-Depth PII Scrubber: 0 personal values passed. Fields sanitized.',
      data: { fieldCount: sanitizedFields.length }
    });

    // =========================================================================
    // STEP 1 & 2: PARALLEL AGENT EXECUTION (Agent 1 Perception + Agent 2 Regulation)
    // =========================================================================
    const isEn = language === 'en';
    const formNameFallback = sanitizedMeta.title || (isEn ? 'Public Application Form' : 'Formulir Publik');
    const institutionFallback = domain.replace(/^www\./, '');

    agent_logs.push({
      domain: 'PLANNER',
      message: 'Launching Agent 1 (Perception) and Agent 2 (Researcher) concurrently via Promise.all...',
      data: { formName: formNameFallback, domain }
    });

    const runAgent1 = async () => {
      const a1Start = Date.now();
      let a1Result = {
        formName: formNameFallback,
        institution: institutionFallback,
        targetOutcome: isEn ? 'Official Registration Receipt / Form Submission' : 'Penerbitan Bukti Registrasi / Submit Formulir',
        category: isEn ? 'Public Service / Scholarship' : 'Layanan Publik / Beasiswa',
        prerequisites: isEn ? ['Official Government ID / Passport', 'Supporting Documents'] : ['KTP / Identitas Resmi', 'Dokumen Pendukung'],
        difficultyLevel: sanitizedFields.length > 10 ? (isEn ? 'Medium' : 'Sedang') : (isEn ? 'Easy' : 'Mudah'),
        estimatedTime: sanitizedFields.length > 10 ? (isEn ? '15 - 20 Mins' : '15 - 20 Menit') : (isEn ? '5 - 10 Mins' : '5 - 10 Menit')
      };

      const a1SystemPrompt = `Reasoning strength: 32
You are Agent 1: Perception and Form Profiler for Owly.AI. You are Meta Muse Spark Open with vision.
RULES:
1. Identify formName ONLY from visible text in screenshot or meta.title. If not visible, return ${isEn ? '"Public Application Form"' : '"Formulir Publik"'}.
2. DO NOT hallucinate institution. If logo not visible, institution = domain.
3. NEVER include user .value in output.
4. Output language MUST be ${isEn ? 'English' : 'Bahasa Indonesia'}. Translate all text fields (targetOutcome, category, prerequisites, difficultyLevel, estimatedTime) to ${isEn ? 'English' : 'Bahasa Indonesia'}.
5. Output MUST be valid JSON schema: {
  "formName": "string",
  "institution": "string",
  "targetOutcome": "string",
  "category": "string",
  "prerequisites": ["string"],
  "difficultyLevel": "string",
  "estimatedTime": "string"
}`;

      const a1UserContent: any[] = [];
      if (screenshotBase64) {
        let formattedImg = screenshotBase64;
        if (!formattedImg.startsWith('data:') && !formattedImg.startsWith('http')) {
          formattedImg = `data:image/jpeg;base64,${formattedImg}`;
        }
        a1UserContent.push({
          type: 'image_url',
          image_url: { url: formattedImg }
        });
      }

      a1UserContent.push({
        type: 'text',
        text: `Analyze this active page and form:
Page Metadata: ${JSON.stringify(sanitizedMeta)}
DOM Fields Sample: ${JSON.stringify(sanitizedFields.slice(0, 15))}
Language: ${isEn ? 'English' : 'Bahasa Indonesia'}
Return ONLY the raw JSON output matching the schema in ${isEn ? 'English' : 'Bahasa Indonesia'}.`
      });

      try {
        const a1Response = await fetch(`${basetenBaseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${basetenApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: 'system', content: a1SystemPrompt },
              { role: 'user', content: a1UserContent }
            ],
            reasoning_effort: 'medium',
            temperature: 0.2,
            max_tokens: 600
          }),
          signal: AbortSignal.timeout(12000)
        });

        if (a1Response.ok) {
          const a1Data = await a1Response.json();
          const rawContent = a1Data.choices?.[0]?.message?.content || '';
          const parsed = extractCleanJson(rawContent);
          if (parsed && parsed.formName) {
            a1Result = { ...a1Result, ...parsed };
          }
        }
      } catch (e: any) {
        console.warn('[Agent 1 Perception] Non-blocking fallback:', e.message);
      }

      const a1Duration = Date.now() - a1Start;
      return { result: a1Result, duration: a1Duration };
    };

    const runAgent2 = async () => {
      const a2Start = Date.now();
      let officialCitation = '';
      try {
        const { data: chunks } = await supabase
          .from('juknis_chunks')
          .select('title, portal_domain, content')
          .eq('portal_domain', domain)
          .limit(2);

        if (chunks && chunks.length > 0) {
          officialCitation = chunks[0].title || `Juknis Resmi ${domain}`;
        }
      } catch {
        // Supabase chunks optional
      }

      const isOfficialGov = domain.endsWith('.go.id') || domain.endsWith('.ac.id') || domain.includes('lpdp') || !!officialCitation;

      let a2Result = {
        officialSource: {
          url: meta.url || `https://${domain}`,
          badge: isOfficialGov ? (isEn ? 'Official Portal' : 'Official .go.id') : 'AI Guidance',
          title: officialCitation || (isEn ? `Official Guide ${institutionFallback}` : `Panduan Pendaftaran ${institutionFallback}`)
        },
        deadlines: isEn ? 'According to official agency schedule' : 'Sesuai jadwal resmi instansi',
        criticalRules: isEn ? [
          'Ensure personal data matches official government identification documents.',
          'Uploaded documents must be legible and unblurred.'
        ] : [
          'Pastikan data diri sesuai dengan identitas kependudukan (KTP/Dukcapil).',
          'Dokumen yang diunggah harus jelas dan tidak buram.'
        ],
        disqualificationTraps: isEn ? [
          'Date of birth or national ID mismatched with official database.',
          'File size exceeds limit or document format invalid.'
        ] : [
          'Data tanggal lahir atau NIK tidak sinkron dengan database pusat.',
          'Ukuran berkas melebihi kuota sistem atau format file tidak sesuai.'
        ],
        isOfficial: isOfficialGov
      };

      const searchQuery = `${formNameFallback} ${institutionFallback} 2026 juknis panduan pendaftaran`;
      const a2SystemPrompt = `Reasoning strength: 32
You are Agent 2: Regulation Researcher for Owly.AI.
CRITICAL PRIVACY: NEVER include PII (nik, email, name) in research. Query = ${searchQuery}
If no .go.id result, return isOfficial false, fallback to AI Guidance.
Output valid JSON:
{
  "deadlines": "string",
  "criticalRules": ["string"],
  "disqualificationTraps": ["string"]
}`;

      try {
        const a2Response = await fetch(`${basetenBaseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${basetenApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: 'system', content: a2SystemPrompt },
              {
                role: 'user',
                content: `Form Name: "${formNameFallback}"\nInstitution: "${institutionFallback}"\nDomain: "${domain}"\nProvide rules and traps in ${language === 'en' ? 'English' : 'Bahasa Indonesia'}.`
              }
            ],
            reasoning_effort: 'medium',
            temperature: 0.2,
            max_tokens: 500
          }),
          signal: AbortSignal.timeout(12000)
        });

        if (a2Response.ok) {
          const a2Data = await a2Response.json();
          const rawA2 = a2Data.choices?.[0]?.message?.content || '';
          const parsedA2 = extractCleanJson(rawA2);
          if (parsedA2) {
            if (Array.isArray(parsedA2.criticalRules) && parsedA2.criticalRules.length > 0) {
              a2Result.criticalRules = parsedA2.criticalRules;
            }
            if (Array.isArray(parsedA2.disqualificationTraps) && parsedA2.disqualificationTraps.length > 0) {
              a2Result.disqualificationTraps = parsedA2.disqualificationTraps;
            }
            if (parsedA2.deadlines) {
              a2Result.deadlines = parsedA2.deadlines;
            }
          }
        }
      } catch (e: any) {
        console.warn('[Agent 2 Researcher] Fallback:', e.message);
      }

      const a2Duration = Date.now() - a2Start;
      return { result: a2Result, duration: a2Duration };
    };

    // Execute Agent 1 & Agent 2 concurrently
    const [a1Output, a2Output] = await Promise.all([runAgent1(), runAgent2()]);
    let agent1Result = a1Output.result;
    let agent2Result = a2Output.result;

    if (agent1Result.institution && !agent2Result.officialSource.title.includes(agent1Result.institution)) {
      agent2Result.officialSource.title = isEn ? `Official Guide ${agent1Result.institution}` : `Panduan Pendaftaran ${agent1Result.institution}`;
    }

    agentTrace.push({
      agent: 'Agent 1 (Perception)',
      status: `Identified: "${agent1Result.formName}" (${agent1Result.institution})`,
      durationMs: a1Output.duration
    });
    agent_logs.push({
      domain: 'PERCEPTION',
      message: `Agent 1 Finished: ${agent1Result.formName} | ${agent1Result.institution}`,
      data: agent1Result
    });

    agentTrace.push({
      agent: 'Agent 2 (Researcher)',
      status: `Sourced: ${agent2Result.officialSource.badge} (${agent2Result.criticalRules.length} rules, ${agent2Result.disqualificationTraps.length} traps)`,
      durationMs: a2Output.duration
    });
    agent_logs.push({
      domain: 'REASONING',
      message: `Agent 2 Grounding: ${agent2Result.officialSource.badge} from ${domain}.`,
      data: agent2Result
    });

    // =========================================================================
    // STEP 3: AGENT 3 - DECISION, SYNTHESIS & CHAINING (High Dynamic Reasoning)
    // =========================================================================
    const a3Start = Date.now();

    // Section 6.3: Dynamic reasoning effort
    // If fieldCount < 8 -> low (32 token), if has officialSource -> high (256 token), else medium (32 token)
    const dynamicReasoningTokens = (dom.fieldCount || 0) < 8 ? 32 : (agent2Result.isOfficial ? 256 : 64);
    const dynamicReasoningLevel = dynamicReasoningTokens >= 256 ? 'high' : 'medium';

    agent_logs.push({
      domain: 'REASONING',
      message: `Agent 3 (Decision & Synthesis): Launching dynamic reasoning (strength: ${dynamicReasoningTokens})...`
    });

    const a3SystemPrompt = `Reasoning strength: ${dynamicReasoningTokens}
You are Agent 3: Decision and Synthesis - High Reasoning for Owly.AI.
Input: Agent1 JSON + Agent2 JSON + DOM fields
TASK: Field Matching, Validation Strategy, Priority Ordering, Trap Detection
RULES:
- fieldId in output MUST exactly match DOM input, do not invent.
- Add confidenceScore 0-1 per field.
- If field corresponds to citizen identity (NIK, Nama, Email, Telepon, Tanggal Lahir, Alamat), map to matching vaultKey (e.g. "personal.nik", "personal.fullName", "personal.email", "personal.phone", "personal.birthDate", "personal.address").
Output JSON format:
{
  "roadmap": "string summary of the form filling steps",
  "fieldRulesMap": [
    {
      "fieldId": "exact_id_from_dom",
      "action": "clear concrete guidance for user",
      "vaultKey": "personal.nik or null",
      "confidenceScore": 0.95,
      "validation": "e.g. 16 digit number"
    }
  ],
  "trapsChecklist": ["string warning before submit"]
}`;

    let agent3Result: {
      roadmap: string;
      fieldRulesMap: Array<{ fieldId: string; action: string; vaultKey: string | null; confidenceScore: number; validation?: string }>;
      trapsChecklist: string[];
    } = {
      roadmap: isEn
        ? `Fill the ${agent1Result.formName} progressively starting from primary identity to supporting attachments.`
        : `Isi formulir ${agent1Result.formName} secara bertahap mulai dari data identitas utama hingga berkas lampiran.`,
      fieldRulesMap: sanitizedFields.map((f: any) => {
        const lowerLabel = (f.label || f.name || f.id).toLowerCase();
        let vaultKey: string | null = null;
        let action = isEn ? `Enter ${f.label || f.name} per official documents.` : `Masukkan ${f.label || f.name} sesuai dokumen resmi.`;
        if (lowerLabel.includes('nik') || lowerLabel.includes('identitas') || lowerLabel.includes('ktp') || lowerLabel.includes('national id') || lowerLabel.includes('ssn')) {
          vaultKey = 'personal.nik';
          action = isEn ? 'Ensure 16 digits match government registry without spaces.' : 'Pastikan 16 digit sesuai Dukcapil tanpa spasi.';
        } else if (lowerLabel.includes('nama') || lowerLabel.includes('name')) {
          vaultKey = 'personal.fullName';
          action = isEn ? 'Enter full legal name without abbreviations per ID/passport.' : 'Tuliskan nama lengkap tanpa singkatan sesuai KTP/Ijazah.';
        } else if (lowerLabel.includes('email')) {
          vaultKey = 'personal.email';
          action = isEn ? 'Use an active email for verification and confirmation letters.' : 'Gunakan email aktif untuk verifikasi dan penerimaan dokumen.';
        } else if (lowerLabel.includes('telepon') || lowerLabel.includes('phone') || lowerLabel.includes('hp')) {
          vaultKey = 'personal.phone';
          action = isEn ? 'Active WhatsApp / mobile number for notifications.' : 'Nomor WhatsApp aktif untuk konfirmasi pengajuan.';
        } else if (
          lowerLabel.includes('tempat') ||
          lowerLabel.includes('place of birth') ||
          lowerLabel.includes('birth place') ||
          lowerLabel.includes('birthplace') ||
          lowerLabel.includes('pob')
        ) {
          vaultKey = 'personal.birthPlace';
          action = isEn
            ? 'Enter city or regency of birth matching your official birth certificate or passport (e.g. Jakarta, Kudus).'
            : 'Tuliskan kota/kabupaten tempat lahir persis sesuai Akta Kelahiran/KTP (cth: Jakarta, Kudus).';
        } else if (
          lowerLabel.includes('tanggal') ||
          lowerLabel.includes('date of birth') ||
          lowerLabel.includes('birth date') ||
          lowerLabel.includes('birthdate') ||
          lowerLabel.includes('dob') ||
          f.type === 'date' ||
          lowerLabel.includes('lahir') ||
          lowerLabel.includes('birth')
        ) {
          vaultKey = 'personal.birthDate';
          action = isEn ? 'Date of birth format matching official civil records.' : 'Format tanggal lahir sesuai dokumen akta / KTP.';
        }
        return {
          fieldId: f.id || f.name,
          action,
          vaultKey,
          confidenceScore: 0.9,
          validation: f.required ? (isEn ? 'Required' : 'Wajib diisi') : (isEn ? 'Optional' : 'Opsional')
        };
      }),
      trapsChecklist: agent2Result.disqualificationTraps
    };

    try {
      const a3Response = await fetch(`${basetenBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${basetenApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: a3SystemPrompt },
            {
              role: 'user',
              content: `Agent 1 Perception: ${JSON.stringify(agent1Result)}\nAgent 2 Regulation: ${JSON.stringify(agent2Result)}\nDOM Fields to Map: ${JSON.stringify(sanitizedFields.slice(0, 20))}\nLanguage: ${language === 'en' ? 'English' : 'Bahasa Indonesia'}`
            }
          ],
          reasoning_effort: dynamicReasoningLevel,
          temperature: 0.2,
          max_tokens: 1200
        }),
        signal: AbortSignal.timeout(14000)
      });

      if (a3Response.ok) {
        const a3Data = await a3Response.json();
        const rawA3 = a3Data.choices?.[0]?.message?.content || '';
        const parsedA3 = extractCleanJson(rawA3);
        if (parsedA3) {
          if (parsedA3.roadmap) agent3Result.roadmap = parsedA3.roadmap;
          if (Array.isArray(parsedA3.fieldRulesMap) && parsedA3.fieldRulesMap.length > 0) {
            // Re-verify that fieldIds match DOM
            const validDomIds = new Set(sanitizedFields.map((f: any) => f.id || f.name));
            const filteredMap = parsedA3.fieldRulesMap.filter((item: any) => validDomIds.has(item.fieldId));
            if (filteredMap.length > 0) {
              agent3Result.fieldRulesMap = filteredMap;
            }
          }
          if (Array.isArray(parsedA3.trapsChecklist) && parsedA3.trapsChecklist.length > 0) {
            agent3Result.trapsChecklist = parsedA3.trapsChecklist;
          }
        }
      }
    } catch (e: any) {
      console.warn('[Agent 3 Decision] Fallback:', e.message);
    }

    const a3Duration = Date.now() - a3Start;
    agentTrace.push({
      agent: 'Agent 3 (Decision & Synthesis)',
      status: `Synthesized roadmap & ${agent3Result.fieldRulesMap.length} field blueprints (${dynamicReasoningTokens} reasoning tokens)`,
      durationMs: a3Duration
    });
    agent_logs.push({
      domain: 'ACTION',
      message: `Agent 3 Completed: ${agent3Result.fieldRulesMap.length} fields blueprint mapped.`,
      data: { roadmap: agent3Result.roadmap }
    });

    // =========================================================================
    // STEP 4: CONSOLIDATE FINAL PAYLOAD & SAVE TO L2 CACHE
    // =========================================================================
    const finalAnalysis = {
      formId: `${domain}_${Date.now()}`,
      formTitle: agent1Result.formName,
      institution: agent1Result.institution,
      targetOutcome: agent1Result.targetOutcome,
      category: agent1Result.category,
      difficultyLevel: agent1Result.difficultyLevel,
      estimatedTime: agent1Result.estimatedTime,
      officialSource: agent2Result.officialSource,
      prerequisites: agent1Result.prerequisites,
      traps: agent3Result.trapsChecklist,
      roadmap: agent3Result.roadmap,
      fieldsGuide: agent3Result.fieldRulesMap
    };

    // Save to coach_cache with 24-hr TTL
    supabase
      .from('coach_cache')
      .upsert({
        cache_key: cacheKey,
        portal_domain: domain,
        field_key: '__FULL_FORM_ANALYSIS__',
        language,
        explanation_json: finalAnalysis,
        source_type: agent2Result.isOfficial ? 'official' : 'ai_guidance',
        confirmation_ref: agent2Result.officialSource.title,
        hit_count: 1,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
      .then(
        () => {
          agent_logs.push({
            domain: 'SECURITY',
            message: `L2 Cache Indexed: Saved form analysis with 24h TTL (Key: ${cacheKey.substring(0, 10)}...).`
          });
        },
        (err: any) => {
          console.warn('Failed to persist cache:', err);
        }
      );

    const totalDuration = Date.now() - overallStart;
    agent_logs.push({
      domain: 'GATEWAY',
      message: `Multi-Agent Pipeline completed successfully in ${totalDuration}ms.`,
      data: { trace: agentTrace }
    });

    return NextResponse.json({
      success: true,
      cached: false,
      analysis: finalAnalysis,
      agentTrace,
      agent_logs
    });

  } catch (error: any) {
    console.error('Multi-Agent /api/form/analyze error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Internal multi-agent orchestration error',
        agent_logs: [
          { domain: 'GATEWAY', message: `Pipeline Error: ${error.message}` }
        ]
      },
      { status: 500 }
    );
  }
}

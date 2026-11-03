// ============================================================================
// OWLY.AI — Modular Localization Dictionary (i18n)
// Mendukung bahasa sesuai spesifikasi PRD Bab 4 (id, en, zh, es, ar, dll)
// ============================================================================

import { SupportedLanguage } from "./types";
export type { SupportedLanguage };

export interface TranslationDictionary {
  nav: {
    pillars: string;
    features: string;
    accessibility: string;
    howItWorks: string;
    mockPortal: string;
    simulator: string;
    installExt: string;
    download: string;
    demo: string;
  };
  hero: {
    aiBadge: string;
    titleLine1: string;
    titleHighlight: string;
    description: string;
    ctaMockPortal: string;
    ctaDownload: string;
    ctaLearnSecurity: string;
  };
  browserMockup: {
    portalDetected: string;
    formTitle: string;
    formSubtitle: string;
    nikLabel: string;
    fieldActive: string;
    nikValidStatus: string;
    autofillBadge: string;
    statementLabel: string;
    pdfFormatNotice: string;
    legalizedNotice: string;
    fieldCoachHeader: string;
    officialBadge: string;
    officialRuleTitle: string;
    officialRuleDesc: string;
    pitfallTitle: string;
    pitfallDesc: string;
    sourceCitation: string;
    vectorStoreLabel: string;
    btnAutofillSingle: string;
    voicebotReady: string;
    auditStatusValid: string;
  };
  marquee: {
    title: string;
    portals: string[];
  };
  pillars: {
    tag: string;
    title: string;
    subtitle: string;
    guidance: {
      tag: string;
      title: string;
      quote: string;
      point1Title: string;
      point1Desc: string;
      point2Title: string;
      point2Desc: string;
      point3Title: string;
      point3Desc: string;
      footer: string;
    };
    assistance: {
      tag: string;
      title: string;
      quote: string;
      point1Title: string;
      point1Desc: string;
      point2Title: string;
      point2Desc: string;
      point3Title: string;
      point3Desc: string;
      footer: string;
    };
    explain: {
      tag: string;
      title: string;
      quote: string;
      point1Title: string;
      point1Desc: string;
      point2Title: string;
      point2Desc: string;
      point3Title: string;
      point3Desc: string;
      footer: string;
    };
    autofill: {
      tag: string;
      title: string;
      quote: string;
      point1Title: string;
      point1Desc: string;
      point2Title: string;
      point2Desc: string;
      point3Title: string;
      point3Desc: string;
      footer: string;
    };
    auditor: {
      tag: string;
      title: string;
      quote: string;
      point1Title: string;
      point1Desc: string;
      point2Title: string;
      point2Desc: string;
      point3Title: string;
      point3Desc: string;
      footer: string;
    };
  };
  agentConsole: {
    badge: string;
    title: string;
    desc: string;
    features: string[];
  };
  accessibility: {
    badge: string;
    title: string;
    subtitle: string;
    tools: { title: string; status: string }[];
  };
  howItWorks: {
    tag: string;
    title: string;
    steps: { step: string; title: string; desc: string }[];
  };
  downloadSection: {
    title: string;
    subtitle: string;
    chromiumBadge: string;
    btnDownloadZip: string;
    videoBadge: string;
    videoTitle: string;
    videoSubtitle: string;
    videoTimestamps: { time: string; label: string }[];
    guideTitle: string;
    steps: { number: string; title: string; desc: string; tip?: string }[];
    browsers: { name: string; url: string; note: string }[];
  };
  ctaBanner: {
    title: string;
    description: string;
    btnDemo: string;
    btnDownload: string;
    btnDocs: string;
  };
  footer: {
    copyright: string;
    subline: string;
  };
  mockPortal: {
    topBannerTag: string;
    topBannerTitle: string;
    btnBackLanding: string;
    formTitle: string;
    formSubtitle: string;
    btnAutofillDemo: string;
    nikLabel: string;
    nikPlaceholder: string;
    nikHint: string;
    spotlightActive: string;
    namaLabel: string;
    namaPlaceholder: string;
    tglLabel: string;
    photoLabel: string;
    photoPrompt: string;
    photoHint: string;
    essayLabel: string;
    essayPlaceholder: string;
    wordCountLabel: string;
    btnAudit: string;
    btnSubmit: string;
    submitDisabledTip: string;
    auditHeader: string;
    auditEmptyMsg: string;
    auditNikInvalidMsg: string;
    auditEssayShortMsg: string;
    auditSuccessMsg: string;
  };
}

const enTranslations: TranslationDictionary = {
  nav: {
    pillars: "Features",
    features: "Features",
    accessibility: "Accessibility Hub",
    howItWorks: "How It Works",
    mockPortal: "Mock Portal",
    simulator: "Simulator",
    installExt: "Install Extension",
    download: "Download",
    demo: "Demo",
  },
  hero: {
    aiBadge: "Powered by Baseten Muse Spark Open • Real-Time Multimodal AI",
    titleLine1: "Your AI Browser Companion",
    titleHighlight: "for Forms & Web",
    description:
      "Understand any page, fill forms with guidance, and catch mistakes before you submit. Powered by high-speed Baseten Muse Spark Open reasoning, hands-free voice companion, visual snip reasoning, client-encrypted vault, and pre-submit traffic light auditor.",
    ctaMockPortal: "Test in LPDP Simulator",
    ctaDownload: "Download Extension (.ZIP)",
    ctaLearnSecurity: "Explore Architecture & Security",
  },
  browserMockup: {
    portalDetected: "Portal Detected",
    formTitle: "LPDP Scholarship Application Form 2026",
    formSubtitle: "Stage 1: Personal Identity & Official Documents",
    nikLabel: "National Identification Number (NIK)",
    fieldActive: "Active Field",
    nikValidStatus: "Matches official 16-digit format",
    autofillBadge: "Autofilled via Vault",
    statementLabel: "Commitment Return Statement (Apostille / Certified)",
    pdfFormatNotice: "Official PDF format, max 2MB",
    legalizedNotice: "Wet seal certification required per Official Guidelines Ch. IV",
    fieldCoachHeader: "Field Coach (Guidelines RAG)",
    officialBadge: "🟢 Official",
    officialRuleTitle: "Official Guideline Rule:",
    officialRuleDesc: "NIK must be 16 valid digits matching physical e-KTP registered in Dukcapil.",
    pitfallTitle: "Common Pitfall:",
    pitfallDesc: "Do not use NIK from old Family Card if you have relocated recently.",
    sourceCitation: "Source: LPDP 2026 Official Guide Page 14",
    vectorStoreLabel: "Meta Vector Store",
    btnAutofillSingle: "Fill This Field from Vault (3271...)",
    voicebotReady: "Handsfree Voicebot Ready",
    auditStatusValid: "Audit: 100% Valid",
  },
  marquee: {
    title: "Guided Assistance Across All Official Public Portals & Digital Forms",
    portals: [
      "LPDP Ministry of Finance Portal",
      "European Schengen Visa Application",
      "Indonesian Passport Services",
      "Civil Service Exam Portal (SSCASN)",
      "US Visa Portal (DS-160)",
      "Australia Awards Scholarship",
      "Online Single Submission (OSS)",
      "LPDP Ministry of Finance Portal",
      "European Schengen Visa Application",
      "Indonesian Passport Services",
    ],
  },
  pillars: {
    tag: "5 Solution Pillars",
    title: "Engineered for Citizen Peace of Mind",
    subtitle: "Combining Baseten Muse Spark Open multimodal reasoning with deterministic local guardrails without hallucinations and Zero-Knowledge client privacy.",
    guidance: {
      tag: "Pillar 1: Guidance",
      title: "Analyze This Form & Smart Roadmap",
      quote: '"Understand complex form structures and requirements before typing"',
      point1Title: "3-Agent Compound Profiler:",
      point1Desc: "Perception Agent processes DOM & full-page WebP screenshots, Regulation RAG matches official rules, and Decision Agent builds step roadmap.",
      point2Title: "Field-by-Field Coach:",
      point2Desc: "Interactive card docked next to the active input with official rules, format examples, pitfall warnings, and verified page citations.",
      point3Title: "Trap Checklist & Anti-Blunder:",
      point3Desc: "Proactive verification of disqualification traps commonly overlooked by applicants during initial administrative screening.",
      footer: "Powered by: Baseten & Neural Vector Store (`file_search`) & Multi-Agent Chain",
    },
    assistance: {
      tag: "Pillar 2: Assistance",
      title: "Voice Companion & Ghost Cursor",
      quote: '"Hands-free two-way voice companion with visual ghost cursor guidance"',
      point1Title: "Hands-Free Voice Companion:",
      point1Desc: "Converse naturally via Push-to-Talk (PTT) or hands-free Live Talk powered by Web Speech API and client-side RMS Voice Activity Detection.",
      point2Title: "Show Me 4-Level Navigator:",
      point2Desc: "Finds hidden buttons and sections using 4-tier cascade (Exact Match 0ms, Synonym Heuristics 0ms, Semantic Reasoning, and Multimodal Vision).",
      point3Title: "Virtual AI Ghost Cursor:",
      point3Desc: "A sleek animated virtual cursor glides smoothly across the screen to pinpoint target elements with an interactive ripple effect.",
      footer: "Powered by: RMS VAD, Web Speech API & Virtual Ghost Cursor Engine",
    },
    explain: {
      tag: "Pillar 3: Explain",
      title: "Lightshot Snip & Vision Reasoning",
      quote: '"Crop confusing sections, tables, or diagrams for instant human-friendly clarity"',
      point1Title: "Lightshot-Style Visual Crop:",
      point1Desc: "Draw a custom bounding box over any ambiguous table, requirement clause, or complex flowchart on the webpage.",
      point2Title: "Multimodal Vision Reasoning:",
      point2Desc: "Baseten Muse Spark Open processes high-resolution visual snips to reason over complex layout, fine print, and contextual instructions.",
      point3Title: "Human-Centric Explainer:",
      point3Desc: "Translates rigid legal and bureaucratic jargon into clear, actionable, citizen-friendly guidance in seconds.",
      footer: "Powered by: Baseten Muse Spark Open Multimodal Vision",
    },
    autofill: {
      tag: "Pillar 4: Autofill",
      title: "Zero-Knowledge Vault & 100% Undo",
      quote: '"Blazing-fast form completion with absolute client privacy and undo peace of mind"',
      point1Title: "Local AES-256-GCM Encryption:",
      point1Desc: "Sensitive citizen vaults (ID, Passport, Diplomas) remain encrypted locally in browser storage. Plaintext credentials never hit any server.",
      point2Title: "UU PDP Compliant PII Masking:",
      point2Desc: "Automatically scrubs and masks national ID numbers and sensitive personal data before any AI interaction.",
      point3Title: "Dual Mode & Instant 100% Undo:",
      point3Desc: "Autofill per-card or in 1-click batch with guaranteed rollback capability that preserves user manual typing untouched.",
      footer: "Powered by: WebCrypto AES-256-GCM & In-Memory Undo Stack",
    },
    auditor: {
      tag: "Pillar 5: Auditor",
      title: "Pre-Submit Traffic Light FSM",
      quote: '"Zero-compromise pre-submission audit before you hit the submit button"',
      point1Title: "Source-Agnostic Audit:",
      point1Desc: "Audits live web form ground-truth values without caring whether fields were filled manually by hand or via 1-Click Vault Autofill.",
      point2Title: "4-Layer Non-Blocking Validation:",
      point2Desc: "Validates asterisk required fields, 16-digit Kemendagri NIK & female date calculation (+40), phone numbers, RFC emails, and ICAO passports.",
      point3Title: "Biometric Photo & Cross-Field Audit:",
      point3Desc: "Inspects Laplacian Blur sharpness, ICAO 9303 head proportion, file extension/size limits, and cross-field date/gender consistency.",
      footer: "Powered by: Client-Side Sharp In-Memory Engine & Finite State Machine",
    },
  },
  agentConsole: {
    badge: "Full AI Reasoning Transparency & Developer Console",
    title: "Live Agentic Execution Console",
    desc: "Experience full transparency into how Baseten Muse Spark Open reasons through complex forms in real-time. Owly.AI features an embedded Cyberpunk dark IDE Terminal Console in the extension header allowing developers to inspect real-time reasoning chains, perception events, and tool calls live.",
    features: [
      "Ultra-low latency inference via Baseten Muse Spark Open",
      "Real-time step-by-step reasoning logs (chain-of-thought)",
      "DOM extraction & perception event stream",
      "Visual 2-turn capture_current_screen tool call inspection",
    ],
  },
  accessibility: {
    badge: "Sensory & Cognitive Comfort",
    title: "Accessibility HUB: 14 Deterministic Tools",
    subtitle:
      "Built on the core conviction that everyone deserves equal, barrier-free digital access—empowering neurodivergent individuals with ADHD, seniors, and citizens with low vision. Can be triggered manually by clicking cards or autonomously called by AI reasoning when citizens complain of fatigue. Runs 100% in the client browser with $0 token cost.",
    tools: [
      { title: "Reading Spotlight", status: "Focus Line" },
      { title: "Text to Speech (TTS)", status: "Web Speech" },
      { title: "Contrast Mode", status: "WCAG AAA" },
      { title: "Highlight Links", status: "High Visibility" },
      { title: "Bigger Text Size", status: "Scalable" },
      { title: "Text Spacing", status: "Letter Spacing" },
      { title: "Pause Animations", status: "Anti-Distraction" },
      { title: "Hide All Images", status: "Clean Form" },
      { title: "Dyslexia Font", status: "OpenDyslexic" },
      { title: "Big Cursor", status: "SVG Pointer" },
      { title: "Live Tooltips", status: "Contextual" },
      { title: "Line Height", status: "Comfort Spacing" },
      { title: "Text Alignment", status: "Normalized" },
      { title: "Color Saturation", status: "Monochrome" },
    ],
  },
  howItWorks: {
    tag: "User Journey",
    title: "From Ambiguity to Submission-Ready in 4 Steps",
    steps: [
      {
        step: "01",
        title: "Open Any Public Form",
        desc: "The extension passively detects the form without reading any confidential citizen input.",
      },
      {
        step: "02",
        title: "Get Official Guidance",
        desc: "Click 'Analyze This Form' to receive step roadmap, field-by-field guidelines, and pitfall alerts.",
      },
      {
        step: "03",
        title: "Fill Fast & Consistently",
        desc: "Leverage locally encrypted AES-256 Vault autofill with guaranteed 100% undo capability.",
      },
      {
        step: "04",
        title: "Traffic Light Pre-Submit Audit",
        desc: "Execute pre-submission check to detect ID typos, photo biometric flaws, and missing attachments.",
      },
    ],
  },
  downloadSection: {
    title: "Install Owly.AI Extension",
    subtitle: "Compatible with all Chromium-based browsers. Easy 1-minute setup with zero technical prerequisites.",
    chromiumBadge: "Supports All Chromium Browsers",
    btnDownloadZip: "Download owly-extension.zip (v1.0.0)",
    videoBadge: "Official Video Guide",
    videoTitle: "Video Tutorial: How to Install Owly.AI Extension",
    videoSubtitle: "Watch the step-by-step walkthrough: extract the ZIP, open the browser extensions page, toggle Developer Mode, and load unpacked into your browser.",
    videoTimestamps: [
      { time: "0:00", label: "Download & Extract ZIP" },
      { time: "0:15", label: "Open chrome://extensions" },
      { time: "0:25", label: "Toggle Developer Mode" },
      { time: "0:35", label: "Load Unpacked Folder" },
      { time: "0:50", label: "Pin & Open AI Side Panel" },
    ],
    guideTitle: "Step-by-Step Installation Guide",
    steps: [
      {
        number: "01",
        title: "Download & Extract ZIP",
        desc: "Click the download button above to save owly-extension.zip. Right-click the file and select 'Extract All' to a local folder.",
        tip: "Ensure the extracted folder contains manifest.json and background.js.",
      },
      {
        number: "02",
        title: "Open Browser Extension Page",
        desc: "Open a new tab in your browser and enter the extension management URL.",
        tip: "Chrome: chrome://extensions • Edge: edge://extensions • Opera: opera://extensions",
      },
      {
        number: "03",
        title: "Enable 'Developer Mode'",
        desc: "In the top-right corner of the extensions page, toggle the 'Developer mode' switch to ON.",
      },
      {
        number: "04",
        title: "Click 'Load Unpacked'",
        desc: "Click the 'Load unpacked' button in the top-left corner and select the extracted extension folder.",
      },
      {
        number: "05",
        title: "Pin & Launch Owly.AI",
        desc: "Click the puzzle icon in your browser toolbar, pin Owly.AI, and click the logo to launch your AI Side Panel on any website!",
      },
    ],
    browsers: [
      {
        name: "Google Chrome",
        url: "chrome://extensions",
        note: "Official Google browser, best performance and native Side Panel support.",
      },
      {
        name: "Microsoft Edge",
        url: "edge://extensions",
        note: "Default Windows browser, natively supports Chromium extensions.",
      },
      {
        name: "Opera / Opera GX",
        url: "opera://extensions",
        note: "Full support for Manifest V3 Chrome Extensions out-of-the-box.",
      },
      {
        name: "Brave Browser",
        url: "brave://extensions",
        note: "Privacy-focused Chromium browser, 100% compatible with Owly.AI.",
      },
    ],
  },
  ctaBanner: {
    title: "Ready to Experience Next-Gen Form Assistance?",
    description: "Download the extension now or test it right away on our interactive simulator without installing.",
    btnDemo: "Open LPDP Simulator",
    btnDownload: "Download Extension (.ZIP)",
    btnDocs: "View Source on GitHub",
  },
  footer: {
    copyright: "© 2026 Owly.AI • AI-Powered Browser Companion for Forms & Web",
    subline: "Zero-Knowledge client architecture, strict local privacy, and Baseten Muse Spark Open multimodal reasoning.",
  },
  mockPortal: {
    topBannerTag: "Official Simulation",
    topBannerTitle: "LPDP Scholarship Application Portal — Ministry of Finance, Republic of Indonesia",
    btnBackLanding: "Back to Home",
    formTitle: "Regular Master / Doctoral Scholarship Application Form 2026",
    formSubtitle: "Stage 1: Personal Identity, Biometric Documents, & Post-Study Plan",
    btnAutofillDemo: "Simulate 1-Click Vault Autofill",
    nikLabel: "National Identification Number (NIK)",
    nikPlaceholder: "16-digit number matching physical e-KTP",
    nikHint: "Ensure NIK is actively registered in Civil Registry (Dukcapil).",
    spotlightActive: "Spotlight Active (Owly)",
    namaLabel: "Full Name (as in Diploma & ID)",
    namaPlaceholder: "Example: Budi Santoso",
    tglLabel: "Date of Birth",
    photoLabel: "Upload Official Biometric Photo (2x2 Inches / 35x45 mm)",
    photoPrompt: "Click to upload plain background photo (white/red)",
    photoHint: "JPG/PNG format, max 200 KB. Biometrically audited for Laplacian blur and ICAO 9303 proportions.",
    essayLabel: "Commitment to Return & Post-Study Contribution Essay",
    essayPlaceholder: "Describe your concrete post-study contributions to national development...",
    wordCountLabel: "words",
    btnAudit: "Run Pre-Submit Audit",
    btnSubmit: "Submit Application",
    submitDisabledTip: "This button is strictly pressed by the user after audit green light is cleared",
    auditHeader: "Pre-Submit Auditor Result (Owly.AI)",
    auditEmptyMsg: "Audit Failed (Red Light): Required fields remain unfilled.",
    auditNikInvalidMsg: "Audit Failed (Red Light): NIK must be exactly 16 numeric digits.",
    auditEssayShortMsg: "Warning (Yellow Light): Contribution essay is too brief (minimum 50 words recommended).",
    auditSuccessMsg: "Audit Cleared (Green Light): All fields valid per LPDP 2026 Guidelines. Ready to submit!",
  },
};

function translationsFallback(_lang: string): TranslationDictionary {
  return enTranslations;
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  id: {
    nav: {
      pillars: "Pilar Fitur",
      features: "Fitur Utama",
      accessibility: "Accessibility Hub",
      howItWorks: "Cara Kerja",
      mockPortal: "Mock Portal",
      simulator: "Simulator",
      installExt: "Pasang Ekstensi",
      download: "Download",
      demo: "Demo",
    },
    hero: {
      aiBadge: "Didukung Baseten Muse Spark Open • Real-Time Multimodal AI",
      titleLine1: "Your AI Browser Companion",
      titleHighlight: "for Forms & Web",
      description:
        "Bimbingan cerdas formulir publik bertenaga model penalaran Baseten Muse Spark Open dengan 3-Agent compound profiler, asistensi suara hands-free, visual snip explain, autofill terenkripsi lokal, dan auditor pra-kirim anti-gagal.",
      ctaMockPortal: "Uji Coba di Simulator LPDP",
      ctaDownload: "Unduh Ekstensi (.ZIP)",
      ctaLearnSecurity: "Pelajari Arsitektur & Keamanan",
    },
    browserMockup: {
      portalDetected: "Portal Terdeteksi",
      formTitle: "Formulir Pendaftaran Beasiswa LPDP 2026",
      formSubtitle: "Tahap 1: Data Identitas Diri & Dokumen Resmi",
      nikLabel: "Nomor Induk Kependudukan (NIK)",
      fieldActive: "Field Aktif",
      nikValidStatus: "Sesuai format 16 digit sah",
      autofillBadge: "Autofilled via Vault",
      statementLabel: "Surat Pernyataan Komitmen Kembali (Apostille / Legalisir)",
      pdfFormatNotice: "Format PDF resmi, maks. 2MB",
      legalizedNotice: "Wajib legalisir basah sesuai Juknis Bab IV",
      fieldCoachHeader: "Field Coach (Juknis RAG)",
      officialBadge: "🟢 Official",
      officialRuleTitle: "Aturan Resmi Juknis:",
      officialRuleDesc: "NIK wajib 16 digit asli sesuai e-KTP fisik dan terdaftar aktif di Dukcapil.",
      pitfallTitle: "Jebakan Umum (Pitfall):",
      pitfallDesc: "Jangan menggunakan NIK pada Kartu Keluarga lama bila pernah pindah domisili.",
      sourceCitation: "Sumber: Juknis LPDP 2026 Halaman 14",
      vectorStoreLabel: "Meta Vector Store",
      btnAutofillSingle: "Isi Kolom Ini dari Vault (3271...)",
      voicebotReady: "Handsfree Voicebot Siap",
      auditStatusValid: "Audit: 100% Valid",
    },
    marquee: {
      title: "Bimbingan Terarah di Atas Seluruh Portal Resmi & Formulir Digital",
      portals: [
        "Portal Beasiswa LPDP Kemenkeu",
        "Aplikasi Visa Schengen Eropa",
        "Layanan Paspor RI (M-Paspor)",
        "Portal Rekrutmen CASN / CPNS",
        "US Visa Portal (DS-160)",
        "Australia Awards Scholarship",
        "Portal Izin Usaha OSS Kemeninvest",
        "Formulir Beasiswa LPDP Kemenkeu",
        "Aplikasi Visa Schengen Eropa",
        "Layanan Paspor RI (M-Paspor)",
      ],
    },
    pillars: {
      tag: "5 Pilar Fitur Unggulan",
      title: "Solusi Komprehensif Berteknologi Multi-Agent",
      subtitle: "Menggabungkan penalaran multimodal Baseten Muse Spark Open dengan validasi deterministik lokal nol-halusinasi dan privasi Zero-Knowledge.",
      guidance: {
        tag: "Pilar 1: Guidance",
        title: "Analyze This Form & Smart Roadmap",
        quote: '"Pahami struktur form, syarat tersembunyi, dan checklist sebelum mulai mengisi"',
        point1Title: "3-Agent Collaborative Chain:",
        point1Desc: "Perception Agent menganalisis DOM & screenshot WebP, Regulation RAG Agent mencocokkan juknis resmi, Decision Agent menyusun roadmap.",
        point2Title: "Field-by-Field Coach:",
        point2Desc: "Menampilkan kartu panduan di samping input aktif berisi aturan resmi, contoh format, jebakan umum (pitfall), dan sitasi halaman.",
        point3Title: "Trap Checklist & Anti-Blunder:",
        point3Desc: "Daftar verifikasi otomatis hal-hal krusial yang sering menggugurkan pendaftar di seleksi berkas administratif.",
        footer: "Didukung: Baseten & Neural Vector Store (`file_search`) & Multi-Agent Chain",
      },
      assistance: {
        tag: "Pilar 2: Assistance",
        title: "Voice Companion & Ghost Cursor",
        quote: '"Asisten ramah suara dua arah dan navigasi kursor visual yang memandu langsung"',
        point1Title: "Hands-Free Voice Companion:",
        point1Desc: "Bicara santai menggunakan PTT (Push-to-Talk) atau Live Talk hands-free dengan Web Speech API dan RMS Voice Activity Detection.",
        point2Title: "Show Me 4-Level Navigator:",
        point2Desc: "Menemukan tombol atau seksi tersembunyi lewat 4 tingkat pencocokan (Exact Match 0ms, Kamus Sinonim 0ms, AI Semantik, dan Multimodal Vision).",
        point3Title: "Virtual AI Ghost Cursor:",
        point3Desc: "Animasi kursor virtual visual meluncur mulus ke elemen target di layar disertai efek ripple click yang memukau pengguna.",
        footer: "Didukung: RMS VAD, Web Speech API & Virtual Ghost Cursor Engine",
      },
      explain: {
        tag: "Pilar 3: Explain",
        title: "Lightshot Snip & Vision Reasoning",
        quote: '"Potong area rumit di layar, dan AI akan menjelaskannya dalam bahasa yang mudah dipahami"',
        point1Title: "Lightshot-Style Visual Crop:",
        point1Desc: "Tarik kotak seleksi pada tabel syarat, diagram alur, atau klausul berbelit di halaman web mana pun.",
        point2Title: "Multimodal Vision Reasoning:",
        point2Desc: "AI memproses tangkapan layar beresolusi tinggi dengan Baseten Muse Spark Open untuk membaca konteks visual dan teks kecil.",
        point3Title: "Penjelas Birokrasi Humanis:",
        point3Desc: "Menerjemahkan bahasa hukum dan aturan kaku menjadi instruksi praktis langkah-demi-langkah ramah warga.",
        footer: "Didukung: Baseten Muse Spark Open Multimodal Vision",
      },
      autofill: {
        tag: "Pilar 4: Autofill",
        title: "Zero-Knowledge Vault & 100% Undo",
        quote: '"Pengisian formulir secepat kilat dengan jaminan privasi mutlak dan keamanan data"',
        point1Title: "Enkripsi Lokal AES-256-GCM:",
        point1Desc: "Vault dokumen (KTP, Paspor, Ijazah, CV) disimpan dan didekripsi lokal di browser Anda. Plaintext tidak pernah dikirim ke server.",
        point2Title: "UU PDP PII Masking Scrubber:",
        point2Desc: "Secara otomatis menyensor NIK dan data pribadi sensitif sebelum dikomunikasikan dengan model AI.",
        point3Title: "Dual Mode & Instant 100% Undo:",
        point3Desc: "Isi per-kartu atau sekaligus 1-klik dengan tombol rollback instan yang mengembalikan form ke kondisi semula tanpa merusak input manual.",
        footer: "Didukung: WebCrypto AES-256-GCM & In-Memory Redux Undo Stack",
      },
      auditor: {
        tag: "Pilar 5: Auditor",
        title: "Pre-Submit Traffic Light FSM",
        quote: '"Audit menyeluruh tanpa kompromi sebelum tombol kirim formulir ditekan"',
        point1Title: "Audit Buta Sumber (Source-Agnostic):",
        point1Desc: "Mengaudit kondisi riil nilai form tanpa peduli apakah diketik manual satu per satu atau diisi otomatis via Vault.",
        point2Title: "4 Lapisan Validasi Non-Blocking:",
        point2Desc: "Cek tanda bintang (*), NIK Kemendagri 16 digit & rumus gender wanita (Tgl+40), nomor HP Indonesia (+62/08), email RFC 5322, dan Paspor ICAO.",
        point3Title: "Audit Biometrik Pasfoto (Zero-Pixel):",
        point3Desc: "Menguji ketajaman Laplacian Blur, rasio kepala standar ICAO 9303, batas ukuran KB, dan konsistensi data silang antar-kolom form.",
        footer: "Didukung: Client-Side Sharp In-Memory Engine & Finite State Machine",
      },
    },
    agentConsole: {
      badge: "Transparansi Penuh Penalaran AI & Developer Console",
      title: "Live Agentic Execution Console",
      desc: "Lihat langsung bagaimana model Baseten Muse Spark Open menalar formulir secara real-time. Owly.AI dilengkapi Terminal Console bergaya Cyberpunk dark IDE di header ekstensi untuk menginspeksi alur penalaran, event perception, dan pemanggilan tool calling secara transparan.",
      features: [
        "Inference super cepat berbasis Baseten Muse Spark Open",
        "Trace penalaran langkah demi langkah (chain-of-thought)",
        "Inspeksi perception event dan ekstraksi DOM",
        "Eksekusi visual tool calling 2-turn capture_current_screen",
      ],
    },
    accessibility: {
      badge: "Kenyamanan Sensorik & Kognitif",
      title: "Accessibility HUB: 14 Tools Deterministik",
      subtitle:
        "Mewujudkan kesetaraan akses digital bagi setiap warga—termasuk individu dengan ADHD, lansia, hingga penderita low vision—karena setiap orang berhak atas kemudahan akses yang setara tanpa hambatan. Dapat diaktifkan secara manual lewat klik tile kartu atau dipanggil secara otonom oleh penalaran AI saat pengguna mengeluh pusing atau lelah. Murni berjalan di browser lokal tanpa biaya token ($0).",
      tools: [
        { title: "Reading Spotlight", status: "Focus Line" },
        { title: "Text to Speech (TTS)", status: "Web Speech" },
        { title: "Contrast Mode", status: "WCAG AAA" },
        { title: "Highlight Links", status: "High Visibility" },
        { title: "Bigger Text Size", status: "Scalable" },
        { title: "Text Spacing", status: "Letter Spacing" },
        { title: "Pause Animations", status: "Anti-Distraction" },
        { title: "Hide All Images", status: "Clean Form" },
        { title: "Dyslexia Font", status: "OpenDyslexic" },
        { title: "Big Cursor", status: "SVG Pointer" },
        { title: "Live Tooltips", status: "Contextual" },
        { title: "Line Height", status: "Comfort Spacing" },
        { title: "Text Alignment", status: "Normalized" },
        { title: "Color Saturation", status: "Monochrome" },
      ],
    },
    howItWorks: {
      tag: "Alur Pengguna",
      title: "Dari Ambigu Menjadi Siap Kirim dalam 4 Langkah",
      steps: [
        {
          step: "01",
          title: "Buka Portal Formulir",
          desc: "Ekstensi mendeteksi formulir secara pasif tanpa membaca isian data privasi pengguna.",
        },
        {
          step: "02",
          title: "Panduan Juknis Resmi",
          desc: "Field Coach & Voicebot memberikan konteks dan contoh sah dari Meta Vector Store.",
        },
        {
          step: "03",
          title: "Autofill Terkontrol",
          desc: "Isi per-kolom atau serentak dari Vault terenkripsi lokal dengan fitur 1-click Undo.",
        },
        {
          step: "04",
          title: "Pre-Submit Audit",
          desc: "Pastikan lampu hijau menyala untuk format regex, biometrik pasfoto, dan konsistensi data.",
        },
      ],
    },
    downloadSection: {
      title: "Pasang Ekstensi Owly.AI",
      subtitle: "Kompatibel penuh dengan seluruh browser berbasis Chromium. Instalasi mudah dalam 1 menit tanpa setup rumit.",
      chromiumBadge: "Mendukung Semua Browser Berbasis Chromium",
      btnDownloadZip: "Unduh owly-extension.zip (v1.0.0)",
      videoBadge: "Video Panduan Resmi",
      videoTitle: "Tutorial Video: Cara Pasang Ekstensi Owly.AI",
      videoSubtitle: "Tonton langkah praktis mulai dari ekstrak file ZIP, membuka halaman ekstensi browser, mengaktifkan Developer Mode, hingga memuat ekstensi ke browser Anda.",
      videoTimestamps: [
        { time: "0:00", label: "Unduh & Ekstrak ZIP" },
        { time: "0:15", label: "Buka chrome://extensions" },
        { time: "0:25", label: "Aktifkan Developer Mode" },
        { time: "0:35", label: "Load Unpacked & Pilih Folder" },
        { time: "0:50", label: "Pin & Buka AI Side Panel" },
      ],
      guideTitle: "Panduan Instalasi Langkah-demi-Langkah",
      steps: [
        {
          number: "01",
          title: "Unduh & Ekstrak File ZIP",
          desc: "Klik tombol unduh di atas untuk mendapatkan file owly-extension.zip. Klik kanan file lalu pilih 'Extract All' (Ekstrak Semua) ke folder pilihan Anda.",
          tip: "Pastikan folder hasil ekstrak berisi file manifest.json dan background.js.",
        },
        {
          number: "02",
          title: "Buka Halaman Ekstensi Browser",
          desc: "Buka tab baru di browser Anda dan ketik URL ekstensi sesuai browser yang Anda gunakan.",
          tip: "Chrome: chrome://extensions • Edge: edge://extensions • Opera: opera://extensions",
        },
        {
          number: "03",
          title: "Aktifkan 'Developer Mode'",
          desc: "Di pojok kanan atas halaman ekstensi, geser tombol switch 'Developer mode' (Mode pengembang) menjadi Aktif (ON).",
        },
        {
          number: "04",
          title: "Klik 'Load Unpacked'",
          desc: "Klik tombol 'Load unpacked' (Muat yang belum dibongkar) di pojok kiri atas, lalu arahkan dan pilih folder ekstensi hasil ekstrak tadi.",
        },
        {
          number: "05",
          title: "Sematkan & Buka Owly.AI",
          desc: "Klik ikon puzzle di toolbar browser, klik ikon pin pada Owly.AI, lalu klik ikon Owly.AI untuk membuka AI Side Panel kapan saja!",
        },
      ],
      browsers: [
        {
          name: "Google Chrome",
          url: "chrome://extensions",
          note: "Browser resmi Google, rekomendasi utama untuk performa Side Panel terbaik.",
        },
        {
          name: "Microsoft Edge",
          url: "edge://extensions",
          note: "Browser bawaan Windows, mendukung ekstensi Chromium secara native.",
        },
        {
          name: "Opera / Opera GX",
          url: "opera://extensions",
          note: "Mendukung Manifest V3 Chrome Extension tanpa konfigurasi tambahan.",
        },
        {
          name: "Brave Browser",
          url: "brave://extensions",
          note: "Browser privasi berbasis Chromium, kompatibel 100% dengan Owly.AI.",
        },
      ],
    },
    ctaBanner: {
      title: "Siap Mencoba Pengalaman Formulir Generasi Baru?",
      description: "Unduh ekstensi sekarang atau coba langsung di simulator interaktif kami tanpa perlu instalasi.",
      btnDemo: "Buka Simulator LPDP",
      btnDownload: "Unduh Ekstensi (.ZIP)",
      btnDocs: "Lihat Source Code di GitHub",
    },
    footer: {
      copyright: "© 2026 Owly.AI • AI-Powered Browser Companion for Forms & Web",
      subline: "Arsitektur Zero-Knowledge, perlindungan data lokal UU PDP, dan penalaran multimodal Baseten Muse Spark Open.",
    },
    mockPortal: {
      topBannerTag: "Simulasi Resmi",
      topBannerTitle: "Portal Pendaftaran Beasiswa Lembaga Pengelola Dana Pendidikan (LPDP) Republik Indonesia",
      btnBackLanding: "Kembali ke Beranda",
      formTitle: "Formulir Beasiswa Reguler Magister / Doktor 2026",
      formSubtitle: "Tahap 1: Data Identitas Pribadi, Dokumen Biometrik, & Rencana Pasca-Studi",
      btnAutofillDemo: "Simulasi 1-Click Vault Autofill",
      nikLabel: "Nomor Induk Kependudukan (NIK)",
      nikPlaceholder: "16 digit angka sesuai e-KTP fisik",
      nikHint: "Pastikan NIK masih aktif di Dinas Kependudukan dan Pencatatan Sipil (Dukcapil).",
      spotlightActive: "Spotlight Aktif (Owly)",
      namaLabel: "Nama Lengkap (Sesuai Ijazah & KTP)",
      namaPlaceholder: "Contoh: Budi Santoso",
      tglLabel: "Tanggal Lahir",
      photoLabel: "Unggah Pasfoto Biometrik Resmi (2x2 Inci / 35x45 mm)",
      photoPrompt: "Klik untuk unggah foto berlatar polos (putih/merah)",
      photoHint: "Format JPG/PNG, ukuran maks. 200 KB. Diaudit biometrik ketajaman Laplacian & proporsi kepala ICAO 9303.",
      essayLabel: "Esai Komitmen Kembali ke Indonesia & Rencana Pasca-Studi",
      essayPlaceholder: "Deskripsikan rencana konkret kontribusi Anda bagi bangsa pasca menyelesaikan studi...",
      wordCountLabel: "kata",
      btnAudit: "Jalankan Pre-Submit Audit",
      btnSubmit: "Kirim Formulir (Submit)",
      submitDisabledTip: "Tombol ini hanya ditekan oleh pengguna sendiri setelah lampu hijau audit menyala",
      auditHeader: "Hasil Pre-Submit Auditor (Owly.AI)",
      auditEmptyMsg: "Audit Gagal (Lampu Merah): Masih ada kolom wajib yang belum diisi lengkap.",
      auditNikInvalidMsg: "Audit Gagal (Lampu Merah): NIK wajib berjumlah tepat 16 digit angka.",
      auditEssayShortMsg: "Peringatan (Lampu Kuning): Esai kontribusi terlalu singkat (disarankan minimal 50 kata).",
      auditSuccessMsg: "Audit Berhasil (Lampu Hijau): Semua field valid, sesuai format Juknis LPDP 2026. Siap dikirim!",
    },
  },
  en: enTranslations,
  // 14 Global & Regional Locales Matching Extension
  es: {
    ...translationsFallback("es"),
    nav: {
      pillars: "Pilares",
      features: "Características",
      accessibility: "Centro de Accesibilidad",
      howItWorks: "Cómo Funciona",
      mockPortal: "Portal de Prueba",
      simulator: "Simulador",
      installExt: "Instalar Extensión",
      download: "Descargar",
      demo: "Demo",
    },
    hero: {
      aiBadge: "Desarrollado con Baseten Muse Spark Open • IA Multimodal en Tiempo Real",
      titleLine1: "Tu Compañero de IA",
      titleHighlight: "para Formularios y la Web",
      description: "Orientación inteligente para formularios oficiales con razonamiento multimodal en tiempo real, asistencia por voz, autofill cifrado local y auditor anti-rechazos.",
      ctaMockPortal: "Probar en Simulador",
      ctaDownload: "Descargar Extensión (.ZIP)",
      ctaLearnSecurity: "Ver Seguridad y Arquitectura",
    },
    ctaBanner: {
      title: "¿Listo para experimentar la asistencia de formularios de nueva generación?",
      description: "Descarga la extensión ahora o pruébala inmediatamente en nuestro simulador interactivo.",
      btnDemo: "Abrir Simulador",
      btnDownload: "Descargar Extensión (.ZIP)",
      btnDocs: "Ver Código en GitHub",
    },
    footer: {
      copyright: "© 2026 Owly.AI • Compañero de Navegador con IA para Formularios y la Web",
      subline: "Arquitectura cliente Zero-Knowledge, estricta privacidad local y razonamiento multimodal Baseten Muse Spark Open.",
    },
  },
  zh: {
    ...translationsFallback("zh"),
    nav: {
      pillars: "核心支柱",
      features: "主要功能",
      accessibility: "无障碍中心",
      howItWorks: "工作原理",
      mockPortal: "模拟门户",
      simulator: "模拟器",
      installExt: "安装扩展",
      download: "下载",
      demo: "演示",
    },
    hero: {
      aiBadge: "由 Baseten Muse Spark Open 提供支持 • 实时多模态 AI",
      titleLine1: "您的智能浏览器助手",
      titleHighlight: "赋能各类表单与网站",
      description: "搭载 Baseten Muse Spark Open 实时多模态推理，具备智能表单指引、免提语音交互、本地加密自动填充与防退件预审审计。",
      ctaMockPortal: "在模拟器中体验",
      ctaDownload: "下载扩展程序 (.ZIP)",
      ctaLearnSecurity: "了解隐私与架构",
    },
    ctaBanner: {
      title: "准备好体验下一代表单智能辅导了吗？",
      description: "立即下载扩展程序，或在交互式模拟器中快速测试。",
      btnDemo: "打开模拟器",
      btnDownload: "下载扩展 (.ZIP)",
      btnDocs: "在 GitHub 上查看源码",
    },
    footer: {
      copyright: "© 2026 Owly.AI • 面向表单与网页的 AI 智能浏览器伴侣",
      subline: "零知识客户端架构、严格本地隐私保护及 Baseten Muse Spark Open 多模态推理。",
    },
  },
  ar: {
    ...translationsFallback("ar"),
    nav: {
      pillars: "الركائز الأساسية",
      features: "الميزات الرئيسية",
      accessibility: "مركز إمكانية الوصول",
      howItWorks: "كيف يعمل",
      mockPortal: "بوابة المحاكاة",
      simulator: "المحاكي",
      installExt: "تثبيت الملحق",
      download: "تحميل",
      demo: "تجربة",
    },
    hero: {
      aiBadge: "مدعوم بنموذج Baseten Muse Spark Open • ذكاء اصطناعي متعدد الوسائط بالوقت الفعلي",
      titleLine1: "رفيقك الذكي على المتصفح",
      titleHighlight: "للنماذج والويب",
      description: "إرشاد ذكي لتعبئة النماذج الرسمية بالاستدلال متعدد الوسائط في الوقت الفعلي، ومساعد صوتي، وملء تلقائي مشفر محلياً، وتدقيق ما قبل الإرسال لمنع الأخطاء.",
      ctaMockPortal: "تجربة في المحاكي",
      ctaDownload: "تحميل الملحق (.ZIP)",
      ctaLearnSecurity: "الأمان والبنية التحتية",
    },
    ctaBanner: {
      title: "جاهز لتجربة الجيل القادم من المساعدة الذكية في النماذج؟",
      description: "حمل الملحق الآن أو جربه مباشرة عبر المحاكي التفاعلي.",
      btnDemo: "فتح المحاكي",
      btnDownload: "تحميل الملحق (.ZIP)",
      btnDocs: "عرض الكود على GitHub",
    },
    footer: {
      copyright: "© 2026 Owly.AI • رفيق المتصفح الذكي للنماذج والويب",
      subline: "بنية عميل عديمة المعرفة (Zero-Knowledge)، خصوصية محلية صارمة، واستدلال Baseten Muse Spark Open.",
    },
  },
  ja: {
    ...translationsFallback("ja"),
    nav: {
      pillars: "主要機能",
      features: "特徴",
      accessibility: "アクセシビリティ",
      howItWorks: "使い方",
      mockPortal: "模擬ポータル",
      simulator: "シミュレーター",
      installExt: "拡張機能をインストール",
      download: "ダウンロード",
      demo: "デモ",
    },
    hero: {
      aiBadge: "Baseten Muse Spark Open 搭載 • リアルタイム・マルチモーダルAI",
      titleLine1: "AIブラウザコンパニオン",
      titleHighlight: "フォーム＆ウェブ入力支援",
      description: "Baseten Muse Spark Openによるリアルタイムマルチモーダル推論。公式ガイダンス、ハンズフリー音声アシスト、暗号化ローカル自動入力、提出前失格防止監査。",
      ctaMockPortal: "シミュレーターで試す",
      ctaDownload: "拡張機能をダウンロード (.ZIP)",
      ctaLearnSecurity: "セキュリティとアーキテクチャ",
    },
    ctaBanner: {
      title: "次世代のフォームアシスタンスを体験しませんか？",
      description: "今すぐ拡張機能をダウンロードするか、インタラクティブなシミュレーターでお試しください。",
      btnDemo: "シミュレーターを開く",
      btnDownload: "拡張機能をダウンロード (.ZIP)",
      btnDocs: "GitHubでソースを見る",
    },
    footer: {
      copyright: "© 2026 Owly.AI • フォームとウェブのためのAIブラウザコンパニオン",
      subline: "ゼロ知識クライアントアーキテクチャ、厳格なローカルプライバシー、Baseten Muse Spark Open推論。",
    },
  },
  fr: {
    ...translationsFallback("fr"),
    nav: {
      pillars: "Piliers",
      features: "Fonctionnalités",
      accessibility: "Accessibilité",
      howItWorks: "Comment ça marche",
      mockPortal: "Portail Démo",
      simulator: "Simulateur",
      installExt: "Installer l'extension",
      download: "Télécharger",
      demo: "Démo",
    },
    hero: {
      aiBadge: "Propulsé par Baseten Muse Spark Open • IA Multimodale en Temps Réel",
      titleLine1: "Votre Compagnon IA",
      titleHighlight: "pour Formulaires & Web",
      description: "Assistance intelligente pour formulaires officiels avec raisonnement multimodal, commande vocale, remplissage automatique chiffré local et audit anti-disqualification.",
      ctaMockPortal: "Essayer le simulateur",
      ctaDownload: "Télécharger l'extension (.ZIP)",
      ctaLearnSecurity: "Sécurité & Architecture",
    },
    ctaBanner: {
      title: "Prêt à découvrir l'assistance aux formulaires de nouvelle génération ?",
      description: "Téléchargez l'extension dès maintenant ou testez-la sur notre simulateur interactif.",
      btnDemo: "Ouvrir le simulateur",
      btnDownload: "Télécharger l'extension (.ZIP)",
      btnDocs: "Voir la source sur GitHub",
    },
    footer: {
      copyright: "© 2026 Owly.AI • Compagnon de navigateur IA pour formulaires et web",
      subline: "Architecture Zero-Knowledge, confidentialité locale stricte et raisonnement Baseten Muse Spark Open.",
    },
  },
  de: {
    ...translationsFallback("de"),
    nav: {
      pillars: "Hauptsäulen",
      features: "Funktionen",
      accessibility: "Barrierefreiheit",
      howItWorks: "So funktioniert's",
      mockPortal: "Demo-Portal",
      simulator: "Simulator",
      installExt: "Erweiterung installieren",
      download: "Herunterladen",
      demo: "Demo",
    },
    hero: {
      aiBadge: "Unterstützt durch Baseten Muse Spark Open • Multimodale Echtzeit-KI",
      titleLine1: "Ihr KI-Browser-Begleiter",
      titleHighlight: "für Formulare & Web",
      description: "Intelligente Führung für offizielle Webformulare mit multimodaler Echtzeit-KI, Sprachsteuerung, lokal verschlüsseltem Autofill und Vorab-Prüfung gegen Formfehler.",
      ctaMockPortal: "Im Simulator testen",
      ctaDownload: "Erweiterung herunterladen (.ZIP)",
      ctaLearnSecurity: "Sicherheit & Architektur",
    },
    ctaBanner: {
      title: "Bereit für Formular-Assistenz der nächsten Generation?",
      description: "Laden Sie die Erweiterung jetzt herunter oder testen Sie sie direkt in unserem Simulator.",
      btnDemo: "Simulator öffnen",
      btnDownload: "Erweiterung herunterladen (.ZIP)",
      btnDocs: "Quellcode auf GitHub",
    },
    footer: {
      copyright: "© 2026 Owly.AI • KI-gestützter Browser-Begleiter für Formulare & Web",
      subline: "Zero-Knowledge-Architektur, strikter lokaler Datenschutz und Baseten Muse Spark Open-Inferenz.",
    },
  },
  pt: {
    ...translationsFallback("pt"),
    nav: {
      pillars: "Pilares",
      features: "Recursos",
      accessibility: "Acessibilidade",
      howItWorks: "Como Funciona",
      mockPortal: "Portal Demo",
      simulator: "Simulador",
      installExt: "Instalar Extensão",
      download: "Baixar",
      demo: "Demonstração",
    },
    hero: {
      aiBadge: "Alimentado por Baseten Muse Spark Open • IA Multimodal em Tempo Real",
      titleLine1: "Seu Companheiro de IA",
      titleHighlight: "para Formulários e Web",
      description: "Orientação inteligente para formulários oficiais com raciocínio multimodal em tempo real, suporte de voz, preenchimento automático criptografado e auditor pré-envio.",
      ctaMockPortal: "Testar no Simulador",
      ctaDownload: "Baixar Extensão (.ZIP)",
      ctaLearnSecurity: "Segurança e Arquitetura",
    },
    ctaBanner: {
      title: "Pronto para experimentar a assistência de formulários de última geração?",
      description: "Baixe a extensão agora ou teste imediatamente em nosso simulador interativo.",
      btnDemo: "Abrir Simulador",
      btnDownload: "Baixar Extensão (.ZIP)",
      btnDocs: "Código no GitHub",
    },
    footer: {
      copyright: "© 2026 Owly.AI • Companheiro de Navegador com IA para Formulários e Web",
      subline: "Arquitetura Zero-Knowledge, privacidade local rigorosa e raciocínio multimodal Baseten Muse Spark Open.",
    },
  },
  hi: {
    ...translationsFallback("hi"),
    nav: {
      pillars: "मुख्य स्तंभ",
      features: "विशेषताएं",
      accessibility: "सुलभता केंद्र",
      howItWorks: "यह कैसे काम करता है",
      mockPortal: "मॉक पोर्टल",
      simulator: "सिम्युलेटर",
      installExt: "एक्सटेंशन जोड़ें",
      download: "डाउनलोड",
      demo: "डेमो",
    },
    hero: {
      aiBadge: "Baseten Muse Spark Open द्वारा संचालित • रीयल-टाइम मल्टीमॉडल AI",
      titleLine1: "आपका AI ब्राउज़र साथी",
      titleHighlight: "फॉर्म और वेब सहायता हेतु",
      description: "सरकारी व सार्वजनिक फॉर्म भरने के लिए बुद्धिमान मार्गदर्शन, वॉयस सहायता, स्थानीय एन्क्रिप्टेड ऑटोफिल और अयोग्यता-रोधी ऑडिटिंग।",
      ctaMockPortal: "सिम्युलेटर आज़माएं",
      ctaDownload: "एक्सटेंशन डाउनलोड करें (.ZIP)",
      ctaLearnSecurity: "सुरक्षा एवं वास्तुकला",
    },
    ctaBanner: {
      title: "अगली पीढ़ी की फॉर्म सहायता का अनुभव करने के लिए तैयार हैं?",
      description: "अभी एक्सटेंशन डाउनलोड करें या हमारे इंटरैक्टिव सिम्युलेटर पर इसका परीक्षण करें।",
      btnDemo: "सिम्युलेटर खोलें",
      btnDownload: "डाउनलोड (.ZIP)",
      btnDocs: "GitHub पर देखें",
    },
    footer: {
      copyright: "© 2026 Owly.AI • फॉर्म और वेब के लिए AI ब्राउज़र साथी",
      subline: "ज़ीरो-नॉलेज क्लाइंट आर्किटेक्चर, सख्त स्थानीय गोपनीयता और Baseten Muse Spark Open मल्टीमॉडल तर्क।",
    },
  },
  ko: {
    ...translationsFallback("ko"),
    nav: {
      pillars: "핵심 기능",
      features: "주요 특징",
      accessibility: "접근성 허브",
      howItWorks: "작동 방식",
      mockPortal: "모의 포털",
      simulator: "시뮬레이터",
      installExt: "확장 프로그램 설치",
      download: "다운로드",
      demo: "데모",
    },
    hero: {
      aiBadge: "Baseten Muse Spark Open 기반 • 실시간 멀티모달 AI",
      titleLine1: "당신의 AI 브라우저 동반자",
      titleHighlight: "공공 서식 및 웹 가이드",
      description: "실시간 멀티모달 추론 기반 스마트 폼 가이드, 핸즈프리 음성 지원, 로컬 암호화 자동완성 및 사전 탈락 방지 감사 기능 제공.",
      ctaMockPortal: "시뮬레이터에서 체험하기",
      ctaDownload: "확장 프로그램 다운로드 (.ZIP)",
      ctaLearnSecurity: "보안 및 아키텍처",
    },
    ctaBanner: {
      title: "차세대 스마트 폼 어시스턴트를 경험할 준비가 되셨나요?",
      description: "지금 바로 확장 프로그램을 다운로드하거나 인터랙티브 시뮬레이터에서 테스트해 보세요.",
      btnDemo: "시뮬레이터 열기",
      btnDownload: "다운로드 (.ZIP)",
      btnDocs: "GitHub 코드 보기",
    },
    footer: {
      copyright: "© 2026 Owly.AI • 양식 및 웹을 위한 AI 브라우저 동반자",
      subline: "제로 지식 클라이언트 아키텍처, 엄격한 로컬 개인 정보 보호 및 Baseten Muse Spark Open 추론.",
    },
  },
  ms: {
    ...translationsFallback("ms"),
    nav: {
      pillars: "Tonggak Ciri",
      features: "Ciri Utama",
      accessibility: "Pusat Kebolehcapaian",
      howItWorks: "Cara Berfungsi",
      mockPortal: "Portal Ujian",
      simulator: "Simulator",
      installExt: "Pasang Sambungan",
      download: "Muat Turun",
      demo: "Demo",
    },
    hero: {
      aiBadge: "Dikuasakan oleh Baseten Muse Spark Open • AI Multimodal Masa Nyata",
      titleLine1: "Pendamping AI Penyemak Imbas",
      titleHighlight: "untuk Borang & Web",
      description: "Bimbingan pintar borang rasmi dengan penaakulan multimodal masa nyata, pembantu suara, auto-isi disulitkan setempat, dan juruaudit pra-hantar anti-gagal.",
      ctaMockPortal: "Uji Cuba di Simulator",
      ctaDownload: "Muat Turun Sambungan (.ZIP)",
      ctaLearnSecurity: "Ketahui Keselamatan & Seni Bina",
    },
    ctaBanner: {
      title: "Bersedia untuk Mengalami Bantuan Borang Generasi Seterusnya?",
      description: "Muat turun sambungan sekarang atau uji terus pada simulator interaktif kami.",
      btnDemo: "Buka Simulator",
      btnDownload: "Muat Turun (.ZIP)",
      btnDocs: "Lihat Kod di GitHub",
    },
    footer: {
      copyright: "© 2026 Owly.AI • Pendamping Penyemak Imbas AI untuk Borang & Web",
      subline: "Seni bina klien Zero-Knowledge, privasi tempatan yang ketat, dan penaakulan multimodal Baseten Muse Spark Open.",
    },
  },
  vi: {
    ...translationsFallback("vi"),
    nav: {
      pillars: "Trụ cột tính năng",
      features: "Tính năng",
      accessibility: "Hỗ trợ tiếp cận",
      howItWorks: "Cách thức hoạt động",
      mockPortal: "Cổng mô phỏng",
      simulator: "Trình mô phỏng",
      installExt: "Cài tiện ích",
      download: "Tải xuống",
      demo: "Thử nghiệm",
    },
    hero: {
      aiBadge: "Được hỗ trợ bởi Baseten Muse Spark Open • AI Đa phương thức Thời gian thực",
      titleLine1: "Trợ lý AI Trình duyệt",
      titleHighlight: "cho Biểu mẫu & Web",
      description: "Hướng dẫn điền biểu mẫu công thông minh với suy luận đa phương thức theo thời gian thực, hỗ trợ giọng nói, tự động điền mã hóa cục bộ và kiểm toán trước khi gửi.",
      ctaMockPortal: "Thử trên Trình mô phỏng",
      ctaDownload: "Tải tiện ích (.ZIP)",
      ctaLearnSecurity: "Bảo mật & Kiến trúc",
    },
    ctaBanner: {
      title: "Sẵn sàng trải nghiệm trợ lý biểu mẫu thế hệ mới?",
      description: "Tải xuống tiện ích ngay bây giờ hoặc kiểm tra trực tiếp trên trình mô phỏng tương tác.",
      btnDemo: "Mở trình mô phỏng",
      btnDownload: "Tải xuống (.ZIP)",
      btnDocs: "Xem mã nguồn GitHub",
    },
    footer: {
      copyright: "© 2026 Owly.AI • Trợ lý trình duyệt AI cho Biểu mẫu & Web",
      subline: "Kiến trúc Zero-Knowledge, bảo mật cục bộ nghiêm ngặt và suy luận đa phương thức Baseten Muse Spark Open.",
    },
  },
  th: {
    ...translationsFallback("th"),
    nav: {
      pillars: "ฟีเจอร์หลัก",
      features: "คุณสมบัติ",
      accessibility: "ศูนย์การเข้าถึง",
      howItWorks: "วิธีการทำงาน",
      mockPortal: "พอร์ทัลจำลอง",
      simulator: "ตัวจำลอง",
      installExt: "ติดตั้งส่วนขยาย",
      download: "ดาวน์โหลด",
      demo: "เดโม",
    },
    hero: {
      aiBadge: "ขับเคลื่อนโดย Baseten Muse Spark Open • AI หลายรูปแบบแบบเรียลไทม์",
      titleLine1: "ผู้ช่วยเบราว์เซอร์ AI",
      titleHighlight: "สำหรับแบบฟอร์มและเว็บไซต์",
      description: "การแนะนำกรอกแบบฟอร์มอัจฉริยะด้วยการให้เหตุผลแบบมัลติโมดัลแบบเรียลไทม์ การสั่งงานด้วยเสียง การกรอกอัตโนมัติเข้ารหัส และระบบตรวจสอบความถูกต้องก่อนส่ง",
      ctaMockPortal: "ทดลองใช้งานบนเครื่องจำลอง",
      ctaDownload: "ดาวน์โหลดส่วนขยาย (.ZIP)",
      ctaLearnSecurity: "ความปลอดภัยและสถาปัตยกรรม",
    },
    ctaBanner: {
      title: "พร้อมสัมผัสประสบการณ์ช่วยเหลือการกรอกแบบฟอร์มยุคใหม่หรือยัง?",
      description: "ดาวน์โหลดส่วนขยายตอนนี้หรือทดสอบทันทีบนเครื่องจำลองแบบโต้ตอบของเรา",
      btnDemo: "เปิดเครื่องจำลอง",
      btnDownload: "ดาวน์โหลด (.ZIP)",
      btnDocs: "ดูซอร์สโค้ดบน GitHub",
    },
    footer: {
      copyright: "© 2026 Owly.AI • ผู้ช่วยเบราว์เซอร์ AI สำหรับแบบฟอร์มและเว็บ",
      subline: "สถาปัตยกรรม Zero-Knowledge ความเป็นส่วนตัวในเครื่องอย่างเข้มงวด และการอนุมานของ Baseten Muse Spark Open",
    },
  },
};

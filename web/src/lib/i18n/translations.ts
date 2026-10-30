// ============================================================================
// SAVVY.AI — Modular Localization Dictionary (i18n)
// Mendukung bahasa sesuai spesifikasi PRD Bab 4 (id, en, zh, es, ar, dll)
// ============================================================================

export type SupportedLanguage = "id" | "en" | "zh" | "es" | "ar";

export interface TranslationDictionary {
  nav: {
    pillars: string;
    features: string;
    accessibility: string;
    howItWorks: string;
    mockPortal: string;
    simulator: string;
    installExt: string;
    demo: string;
  };
  hero: {
    hackathonBadge: string;
    titleLine1: string;
    titleHighlight: string;
    description: string;
    ctaMockPortal: string;
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
    pillar1: {
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
    pillar2: {
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
    pillar3: {
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
  ctaBanner: {
    title: string;
    description: string;
    btnDemo: string;
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

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  id: {
    nav: {
      pillars: "Pilar Solusi",
      features: "Fitur Utama",
      accessibility: "Accessibility Hub",
      howItWorks: "Cara Kerja",
      mockPortal: "Mock Portal",
      simulator: "Simulator",
      installExt: "Pasang Ekstensi",
      demo: "Demo",
    },
    hero: {
      hackathonBadge: "Meta Global AI Developer Hackathon 2026 • Build for Your World",
      titleLine1: "Your AI Browser Companion",
      titleHighlight: "for Forms & Web",
      description:
        "Understand any page, fill forms with guidance, and catch mistakes before you submit. Private by design, powered by Muse Spark",
      ctaMockPortal: "Uji Coba di Mock Portal LPDP",
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
      tag: "3 Pilar Solusi",
      title: "Dirancang Khusus untuk Rasa Aman Warga",
      subtitle: "Menggabungkan kecerdasan reasoning Meta Muse Spark dengan penjaga deterministik lokal tanpa halusinasi.",
      pillar1: {
        tag: "Pilar 1",
        title: "UNDERSTAND",
        quote: '"Kolom ini maksudnya apa dan apa aturannya?"',
        point1Title: "Field Coach:",
        point1Desc: "RAG resmi via Meta Vector Store dengan sitasi bab & halaman sah.",
        point2Title: "Explain This:",
        point2Desc: "Snip area membingungkan dengan penutup sensor DOM Masking lokal.",
        point3Title: "Handsfree Voicebot:",
        point3Desc: "Tanya jawab suara handsfree via Silero VAD & Muse Voice.",
        footer: "Didukung: Meta Vector Store (`file_search`)",
      },
      pillar2: {
        tag: "Pilar 2",
        title: "FILL",
        quote: '"Bagaimana mengisinya dengan benar, konsisten, dan cepat?"',
        point1Title: "Multiple Vault:",
        point1Desc: "Terenkripsi lokal AES-256-GCM (Zero-Knowledge, data tidak pernah ke server).",
        point2Title: "Dual Autofill & Undo:",
        point2Desc: "Single-field per kartu panduan atau batch 1-click dengan tombol undo instan.",
        point3Title: "Essay Coach:",
        point3Desc: "Merapikan 3 bullet fakta kasar menjadi draf narasi formal tanpa halusinasi.",
        footer: "Didukung: WebCrypto AES-256-GCM & Muse Spark 1.3",
      },
      pillar3: {
        tag: "Pilar 3",
        title: "AUDIT",
        quote: '"Apakah ada yang salah atau berpotensi ditolak?"',
        point1Title: "Traffic Light Auditor:",
        point1Desc: "Evaluasi regex instan (<300ms) untuk format NIK, tanggal, dan email.",
        point2Title: "Audit Kepatuhan Foto (Zero-Pixel):",
        point2Desc: "Uji rasio, blur Laplacian, dan biometrik tanpa manipulasi piksel (ICAO).",
        point3Title: "Consistency Checker:",
        point3Desc: "Agen penalaran pemeriksa keselarasan data silang antar-kolom form.",
        footer: "Didukung: Sharp in-memory deterministik + FSM",
      },
    },
    accessibility: {
      badge: "Kenyamanan Sensorik & Kognitif",
      title: "Accessibility HUB: 14 Tools Deterministik",
      subtitle:
        "Dapat diaktifkan secara manual lewat klik tile kartu atau dipicu oleh reasoning AI saat pengguna mengeluh pusing/lelah. Murni berjalan di browser lokal tanpa biaya token ($0).",
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
    ctaBanner: {
      title: "Siap Mengisi Formulir Tanpa Cemas?",
      description:
        "Uji coba Savvy.AI sekarang di Mock Portal resmi atau pasang ekstensi Chrome untuk pengalaman pendaftaran publik yang lebih manusiawi.",
      btnDemo: "Buka Demo Mock Portal",
      btnDocs: "Dokumentasi GitHub",
    },
    footer: {
      copyright: "© 2026 Savvy.AI • Dibuat untuk Meta Global AI Developer Hackathon 2026 • Track: Indie Developer",
      subline: "Built for Your World with Meta Muse Spark, Responses API, and Native Web Accessibility.",
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
      spotlightActive: "Spotlight Aktif (Savvy)",
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
      auditHeader: "Hasil Pre-Submit Auditor (Savvy.AI)",
      auditEmptyMsg: "Audit Gagal (Lampu Merah): Masih ada kolom wajib yang belum diisi lengkap.",
      auditNikInvalidMsg: "Audit Gagal (Lampu Merah): NIK wajib berjumlah tepat 16 digit angka.",
      auditEssayShortMsg: "Peringatan (Lampu Kuning): Esai kontribusi terlalu singkat (disarankan minimal 50 kata).",
      auditSuccessMsg: "Audit Berhasil (Lampu Hijau): Semua field valid, sesuai format Juknis LPDP 2026. Siap dikirim!",
    },
  },
  en: {
    nav: {
      pillars: "Solution Pillars",
      features: "Features",
      accessibility: "Accessibility Hub",
      howItWorks: "How It Works",
      mockPortal: "Mock Portal",
      simulator: "Simulator",
      installExt: "Install Extension",
      demo: "Demo",
    },
    hero: {
      hackathonBadge: "Meta Global AI Developer Hackathon 2026 • Build for Your World",
      titleLine1: "Your AI Browser Companion",
      titleHighlight: "for Forms & Web",
      description:
        "Understand any page, fill forms with guidance, and catch mistakes before you submit. Private by design, powered by Muse Spark",
      ctaMockPortal: "Test in LPDP Mock Portal",
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
      tag: "3 Solution Pillars",
      title: "Engineered for Citizen Peace of Mind",
      subtitle: "Combining Meta Muse Spark reasoning with deterministic local guardrails without hallucinations.",
      pillar1: {
        tag: "Pillar 1",
        title: "UNDERSTAND",
        quote: '"What does this field mean and what are the rules?"',
        point1Title: "Field Coach:",
        point1Desc: "Official RAG via Meta Vector Store with exact chapter & page citations.",
        point2Title: "Explain This:",
        point2Desc: "Visual snippet inspection with client-side DOM Blackout Masking.",
        point3Title: "Handsfree Voicebot:",
        point3Desc: "Two-way voice Q&A powered by on-device Silero VAD & Muse Voice.",
        footer: "Powered by: Meta Vector Store (`file_search`)",
      },
      pillar2: {
        tag: "Pillar 2",
        title: "FILL",
        quote: '"How do I fill this accurately, consistently, and fast?"',
        point1Title: "Multiple Vault:",
        point1Desc: "Locally encrypted AES-256-GCM (Zero-Knowledge, data never touches servers).",
        point2Title: "Dual Autofill & Undo:",
        point2Desc: "Granular per-card autofill or 1-click batch fill with instant 100% undo.",
        point3Title: "Essay Coach:",
        point3Desc: "Transforms 3 raw fact bullets into formal compliant narrative without hallucinating.",
        footer: "Powered by: WebCrypto AES-256-GCM & Muse Spark 1.3",
      },
      pillar3: {
        tag: "Pillar 3",
        title: "AUDIT",
        quote: '"Are there any mistakes or rejection risks?"',
        point1Title: "Traffic Light Auditor:",
        point1Desc: "Instant (<300ms) regex evaluation for ID formats, dates, and email syntax.",
        point2Title: "Photo Compliance Audit (Zero-Pixel):",
        point2Desc: "Checks aspect ratio, Laplacian blur, and biometrics without altering pixels (ICAO).",
        point3Title: "Consistency Checker:",
        point3Desc: "Reasoning agent validating cross-field logical sanity across inputs.",
        footer: "Powered by: Sharp in-memory deterministic + FSM",
      },
    },
    accessibility: {
      badge: "Sensory & Cognitive Comfort",
      title: "Accessibility HUB: 14 Deterministic Tools",
      subtitle:
        "Can be triggered manually by clicking cards or autonomously called by AI reasoning when citizens complain of fatigue. Runs 100% in client browser with $0 token cost.",
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
      tag: "Citizen Journey",
      title: "From Ambiguity to Confident Submission in 4 Steps",
      steps: [
        {
          step: "01",
          title: "Open Official Form",
          desc: "Extension passively detects form fields without reading private input values.",
        },
        {
          step: "02",
          title: "Official Guideline RAG",
          desc: "Field Coach & Voicebot provide real-time verified context from Meta Vector Store.",
        },
        {
          step: "03",
          title: "Controlled Autofill",
          desc: "Fill per-field or all at once from encrypted local Vault with 1-click safe undo.",
        },
        {
          step: "04",
          title: "Pre-Submit Audit",
          desc: "Ensure green light status for regex syntax, photo compliance, and data consistency.",
        },
      ],
    },
    ctaBanner: {
      title: "Ready to Fill Important Forms Without Anxiety?",
      description:
        "Test Savvy.AI today on our official Mock Portal or install the Chrome Extension for a more humane digital citizen experience.",
      btnDemo: "Open Mock Portal Demo",
      btnDocs: "GitHub Documentation",
    },
    footer: {
      copyright: "© 2026 Savvy.AI • Built for Meta Global AI Developer Hackathon 2026 • Track: Indie Developer",
      subline: "Built for Your World with Meta Muse Spark, Responses API, and Native Web Accessibility.",
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
      spotlightActive: "Spotlight Active (Savvy)",
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
      auditHeader: "Pre-Submit Auditor Result (Savvy.AI)",
      auditEmptyMsg: "Audit Failed (Red Light): Required fields remain unfilled.",
      auditNikInvalidMsg: "Audit Failed (Red Light): NIK must be exactly 16 numeric digits.",
      auditEssayShortMsg: "Warning (Yellow Light): Contribution essay is too brief (minimum 50 words recommended).",
      auditSuccessMsg: "Audit Cleared (Green Light): All fields valid per LPDP 2026 Guidelines. Ready to submit!",
    },
  },
  // Bahasa tambahan (Placeholder fallback ke en untuk zh, es, ar)
  zh: {} as any,
  es: {} as any,
  ar: {} as any,
};

// Fallback untuk bahasa tambahan agar tidak kosong
translations.zh = translations.en;
translations.es = translations.en;
translations.ar = translations.en;

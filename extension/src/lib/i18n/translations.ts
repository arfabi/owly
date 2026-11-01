// OWLY.AI — Multilingual Translations Dictionary
// Supported Locales: English (US - American English, Default) and Bahasa Indonesia (ID)

export type SupportedLanguage = "en" | "id";

export interface ExtensionTranslations {
  header: {
    portalDetected: string;
    targetGoal: string;
    vaultLocked: string;
    vaultUnlocked: string;
    btnLock: string;
    btnUnlock: string;
    selectLanguage: string;
    changeLanguage: string;
    langIndonesian: string;
    langEnglishUs: string;
    langIdSubtitle: string;
    langEnSubtitle: string;
    logConsoleTooltip: string;
    accessibilityTooltip: string;
    appSubtitle: string;
  };
  tabs: {
    guide: string;
    vault: string;
    audit: string;
  };
  assistant: {
    greetingTitle: string;
    greetingDesc: string;
    guideMeTitle: string;
    guideMeDesc: string;
    btnAnalyzeForm: string;
    btnAnalyzeAgain: string;
    analyzedReadyBadge: string;
    fieldsCountSuffix: string;
    estimatedTimeLabel: string;
    sectionsToFillTitle: string;
    sectionPersonal: string;
    sectionAcademic: string;
    sectionDocuments: string;
    btnCancelAnalysis: string;
    btnGuideStep: string;
    btnAutofillQuick: string;
    explainThisTitle: string;
    explainThisSub: string;
    showMeTitle: string;
    showMeSub: string;
    a11ySectionTitle: string;
    chipTextTooSmall: string;
    chipGlareScreen: string;
    chipReadAloud: string;
    chipHardToFocus: string;
    btnMoreA11y: string;
    snipBoxTitle: string;
    snipVisionBadge: string;
    voiceDrawerTitle: string;
    pttTitle: string;
    pttDesc: string;
    liveTalkTitle: string;
    liveTalkDesc: string;
    micPermissionLabel: string;
    micActive: string;
    micInactive: string;
    btnAllowMic: string;
    pttHoldToSpeak: string;
    pttReleaseToSend: string;
    pttListeningPrompt: string;
    pttIdlePrompt: string;
    btnStopLiveTalk: string;
    btnStartLiveTalk: string;
    liveSpeakingStatus: string;
    liveThinkingStatus: string;
    liveListeningStatus: string;
    liveIdleStatus: string;
    inputPlaceholder: string;
    keyboardHint: string;
    btnSendMessage: string;
    btnStartNewChat: string;
    multiAgentRunning: string;
    multiAgentScanningDesc: string;
    step1Vision: string;
    step2Dom: string;
    step3Grounding: string;
    step4Agent1: string;
    step5Agent2: string;
  };
  coach: {
    activeFieldTitle: string;
    activeFieldDesc: string;
    badgeOfficial: string;
    badgeCurated: string;
    badgeAi: string;
    secMeaning: string;
    secMeaningText: string;
    secHowTo: string;
    secHowToText: string;
    secExample: string;
    secExampleText: string;
    secPitfall: string;
    secPitfallText: string;
    sourceText: string;
    btnAutofillSingle: string;
    btnAutofillDone: string;
    voicebotTitle: string;
    voiceStatusListening: string;
    voiceStatusThinking: string;
    voiceStatusSpeaking: string;
    btnAskVoice: string;
    btnExplainThis: string;
    explainDesc: string;
  };
  vault: {
    title: string;
    subtitle: string;
    readyToFillTitle: string;
    readyToFillSubtitle: string;
    btnBatchAutofill: string;
    warningNotAnalyzed: string;
    btnAnalyzeNow: string;
    undoBarSuccess: string;
    btnUndo: string;
    verifiedDataTitle: string;
    itemsCountSuffix: string;
    btnAddData: string;
    uploadDocCardTitle: string;
    uploadDocCardSubtitle: string;
    btnUploadDoc: string;
    uploadingDoc: string;
    uploadConsentNotice: string;
    privacyPolicyLink: string;
    modalAddDataTitle: string;
    labelDataName: string;
    labelValue: string;
    labelAliases: string;
    hintAliases: string;
    labelSourceTag: string;
    placeholderDataName: string;
    placeholderValue: string;
    placeholderAliases: string;
    placeholderSourceTag: string;
    errorNameRequired: string;
    errorValueRequired: string;
    btnCancel: string;
    btnSaveData: string;
    deleteTooltip: string;
  };
  audit: {
    summaryTitle: string;
    greenCount: string;
    yellowCount: string;
    redCount: string;
    reAuditBtn: string;
    auditNowBtn: string;
    auditingProgress: string;
    findingsTitle: string;
    fieldsDetectedSuffix: string;
    tipVaultTypoTitle: string;
    tipVaultTypoDesc: string;
    btnOpenVault: string;
    allClearTitle: string;
    allClearDesc: string;
    btnSaveFormToVault: string;
    saveVaultToast: string;
    scopeCardTitle: string;
    scopeL1Label: string;
    scopeL1Desc: string;
    scopeL2Label: string;
    scopeL2Desc: string;
    scopeL3Label: string;
    scopeL3Desc: string;
    scopeL4Label: string;
    scopeL4Desc: string;
    btnHighlightField: string;
    guideLabel: string;
  };
  a11y: {
    title: string;
    welcomeTitle: string;
    welcomeDesc: string;
    quickProfilesTitle: string;
    resetBtn: string;
    undoBtn: string;
    activeCountSuffix: string;
    profileAdhd: string;
    profileDyslexia: string;
    profileLowVision: string;
    profileSenior: string;
  };
  auth: {
    title: string;
    subtitle: string;
    loggedInBadge: string;
    accountDesc: string;
    btnLogout: string;
    demoUserTitle: string;
    btnDemoLogin: string;
    demoAccountHint: string;
    orSocial: string;
    pdpNotice: string;
  };
  logConsole: {
    title: string;
    subtitle: string;
    liveBadge: string;
    copyJson: string;
    copied: string;
    clear: string;
    close: string;
    infoBannerTitle: string;
    infoBannerDesc: string;
    allLogs: string;
    searchPlaceholder: string;
    copyTooltip: string;
    clearTooltip: string;
    closeTooltip: string;
  };
  common: {
    loading: string;
    success: string;
    error: string;
    cancel: string;
    close: string;
    copy: string;
    copied: string;
    retry: string;
    save: string;
    privacyFooter: string;
  };
}

export const translations: Record<SupportedLanguage, ExtensionTranslations> = {
  // =========================================================================
  // ENGLISH (US - American English, Default)
  // =========================================================================
  en: {
    header: {
      portalDetected: "Official Form Detected",
      targetGoal: "🎯 Online Application 2026",
      vaultLocked: "Vault Locked",
      vaultUnlocked: "Vault Unlocked",
      btnLock: "Lock",
      btnUnlock: "Unlock Vault",
      selectLanguage: "Select Language",
      changeLanguage: "Change Language",
      langIndonesian: "Bahasa Indonesia",
      langEnglishUs: "English (US)",
      langIdSubtitle: "Indonesian (ID)",
      langEnSubtitle: "American English (EN)",
      logConsoleTooltip: "Log Console • Live Agent Tracing",
      accessibilityTooltip: "Accessibility HUB (14 Tools)",
      appSubtitle: "Your AI Browser Companion",
    },
    tabs: {
      guide: "Ask Owly",
      vault: "Auto Fill",
      audit: "Audit Form",
    },
    assistant: {
      greetingTitle: "Hello, I'm Owly",
      greetingDesc: "Your intelligent browser companion. Ask questions below or pick a quick tool.",
      guideMeTitle: "Guide me through this form",
      guideMeDesc: "Owly will scan this page and walk you through completing each input field.",
      btnAnalyzeForm: "Analyze This Form",
      btnAnalyzeAgain: "Re-Analyze This Form",
      analyzedReadyBadge: "Form Analyzed & Ready",
      fieldsCountSuffix: "Input Fields Detected",
      estimatedTimeLabel: "Estimated Time:",
      sectionsToFillTitle: "Sections to Complete:",
      sectionPersonal: "Personal Identity & Civil Records",
      sectionAcademic: "Academic & Program Information",
      sectionDocuments: "Documents & Verification",
      btnCancelAnalysis: "Cancel & Return to Overview",
      btnGuideStep: "Guide Field by Field",
      btnAutofillQuick: "1-Click AutoFill",
      explainThisTitle: "Explain This",
      explainThisSub: "Lightshot Snip",
      showMeTitle: "Show Me",
      showMeSub: "Find Button or Text",
      a11ySectionTitle: "Accessibility Tools",
      chipTextTooSmall: "👁️ Text Too Small",
      chipGlareScreen: "🌗 Screen Too Bright",
      chipReadAloud: "🔊 Read Aloud (TTS)",
      chipHardToFocus: "🧠 Hard to Focus",
      btnMoreA11y: "All 14 Tools",
      snipBoxTitle: "Captured Snip Area",
      snipVisionBadge: "Multimodal Vision",
      voiceDrawerTitle: "Voice Companion",
      pttTitle: "PTT (Push-to-Talk)",
      pttDesc: "Hold button while speaking",
      liveTalkTitle: "Live Talk",
      liveTalkDesc: "Automatic speech detection",
      micPermissionLabel: "Microphone Access:",
      micActive: "Active",
      micInactive: "Inactive",
      btnAllowMic: "Allow",
      pttHoldToSpeak: "Hold",
      pttReleaseToSend: "Release",
      pttListeningPrompt: "Listening to your voice...",
      pttIdlePrompt: "Hold button to speak",
      btnStopLiveTalk: "Stop Live Talk",
      btnStartLiveTalk: "Start Live Talk",
      liveSpeakingStatus: "🔊 Owly is speaking...",
      liveThinkingStatus: "🧠 Owly is thinking...",
      liveListeningStatus: "🎙️ Owly is listening to your speech...",
      liveIdleStatus: "Click to enable two-way voice conversation",
      inputPlaceholder: "Ask anything, adjust display, or 'Show me: ...'",
      keyboardHint: "Enter ↵ to send, Shift+Enter for new line",
      btnSendMessage: "Send Message",
      btnStartNewChat: "Start New Conversation",
      multiAgentRunning: "Owly AI Multi-Agent Running...",
      multiAgentScanningDesc: "Analyzing visual screen, mapping DOM structure, and grounding official regulations",
      step1Vision: "Upload Screenshot to Multimodal Vision Engine",
      step2Dom: "DOM Extractor & Form Structure Mapping",
      step3Grounding: "Official Regulation Grounding Engine",
      step4Agent1: "Agent 1: Context & Bureaucracy Verifier",
      step5Agent2: "Agent 2: Field Rules & Anti-Disqualification Auditor",
    },
    coach: {
      activeFieldTitle: "National Identification Number (NIK)",
      activeFieldDesc: "Active field highlighted by Beacon Spotlight",
      badgeOfficial: "🟢 Official Guidance",
      badgeCurated: "🔵 Owly Curated",
      badgeAi: "🟡 AI Guidance",
      secMeaning: "Field Meaning:",
      secMeaningText: "A 16-digit continuous citizen identification number issued by the civil registry.",
      secHowTo: "How to Fill:",
      secHowToText: "Enter 16 continuous digits without spaces or dashes. Must match your latest physical ID card.",
      secExample: "Valid Example:",
      secExampleText: "3271041908980002",
      secPitfall: "Common Pitfall:",
      secPitfallText: "Do not use an outdated identification number if you have recently relocated your registered residence.",
      sourceText: "Verified from Official Ministry Guidelines",
      btnAutofillSingle: "Fill This Field from Vault",
      btnAutofillDone: "Autofilled from Vault",
      voicebotTitle: "Hands-Free Voicebot (Muse Voice + VAD)",
      voiceStatusListening: "Listening to your voice...",
      voiceStatusThinking: "Muse Spark is reasoning...",
      voiceStatusSpeaking: "Explaining official guidelines...",
      btnAskVoice: "Talk to Owly",
      btnExplainThis: "Explain This (Multimodal Snip)",
      explainDesc: "Select any confusing section. Personal data inputs are automatically blacked out for privacy.",
    },
    vault: {
      title: "Multiple Vault (Zero-Knowledge AES-256)",
      subtitle: "Identity credentials encrypted locally in browser memory. Never sent to any server in cleartext.",
      readyToFillTitle: "Ready to Fill Active Form",
      readyToFillSubtitle: "Matches verified profile data to web inputs with one click",
      btnBatchAutofill: "1-Click AutoFill",
      warningNotAnalyzed: "Form has not been analyzed yet! Please analyze the form first so Owly can match fields accurately.",
      btnAnalyzeNow: "🔍 Analyze Form Now",
      undoBarSuccess: "Form successfully filled from Vault!",
      btnUndo: "Undo 100%",
      verifiedDataTitle: "Verified Profile Data",
      itemsCountSuffix: "items",
      btnAddData: "+ Add Data",
      uploadDocCardTitle: "Add Profile Data via ID or Document",
      uploadDocCardSubtitle: "Upload your ID card, Passport, or Academic Certificate (PDF, PNG, JPG)",
      btnUploadDoc: "Upload Document",
      uploadingDoc: "Processing Document...",
      uploadConsentNotice: "By uploading, I consent to AI processing my ID for autofill. Original files are auto-deleted after extraction. Only encrypted extracted data is stored in my vault.",
      privacyPolicyLink: "Privacy Policy",
      modalAddDataTitle: "Add New Profile Item",
      labelDataName: "Data Name",
      labelValue: "Value",
      labelAliases: "Aliases",
      hintAliases: "(comma separated to recognize similar input field names)",
      labelSourceTag: "Source Tag",
      placeholderDataName: "e.g. Tax Identification Number",
      placeholderValue: "e.g. 12.345.678.9-012.000",
      placeholderAliases: "e.g. Tax ID, NPWP, Tax Number",
      placeholderSourceTag: "e.g. Tax Card / Manual Input",
      errorNameRequired: "Data Name is required.",
      errorValueRequired: "Data Value is required.",
      btnCancel: "Cancel",
      btnSaveData: "Save Data",
      deleteTooltip: "Delete this item",
    },
    audit: {
      summaryTitle: "Traffic Light Pre-Submit Auditor",
      greenCount: "Passed",
      yellowCount: "Warnings",
      redCount: "Fatal Issues",
      reAuditBtn: "Re-Audit Web Form",
      auditNowBtn: "Audit Form Now",
      auditingProgress: "Scanning & Auditing Page Fields...",
      findingsTitle: "Audit Findings",
      fieldsDetectedSuffix: "Fields Detected",
      tipVaultTypoTitle: "Tip: Connect Vault for Typo Guard",
      tipVaultTypoDesc: "No Vault documents detected. Audit runs normally, but automatic typo matching for names & IDs is inactive.",
      btnOpenVault: "Open Auto Fill / Vault Tab",
      allClearTitle: "Form is Perfect & Ready to Submit!",
      allClearDesc: "All required fields are completed, standard formats verified, and no data contradictions found.",
      btnSaveFormToVault: "Save Form Data to Vault",
      saveVaultToast: "Form data successfully saved into your local encrypted Vault!",
      scopeCardTitle: "Owly 4-Layer Audit Scope",
      scopeL1Label: "Form Rules",
      scopeL1Desc: "Required fields (*), minimum lengths, and built-in website placeholders.",
      scopeL2Label: "Standard Formats",
      scopeL2Desc: "16-digit ID validation, phone format (+1/08), RFC email syntax, and passport checks.",
      scopeL3Label: "Typo Guard",
      scopeL3Desc: "Cross-checks spelling of names and IDs against verified local Vault data.",
      scopeL4Label: "File Instructions",
      scopeL4Desc: "Verifies file size limits (KB/MB) and allowed extension guidelines on the page.",
      btnHighlightField: "👉 Highlight Field on Web",
      guideLabel: "Guide:",
    },
    a11y: {
      title: "Accessibility HUB: 14 Tools",
      welcomeTitle: "Welcome to Owly Accessibility HUB",
      welcomeDesc: "Built on the conviction of digital equality—empowering neurodivergent individuals with ADHD, seniors, and citizens with low vision with equal, barrier-free access.",
      quickProfilesTitle: "QUICK ACCESSIBILITY PROFILES",
      resetBtn: "Reset All",
      undoBtn: "Undo",
      activeCountSuffix: "active tools",
      profileAdhd: "ADHD Friendly",
      profileDyslexia: "Dyslexia Friendly",
      profileLowVision: "Low Vision",
      profileSenior: "Senior Comfort",
    },
    auth: {
      title: "Owly.AI Auth",
      subtitle: "Zero-Knowledge Public Form Assistant",
      loggedInBadge: "Account Verified (Supabase 50,000 MAU). Data synchronized via AES-256-GCM encryption.",
      accountDesc: "Your credentials and data are encrypted locally via AES-256-GCM. Plaintext is never stored on servers.",
      btnLogout: "Log Out of Account",
      demoUserTitle: "Instant Demo Access",
      btnDemoLogin: "1-Click Demo Login",
      demoAccountHint: "Account: demo@owly.ai • Preloaded ID/Document Vault",
      orSocial: "Or Sign In via Google / Social Media",
      pdpNotice: "Privacy Guaranteed: Confidential credentials and documents are never exposed or stored in cleartext.",
    },
    logConsole: {
      title: "Owly.AI • Agentic Log Console",
      subtitle: "Real-time reasoning, perception, & action execution trace",
      liveBadge: "LIVE",
      copyJson: "Copy JSON",
      copied: "Copied",
      clear: "Clear Logs",
      close: "Close Console",
      infoBannerTitle: "Live Tracing",
      infoBannerDesc: "Real-time trace of Baseten Muse Spark Open calls, voice recognition, and local AES-256 Vault execution.",
      allLogs: "ALL",
      searchPlaceholder: "Filter log events by keyword, message, domain...",
      copyTooltip: "Copy all logs in JSON format",
      clearTooltip: "Clear current logs",
      closeTooltip: "Close Console",
    },
    common: {
      loading: "Loading...",
      success: "Success",
      error: "Error",
      cancel: "Cancel",
      close: "Close",
      copy: "Copy",
      copied: "Copied!",
      retry: "Retry",
      save: "Save",
      privacyFooter: "Your data stays in your private device",
    },
  },

  // =========================================================================
  // BAHASA INDONESIA (ID)
  // =========================================================================
  id: {
    header: {
      portalDetected: "Formulir Resmi Terdeteksi",
      targetGoal: "🎯 Pendaftaran Online 2026",
      vaultLocked: "Vault Terkunci",
      vaultUnlocked: "Vault Terbuka",
      btnLock: "Kunci",
      btnUnlock: "Buka Vault",
      selectLanguage: "Pilih Bahasa",
      changeLanguage: "Ganti Bahasa",
      langIndonesian: "Bahasa Indonesia",
      langEnglishUs: "English (US)",
      langIdSubtitle: "Indonesia (ID)",
      langEnSubtitle: "American English (EN)",
      logConsoleTooltip: "Log Console • Pelacakan Agen Nyata",
      accessibilityTooltip: "Accessibility HUB (14 Tools)",
      appSubtitle: "Your AI Browser Companion",
    },
    tabs: {
      guide: "Tanya Owly",
      vault: "Auto Fill",
      audit: "Audit Form",
    },
    assistant: {
      greetingTitle: "Halo, Saya Owly",
      greetingDesc: "Asisten cerdas pendamping Browsermu, ketik pertanyaan di bawah atau pilih bantuan cepat.",
      guideMeTitle: "Pandu saya isi formulir ini",
      guideMeDesc: "Owly akan memindai halaman ini dan membimbingmu untuk mengisi formulir ini.",
      btnAnalyzeForm: "Analyze this Form",
      btnAnalyzeAgain: "Audit Ulang Formulir Ini",
      analyzedReadyBadge: "Formulir Dianalisis & Siap",
      fieldsCountSuffix: "Kolom Pertanyaan Terdeteksi",
      estimatedTimeLabel: "Estimasi Waktu:",
      sectionsToFillTitle: "Jumlah yang harus diisi:",
      sectionPersonal: "Identitas Pribadi & Kependudukan",
      sectionAcademic: "Latar Belakang Akademik & Program",
      sectionDocuments: "Dokumen & Verifikasi Berkas",
      btnCancelAnalysis: "Batalkan / Reset Analisis",
      btnGuideStep: "Pandu Kolom demi Kolom",
      btnAutofillQuick: "1-Click AutoFill",
      explainThisTitle: "Explain This",
      explainThisSub: "Cuplikan Area Layar",
      showMeTitle: "Show Me",
      showMeSub: "Cari Tombol / Teks",
      a11ySectionTitle: "Alat Bantu Aksesibilitas",
      chipTextTooSmall: "👁️ Teks Kekecilan",
      chipGlareScreen: "🌗 Layar Silau",
      chipReadAloud: "🔊 Bacakan Halaman",
      chipHardToFocus: "🧠 Susah Fokus",
      btnMoreA11y: "Semua 14 Alat",
      snipBoxTitle: "Area Cuplikan (Snip)",
      snipVisionBadge: "Multimodal Vision",
      voiceDrawerTitle: "Voice Companion",
      pttTitle: "PTT (Push-to-Talk)",
      pttDesc: "Tahan tombol saat bicara",
      liveTalkTitle: "Live Talk",
      liveTalkDesc: "Deteksi suara otomatis",
      micPermissionLabel: "Izin Mikrofon:",
      micActive: "Aktif",
      micInactive: "Tidak Aktif",
      btnAllowMic: "Izinkan",
      pttHoldToSpeak: "Tahan",
      pttReleaseToSend: "Lepas",
      pttListeningPrompt: "Mendengarkan suara Anda...",
      pttIdlePrompt: "Tahan tombol untuk bicara",
      btnStopLiveTalk: "Hentikan Live Talk",
      btnStartLiveTalk: "Mulai Live Talk",
      liveSpeakingStatus: "🔊 Owly sedang menjawab dengan suara...",
      liveThinkingStatus: "🧠 Owly sedang memproses jawaban...",
      liveListeningStatus: "🎙️ Owly siap mendengarkan ucapan Anda...",
      liveIdleStatus: "Klik untuk mengaktifkan dialog suara dua arah",
      inputPlaceholder: "Tanya Apapun, Atur Tampilan, atau 'Show me: ...'",
      keyboardHint: "Enter ↵ untuk kirim, Shift+Enter untuk baris baru",
      btnSendMessage: "Kirim Pesan",
      btnStartNewChat: "Mulai Percakapan Baru",
      multiAgentRunning: "Owly AI Multi-Agent Sedang Bekerja...",
      multiAgentScanningDesc: "Memindai visual layar, struktur DOM, dan mencocokkan juknis resmi",
      step1Vision: "Unggah Screenshot ke Multimodal Vision Engine",
      step2Dom: "Ekstraktor DOM & Pemetaan Struktur Formulir",
      step3Grounding: "Mesin Validasi Juknis & Regulasi Resmi",
      step4Agent1: "Agen 1: Verifikator Konteks & Birokrasi",
      step5Agent2: "Agent 2: Auditor Anti-Diskualifikasi & Aturan Kolom",
    },
    coach: {
      activeFieldTitle: "Nomor Induk Kependudukan (NIK)",
      activeFieldDesc: "Kolom aktif disorot oleh Beacon Spotlight",
      badgeOfficial: "🟢 Panduan Resmi",
      badgeCurated: "🔵 Owly Curated",
      badgeAi: "🟡 AI Guidance",
      secMeaning: "Arti Kolom:",
      secMeaningText: "Nomor identitas tunggal warga negara berisikan 16 digit angka yang diterbitkan oleh Disdukcapil.",
      secHowTo: "Cara Pengisian:",
      secHowToText: "Ketik 16 digit angka berurutan tanpa tanda spasi atau strip. Pastikan sama persis dengan e-KTP fisik terbaru.",
      secExample: "Contoh Sah:",
      secExampleText: "3271041908980002",
      secPitfall: "Jebakan / Fatal Error:",
      secPitfallText: "Jangan gunakan NIK lama pada fotokopi Kartu Keluarga jika Anda baru saja pindah domisili.",
      sourceText: "Terverifikasi dari Petunjuk Teknis Resmi",
      btnAutofillSingle: "Isi Kolom Ini dari Vault",
      btnAutofillDone: "Telah Terisi dari Vault",
      voicebotTitle: "Handsfree Voicebot (Muse Voice + VAD)",
      voiceStatusListening: "Mendengarkan ucapan Anda...",
      voiceStatusThinking: "Muse Spark sedang menalar...",
      voiceStatusSpeaking: "Menjelaskan aturan juknis...",
      btnAskVoice: "Bicara dengan Owly",
      btnExplainThis: "Explain This (Multimodal Snip)",
      explainDesc: "Pilih area formulir yang membingungkan. Kotak input akan ditutup sensor otomatis.",
    },
    vault: {
      title: "Multiple Vault (Zero-Knowledge AES-256)",
      subtitle: "Data identitas terenkripsi di memori lokal browser. Tidak pernah dikirim ke server dalam bentuk teks terbuka.",
      readyToFillTitle: "Siap Mengisi Formulir Aktif",
      readyToFillSubtitle: "Cocokkan data profil terverifikasi ke kolom input web dalam satu klik",
      btnBatchAutofill: "1-Click AutoFill",
      warningNotAnalyzed: "Formulir belum dianalisis! Klik tombol di bawah agar Owly memetakan kolom dengan akurat.",
      btnAnalyzeNow: "🔍 Analyze Form Sekarang",
      undoBarSuccess: "Formulir Berhasil Diisi!",
      btnUndo: "Undo 100%",
      verifiedDataTitle: "Data Profil Terverifikasi",
      itemsCountSuffix: "item",
      btnAddData: "+ Tambah Data",
      uploadDocCardTitle: "Tambah Data Profil via KTP / Dokumen",
      uploadDocCardSubtitle: "Unggah KTP, Paspor, atau Ijazah Anda (PDF, PNG, JPG)",
      btnUploadDoc: "Upload Dokumen",
      uploadingDoc: "Memproses Dokumen...",
      uploadConsentNotice: "Dengan mengunggah, saya menyetujui AI mengekstrak data identitas untuk autofill. File asli otomatis dihapus setelah ekstraksi. Hanya data terenkripsi yang disimpan di Vault.",
      privacyPolicyLink: "Kebijakan Privasi",
      modalAddDataTitle: "Tambah Data Profil Baru",
      labelDataName: "Nama Data",
      labelValue: "Nilai Data",
      labelAliases: "Aliases (Nama Serupa)",
      hintAliases: "(pisahkan koma untuk mengenali input field dengan nama mirip)",
      labelSourceTag: "Label Sumber (Tag)",
      placeholderDataName: "Cth: Nomor NPWP",
      placeholderValue: "Cth: 12.345.678.9-012.000",
      placeholderAliases: "Pisahkan koma, cth: Tax ID, NPWP, Tax Number",
      placeholderSourceTag: "Cth: Kartu NPWP / Manual Input",
      errorNameRequired: "Nama Data wajib diisi.",
      errorValueRequired: "Nilai data wajib diisi.",
      btnCancel: "Batal",
      btnSaveData: "Simpan Data",
      deleteTooltip: "Hapus data ini",
    },
    audit: {
      summaryTitle: "Traffic Light Pre-Submit Auditor",
      greenCount: "Lolos",
      yellowCount: "Peringatan",
      redCount: "Fatal",
      reAuditBtn: "Audit Ulang Formulir Web",
      auditNowBtn: "Audit Form Sekarang",
      auditingProgress: "Memindai & Mengaudit Kolom Halaman...",
      findingsTitle: "Daftar Hasil Temuan",
      fieldsDetectedSuffix: "Kolom Terdeteksi",
      tipVaultTypoTitle: "Tips: Hubungkan Vault untuk Typo Guard",
      tipVaultTypoDesc: "Anda belum menyimpan dokumen ke Vault. Audit tetap berjalan normal, namun fitur pencocokan otomatis salah ketik (typo guard) dinonaktifkan.",
      btnOpenVault: "Buka Tab Auto Fill / Vault",
      allClearTitle: "Formulir Sempurna & Siap Dikirim!",
      allClearDesc: "Seluruh kolom wajib telah terisi, format baku sesuai standar nasional, dan tidak ditemukan kontradiksi data.",
      btnSaveFormToVault: "Simpan Data Form Ini ke Vault",
      saveVaultToast: "Data formulir berhasil disimpan ke Vault lokal terenkripsi Anda!",
      scopeCardTitle: "Cakupan 4 Lapisan Audit Owly",
      scopeL1Label: "Aturan Form",
      scopeL1Desc: "Kolom bertanda bintang (*), panjang minimum, dan placeholder bawaan web.",
      scopeL2Label: "Format Baku",
      scopeL2Desc: "NIK 16 digit (algoritma wanita +40), No HP 08/+62, Email RFC, dan paspor ICAO.",
      scopeL3Label: "Typo Guard",
      scopeL3Desc: "Membandingkan ejaan nama/kontak dengan data resmi Vault secara 100% lokal.",
      scopeL4Label: "Instruksi Berkas",
      scopeL4Desc: "Membaca catatan batasan ukuran (KB/MB) dan format ekstensi file di halaman.",
      btnHighlightField: "👉 Sorot Kolom di Web",
      guideLabel: "Panduan:",
    },
    a11y: {
      title: "Accessibility HUB: 14 Tools",
      welcomeTitle: "Selamat Datang di Owly Accessibility HUB",
      welcomeDesc: "Mewujudkan kesetaraan akses digital bagi setiap warga—membantu individu dengan ADHD, lansia, hingga penderita low vision untuk mendapatkan kemudahan akses yang sama tanpa hambatan.",
      quickProfilesTitle: "PROFIL CEPAT AKSESIBILITAS",
      resetBtn: "Reset Semua",
      undoBtn: "Urungkan",
      activeCountSuffix: "fitur aktif",
      profileAdhd: "ADHD Friendly",
      profileDyslexia: "Dyslexia Friendly",
      profileLowVision: "Low Vision",
      profileSenior: "Senior Comfort",
    },
    auth: {
      title: "Autentikasi Owly.AI",
      subtitle: "Asisten Formulir Publik Berbasis Zero-Knowledge",
      loggedInBadge: "Akun Terverifikasi (Supabase 50.000 MAU). Data disinkronkan dengan enkripsi AES-256-GCM.",
      accountDesc: "Data Anda tersimpan dan terenkripsi secara lokal via AES-256-GCM. Plaintext tidak pernah dikirim ke server.",
      btnLogout: "Keluar dari Akun",
      demoUserTitle: "Pintu Masuk Demo Instan",
      btnDemoLogin: "1-Click Masuk Demo",
      demoAccountHint: "Akun: demo@owly.ai • Vault KTP/Dokumen Otomatis Terisi",
      orSocial: "Atau Masuk via Google / Media Sosial",
      pdpNotice: "Jaminan Privasi UU PDP: NIK, NPWP, dan data foto tidak pernah disimpan dalam format teks terbuka.",
    },
    logConsole: {
      title: "Owly.AI • Agentic Log Console",
      subtitle: "Trace penalaran real-time, persepsi, dan eksekusi aksi",
      liveBadge: "LIVE",
      copyJson: "Salin JSON",
      copied: "Tersalin",
      clear: "Bersihkan Log",
      close: "Tutup Console",
      infoBannerTitle: "Pelacakan Langsung",
      infoBannerDesc: "Jejak live pemanggilan model Baseten Muse Spark Open, VAD suara, dan eksekusi Vault AES-256.",
      allLogs: "SEMUA",
      searchPlaceholder: "Saring event log berdasarkan kata kunci...",
      copyTooltip: "Salin semua log dalam format JSON",
      clearTooltip: "Bersihkan log saat ini",
      closeTooltip: "Tutup Console",
    },
    common: {
      loading: "Memuat...",
      success: "Berhasil",
      error: "Kendala",
      cancel: "Batal",
      close: "Tutup",
      copy: "Salin",
      copied: "Tersalin!",
      retry: "Coba Lagi",
      save: "Simpan",
      privacyFooter: "Data Anda tetap aman di perangkat Anda",
    },
  },
};

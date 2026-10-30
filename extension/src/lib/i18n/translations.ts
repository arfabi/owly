export type SupportedLanguage = "id" | "en";

export interface ExtensionTranslations {
  header: {
    portalDetected: string;
    targetGoal: string;
    vaultLocked: string;
    vaultUnlocked: string;
    btnLock: string;
    btnUnlock: string;
  };
  tabs: {
    assistant: string;
    guide: string;
    vault: string;
    audit: string;
    a11y: string;
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
    profilePribadi: string;
    profilePasangan: string;
    profilePekerjaan: string;
    nikLabel: string;
    namaLabel: string;
    tglLabel: string;
    alamatLabel: string;
    ocrUploadTitle: string;
    ocrUploadDesc: string;
    btnSimulateOcr: string;
    btnBatchAutofill: string;
    undoBarText: string;
    btnUndo: string;
    essayTitle: string;
    essaySubtitle: string;
    essayBullet1Placeholder: string;
    essayBullet2Placeholder: string;
    essayBullet3Placeholder: string;
    btnGenerateEssay: string;
    essayResultLabel: string;
  };
  audit: {
    summaryTitle: string;
    greenCount: string;
    yellowCount: string;
    redCount: string;
    photoTitle: string;
    photoSubtitle: string;
    chipRatio: string;
    chipBlur: string;
    chipBiometric: string;
    btnScanPhoto: string;
    btnFixPhoto: string;
    consistencyTitle: string;
    consistencyDesc: string;
    consistencyMatch: string;
    btnRunFullAudit: string;
    auditCompleteToast: string;
  };
  a11y: {
    title: string;
    subtitle: string;
    zeroTokenBadge: string;
    tools: {
      id: string;
      title: string;
      desc: string;
      type: "toggle" | "stepper";
      statusOn: string;
      statusOff: string;
    }[];
  };
}

export const translations: Record<SupportedLanguage, ExtensionTranslations> = {
  id: {
    header: {
      portalDetected: "beasiswalpdp.kemenkeu.go.id",
      targetGoal: "🎯 Beasiswa LPDP 2026",
      vaultLocked: "Vault Terkunci",
      vaultUnlocked: "Vault Terbuka",
      btnLock: "Kunci",
      btnUnlock: "Buka Vault",
    },
    tabs: {
      assistant: "AI Assistant",
      guide: "Forms Guide",
      vault: "AutoFill",
      audit: "Audit Form",
      a11y: "A11y Hub",
    },
    coach: {
      activeFieldTitle: "Nomor Induk Kependudukan (NIK)",
      activeFieldDesc: "Kolom formulir aktif yang sedang disorot Spotlight",
      badgeOfficial: "🟢 Resmi • Juknis LPDP 2026 hlm. 14",
      badgeCurated: "🔵 Dikurasi",
      badgeAi: "🟡 Saran AI",
      secMeaning: "Arti Istilah:",
      secMeaningText: "Nomor identitas kependudukan tunggal 16 digit yang diterbitkan oleh Dinas Dukcapil.",
      secHowTo: "Cara Mengisi:",
      secHowToText: "Ketik 16 digit angka tanpa spasi atau tanda strip. Wajib sesuai fisik e-KTP terbaru.",
      secExample: "Contoh Valid:",
      secExampleText: "3271041908980002",
      secPitfall: "Jebakan Umum (Pitfall):",
      secPitfallText: "Jangan gunakan NIK lama pada fotokopi Kartu Keluarga jika Anda baru saja pindah domisili.",
      sourceText: "Meta Vector Store RAG • Halaman 14 Bab IV",
      btnAutofillSingle: "Isi Kolom Ini dari Vault (327104...)",
      btnAutofillDone: "Telah Terisi dari Vault",
      voicebotTitle: "Handsfree Voicebot (Muse Voice + VAD)",
      voiceStatusListening: "Mendengarkan ucapan Anda...",
      voiceStatusThinking: "Muse Spark sedang menalar...",
      voiceStatusSpeaking: "Menjelaskan aturan juknis...",
      btnAskVoice: "Bicara dengan Savvy",
      btnExplainThis: "Explain This (Multimodal Snip)",
      explainDesc: "Pilih area formulir yang membingungkan. Kotak input akan ditutup sensor otomatis.",
    },
    vault: {
      title: "Multiple Vault (Zero-Knowledge AES-256)",
      subtitle: "Data identitas terenkripsi di memori lokal browser. Tidak pernah dikirim ke server.",
      profilePribadi: "Profil: Pribadi",
      profilePasangan: "Profil: Pasangan",
      profilePekerjaan: "Profil: Pekerjaan",
      nikLabel: "NIK",
      namaLabel: "Nama Lengkap",
      tglLabel: "Tgl Lahir",
      alamatLabel: "Alamat KTP",
      ocrUploadTitle: "Upload Scan KTP ke Vault (Multimodal Vision)",
      ocrUploadDesc: "Diproses di RAM oleh Muse Spark Open dengan persetujuan PDP, foto langsung dihapus.",
      btnSimulateOcr: "Uji Coba Ekstraksi KTP",
      btnBatchAutofill: "1-Click Autofill Semua Kolom Cocok",
      undoBarText: "4 kolom formulir berhasil diisi dari Vault.",
      btnUndo: "Batalkan (Undo)",
      essayTitle: "Essay Coach (3-Bullet Smart Drafting)",
      essaySubtitle: "Bantuan menstrukturkan draf esai resmi tanpa mengarang fakta/halusinasi.",
      essayBullet1Placeholder: "Fakta 1: Latar belakang & fokus studi yang dipilih",
      essayBullet2Placeholder: "Fakta 2: Rencana pengabdian di instansi/masyarakat",
      essayBullet3Placeholder: "Fakta 3: Target kontribusi nyata 5 tahun ke depan",
      btnGenerateEssay: "Rancang Draf Narasi Esai Formal",
      essayResultLabel: "Hasil Draf Narasi Resmi (Siap Salin):",
    },
    audit: {
      summaryTitle: "Traffic Light Pre-Submit Auditor",
      greenCount: "3 Kolom Siap",
      yellowCount: "1 Peringatan",
      redCount: "1 Perlu Perbaikan",
      photoTitle: "Audit Kepatuhan Pasfoto (ICAO 9303)",
      photoSubtitle: "Pemeriksaan in-memory tanpa sentuh atau ubah piksel biometrik wajah.",
      chipRatio: "Rasio 2x2 Inci: Sah",
      chipBlur: "Ketajaman Laplacian: Baik (142)",
      chipBiometric: "Proporsi Kepala: 58% (Normal 50-69%)",
      btnScanPhoto: "Uji Pindai Pasfoto",
      btnFixPhoto: "Ganti Pasfoto Tajam",
      consistencyTitle: "Consistency Checker Agent",
      consistencyDesc: "Pemeriksaan silang: Nama di Formulir ('Budi Santoso') vs Nama di Paspor ('BUDI SANTOSO').",
      consistencyMatch: "Konsistensi Data: 100% Selaras",
      btnRunFullAudit: "Jalankan Audit Menyeluruh Sekarang",
      auditCompleteToast: "Audit selesai. Lampu hijau siap kirim!",
    },
    a11y: {
      title: "Accessibility HUB: 14 Tools Deterministik",
      subtitle: "Alat kenyamanan sensorik & kognitif lokal ($0 biaya token). Bisa dipicu klik atau AI reasoning.",
      zeroTokenBadge: "0 Token LLM • Instan <10ms",
      tools: [
        { id: "spotlight", title: "Reading Spotlight", desc: "Strip sorot mengikuti vertikal kursor", type: "toggle", statusOn: "Aktif", statusOff: "Mati" },
        { id: "tts", title: "Text to Speech (TTS)", desc: "Baca instruksi via Web Speech API", type: "toggle", statusOn: "Aktif", statusOff: "Mati" },
        { id: "contrast", title: "Contrast Mode", desc: "Filter kontras tinggi WCAG AAA", type: "toggle", statusOn: "High Contrast", statusOff: "Normal" },
        { id: "links", title: "Highlight Links", desc: "Sorot elemen interaktif & tombol", type: "toggle", statusOn: "Highlighted", statusOff: "Normal" },
        { id: "textSize", title: "Bigger Text Size", desc: "Perbesar skala tipografi halaman", type: "stepper", statusOn: "+25% (Besar)", statusOff: "Normal" },
        { id: "textSpacing", title: "Text Spacing", desc: "Perlebar jarak antar-huruf kata", type: "stepper", statusOn: "Spacious", statusOff: "Normal" },
        { id: "pauseAnim", title: "Pause Animations", desc: "Hentikan elemen bergerak/distraksi", type: "toggle", statusOn: "Paused", statusOff: "Normal" },
        { id: "hideImages", title: "Hide All Images", desc: "Sembunyikan gambar iklan/banner", type: "toggle", statusOn: "Hidden", statusOff: "Normal" },
        { id: "dyslexiaFont", title: "Dyslexia Friendly Font", desc: "Ganti font ke OpenDyslexic", type: "toggle", statusOn: "OpenDyslexic", statusOff: "Normal" },
        { id: "bigCursor", title: "Big Cursor", desc: "Ganti kursor ke pointer SVG besar", type: "toggle", statusOn: "Big Pointer", statusOff: "Normal" },
        { id: "liveTooltips", title: "Live Explanatory Tooltips", desc: "Tooltip istilah birokrasi mengambang", type: "toggle", statusOn: "Aktif", statusOff: "Mati" },
        { id: "lineHeight", title: "Line Height Spacing", desc: "Penskalaan jarak vertikal baris teks", type: "stepper", statusOn: "2.0 Line Height", statusOff: "Normal" },
        { id: "textAlign", title: "Text Alignment", desc: "Normalisasi perataan teks ke kiri", type: "toggle", statusOn: "Left-Aligned", statusOff: "Normal" },
        { id: "colorSat", title: "Color Saturation", desc: "Penyesuaian saturasi warna monokrom", type: "stepper", statusOn: "Monochrome", statusOff: "Normal" },
      ],
    },
  },
  en: {
    header: {
      portalDetected: "beasiswalpdp.kemenkeu.go.id",
      targetGoal: "🎯 LPDP Scholarship 2026",
      vaultLocked: "Vault Locked",
      vaultUnlocked: "Vault Unlocked",
      btnLock: "Lock",
      btnUnlock: "Unlock Vault",
    },
    tabs: {
      assistant: "AI Assistant",
      guide: "Forms Guide",
      vault: "AutoFill",
      audit: "Audit Form",
      a11y: "A11y Hub",
    },
    coach: {
      activeFieldTitle: "National Identification Number (NIK)",
      activeFieldDesc: "Active field highlighted by Beacon Spotlight",
      badgeOfficial: "🟢 Official • LPDP Guidelines 2026 p. 14",
      badgeCurated: "🔵 Curated",
      badgeAi: "🟡 AI Guidance",
      secMeaning: "Field Meaning:",
      secMeaningText: "A 16-digit single citizen identity number issued by Dukcapil civil registry.",
      secHowTo: "How to Fill:",
      secHowToText: "Enter 16 digits without spaces or dashes. Must match your latest physical e-KTP.",
      secExample: "Valid Example:",
      secExampleText: "3271041908980002",
      secPitfall: "Common Pitfall:",
      secPitfallText: "Do not use old NIK from an outdated Family Card if you recently relocated.",
      sourceText: "Meta Vector Store RAG • Chapter IV Page 14",
      btnAutofillSingle: "Fill This Field from Vault (327104...)",
      btnAutofillDone: "Autofilled from Vault",
      voicebotTitle: "Handsfree Voicebot (Muse Voice + VAD)",
      voiceStatusListening: "Listening to your voice...",
      voiceStatusThinking: "Muse Spark is reasoning...",
      voiceStatusSpeaking: "Explaining official guidelines...",
      btnAskVoice: "Talk to Savvy",
      btnExplainThis: "Explain This (Multimodal Snip)",
      explainDesc: "Select confusing form areas. Input values are automatically masked in black.",
    },
    vault: {
      title: "Multiple Vault (Zero-Knowledge AES-256)",
      subtitle: "Identity credentials encrypted locally in browser memory. Never sent to servers.",
      profilePribadi: "Profile: Personal",
      profilePasangan: "Profile: Spouse",
      profilePekerjaan: "Profile: Employment",
      nikLabel: "NIK",
      namaLabel: "Full Name",
      tglLabel: "Birth Date",
      alamatLabel: "Address",
      ocrUploadTitle: "Upload ID Scan to Vault (Multimodal Vision)",
      ocrUploadDesc: "Processed in RAM by Muse Spark Open with PDP consent, image deleted immediately.",
      btnSimulateOcr: "Simulate ID Card OCR",
      btnBatchAutofill: "1-Click Autofill All Matching Fields",
      undoBarText: "4 form fields successfully filled from Vault.",
      btnUndo: "Undo Autofill",
      essayTitle: "Essay Coach (3-Bullet Smart Drafting)",
      essaySubtitle: "Assists in structuring formal compliant essays without hallucinating facts.",
      essayBullet1Placeholder: "Fact 1: Background & rationale for chosen academic field",
      essayBullet2Placeholder: "Fact 2: Concrete contribution plan to agency or society",
      essayBullet3Placeholder: "Fact 3: Measurable 5-year post-study milestones",
      btnGenerateEssay: "Draft Formal Statement of Purpose",
      essayResultLabel: "Official Statement Draft (Ready to Copy):",
    },
    audit: {
      summaryTitle: "Traffic Light Pre-Submit Auditor",
      greenCount: "3 Fields Ready",
      yellowCount: "1 Warning",
      redCount: "1 Fix Needed",
      photoTitle: "Biometric Photo Compliance (ICAO 9303)",
      photoSubtitle: "Audited in-memory without retouching biometrics or altering face pixels.",
      chipRatio: "Aspect Ratio 2x2: Valid",
      chipBlur: "Laplacian Sharpness: Crisp (142)",
      chipBiometric: "Head Proportion: 58% (Normal 50-69%)",
      btnScanPhoto: "Run Photo Biometrics Scan",
      btnFixPhoto: "Replace with Sharp Photo",
      consistencyTitle: "Consistency Checker Agent",
      consistencyDesc: "Cross-validation: Name on Form ('Budi Santoso') vs Name on Passport ('BUDI SANTOSO').",
      consistencyMatch: "Data Consistency: 100% Match",
      btnRunFullAudit: "Run Complete Pre-Submit Audit Now",
      auditCompleteToast: "Audit completed. Green light cleared for submission!",
    },
    a11y: {
      title: "Accessibility HUB: 14 Deterministic Tools",
      subtitle: "Local sensory & cognitive comfort tools ($0 token cost). Triggered by click or AI reasoning.",
      zeroTokenBadge: "0 LLM Tokens • Instant <10ms",
      tools: [
        { id: "spotlight", title: "Reading Spotlight", desc: "Focus line strip following vertical cursor", type: "toggle", statusOn: "Active", statusOff: "Off" },
        { id: "tts", title: "Text to Speech (TTS)", desc: "Read instructions via Web Speech API", type: "toggle", statusOn: "Active", statusOff: "Off" },
        { id: "contrast", title: "Contrast Mode", desc: "High contrast WCAG AAA filter", type: "toggle", statusOn: "High Contrast", statusOff: "Normal" },
        { id: "links", title: "Highlight Links", desc: "Highlight interactive buttons & links", type: "toggle", statusOn: "Highlighted", statusOff: "Normal" },
        { id: "textSize", title: "Bigger Text Size", desc: "Scale typography without breaking layout", type: "stepper", statusOn: "+25% (Large)", statusOff: "Normal" },
        { id: "textSpacing", title: "Text Spacing", desc: "Widen letter and word spacing", type: "stepper", statusOn: "Spacious", statusOff: "Normal" },
        { id: "pauseAnim", title: "Pause Animations", desc: "Stop moving banners and animations", type: "toggle", statusOn: "Paused", statusOff: "Normal" },
        { id: "hideImages", title: "Hide All Images", desc: "Hide decorative images and banners", type: "toggle", statusOn: "Hidden", statusOff: "Normal" },
        { id: "dyslexiaFont", title: "Dyslexia Friendly Font", desc: "Switch global font to OpenDyslexic", type: "toggle", statusOn: "OpenDyslexic", statusOff: "Normal" },
        { id: "bigCursor", title: "Big Cursor", desc: "Enlarge mouse pointer to high-visibility SVG", type: "toggle", statusOn: "Big Pointer", statusOff: "Normal" },
        { id: "liveTooltips", title: "Live Explanatory Tooltips", desc: "Floating simplified legal terminology", type: "toggle", statusOn: "Active", statusOff: "Off" },
        { id: "lineHeight", title: "Line Height Spacing", desc: "Increase vertical reading line spacing", type: "stepper", statusOn: "2.0 Line Height", statusOff: "Normal" },
        { id: "textAlign", title: "Text Alignment", desc: "Normalize text alignment to left", type: "toggle", statusOn: "Left-Aligned", statusOff: "Normal" },
        { id: "colorSat", title: "Color Saturation", desc: "Adjust monochrome color saturation", type: "stepper", statusOn: "Monochrome", statusOff: "Normal" },
      ],
    },
  },
};

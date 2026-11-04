// ============================================================================
// OWLY.AI — Welcome & Onboarding Internationalization (14 Languages)
// ============================================================================

export interface WelcomeLanguageItem {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const WELCOME_LANGUAGES: WelcomeLanguageItem[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "zh", name: "Chinese", nativeName: "简体中文", flag: "🇨🇳" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", flag: "🇲🇾" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳" },
  { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭" },
];

export interface WelcomeTranslation {
  header: {
    title: string;
    badge: string;
  };
  stepper: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    step5: string;
    step6: string;
    step7: string;
  };
  controls: {
    next: string;
    back: string;
    skip: string;
    finish: string;
    stepOf: (curr: number, total: number) => string;
  };
  step1: {
    title: string;
    subtitle: string;
    activeNotice: string;
  };
  step2: {
    title: string;
    subtitle: string;
    whatIs: string;
    whatIsDesc: string;
    whoFor: string;
    whoForDesc: string;
    poweredBy: string;
    poweredByDesc: string;
    howToOpen: string;
    howToOpenDesc: string;
    stepPin: string;
    stepSidePanel: string;
    stepShortcut: string;
  };
  step3: {
    title: string;
    subtitle: string;
    tabVoice: string;
    tabSnip: string;
    voiceTitle: string;
    voiceDesc: string;
    voiceHighlight: string;
    snipTitle: string;
    snipDesc: string;
    snipHighlight: string;
  };
  step4: {
    title: string;
    subtitle: string;
    slide1: string;
    slide2: string;
    slide3: string;
    slide1Desc: string;
    slide2Desc: string;
    slide3Desc: string;
    cardPillarsTitle: string;
    pillarMeaning: string;
    pillarHowTo: string;
    pillarExample: string;
    pillarPitfall: string;
  };
  step5: {
    title: string;
    subtitle: string;
    vaultTitle: string;
    vaultDesc: string;
    privacyPromise: string;
    privacyPromiseDesc: string;
    autofillTitle: string;
    autofillDesc: string;
  };
  step6: {
    title: string;
    subtitle: string;
    tabCard: string;
    tabFull: string;
    auditTitle: string;
    auditDesc: string;
    fourLayersTitle: string;
    layer1: string;
    layer2: string;
    layer3: string;
    layer4: string;
    metaReasoning: string;
  };
  step7: {
    title: string;
    subtitle: string;
    ctaSimulator: string;
    ctaSimulatorDesc: string;
    ctaSidePanel: string;
    ctaSidePanelDesc: string;
    pinReminder: string;
  };
}

export const WELCOME_I18N: Record<string, WelcomeTranslation> = {
  en: {
    header: {
      title: "Owly.AI Onboarding",
      badge: "Meta Muse Spark Powered",
    },
    stepper: {
      step1: "Language",
      step2: "Meet Owly",
      step3: "Voice & Snip",
      step4: "Forms Guide",
      step5: "Private Vault",
      step6: "Pre-Submit Audit",
      step7: "Launch",
    },
    controls: {
      next: "Next Step ➔",
      back: "← Back",
      skip: "Skip to Launch",
      finish: "🚀 Start Using Owly.AI",
      stepOf: (curr, total) => `Step ${curr} of ${total}`,
    },
    step1: {
      title: "Choose Your Preferred Language",
      subtitle: "Owly supports 14 global languages. Select your language now — this tutorial and your extension UI will update instantly.",
      activeNotice: "Your preferred language has been saved to your local browser storage.",
    },
    step2: {
      title: "Meet Owly: Your AI Browser Companion",
      subtitle: "An active compound browser agent built to guide, verify, and safeguard applicants across complex public portals.",
      whatIs: "What is Owly.AI?",
      whatIsDesc: "Owly lives in your Chrome Side Panel. Instead of chatbot walls of text, it interacts directly with live web forms — projecting step-by-step numbers, explaining legal clauses, and auditing inputs before submission.",
      whoFor: "Who is it built for?",
      whoForDesc: "Scholarship, visa, civil service, and public grant applicants who cannot afford to lose life-changing opportunities over technical formatting errors.",
      poweredBy: "Meta AI Architecture",
      poweredByDesc: "Driven by Meta Muse Spark Open (reasoning & multimodal vision) via Baseten GPU and Meta Muse Voice Transcribe (ASR gateway).",
      howToOpen: "How to open Owly in Chrome:",
      howToOpenDesc: "1. Click Chrome's Puzzle icon 🧩 → Pin Owly.AI 🦉.\n2. Click the pinned Owly icon to slide out the Side Panel.\n3. Or press Alt + Shift + O anytime.",
      stepPin: "1. Pin to Toolbar",
      stepSidePanel: "2. Open Side Panel",
      stepShortcut: "3. Alt + Shift + O",
    },
    step3: {
      title: "Ask Owly: Voice Companion & Visual Snip",
      subtitle: "Communicate naturally using speech recognition or visual cropping without typing.",
      tabVoice: "🎙️ Voice Companion (PTT & Live)",
      tabSnip: "✂️ Visual Snip ('Explain This')",
      voiceTitle: "Hands-Free Voice Dialogue",
      voiceDesc: "Use Push-to-Talk (PTT) for quick inquiries, or switch to Live Talk for hands-free conversations while holding physical documents.",
      voiceHighlight: "Meta Muse Voice Transcribe streams 16 kHz Mono PCM audio via background AudioWorkletNode — zero main-thread UI lag and near-zero error on alphanumeric IDs.",
      snipTitle: "Explain This: Drag-and-Crop Clause Analyzer",
      snipDesc: "Select and crop any confusing legal clause, official stamp, or fine-print footnote on the webpage.",
      snipHighlight: "Meta Muse Spark Multimodal Vision analyzes the crop to deliver a plain-language explanation, legal implications, genuine specimen markers, and concrete action steps.",
    },
    step4: {
      title: "Forms Guide: Interactive Step-by-Step Roadmap",
      subtitle: "Transform overwhelming, multi-page portals into numbered, guided steps projected onto the live DOM.",
      slide1: "1. Click 'Analyze Form'",
      slide2: "2. CMAS Triad Synthesis",
      slide3: "3. Interactive Badges (1..N)",
      slide1Desc: "When opening any form, click 'Analyze Form' to scan the viewport.",
      slide2Desc: "3 Meta agents parse logos, deadlines, and official guidelines in parallel.",
      slide3Desc: "Numbered badges (1, 2, 3...) appear on the page. Click any badge to open the 4-element Field Coach.",
      cardPillarsTitle: "4-Element AI Field Coach Card:",
      pillarMeaning: "📌 Field Meaning — What the authority is really asking for.",
      pillarHowTo: "✍️ How to Fill — Formatting rules, syntax, and character limits.",
      pillarExample: "✅ Valid Example — Concrete, real-world compliant input.",
      pillarPitfall: "⚠️ Common Pitfall — The exact traps that cause disqualification.",
    },
    step5: {
      title: "1-Click Autofill & Zero-Knowledge Vault",
      subtitle: "Upload documents once. Autofill any form with client-side AES-256 encryption.",
      vaultTitle: "Private Document Vault",
      vaultDesc: "Upload your passport, national ID, or language certificate. Meta Muse Spark extracts structured fields in volatile server RAM — never stored in any database.",
      privacyPromise: "100% Zero-Knowledge Encryption",
      privacyPromiseDesc: "Extracted credentials are encrypted locally in your browser memory via WebCrypto AES-256-GCM. No plaintext ever leaves your machine.",
      autofillTitle: "Deterministic 1-Click Fill + Undo",
      autofillDesc: "Click 'Auto Fill from Vault' on any field. Data populates instantly. Changed your mind? Click 'Undo Fill' to revert safely.",
    },
    step6: {
      title: "Pre-Submit Form Auditor: Anti-Disqualification",
      subtitle: "A 4-layer client validation engine combined with Meta deep reasoning to catch fatal mistakes before submitting.",
      tabCard: "🚦 Traffic Light Card",
      tabFull: "🖥️ Viewport Highlight",
      auditTitle: "Pre-Submit Traffic Light Evaluation",
      auditDesc: "Runs in under 5ms, scanning every filled input for formatting, file constraints, and logic prerequisites.",
      fourLayersTitle: "4-Layer Audit Scope:",
      layer1: "Layer 1: Required DOM attributes & visual red asterisks.",
      layer2: "Layer 2: Standard ICAO passports, national IDs, E.164 phones, and word counts.",
      layer3: "Layer 3: Client-side Levenshtein distance typo detection against verified Vault.",
      layer4: "Layer 4: Attachment file size (<2MB) and allowable extensions (.pdf, .jpg).",
      metaReasoning: "Concurrently, Meta Muse Spark analyzes unwritten page footnotes and cross-field logic contradictions.",
    },
    step7: {
      title: "You're All Set! Launch Your First Live Test",
      subtitle: "Experience the full power of Owly.AI in under 60 seconds on our official Form Simulator.",
      ctaSimulator: "🚀 Open Form Simulator (Live Benchmark)",
      ctaSimulatorDesc: "Navigate to our realistic scholarship & visa application portal to test scanning, coaching, voice, and auditing.",
      ctaSidePanel: "🦉 Open Owly Side Panel Now",
      ctaSidePanelDesc: "Launch the AI companion side panel directly in your current window.",
      pinReminder: "Tip: Pin Owly.AI to your Chrome toolbar for instant 1-click access on any webpage!",
    },
  },
  id: {
    header: {
      title: "Panduan Pengenalan Owly.AI",
      badge: "Bertenaga Meta Muse Spark",
    },
    stepper: {
      step1: "Bahasa",
      step2: "Mengenal Owly",
      step3: "Suara & Snip",
      step4: "Forms Guide",
      step5: "Brankas Pribadi",
      step6: "Audit Pra-Kirim",
      step7: "Mulai",
    },
    controls: {
      next: "Langkah Berikutnya ➔",
      back: "← Kembali",
      skip: "Lewati ke Akhir",
      finish: "🚀 Mulai Gunakan Owly.AI",
      stepOf: (curr, total) => `Langkah ${curr} dari ${total}`,
    },
    step1: {
      title: "Pilih Bahasa Pilihan Anda",
      subtitle: "Owly mendukung 14 bahasa global. Pilih bahasa Anda sekarang — panduan ini dan antarmuka ekstensi akan langsung berganti seketika.",
      activeNotice: "Pilihan bahasa Anda telah tersimpan di penyimpanan lokal browser Anda.",
    },
    step2: {
      title: "Mengenal Owly: Rekan Cerdas Pengisi Formulir",
      subtitle: "Agen browser otonom yang memandu, memvalidasi, dan mengamankan pendaftaran Anda di portal publik yang rumit.",
      whatIs: "Apa itu Owly.AI?",
      whatIsDesc: "Owly hidup di Side Panel Chrome Anda. Bukan sekadar chatbot teks, Owly berinteraksi langsung dengan formulir aktif — memproyeksikan nomor langkah, menjelaskan istilah hukum, dan mengaudit data sebelum dikirim.",
      whoFor: "Untuk Siapa Owly Dibuat?",
      whoForDesc: "Pendaftar beasiswa, visa, CPNS, dan bantuan sosial yang tidak boleh gagal hanya karena salah ketik format atau salah paham istilah birokrasi.",
      poweredBy: "Arsitektur Meta AI Resmi",
      poweredByDesc: "Digerakkan oleh Meta Muse Spark Open (penalaran & multimodal vision via GPU Baseten) dan Meta Muse Voice Transcribe (gateway ASR resmi).",
      howToOpen: "Cara Membuka Owly di Chrome:",
      howToOpenDesc: "1. Klik ikon Puzzle 🧩 di Chrome → Pin Owly.AI 🦉 ke toolbar.\n2. Klik ikon Owly untuk membuka Side Panel.\n3. Atau tekan pintasan Alt + Shift + O kapan saja.",
      stepPin: "1. Pin ke Toolbar",
      stepSidePanel: "2. Buka Side Panel",
      stepShortcut: "3. Alt + Shift + O",
    },
    step3: {
      title: "Ask Owly: Voice Companion & Visual Snip",
      subtitle: "Berkomunikasi secara alami dengan suara atau seleksi visual tanpa perlu mengetik manual.",
      tabVoice: "🎙️ Voice Companion (PTT & Live)",
      tabSnip: "✂️ Visual Snip ('Explain This')",
      voiceTitle: "Dialog Suara Hands-Free",
      voiceDesc: "Gunakan Push-to-Talk (PTT) untuk tanya jawab cepat, atau beralih ke Live Talk saat kedua tangan Anda sedang memegang paspor/ijazah fisik.",
      voiceHighlight: "Meta Muse Voice Transcribe mengalirkan audio 16 kHz Mono PCM via AudioWorkletNode — tanpa lag pada thread UI dan bebas halusinasi pada nomor identitas.",
      snipTitle: "Explain This: Crop & Terjemahkan Istilah Birokrasi",
      snipDesc: "Tyeleksi dan crop kalimat hukum, stempel resmi, atau catatan kaki kecil yang membingungkan di layar.",
      snipHighlight: "Meta Muse Spark Multimodal Vision menganalisis gambar crop untuk memberikan arti awam, implikasi hukum, ciri keaslian fisik, dan tindakan konkret.",
    },
    step4: {
      title: "Forms Guide: Peta Langkah Interaktif (1..N)",
      subtitle: "Ubah formulir panjang yang membingungkan menjadi panduan bernomor langkah demi langkah langsung di halaman web.",
      slide1: "1. Klik 'Analyze Form'",
      slide2: "2. Sintesis 3-Agent CMAS",
      slide3: "3. Nomor Lencana (1..N)",
      slide1Desc: "Saat membuka formulir apa pun, klik 'Analyze Form' untuk memindai halaman.",
      slide2Desc: "3 agen Meta menganalisis logo, tenggat waktu, dan aturan resmi secara paralel.",
      slide3Desc: "Lencana nomor (1, 2, 3...) muncul di halaman. Klik lencana mana pun untuk membuka AI Field Coach.",
      cardPillarsTitle: "Kartu 4 Pilar Panduan AI Field Coach:",
      pillarMeaning: "📌 Arti Kolom — Apa yang sebenarnya diminta oleh instansi.",
      pillarHowTo: "✍️ Cara Mengisi — Format penulisan, sintaksis, dan batas karakter.",
      pillarExample: "✅ Contoh Valid — Data masukan konkret yang benar dan sah.",
      pillarPitfall: "⚠️ Jebakan Diskualifikasi — Kesalahan fatal umum yang sering menggugurkan pelamar.",
    },
    step5: {
      title: "1-Click Autofill & Brankas Pribadi (Vault)",
      subtitle: "Unggah dokumen sekali. Isi formulir otomatis dengan enkripsi lokal AES-256-GCM.",
      vaultTitle: "Brankas Dokumen Pribadi",
      vaultDesc: "Unggah KTP, paspor, atau sertifikat bahasa. Meta Muse Spark mengekstrak data di RAM sementara — tidak pernah disimpan di database cloud mana pun.",
      privacyPromise: "Enkripsi Zero-Knowledge 100%",
      privacyPromiseDesc: "Data pribadi dienkripsi langsung di memori browser Anda menggunakan WebCrypto AES-256-GCM. Teks terbaca tidak pernah keluar dari komputer Anda.",
      autofillTitle: "Isi Sekali Klik + Tombol Undo",
      autofillDesc: "Klik 'Auto Fill from Vault' pada kolom apa pun. Formulir langsung terisi. Ingin membatalkan? Klik 'Undo Fill' untuk mengembalikan ke semula.",
    },
    step6: {
      title: "Pre-Submit Form Auditor: Anti-Gagal Pra-Kirim",
      subtitle: "Mesin validasi deterministik 4 lapis berpadu dengan penalaran mendalam Meta untuk mencegah diskualifikasi sebelum submit.",
      tabCard: "🚦 Kartu Lampu Lalu Lintas",
      tabFull: "🖥️ Sorot di Layar Penuh",
      auditTitle: "Evaluasi Audit Lampu Lalu Lintas",
      auditDesc: "Berjalan dalam <5ms, memindai setiap input untuk memeriksa format, batas file, dan kelayakan administratif.",
      fourLayersTitle: "Cakupan 4 Lapis Audit:",
      layer1: "Layer 1: Atribut wajib DOM & tanda bintang merah (*) di layar.",
      layer2: "Layer 2: Standar Paspor ICAO, NIK/ID Nasional, format HP E.164, dan minimal 50 kata.",
      layer3: "Layer 3: Deteksi salah ketik (typo) Levenshtein distance terhadap Brankas terverifikasi.",
      layer4: "Layer 4: Batas ukuran lampiran (<2MB) dan ekstensi yang diizinkan (.pdf, .jpg).",
      metaReasoning: "Secara bersamaan, Meta Muse Spark menganalisis catatan kaki dan kontradiksi logika antar-kolom.",
    },
    step7: {
      title: "Semua Siap! Lakukan Pengujian Langsung Pertama Anda",
      subtitle: "Rasakan kecanggihan Owly.AI dalam waktu kurang dari 60 detik di Portal Simulator resmi kami.",
      ctaSimulator: "🚀 Buka Simulator Formulir (Live Demo)",
      ctaSimulatorDesc: "Kunjungi portal simulasi beasiswa & visa kami untuk menguji fitur scan formulir, bimbingan, suara, dan audit.",
      ctaSidePanel: "🦉 Buka Side Panel Owly Sekarang",
      ctaSidePanelDesc: "Buka panel samping asisten AI langsung di jendela browser Anda.",
      pinReminder: "Tips: Pasang pin Owly.AI di toolbar Chrome Anda untuk akses cepat di halaman web mana pun!",
    },
  },
};

// Fallback generator for other 12 languages (es, zh, ar, ja, fr, de, pt, hi, ko, ms, vi, th)
export function getWelcomeI18n(lang: string): WelcomeTranslation {
  if (WELCOME_I18N[lang]) {
    return WELCOME_I18N[lang];
  }
  return WELCOME_I18N.en;
}


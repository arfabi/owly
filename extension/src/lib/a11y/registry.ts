/**
 * Owly Accessibility Unified Registry & Agentic Tooling
 * Sesuai arsitektur accessibility-hub-plan.md dengan 14 Tool Deterministik Nyata Owly
 */

export interface ToolOption {
  value: string;
  label: string;
}

export interface A11yToolDef {
  id: string;
  title: string;
  kind: "toggle" | "level" | "multi";
  options: string[];
  defaultIndex: number;
  aliases: string[];
}

export const A11Y_TOOLS: A11yToolDef[] = [
  {
    id: "spotlight",
    title: "Reading Spotlight",
    kind: "toggle",
    options: ["Off", "On"],
    defaultIndex: 0,
    aliases: ["spotlight", "sorot baris", "fokus baca", "pemandu baca", "baris baca", "reading guide"],
  },
  {
    id: "tts",
    title: "Text to Speech (TTS)",
    kind: "toggle",
    options: ["Off", "On"],
    defaultIndex: 0,
    aliases: ["bacakan", "suara", "dengarkan", "baca keras", "tts", "speak", "read aloud", "audio"],
  },
  {
    id: "contrast",
    title: "Contrast Mode",
    kind: "multi",
    options: ["Normal", "High", "Invert", "Monochrome"],
    defaultIndex: 0,
    aliases: ["kontras", "gelap", "dark mode", "terlalu terang", "silau", "high contrast", "invert", "monokrom", "hitam putih"],
  },
  {
    id: "links",
    title: "Highlight Links",
    kind: "multi",
    options: ["Off", "Highlight", "Underline", "High Contrast"],
    defaultIndex: 0,
    aliases: ["link", "tautan", "sorot link", "garis bawah", "underline", "highlight link"],
  },
  {
    id: "textSize",
    title: "Bigger Text Size",
    kind: "level",
    options: ["Normal", "+25%", "+50%", "+75%", "+100%"],
    defaultIndex: 0,
    aliases: ["teks", "tulisan", "font", "huruf", "ukuran huruf", "perbesar", "perkecil", "tulisannya kecil", "font size"],
  },
  {
    id: "textSpacing",
    title: "Text Spacing",
    kind: "level",
    options: ["Normal", "Light (+10%)", "Medium (+25%)", "Heavy (+50%)"],
    defaultIndex: 0,
    aliases: ["jarak huruf", "jarak kata", "spasi huruf", "letter spacing", "huruf rapat", "huruf menumpuk", "kerning"],
  },
  {
    id: "pauseAnim",
    title: "Pause Animations",
    kind: "toggle",
    options: ["Normal", "Paused"],
    defaultIndex: 0,
    aliases: ["animasi", "gerakan", "berkedip", "pusing", "pause animasi", "stop animasi", "freeze animations"],
  },
  {
    id: "hideImages",
    title: "Hide All Images",
    kind: "multi",
    options: ["Normal", "Hidden", "Grayscale"],
    defaultIndex: 0,
    aliases: ["gambar", "foto", "sembunyikan gambar", "hilangkan gambar", "tanpa gambar", "hide images"],
  },
  {
    id: "dyslexiaFont",
    title: "Dyslexia Friendly Font",
    kind: "toggle",
    options: ["Off", "On"],
    defaultIndex: 0,
    aliases: ["disleksia", "dyslexia", "huruf tertukar", "font disleksia", "huruf ramah baca", "opendyslexic"],
  },
  {
    id: "bigCursor",
    title: "Big Cursor",
    kind: "multi",
    options: ["Normal", "Large (Black)", "Large (White)", "Highlighter"],
    defaultIndex: 0,
    aliases: ["kursor", "cursor", "pointer", "mouse", "kursor besar", "mouse besar", "penunjuk"],
  },
  {
    id: "liveTooltips",
    title: "Live Explanatory Tooltips",
    kind: "toggle",
    options: ["Off", "On"],
    defaultIndex: 0,
    aliases: ["tooltip", "penjelasan kata", "kamus kata", "arti kata", "live tooltip", "bantuan istilah"],
  },
  {
    id: "lineHeight",
    title: "Line Height Spacing",
    kind: "level",
    options: ["Normal", "1.5x", "1.8x", "2.2x"],
    defaultIndex: 0,
    aliases: ["jarak baris", "tinggi baris", "line height", "baris rapat", "baris terlalu dekat"],
  },
  {
    id: "textAlign",
    title: "Text Alignment",
    kind: "multi",
    options: ["Normal", "Left", "Center", "Justify"],
    defaultIndex: 0,
    aliases: ["rata kiri", "rata tengah", "rata kanan kiri", "justify", "perataan teks", "text align"],
  },
  {
    id: "colorSat",
    title: "Color Saturation",
    kind: "multi",
    options: ["Normal", "High (+50%)", "Low (-50%)", "Monochrome"],
    defaultIndex: 0,
    aliases: ["saturasi", "kejenuhan warna", "warna tajam", "warna pudar", "color saturation"],
  },
];

// Presets Kebutuhan Khusus (Sesuai Profil Nyata Owly)
export const A11Y_PROFILES: Record<string, { label: string; levels: Record<string, number> }> = {
  adhd: {
    label: "ADHD Focus",
    levels: { spotlight: 1, pauseAnim: 1 },
  },
  dyslexia: {
    label: "Dyslexia Support",
    levels: { dyslexiaFont: 1, lineHeight: 2, textSpacing: 2 },
  },
  low_vision: {
    label: "Low Vision",
    levels: { contrast: 1, textSize: 2, bigCursor: 1 },
  },
  senior: {
    label: "Senior Comfort",
    levels: { textSize: 1, lineHeight: 1, bigCursor: 1, links: 1 },
  },
};

// Meta Tooling: 4 Unified Schemas untuk LLM Function Calling
export const A11Y_FUNCTION_SCHEMAS = [
  {
    type: "function",
    function: {
      name: "set_accessibility_feature",
      description: "Menetapkan nilai pasti fitur aksesibilitas pada halaman web. Idempoten.",
      parameters: {
        type: "object",
        properties: {
          feature: {
            type: "string",
            enum: [
              "spotlight", "tts", "contrast", "links", "textSize", "textSpacing",
              "pauseAnim", "hideImages", "dyslexiaFont", "bigCursor", "liveTooltips",
              "lineHeight", "textAlign", "colorSat"
            ],
            description: "ID fitur aksesibilitas Owly."
          },
          value: {
            type: "string",
            description: "Nilai opsi (contoh: 'On', 'Off', '+25%', '+50%', '+75%', '+100%', 'High', 'Invert', 'Monochrome', 'Large (Black)', 'Paused', 'Left', 'Center', 'Justify')"
          }
        },
        required: ["feature", "value"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "step_accessibility_feature",
      description: "Menaikkan atau menurunkan tingkat fitur level bertahap (textSize, textSpacing, lineHeight). Untuk 'lebih besar lagi', 'agak kecilkan'.",
      parameters: {
        type: "object",
        properties: {
          feature: {
            type: "string",
            enum: ["textSize", "textSpacing", "lineHeight"]
          },
          direction: {
            type: "string",
            enum: ["increase", "decrease"]
          }
        },
        required: ["feature", "direction"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "apply_accessibility_profile",
      description: "Menerapkan profil preset kebutuhan khusus pengguna (ADHD, Dyslexia, Low Vision, Senior).",
      parameters: {
        type: "object",
        properties: {
          profile: {
            type: "string",
            enum: ["adhd", "dyslexia", "low_vision", "senior"]
          }
        },
        required: ["profile"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "reset_accessibility",
      description: "Mereset semua fitur aksesibilitas atau satu fitur tertentu ke bawaan normal.",
      parameters: {
        type: "object",
        properties: {
          scope: {
            type: "string",
            description: "'all' untuk semua fitur, atau ID fitur spesifik."
          }
        },
        required: ["scope"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "undo_last_change",
      description: "Membatalkan perubahan aksesibilitas terakhir (kembali ke snapshot sebelumnya).",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  }
];

export interface A11yCommandResult {
  source: "fast_path" | "llm" | "fallback";
  actionType: "set" | "step" | "profile" | "reset" | "undo";
  feature?: string;
  value?: string;
  profile?: string;
  direction?: "increase" | "decrease";
  newLevels: Record<string, number>;
  message: string;
}

/**
 * Fast-path intent matcher (<5ms, zero network latency)
 */
export function matchA11yFastPath(
  input: string,
  currentLevels: Record<string, number>,
  isId: boolean = false
): A11yCommandResult | null {
  const text = input.toLowerCase().trim();

  // 1. Reset / Kembalikan normal
  if (/^(reset|normal|kembalikan|default|bawaan|pulihkan|turn off all|clear all|restore default)/i.test(text)) {
    const reset: Record<string, number> = {};
    A11Y_TOOLS.forEach(t => { reset[t.id] = 0; });
    return {
      source: "fast_path",
      actionType: "reset",
      newLevels: reset,
      message: isId ? "🧹 Semua fitur aksesibilitas dikembalikan ke normal." : "🧹 All accessibility features reset to default.",
    };
  }

  // 2. Undo / Batal
  if (/^(urungkan|undo|batal|tadi lebih baik|kembalikan yang tadi|revert)/i.test(text)) {
    return {
      source: "fast_path",
      actionType: "undo",
      newLevels: currentLevels,
      message: isId ? "↶ Membatalkan perubahan terakhir..." : "↶ Reverting last accessibility change...",
    };
  }

  // 3. Profiles
  if (text.includes("adhd") || text.includes("fokus adhd") || text.includes("focus adhd") || text.includes("hard to focus") || text.includes("susah fokus")) {
    const updated = { ...currentLevels, ...A11Y_PROFILES.adhd.levels };
    return {
      source: "fast_path",
      actionType: "profile",
      profile: "adhd",
      newLevels: updated,
      message: isId ? "🧠 Profil ADHD diaktifkan (Reading Spotlight On + Animasi Dijeda)." : "🧠 ADHD Focus Profile activated (Reading Spotlight On + Paused Animations).",
    };
  }
  if (text.includes("disleksia") || text.includes("dyslexia") || text.includes("dyslexic")) {
    const updated = { ...currentLevels, ...A11Y_PROFILES.dyslexia.levels };
    return {
      source: "fast_path",
      actionType: "profile",
      profile: "dyslexia",
      newLevels: updated,
      message: isId ? "📖 Profil Dyslexia diaktifkan (Font Ramah Baca + Spasi & Tinggi Baris Disesuaikan)." : "📖 Dyslexia Support Profile activated (Friendly Font + Spacing & Line Height adjusted).",
    };
  }
  if (text.includes("low vision") || text.includes("rabun") || text.includes("kurang jelas") || text.includes("poor vision") || text.includes("blurry")) {
    const updated = { ...currentLevels, ...A11Y_PROFILES.low_vision.levels };
    return {
      source: "fast_path",
      actionType: "profile",
      profile: "low_vision",
      newLevels: updated,
      message: isId ? "👓 Profil Low Vision diaktifkan (Kontras Tinggi + Teks +50% + Kursor Besar)." : "👓 Low Vision Profile activated (High Contrast + Text +50% + Big Cursor).",
    };
  }
  if (text.includes("senior") || text.includes("lansia") || text.includes("orang tua") || text.includes("elderly")) {
    const updated = { ...currentLevels, ...A11Y_PROFILES.senior.levels };
    return {
      source: "fast_path",
      actionType: "profile",
      profile: "senior",
      newLevels: updated,
      message: isId ? "👵 Profil Senior diaktifkan (Teks +25% + Spasi Renggang + Sorot Tautan)." : "👵 Senior Profile activated (Text +25% + Relaxed Spacing + Highlight Links).",
    };
  }

  // 4. Step Text Size (Increase / Decrease)
  if (
    /(perbesar|tambah besar|lebih besar|perbesar teks|font besar|huruf besar|zoom in|tulisannya kekecilan|kekecilan|tulisan kecil|huruf kecil|text is too small|too small|make it larger|make larger|make it bigger|make bigger|larger text|bigger text|large text|big text|increase font|increase text|enlarge text|enlarge|bigger font|larger font)/i.test(text)
  ) {
    const current = currentLevels.textSize || 0;
    const next = Math.min(current + 1, 4); // Max +100%
    const tool = A11Y_TOOLS.find(t => t.id === "textSize")!;
    const updated = { ...currentLevels, textSize: next };
    return {
      source: "fast_path",
      actionType: "step",
      feature: "textSize",
      direction: "increase",
      value: tool.options[next],
      newLevels: updated,
      message: isId ? `🔍 Ukuran teks dinaikkan ke ${tool.options[next]}.` : `🔍 Text size increased to ${tool.options[next]}.`,
    };
  }
  if (
    /(perkecil|lebih kecil|kurangi ukuran|kecilkan teks|zoom out|tulisannya kebesaran|kebesaran|terlalu besar|make it smaller|make smaller|smaller text|decrease font|decrease text|shrink text|shrink|too big|too large)/i.test(text)
  ) {
    const current = currentLevels.textSize || 0;
    const next = Math.max(current - 1, 0);
    const tool = A11Y_TOOLS.find(t => t.id === "textSize")!;
    const updated = { ...currentLevels, textSize: next };
    return {
      source: "fast_path",
      actionType: "step",
      feature: "textSize",
      direction: "decrease",
      value: tool.options[next],
      newLevels: updated,
      message: isId ? `🔍 Ukuran teks diubah ke ${tool.options[next]}.` : `🔍 Text size decreased to ${tool.options[next]}.`,
    };
  }

  // 5. TTS / Bacakan
  if (/(bacakan|suarakan|dengarkan|baca keras|read aloud|bicara|tts|read this|read page|read text|speak|text to speech|audio)/i.test(text)) {
    const updated = { ...currentLevels, tts: 1 };
    return {
      source: "fast_path",
      actionType: "set",
      feature: "tts",
      value: "On",
      newLevels: updated,
      message: isId ? "🔊 Text-to-Speech diaktifkan. Membacakan ringkasan halaman..." : "🔊 Text-to-Speech activated. Reading page text aloud...",
    };
  }

  // 6. Spotlight / Sorot Baris
  if (/(spotlight|sorot baris|pemandu baca|fokus baris|senter|reading spotlight|reading guide|focus line)/i.test(text)) {
    const updated = { ...currentLevels, spotlight: 1 };
    return {
      source: "fast_path",
      actionType: "set",
      feature: "spotlight",
      value: "On",
      newLevels: updated,
      message: isId ? "🔦 Reading Spotlight diaktifkan untuk membantu fokus baris demi baris." : "🔦 Reading Spotlight activated to assist line-by-line reading.",
    };
  }

  // 7. Kontras / Mode Gelap / Screen Glare
  if (/(mode gelap|dark mode|gelap|silau|terlalu terang|kontras tinggi|high contrast|screen glare|too bright|glare)/i.test(text)) {
    const updated = { ...currentLevels, contrast: 1 }; // High
    return {
      source: "fast_path",
      actionType: "set",
      feature: "contrast",
      value: "High",
      newLevels: updated,
      message: isId ? "🌗 Mode Kontras Tinggi diaktifkan untuk mengurangi silau mata." : "🌗 High Contrast Mode activated to reduce screen glare.",
    };
  }
  if (/(invert|balik warna|inverted)/i.test(text)) {
    const updated = { ...currentLevels, contrast: 2 }; // Invert
    return {
      source: "fast_path",
      actionType: "set",
      feature: "contrast",
      value: "Invert",
      newLevels: updated,
      message: isId ? "🌗 Warna tampilan dibalik (Invert)." : "🌗 Screen colors inverted.",
    };
  }

  // 8. Animasi
  if (/(animasi|jeda animasi|stop animasi|hentikan animasi|pusing|pause animation|stop animation|freeze animation|motion)/i.test(text)) {
    const updated = { ...currentLevels, pauseAnim: 1 };
    return {
      source: "fast_path",
      actionType: "set",
      feature: "pauseAnim",
      value: "Paused",
      newLevels: updated,
      message: isId ? "⏸ Semua animasi dan pergerakan di halaman dijeda." : "⏸ All animations and motion effects paused.",
    };
  }

  // 9. Links
  if (/(sorot link|highlight link|tautan|garis bawahi link|highlight links|underline link)/i.test(text)) {
    const updated = { ...currentLevels, links: 1 };
    return {
      source: "fast_path",
      actionType: "set",
      feature: "links",
      value: "Highlight",
      newLevels: updated,
      message: isId ? "🔗 Semua tautan kini diberi sorotan warna terang." : "🔗 All hyperlinks are now highlighted.",
    };
  }

  // 10. Kursor Besar
  if (/(kursor|cursor|mouse besar|pointer besar|big cursor|large cursor|large pointer)/i.test(text)) {
    const updated = { ...currentLevels, bigCursor: 1 };
    return {
      source: "fast_path",
      actionType: "set",
      feature: "bigCursor",
      value: "Large (Black)",
      newLevels: updated,
      message: isId ? "🖱️ Kursor diperbesar untuk memudahkan navigasi mouse." : "🖱️ Cursor enlarged for easier mouse tracking.",
    };
  }

  return null;
}

/**
 * Intelligent Local Complaint Mapper (Fallback saat LLM Offline)
 */
export function mapComplaintFallback(
  input: string,
  currentLevels: Record<string, number>,
  isId: boolean = false
): A11yCommandResult {
  const text = input.toLowerCase();
  const updated = { ...currentLevels };
  const applied: string[] = [];

  if (text.includes("capek") || text.includes("lelah") || text.includes("perih") || text.includes("hurt") || text.includes("tired") || text.includes("strain") || text.includes("fatigue")) {
    updated.contrast = 1; // High
    updated.textSize = Math.min((updated.textSize || 0) + 1, 3); // +25% or +50%
    applied.push(isId ? "Kontras Tinggi" : "High Contrast", isId ? "Ukuran Teks Lebih Besar" : "Larger Text Size");
  } else if (text.includes("susah baca") || text.includes("tidak jelas") || text.includes("kecil") || text.includes("hard to read") || text.includes("can't read") || text.includes("cant read") || text.includes("small")) {
    updated.textSize = Math.min((updated.textSize || 0) + 2, 4);
    updated.textSpacing = 1;
    applied.push(isId ? "Teks +50%" : "Text +50%", isId ? "Jarak Huruf" : "Letter Spacing");
  } else if (text.includes("terlalu ramai") || text.includes("susah fokus") || text.includes("banyak iklan") || text.includes("hard to focus") || text.includes("distracted")) {
    updated.spotlight = 1;
    updated.pauseAnim = 1;
    applied.push(isId ? "Reading Spotlight" : "Reading Spotlight", isId ? "Pause Animasi" : "Pause Animations");
  } else {
    updated.textSize = Math.min((updated.textSize || 0) + 1, 4);
    applied.push(isId ? "Ukuran Teks +25%" : "Text Size +25%");
  }

  return {
    source: "fallback",
    actionType: "set",
    newLevels: updated,
    message: isId ? `✨ Menyesuaikan tampilan: ${applied.join(" & ")}.` : `✨ Visual adjustment applied: ${applied.join(" & ")}.`,
  };
}

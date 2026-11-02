// OWLY.AI — Multilingual Translations System
// Supported Locales: 14 Global & Regional Languages with Web Speech API Compatibility

export type SupportedLanguage =
  | "en" // English (US - American English, Default)
  | "id" // Bahasa Indonesia
  | "es" // Español (Spanish)
  | "zh" // 中文 (Chinese Simplified)
  | "ar" // العربية (Arabic)
  | "ja" // 日本語 (Japanese)
  | "fr" // Français (French)
  | "de" // Deutsch (German)
  | "pt" // Português (Portuguese)
  | "hi" // हिन्दी (Hindi)
  | "ko" // 한국어 (Korean)
  | "ms" // Bahasa Melayu (Malay)
  | "vi" // Tiếng Việt (Vietnamese)
  | "th"; // ไทย (Thai)

export const SPEECH_LANG_MAP: Record<SupportedLanguage, string> = {
  en: "en-US",
  id: "id-ID",
  es: "es-ES",
  zh: "zh-CN",
  ar: "ar-SA",
  ja: "ja-JP",
  fr: "fr-FR",
  de: "de-DE",
  pt: "pt-BR",
  hi: "hi-IN",
  ko: "ko-KR",
  ms: "ms-MY",
  vi: "vi-VN",
  th: "th-TH",
};

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string;
}

export const LANGUAGE_METADATA: LanguageMeta[] = [
  { code: "en", name: "English (US)", nativeName: "American English", flag: "🇺🇸", speechCode: "en-US" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩", speechCode: "id-ID" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", speechCode: "es-ES" },
  { code: "zh", name: "Chinese (Simplified)", nativeName: "简体中文", flag: "🇨🇳", speechCode: "zh-CN" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", speechCode: "ar-SA" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", speechCode: "ja-JP" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", speechCode: "fr-FR" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", speechCode: "de-DE" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷", speechCode: "pt-BR" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", speechCode: "hi-IN" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷", speechCode: "ko-KR" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", flag: "🇲🇾", speechCode: "ms-MY" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳", speechCode: "vi-VN" },
  { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭", speechCode: "th-TH" },
];

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
    micReadyBadge: string;
    voiceCompanionTooltip: string;
    closeVoiceTooltip: string;
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
    clearAllBtn: string;
    clearAllTooltip: string;
    emptyProfileTitle: string;
    loadDemoBtn: string;
    btnUploadOrDrop: string;
  };
  audit: {
    summaryTitle: string;
    formScore: string;
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
    cycleTooltip: string;
    tools: Record<string, { title: string; options: string[] }>;
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
    autoScroll: string;
    autoScrollTooltip: string;
    noLogsTitle: string;
    noLogsDesc: string;
    collapse: string;
    payload: string;
    activeThreads: string;
    logsCount: string;
    workerLabel: string;
  };
  welcome: {
    title: string;
    subtitle: string;
    selectPrompt: string;
    btnConfirm: string;
    footerNote: string;
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

/**
 * Strict System Guardrail: Guarantees that the AI generates output strictly
 * in the user's chosen language, regardless of the language of any snipped images,
 * form labels, or underlying webpage content.
 */
export function getLanguageGuardrail(lang: SupportedLanguage | string): string {
  const meta = LANGUAGE_METADATA.find((m) => m.code === lang) || LANGUAGE_METADATA[0];
  return `[OUTPUT LANGUAGE REQUIREMENT: You MUST generate your ENTIRE response in ${meta.name} (${meta.nativeName} - ${meta.code}). Even if the user prompt, input text, form labels, or snipped image content are in Indonesian, English, or any other language, you MUST translate and provide all explanations, guidance, instructions, and replies solely in ${meta.name} (${meta.nativeName}). Do not respond in the source language.]`;
}

/**
 * Web Speech API Voice Picker: Strictly matches the native voice speaker
 * for the target language. Crucially, NEVER returns a fallback voice from another
 * language (e.g. an Indonesian voice for Thai), preventing unnatural accent distortions.
 */
export function selectVoiceForLanguage(
  voices: SpeechSynthesisVoice[],
  targetLanguage: SupportedLanguage | string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;
  const speechCode = SPEECH_LANG_MAP[targetLanguage as SupportedLanguage] || "en-US";
  const langPrefix = targetLanguage.toLowerCase().split("-")[0];
  const targetTag = speechCode.toLowerCase();

  // 1. Exact BCP-47 match (e.g., 'th-th' or 'th_th')
  const exact = voices.find(
    (v) => v.lang.toLowerCase().replace("_", "-") === targetTag
  );
  if (exact) return exact;

  // 2. Prefix match on primary language subtag (e.g., starts with 'th-' or 'th_')
  const prefix = voices.find((v) => {
    const l = v.lang.toLowerCase().replace("_", "-");
    return l.startsWith(langPrefix + "-") || l === langPrefix;
  });
  if (prefix) return prefix;

  // 3. Fallback: Check if voice name contains the language name
  const meta = LANGUAGE_METADATA.find((m) => m.code === targetLanguage);
  if (meta) {
    const nameMatch = voices.find(
      (v) =>
        v.name.toLowerCase().includes(meta.name.toLowerCase()) ||
        v.name.toLowerCase().includes(meta.nativeName.toLowerCase())
    );
    if (nameMatch) return nameMatch;
  }

  // CRITICAL: NEVER return a voice from another language (e.g., Indonesian or English voice reading Thai)!
  // Returning null allows the browser's native engine to handle utterance.lang cleanly.
  return null;
}


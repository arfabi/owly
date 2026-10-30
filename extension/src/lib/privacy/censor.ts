// ============================================================================
// SAVVY.AI — Client-Side PII Censor Guard
// Real-time regex interception for NIK, NPWP, and Account Numbers in Chat
// ============================================================================

export interface PiiDetectionResult {
  hasPII: boolean;
  detectedTypes: string[];
  redactedText: string;
  originalText: string;
  warningMessage?: string;
}

// Regex patterns
const NIK_REGEX = /\b([1-9][0-9]{5}[0-7][0-9][0-1][0-9][0-9]{4})\b/g;
const NPWP_REGEX = /\b(\d{2}\.?\d{3}\.?\d{3}\.?\d{1}-?\d{3}\.?\d{3}|\d{15,16})\b/g;
const CREDIT_CARD_REGEX = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;

/**
 * Checks text for sensitive personal identification numbers.
 * Provides client-side warning before text is sent to LLM prompt.
 */
export function inspectAndRedactPII(input: string): PiiDetectionResult {
  const detectedTypes: string[] = [];
  let redacted = input;

  // 1. Detect NIK (16 digits)
  if (NIK_REGEX.test(input)) {
    detectedTypes.push("NIK (Nomor Induk Kependudukan)");
    redacted = redacted.replace(NIK_REGEX, (match) => {
      return `[REDACTED_NIK_${match.slice(0, 4)}****${match.slice(-4)}]`;
    });
  }

  // 2. Detect NPWP (15-16 digits)
  if (NPWP_REGEX.test(input)) {
    // Avoid double counting if already matched as NIK
    if (!detectedTypes.includes("NIK (Nomor Induk Kependudukan)")) {
      detectedTypes.push("NPWP (Nomor Pokok Wajib Pajak)");
    }
    redacted = redacted.replace(NPWP_REGEX, "[REDACTED_NPWP]");
  }

  // 3. Detect Credit Card (16 digits)
  if (CREDIT_CARD_REGEX.test(input)) {
    detectedTypes.push("Nomor Kartu Keuangan / Kredit");
    redacted = redacted.replace(CREDIT_CARD_REGEX, "[REDACTED_CARD_NUMBER]");
  }

  const hasPII = detectedTypes.length > 0;

  let warningMessage: string | undefined = undefined;
  if (hasPII) {
    warningMessage = `⚠️ Peringatan Privasi: Pesan Anda terdeteksi memuat ${detectedTypes.join(
      ", "
    )}. Demi keamanan Anda, nomor ini disamarkan. Mohon simpan data rahasia di Private Vault terenkripsi agar tidak terkirim ke jaringan terbuka!`;
  }

  return {
    hasPII,
    detectedTypes,
    redactedText: redacted,
    originalText: input,
    warningMessage,
  };
}

// ============================================================================
// OWLY.AI — Client-Side PII Censor Guard
// Real-time regex interception for NIK, NPWP, and Account Numbers in Chat
// Multilingual support: American English (default) & Bahasa Indonesia
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
export function inspectAndRedactPII(input: string, lang: "en" | "id" = "en"): PiiDetectionResult {
  const detectedTypes: string[] = [];
  let redacted = input;

  const isId = lang === "id";

  // 1. Detect NIK (16 digits)
  if (NIK_REGEX.test(input)) {
    detectedTypes.push(isId ? "NIK (Nomor Induk Kependudukan)" : "National ID (NIK)");
    redacted = redacted.replace(NIK_REGEX, (match) => {
      return `[REDACTED_NIK_${match.slice(0, 4)}****${match.slice(-4)}]`;
    });
  }

  // 2. Detect NPWP (15-16 digits)
  if (NPWP_REGEX.test(input)) {
    const nikLabel = isId ? "NIK (Nomor Induk Kependudukan)" : "National ID (NIK)";
    if (!detectedTypes.includes(nikLabel)) {
      detectedTypes.push(isId ? "NPWP (Nomor Pokok Wajib Pajak)" : "Tax ID (NPWP)");
    }
    redacted = redacted.replace(NPWP_REGEX, "[REDACTED_NPWP]");
  }

  // 3. Detect Credit Card (16 digits)
  if (CREDIT_CARD_REGEX.test(input)) {
    detectedTypes.push(isId ? "Nomor Kartu Keuangan / Kredit" : "Payment / Credit Card Number");
    redacted = redacted.replace(CREDIT_CARD_REGEX, "[REDACTED_CARD_NUMBER]");
  }

  const hasPII = detectedTypes.length > 0;

  let warningMessage: string | undefined = undefined;
  if (hasPII) {
    if (isId) {
      warningMessage = `⚠️ Peringatan Privasi: Pesan Anda terdeteksi memuat ${detectedTypes.join(
        ", "
      )}. Demi keamanan Anda, nomor ini disamarkan. Mohon simpan data rahasia di Private Vault terenkripsi agar tidak terkirim ke jaringan terbuka!`;
    } else {
      warningMessage = `⚠️ Privacy Alert: Your message contains ${detectedTypes.join(
        ", "
      )}. For your protection, this sensitive number has been redacted. Please save confidential details in your encrypted Private Vault so they are never sent over open networks!`;
    }
  }

  return {
    hasPII,
    detectedTypes,
    redactedText: redacted,
    originalText: input,
    warningMessage,
  };
}

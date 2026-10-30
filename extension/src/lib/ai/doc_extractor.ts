// ============================================================================
// SAVVY.AI — Multimodal Document Vision Extractor (Muse Spark Open via Baseten)
// Ephemeral, zero-retention extraction complying with UU PDP No. 27/2022
// ============================================================================

import { applyBlackoutMask, KTP_DEFAULT_MASKS } from "../privacy/masking";

export interface ExtractedDocumentData {
  documentType: "KTP" | "Passport" | "Transcript" | "Certificate" | "Unknown";
  nik?: string;
  fullName?: string;
  birthDate?: string;
  birthPlace?: string;
  gender?: string;
  address?: string;
  rawText?: string;
}

/**
 * Extracts document fields by first applying client-side blackout mask over
 * biometrics, then passing the masked image to the vision API.
 */
export async function extractDocumentWithMask(
  imageSource: string, // Data URI or URL
  apiBaseUrl: string = "https://savvy-companion.vercel.app"
): Promise<ExtractedDocumentData> {
  // Step 1: Client-Side Biometric Face Blackout Mask
  const maskedImageDataUrl = await applyBlackoutMask(imageSource, KTP_DEFAULT_MASKS);

  // Step 2: Send masked image to /api/explain with extraction prompt
  try {
    const res = await fetch(`${apiBaseUrl}/api/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_base64: maskedImageDataUrl,
        context_label: "Ekstraksi Dokumen KTP Resmi RI untuk Vault",
        portal_url: "savvy-vault-extraction",
      }),
    });

    if (!res.ok) {
      throw new Error(`Ekstraksi gagal: HTTP ${res.status}`);
    }

    const json = await res.json();
    const explanation = json.explanation || "";

    // Regex extract common fields from AI explanation
    const nikMatch = explanation.match(/\b([1-9][0-9]{15})\b/);
    const nameMatch = explanation.match(/(?:Nama|Name)[\s:]+([A-Z\s]{3,40})/i);
    const dobMatch = explanation.match(/(?:Tanggal Lahir|Lahir|DOB)[\s:]+([0-9\/-]{8,10})/i);

    return {
      documentType: "KTP",
      nik: nikMatch ? nikMatch[1] : undefined,
      fullName: nameMatch ? nameMatch[1].trim() : undefined,
      birthDate: dobMatch ? dobMatch[1].trim() : undefined,
      rawText: explanation,
    };
  } catch (err: any) {
    console.error("[Savvy.AI DocExtractor] Error:", err);
    throw err;
  }
}

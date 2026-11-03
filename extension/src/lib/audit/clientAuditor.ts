// ============================================================================
// OWLY.AI — Client-Side Deterministic & Zero-Knowledge Vault Form Auditor
// Ultra-fast (<5ms), zero API cost, mathematical accuracy, 100% private.
// ============================================================================

import { SupportedLanguage } from "../i18n/types";
import { getAuditI18n } from "./auditI18n";

export interface ScrapedFormField {
  fieldId: string;
  name: string;
  label: string;
  currentValue: string;
  surroundingContext?: string;
  rules: {
    isRequired: boolean;
    placeholder?: string;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    type: string;
    inputMaskDetected?: string;
    accept?: string;
  };
}

export interface PageUploadContext {
  pageWideFileInstructions: string[];
  attachedFilesMetadata: {
    fieldName: string;
    fileName: string;
    fileSizeKb: number;
    fileExtension: string;
  }[];
}

export interface VaultProfileItem {
  id: string;
  name: string;
  value: string;
  aliases: string[];
  sourceTag?: string;
}

export interface AuditAction {
  label: string;
  actionType: "HIGHLIGHT" | "REPLACE_VALUE" | "OPEN_VAULT";
  replaceValue?: string;
  fieldId?: string;
  fieldName?: string;
}

export interface AuditIssue {
  id: string;
  fieldId: string;
  fieldName: string;
  fieldLabel: string;
  level: "red" | "yellow" | "green";
  badge: "REQUIRED" | "FORMAT" | "DISCREPANCY" | "ATTACHMENT" | "RULE" | "VALID" | "WAJIB" | "SUMBER" | "BERKAS" | "ATURAN";
  message: string;
  hint?: string;
  juknisRef?: string;
  action?: AuditAction;
}

export interface ComprehensiveAuditReport {
  overallStatus: "green" | "yellow" | "red";
  score: number; // 0 - 100
  issues: AuditIssue[];
  passedCount: number; // Kolom aman (0 isu)
  warningCount: number; // Kolom dengan peringatan
  dangerCount: number; // Kolom dengan kendala fatal
  passedFieldsCount: number;
  warningFieldsCount: number;
  dangerFieldsCount: number;
  dangerIssuesCount: number;
  warningIssuesCount: number;
  totalFieldsScanned: number;
  vaultConnected: boolean;
}

// ---------------------------------------------------------------------------
// 1. DETERMINISTIC VALIDATORS (NIK, No HP, Email, Paspor)
// ---------------------------------------------------------------------------

export function validateIndonesianNIK(nik: string, lang: SupportedLanguage = "en"): {
  isValid: boolean;
  reason?: string;
  parsed?: {
    provinceCode: number;
    birthDay: number;
    birthMonth: number;
    birthYear2Digit: number;
    isFemale: boolean;
  };
} {
  const i18n = getAuditI18n(lang);
  const clean = nik.replace(/\D/g, "");
  if (clean.length !== 16) {
    return {
      isValid: false,
      reason: i18n.nikLength(clean.length),
    };
  }

  const prov = parseInt(clean.substring(0, 2), 10);
  if (prov < 11 || prov > 94) {
    return {
      isValid: false,
      reason: i18n.nikProv(prov),
    };
  }

  const rawDay = parseInt(clean.substring(6, 8), 10);
  // Algoritma Resmi Dukcapil: Wanita = Tanggal Lahir + 40 (rentang 41-71)
  const isFemale = rawDay > 40;
  const day = isFemale ? rawDay - 40 : rawDay;
  const month = parseInt(clean.substring(8, 10), 10);
  const year2D = parseInt(clean.substring(10, 12), 10);

  if (day < 1 || day > 31 || month < 1 || month > 12) {
    return {
      isValid: false,
      reason: i18n.nikDateInvalid(rawDay, month),
    };
  }

  return {
    isValid: true,
    parsed: {
      provinceCode: prov,
      birthDay: day,
      birthMonth: month,
      birthYear2Digit: year2D,
      isFemale,
    },
  };
}

export function validateGenericNationalID(idVal: string, lang: SupportedLanguage = "en"): { isValid: boolean; reason?: string } {
  const i18n = getAuditI18n(lang);
  const clean = idVal.trim();
  // Standard global National ID / Citizen ID (e.g. US SSN 9 digits, UK NI 9 chars, France 13-15 chars, Spain DNI 9 chars, etc.)
  // Must be between 5 and 25 characters, alphanumeric with optional dashes or spaces
  if (clean.length < 5 || clean.length > 25) {
    return {
      isValid: false,
      reason: i18n.globalIdInvalid,
    };
  }
  if (!/^[A-Za-z0-9\-\s]+$/.test(clean)) {
    return {
      isValid: false,
      reason: i18n.globalIdInvalid,
    };
  }
  return { isValid: true };
}

export function validatePhoneNumber(phone: string, lang: SupportedLanguage = "en"): { isValid: boolean; reason?: string } {
  const i18n = getAuditI18n(lang);
  const clean = phone.replace(/[^\d+]/g, "");
  if (!clean) return { isValid: false, reason: i18n.phoneEmpty };

  // 1. International E.164 format (starts with '+')
  if (clean.startsWith("+")) {
    const digitsOnly = clean.substring(1);
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return {
        isValid: false,
        reason: i18n.phoneLength(digitsOnly.length, clean),
      };
    }
    return { isValid: true };
  }

  // 2. Domestic / Standard formats (accepts both Indonesian 08xx and global domestic 7-15 digits)
  let digits = clean;
  if (digits.length < 7 || digits.length > 15) {
    return {
      isValid: false,
      reason: i18n.phoneLength(digits.length, digits),
    };
  }

  return { isValid: true };
}

export const validateIndonesianPhone = validatePhoneNumber;

export function validateRFC5322Email(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePassportICAO(passport: string, lang: SupportedLanguage = "en"): { isValid: boolean; reason?: string } {
  const i18n = getAuditI18n(lang);
  const clean = passport.trim().toUpperCase();
  // Standar ICAO 9303: 1 huruf + 7-8 digit angka
  if (!/^[A-Z][0-9]{7,8}$/.test(clean)) {
    return {
      isValid: false,
      reason: i18n.passportFormat,
    };
  }
  return { isValid: true };
}

// ---------------------------------------------------------------------------
// 2. LEVENSHTEIN DISTANCE FOR CLIENT-SIDE ZERO-KNOWLEDGE TYPO CATCHING
// ---------------------------------------------------------------------------

function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array.from({ length: bn + 1 }, () => Array(an + 1).fill(0));
  for (let i = 0; i <= an; i++) matrix[0][i] = i;
  for (let j = 0; j <= bn; j++) matrix[j][0] = j;

  for (let j = 1; j <= bn; j++) {
    for (let i = 1; i <= an; i++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1,
        matrix[j][i - 1] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }
  return matrix[bn][an];
}

// ---------------------------------------------------------------------------
// 3. COMPREHENSIVE MULTI-LAYER AUDIT ENGINE (NON-BLOCKING ACCUMULATOR)
// ---------------------------------------------------------------------------

export function runClientSideComprehensiveAudit(
  fields: ScrapedFormField[],
  pageUploadContext: PageUploadContext,
  vaultItems: VaultProfileItem[] = [],
  language: SupportedLanguage = "en"
): ComprehensiveAuditReport {
  const issues: AuditIssue[] = [];
  const i18n = getAuditI18n(language);

  // Indexing map untuk pencocokan nalar silang antar-kolom di form
  const fieldMap: Record<string, ScrapedFormField> = {};
  fields.forEach((f) => {
    const key = (f.name || f.fieldId || f.label || "").toLowerCase();
    fieldMap[key] = f;
  });

  const getFieldValue = (pattern: RegExp): string => {
    for (const [k, f] of Object.entries(fieldMap)) {
      if (pattern.test(k) || pattern.test(f.label.toLowerCase())) {
        return f.currentValue;
      }
    }
    return "";
  };

  const formNik = getFieldValue(/\b(nik|ktp|e-ktp|kependudukan)\b/);
  const formBirthDate = getFieldValue(/tgl|tanggal.*lahir|birth.*date|dob/);
  const formGender = getFieldValue(/gender|kelamin|jenis.*kelamin/);

  // Parse NIK sekali jika tersedia
  let parsedNik: any = null;
  if (formNik) {
    const res = validateIndonesianNIK(formNik, language);
    if (res.isValid && res.parsed) {
      parsedNik = res.parsed;
    }
  }

  // Evaluasi setiap field satu per satu (Non-Blocking)
  fields.forEach((f) => {
    const label = f.label || f.name || f.fieldId || i18n.fieldWord;
    const val = f.currentValue.trim();
    const lowerLabel = label.toLowerCase();
    const type = f.rules.type.toLowerCase();

    // =========================================================================
    // LAYER 1: DOM & FORM CONSTRAINTS
    // =========================================================================

    // 1.1 Required check
    if (f.rules.isRequired && !val) {
      issues.push({
        id: `req_${f.fieldId}`,
        fieldId: f.fieldId,
        fieldName: f.name,
        fieldLabel: label,
        level: "red",
        badge: "REQUIRED",
        message: i18n.requiredMessage(label),
        hint: f.rules.placeholder
          ? i18n.requiredHintPlaceholder(f.rules.placeholder)
          : i18n.requiredHintGeneral,
        action: {
          label: i18n.highlightAction,
          actionType: "HIGHLIGHT",
          fieldId: f.fieldId,
          fieldName: f.name,
        },
      });
      return; // Jika kosong, lewati cek format isi
    }

    // Jika ada nilai, periksa minLength bawaan
    if (val && f.rules.minLength && val.length < f.rules.minLength) {
      issues.push({
        id: `minlen_${f.fieldId}`,
        fieldId: f.fieldId,
        fieldName: f.name,
        fieldLabel: label,
        level: "red",
        badge: "FORMAT",
        message: i18n.minlenMessage(label, val.length, f.rules.minLength),
        hint: f.rules.placeholder ? i18n.minlenHint(f.rules.placeholder) : undefined,
        action: {
          label: i18n.highlightAction,
          actionType: "HIGHLIGHT",
          fieldId: f.fieldId,
          fieldName: f.name,
        },
      });
    }

    if (!val) return; // Kolom opsional yang kosong tidak diaudit formatnya

    // =========================================================================
    // LAYER 2: FORMAT BAKU STANDAR & NALAR SILANG
    // =========================================================================

    // 2.1 Audit NIK (Indonesia) vs Generic National ID (Global)
    const isExplicitNik = /\b(nik|ktp|e-ktp|kependudukan)\b/i.test(lowerLabel);
    const isGenericNationalId =
      lowerLabel.includes("national id") ||
      lowerLabel.includes("citizen id") ||
      lowerLabel.includes("government id") ||
      lowerLabel.includes("id card") ||
      lowerLabel.includes("no. identitas") ||
      lowerLabel.includes("nomor identitas") ||
      lowerLabel.includes("identity number");

    if (isExplicitNik) {
      // Indonesian NIK: 16-digit Dukcapil validation & cross-reasoning
      const nikRes = validateIndonesianNIK(val, language);
      if (!nikRes.isValid) {
        issues.push({
          id: `nik_${f.fieldId}`,
          fieldId: f.fieldId,
          fieldName: f.name,
          fieldLabel: label,
          level: "red",
          badge: "FORMAT",
          message: nikRes.reason || i18n.nikInvalid,
          hint: i18n.nikHint,
          juknisRef: "UU Adminduk No. 24/2013",
          action: { label: i18n.highlightAction, actionType: "HIGHLIGHT", fieldId: f.fieldId, fieldName: f.name },
        });
      } else {
        // NIK Valid format, lakukan Nalar Silang terhadap Tanggal Lahir form jika ada
        const { birthDay, birthMonth, isFemale } = nikRes.parsed!;
        if (formBirthDate) {
          const parts = formBirthDate.split(/[-/]/).map((p) => parseInt(p, 10));
          let formDay = 0;
          let formMonth = 0;
          if (parts[0] > 1900) {
            formMonth = parts[1];
            formDay = parts[2];
          } else {
            formDay = parts[0];
            formMonth = parts[1];
          }

          if (formDay > 0 && (formDay !== birthDay || formMonth !== birthMonth)) {
            issues.push({
              id: `nik_dob_mismatch_${f.fieldId}`,
              fieldId: f.fieldId,
              fieldName: f.name,
              fieldLabel: label,
              level: "red",
              badge: "FORMAT",
              message: i18n.nikDobMismatch(birthDay, birthMonth, formDay, formMonth),
              hint: i18n.nikDobHint,
              action: { label: i18n.highlightAction, actionType: "HIGHLIGHT", fieldId: f.fieldId, fieldName: f.name },
            });
          }
        }

        // Nalar Silang terhadap Jenis Kelamin Form jika ada
        if (formGender) {
          const isFormFemale = /perempuan|wanita|female|^p$/i.test(formGender);
          const isFormMale = /laki|pria|male|^l$/i.test(formGender);
          if ((isFemale && isFormMale) || (!isFemale && isFormFemale)) {
            issues.push({
              id: `nik_gender_mismatch_${f.fieldId}`,
              fieldId: f.fieldId,
              fieldName: f.name,
              fieldLabel: label,
              level: "red",
              badge: "FORMAT",
              message: i18n.nikGenderMismatch(isFemale ? i18n.female : i18n.male, formGender),
              hint: i18n.nikGenderHint,
              action: { label: i18n.highlightAction, actionType: "HIGHLIGHT", fieldId: f.fieldId, fieldName: f.name },
            });
          }
        }
      }
    } else if (isGenericNationalId) {
      // Global National ID: International standard validation (5–25 alphanumeric characters)
      const genRes = validateGenericNationalID(val, language);
      if (!genRes.isValid) {
        issues.push({
          id: `national_id_${f.fieldId}`,
          fieldId: f.fieldId,
          fieldName: f.name,
          fieldLabel: label,
          level: "red",
          badge: "FORMAT",
          message: genRes.reason || i18n.globalIdInvalid,
          hint: i18n.globalIdHint,
          action: { label: i18n.highlightAction, actionType: "HIGHLIGHT", fieldId: f.fieldId, fieldName: f.name },
        });
      }
    }

    // 2.2 Audit No Handphone / Phone Number (E.164 International & Domestic)
    else if (lowerLabel.includes("hp") || lowerLabel.includes("handphone") || lowerLabel.includes("telepon") || lowerLabel.includes("phone") || lowerLabel.includes("whatsapp") || type === "tel") {
      const phoneRes = validatePhoneNumber(val, language);
      if (!phoneRes.isValid) {
        issues.push({
          id: `phone_${f.fieldId}`,
          fieldId: f.fieldId,
          fieldName: f.name,
          fieldLabel: label,
          level: "red",
          badge: "FORMAT",
          message: phoneRes.reason || i18n.phoneInvalid,
          hint: i18n.phoneHint,
          action: { label: i18n.highlightAction, actionType: "HIGHLIGHT", fieldId: f.fieldId, fieldName: f.name },
        });
      }
    }

    // 2.3 Audit Email
    else if (lowerLabel.includes("email") || lowerLabel.includes("surel") || type === "email") {
      if (!validateRFC5322Email(val)) {
        issues.push({
          id: `email_${f.fieldId}`,
          fieldId: f.fieldId,
          fieldName: f.name,
          fieldLabel: label,
          level: "red",
          badge: "FORMAT",
          message: i18n.emailInvalid,
          hint: i18n.emailHint,
          action: { label: i18n.highlightAction, actionType: "HIGHLIGHT", fieldId: f.fieldId, fieldName: f.name },
        });
      }
    }

    // 2.4 Audit Passport Number (strictly for text inputs, not file uploads or photos)
    else if (
      type !== "file" &&
      !lowerLabel.includes("foto") &&
      !lowerLabel.includes("photo") &&
      !lowerLabel.includes("scan") &&
      !lowerLabel.includes("berkas") &&
      !lowerLabel.includes("doc") &&
      (lowerLabel.includes("paspor") || lowerLabel.includes("passport"))
    ) {
      const passRes = validatePassportICAO(val, language);
      if (!passRes.isValid) {
        issues.push({
          id: `passport_${f.fieldId}`,
          fieldId: f.fieldId,
          fieldName: f.name,
          fieldLabel: label,
          level: "red",
          badge: "FORMAT",
          message: passRes.reason || i18n.passportInvalid,
          hint: i18n.passportHint,
          action: { label: i18n.highlightAction, actionType: "HIGHLIGHT", fieldId: f.fieldId, fieldName: f.name },
        });
      }
    }

    // 2.5 Audit Essay / Research Proposal Abstract Word Count (min. 50 words)
    else if (
      type === "textarea" ||
      lowerLabel.includes("proposal") ||
      lowerLabel.includes("abstract") ||
      lowerLabel.includes("abstrak") ||
      lowerLabel.includes("esai") ||
      lowerLabel.includes("essay")
    ) {
      const words = val.trim().split(/\s+/).filter(Boolean);
      const wordCount = words.length;
      if (wordCount < 50) {
        issues.push({
          id: `word_count_${f.fieldId}`,
          fieldId: f.fieldId,
          fieldName: f.name,
          fieldLabel: label,
          level: "red",
          badge: "FORMAT",
          message: i18n.proposalShortMessage(label, wordCount),
          hint: i18n.proposalShortHint,
          action: { label: i18n.highlightAction, actionType: "HIGHLIGHT", fieldId: f.fieldId, fieldName: f.name },
        });
      }
    }

    // 2.6 Audit Full Name (Typo numeric / symbols)
    else if (lowerLabel.includes("nama") || lowerLabel.includes("name")) {
      if (!lowerLabel.includes("ibu") && !lowerLabel.includes("mother") && !lowerLabel.includes("kampus") && !lowerLabel.includes("university")) {
        if (val.length < 3) {
          issues.push({
            id: `name_len_${f.fieldId}`,
            fieldId: f.fieldId,
            fieldName: f.name,
            fieldLabel: label,
            level: "red",
            badge: "FORMAT",
            message: i18n.nameShort,
            action: { label: i18n.highlightAction, actionType: "HIGHLIGHT", fieldId: f.fieldId, fieldName: f.name },
          });
        } else if (/\d/.test(val)) {
          issues.push({
            id: `name_num_${f.fieldId}`,
            fieldId: f.fieldId,
            fieldName: f.name,
            fieldLabel: label,
            level: "red",
            badge: "FORMAT",
            message: i18n.nameDigits(val),
            hint: i18n.nameDigitsHint,
            action: { label: i18n.highlightAction, actionType: "HIGHLIGHT", fieldId: f.fieldId, fieldName: f.name },
          });
        }
      }
    }

    // =========================================================================
    // LAYER 3: ZERO-KNOWLEDGE CLIENT-SIDE VAULT RECONCILER (TYPO CATCHER)
    // =========================================================================
    if (vaultItems && vaultItems.length > 0) {
      const matchingVaultItem = vaultItems.find((vi) => {
        const vName = vi.name.toLowerCase();
        if (lowerLabel.includes(vName) || vName.includes(lowerLabel)) return true;
        if (Array.isArray(vi.aliases)) {
          return vi.aliases.some((a) => lowerLabel.includes(a.toLowerCase()) || a.toLowerCase().includes(lowerLabel));
        }
        return false;
      });

      if (matchingVaultItem && matchingVaultItem.value && val) {
        const vaultVal = matchingVaultItem.value.trim();
        if (val.toLowerCase() !== vaultVal.toLowerCase()) {
          const dist = levenshteinDistance(val, vaultVal);
          const maxLen = Math.max(val.length, vaultVal.length);
          const similarity = 1 - dist / maxLen;

          if (dist >= 1 && dist <= 3 && similarity > 0.65) {
            issues.push({
              id: `vault_mismatch_${f.fieldId}`,
              fieldId: f.fieldId,
              fieldName: f.name,
              fieldLabel: label,
              level: "yellow",
              badge: "DISCREPANCY",
              message: i18n.vaultMismatchMessage(label, val, vaultVal),
              hint: i18n.vaultMismatchHint,
              action: {
                label: i18n.useVaultAction(vaultVal),
                actionType: "REPLACE_VALUE",
                replaceValue: vaultVal,
                fieldId: f.fieldId,
                fieldName: f.name,
              },
            });
          }
        }
      }
    }
  });

  // =========================================================================
  // LAYER 4: FILE UPLOAD & PAGE CONSTRAINTS AUDIT
  // =========================================================================
  if (pageUploadContext?.attachedFilesMetadata && pageUploadContext.attachedFilesMetadata.length > 0) {
    pageUploadContext.attachedFilesMetadata.forEach((att) => {
      // 4.1 Cek ukuran file > 512 KB jika ada catatan 500 KB di halaman
      const has500KbLimit = pageUploadContext.pageWideFileInstructions.some((inst) =>
        /500\s*kb|0\.5\s*mb|maksimal 500|max.*500/i.test(inst)
      );

      if (has500KbLimit && att.fileSizeKb > 512) {
        issues.push({
          id: `file_size_${att.fieldName}`,
          fieldId: att.fieldName,
          fieldName: att.fieldName,
          fieldLabel: i18n.attachmentLabel(att.fileName),
          level: "red",
          badge: "ATTACHMENT",
          message: i18n.fileSizeExceeded(att.fileName, Math.round(att.fileSizeKb / 1024 * 10) / 10, 0.5),
          hint: i18n.fileSizeHint(0.5),
        });
      } else if (att.fileSizeKb > 5120) {
        issues.push({
          id: `file_size_max_${att.fieldName}`,
          fieldId: att.fieldName,
          fieldName: att.fieldName,
          fieldLabel: i18n.attachmentLabel(att.fileName),
          level: "red",
          badge: "ATTACHMENT",
          message: i18n.fileSizeExceeded(att.fileName, Math.round(att.fileSizeKb / 1024), 5),
          hint: i18n.fileSizeHint(5),
        });
      }

      // 4.2 Cek ekstensi file yang dilarang
      const validExts = ["pdf", "jpg", "jpeg", "png"];
      if (att.fileExtension && !validExts.includes(att.fileExtension.toLowerCase())) {
        issues.push({
          id: `file_ext_${att.fieldName}`,
          fieldId: att.fieldName,
          fieldName: att.fieldName,
          fieldLabel: i18n.attachmentLabel(att.fileName),
          level: "red",
          badge: "ATTACHMENT",
          message: i18n.fileExtInvalid(att.fileName, att.fileExtension.toUpperCase(), "PDF, JPG, PNG"),
          hint: i18n.fileExtHint("PDF, JPG, PNG"),
        });
      }
    });
  }

  // 1. Petakan isu ke setiap field unik
  const redFieldIds = new Set<string>();
  const yellowFieldIds = new Set<string>();

  issues.forEach((issue) => {
    if (issue.level === "red") {
      redFieldIds.add(issue.fieldId);
      if (issue.fieldName) redFieldIds.add(issue.fieldName);
    } else if (issue.level === "yellow") {
      yellowFieldIds.add(issue.fieldId);
      if (issue.fieldName) yellowFieldIds.add(issue.fieldName);
    }
  });

  // 2. Hitung status per-kolom secara mutlak (Invarian: Passed + Warning + Danger === Total Kolom)
  let dangerFieldsCount = 0;
  let warningFieldsCount = 0;
  let passedFieldsCount = 0;

  fields.forEach((f) => {
    const hasRed = redFieldIds.has(f.fieldId) || (f.name && redFieldIds.has(f.name));
    const hasYellow = yellowFieldIds.has(f.fieldId) || (f.name && yellowFieldIds.has(f.name));

    if (hasRed) {
      dangerFieldsCount++;
    } else if (hasYellow) {
      warningFieldsCount++;
    } else {
      passedFieldsCount++;
    }
  });

  const dangerIssuesCount = issues.filter((i) => i.level === "red").length;
  const warningIssuesCount = issues.filter((i) => i.level === "yellow").length;
  const totalScanned = Math.max(fields.length, 1);

  let overallStatus: "green" | "yellow" | "red" = "green";
  if (dangerFieldsCount > 0 || dangerIssuesCount > 0) overallStatus = "red";
  else if (warningFieldsCount > 0 || warningIssuesCount > 0) overallStatus = "yellow";

  const score = Math.max(0, Math.round(((passedFieldsCount + warningFieldsCount * 0.5) / totalScanned) * 100));

  return {
    overallStatus,
    score,
    issues,
    passedCount: passedFieldsCount,
    warningCount: warningFieldsCount,
    dangerCount: dangerFieldsCount,
    passedFieldsCount,
    warningFieldsCount,
    dangerFieldsCount,
    dangerIssuesCount,
    warningIssuesCount,
    totalFieldsScanned: fields.length,
    vaultConnected: vaultItems.length > 0,
  };
}

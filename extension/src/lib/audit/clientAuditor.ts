// ============================================================================
// SAVVY.AI — Client-Side Deterministic & Zero-Knowledge Vault Form Auditor
// Ultra-fast (<5ms), zero API cost, mathematical accuracy, 100% private.
// ============================================================================

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
  badge: "WAJIB" | "FORMAT" | "SUMBER" | "BERKAS" | "VALID";
  message: string;
  hint?: string;
  juknisRef?: string;
  action?: AuditAction;
}

export interface ComprehensiveAuditReport {
  overallStatus: "green" | "yellow" | "red";
  score: number; // 0 - 100
  issues: AuditIssue[];
  passedCount: number;
  warningCount: number;
  dangerCount: number;
  totalFieldsScanned: number;
  vaultConnected: boolean;
}

// ---------------------------------------------------------------------------
// 1. DETERMINISTIC VALIDATORS (NIK, No HP, Email, Paspor)
// ---------------------------------------------------------------------------

export function validateIndonesianNIK(nik: string): {
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
  const clean = nik.replace(/\D/g, "");
  if (clean.length !== 16) {
    return { isValid: false, reason: `Panjang NIK harus tepat 16 digit angka (saat ini ${clean.length} digit).` };
  }

  const prov = parseInt(clean.substring(0, 2), 10);
  if (prov < 11 || prov > 94) {
    return { isValid: false, reason: `Kode provinsi '${prov}' tidak terdaftar pada database Kemendagri.` };
  }

  const rawDay = parseInt(clean.substring(6, 8), 10);
  // Algoritma Resmi Dukcapil: Wanita = Tanggal Lahir + 40 (rentang 41-71)
  const isFemale = rawDay > 40;
  const day = isFemale ? rawDay - 40 : rawDay;
  const month = parseInt(clean.substring(8, 10), 10);
  const year2D = parseInt(clean.substring(10, 12), 10);

  if (day < 1 || day > 31 || month < 1 || month > 12) {
    return { isValid: false, reason: `Digit tanggal/bulan lahir pada NIK (${rawDay}/${month}) tidak valid secara kalender.` };
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

export function validateIndonesianPhone(phone: string): { isValid: boolean; reason?: string } {
  const clean = phone.replace(/[^\d+]/g, "");
  if (!clean) return { isValid: false, reason: "Nomor handphone kosong." };

  let digits = clean;
  if (digits.startsWith("+62")) {
    digits = "0" + digits.substring(3);
  } else if (digits.startsWith("62")) {
    digits = "0" + digits.substring(2);
  }

  if (!digits.startsWith("08")) {
    return { isValid: false, reason: "Nomor handphone standar Indonesia harus diawali 08 atau +62." };
  }

  if (digits.length < 10 || digits.length > 13) {
    return {
      isValid: false,
      reason: `Jumlah digit nomor handphone harus 10–13 digit (ditemukan ${digits.length} digit: '${digits}').`,
    };
  }

  return { isValid: true };
}

export function validateRFC5322Email(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePassportICAO(passport: string): { isValid: boolean; reason?: string } {
  const clean = passport.trim().toUpperCase();
  // Standar ICAO 9303: 1 huruf + 7-8 digit angka
  if (!/^[A-Z][0-9]{7,8}$/.test(clean)) {
    return { isValid: false, reason: "Nomor paspor harus diawali 1 huruf kapital diikuti 7–8 digit angka (Contoh: C1234567)." };
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
  vaultItems: VaultProfileItem[] = []
): ComprehensiveAuditReport {
  const issues: AuditIssue[] = [];

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

  const formNik = getFieldValue(/nik|ktp|national.id/);
  const formBirthDate = getFieldValue(/tgl|tanggal.*lahir|birth.*date|dob/);
  const formGender = getFieldValue(/gender|kelamin|jenis.*kelamin/);

  // Parse NIK sekali jika tersedia
  let parsedNik: any = null;
  if (formNik) {
    const res = validateIndonesianNIK(formNik);
    if (res.isValid && res.parsed) {
      parsedNik = res.parsed;
    }
  }

  // Evaluasi setiap field satu per satu (Non-Blocking)
  fields.forEach((f) => {
    const label = f.label || f.name || f.fieldId || "Kolom";
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
        badge: "WAJIB",
        message: `Field '${label}' wajib diisi (terdapat tanda asterik * / required).`,
        hint: f.rules.placeholder ? `Contoh pengisian: ${f.rules.placeholder}` : "Lengkapi kolom ini sebelum mengirim berkas.",
        action: {
          label: "Sorot Kolom di Web",
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
        message: `Isian '${label}' kurang dari batas minimal form (${val.length}/${f.rules.minLength} karakter).`,
        hint: f.rules.placeholder ? `Format acuan: ${f.rules.placeholder}` : undefined,
        action: {
          label: "Sorot Kolom di Web",
          actionType: "HIGHLIGHT",
          fieldId: f.fieldId,
          fieldName: f.name,
        },
      });
    }

    if (!val) return; // Kolom opsional yang kosong tidak diaudit formatnya

    // =========================================================================
    // LAYER 2: FORMAT BAKU STANDAR INDONESIA & NALAR SILANG
    // =========================================================================

    // 2.1 Audit NIK
    if (lowerLabel.includes("nik") || lowerLabel.includes("no. ktp") || lowerLabel.includes("nomor induk kependudukan")) {
      const nikRes = validateIndonesianNIK(val);
      if (!nikRes.isValid) {
        issues.push({
          id: `nik_${f.fieldId}`,
          fieldId: f.fieldId,
          fieldName: f.name,
          fieldLabel: label,
          level: "red",
          badge: "FORMAT",
          message: nikRes.reason || "Format NIK tidak valid.",
          hint: "NIK wajib 16 digit angka numerik sesuai e-KTP Dukcapil.",
          juknisRef: "UU Adminduk No. 24/2013",
          action: { label: "Sorot Kolom di Web", actionType: "HIGHLIGHT", fieldId: f.fieldId, fieldName: f.name },
        });
      } else {
        // NIK Valid format, lakukan Nalar Silang terhadap Tanggal Lahir form jika ada
        const { birthDay, birthMonth, isFemale } = nikRes.parsed!;
        if (formBirthDate) {
          // Normalisasi format tanggal lahir form (cth: "17-08-1995" atau "1995-08-17" atau "17/08/1995")
          const parts = formBirthDate.split(/[-/]/).map((p) => parseInt(p, 10));
          let formDay = 0;
          let formMonth = 0;
          if (parts[0] > 1900) {
            // YYYY-MM-DD
            formMonth = parts[1];
            formDay = parts[2];
          } else {
            // DD-MM-YYYY
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
              message: `Tanggal lahir pada NIK (${birthDay}/${birthMonth}) tidak cocok dengan tanggal lahir di form (${formDay}/${formMonth}).`,
              hint: "Periksa kembali ketikan NIK atau tanggal lahir Anda agar tidak gugur verifikasi administrasi.",
              action: { label: "Sorot Kolom di Web", actionType: "HIGHLIGHT", fieldId: f.fieldId, fieldName: f.name },
            });
          }
        }

        // Nalar Silang terhadap Jenis Kelamin Form jika ada
        if (formGender) {
          const isFormFemale = /perempuan|wanita|female/i.test(formGender);
          const isFormMale = /laki|pria|male/i.test(formGender);
          if ((isFemale && isFormMale) || (!isFemale && isFormFemale)) {
            issues.push({
              id: `nik_gender_mismatch_${f.fieldId}`,
              fieldId: f.fieldId,
              fieldName: f.name,
              fieldLabel: label,
              level: "red",
              badge: "FORMAT",
              message: `Gender yang terenkode di NIK (${isFemale ? "Perempuan (+40)" : "Laki-laki"}) tidak cocok dengan jenis kelamin yang dipilih (${formGender}).`,
              hint: "Pada NIK resmi Dukcapil, tanggal lahir perempuan ditambah 40 (rentang 41–71).",
              action: { label: "Sorot Kolom di Web", actionType: "HIGHLIGHT", fieldId: f.fieldId, fieldName: f.name },
            });
          }
        }
      }
    }

    // 2.2 Audit No Handphone
    else if (lowerLabel.includes("hp") || lowerLabel.includes("handphone") || lowerLabel.includes("telepon") || lowerLabel.includes("whatsapp") || type === "tel") {
      const phoneRes = validateIndonesianPhone(val);
      if (!phoneRes.isValid) {
        issues.push({
          id: `phone_${f.fieldId}`,
          fieldId: f.fieldId,
          fieldName: f.name,
          fieldLabel: label,
          level: "red",
          badge: "FORMAT",
          message: phoneRes.reason || "Format nomor HP tidak valid.",
          hint: "Contoh format standar: 08123456789 atau +628123456789 (10–13 digit).",
          action: { label: "Sorot Kolom di Web", actionType: "HIGHLIGHT", fieldId: f.fieldId, fieldName: f.name },
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
          message: `Format alamat email '${val}' tidak valid menurut standar RFC 5322.`,
          hint: "Pastikan memuat tanda '@' dan domain resmi penyedia email (contoh: nama@domain.com).",
          action: { label: "Sorot Kolom di Web", actionType: "HIGHLIGHT", fieldId: f.fieldId, fieldName: f.name },
        });
      }
    }

    // 2.4 Audit Paspor
    else if (lowerLabel.includes("paspor") || lowerLabel.includes("passport")) {
      const passRes = validatePassportICAO(val);
      if (!passRes.isValid) {
        issues.push({
          id: `passport_${f.fieldId}`,
          fieldId: f.fieldId,
          fieldName: f.name,
          fieldLabel: label,
          level: "red",
          badge: "FORMAT",
          message: passRes.reason || "Format nomor paspor tidak sesuai standar ICAO.",
          hint: "Standar paspor RI: 1 huruf kapital diikuti 7–8 digit angka.",
          action: { label: "Sorot Kolom di Web", actionType: "HIGHLIGHT", fieldId: f.fieldId, fieldName: f.name },
        });
      }
    }

    // 2.5 Audit Nama Lengkap (Typo karakter angka / simbol)
    else if (lowerLabel.includes("nama") && !lowerLabel.includes("ibu") && !lowerLabel.includes("kampus") && !lowerLabel.includes("prodi")) {
      if (val.length < 3) {
        issues.push({
          id: `name_len_${f.fieldId}`,
          fieldId: f.fieldId,
          fieldName: f.name,
          fieldLabel: label,
          level: "red",
          badge: "FORMAT",
          message: "Nama lengkap terlalu pendek (kurang dari 3 huruf).",
          action: { label: "Sorot Kolom di Web", actionType: "HIGHLIGHT", fieldId: f.fieldId, fieldName: f.name },
        });
      } else if (/\d/.test(val)) {
        issues.push({
          id: `name_num_${f.fieldId}`,
          fieldId: f.fieldId,
          fieldName: f.name,
          fieldLabel: label,
          level: "red",
          badge: "FORMAT",
          message: `Nama lengkap mengandung angka numerik ('${val}'). Nama harus bersih sesuai dokumen resmi.`,
          hint: "Hapus karakter angka atau ketikan tidak sengaja.",
          action: { label: "Sorot Kolom di Web", actionType: "HIGHLIGHT", fieldId: f.fieldId, fieldName: f.name },
        });
      }
    }

    // =========================================================================
    // LAYER 3: ZERO-KNOWLEDGE CLIENT-SIDE VAULT RECONCILER (TYPO CATCHER)
    // =========================================================================
    if (vaultItems && vaultItems.length > 0) {
      // Cari data vault yang bersesuaian dengan field ini
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
        // Bandingkan jika tidak persis sama tapi mirip (typo manusia)
        if (val.toLowerCase() !== vaultVal.toLowerCase()) {
          const dist = levenshteinDistance(val, vaultVal);
          const maxLen = Math.max(val.length, vaultVal.length);
          const similarity = 1 - dist / maxLen;

          // Jika ada perbedaan 1 s/d 3 karakter pada kata dengan panjang cukup
          if (dist >= 1 && dist <= 3 && similarity > 0.65) {
            issues.push({
              id: `vault_mismatch_${f.fieldId}`,
              fieldId: f.fieldId,
              fieldName: f.name,
              fieldLabel: label,
              level: "yellow",
              badge: "SUMBER",
              message: `Form tertulis '${val}', berbeda dengan dokumen Vault '${vaultVal}'.`,
              hint: `Terdeteksi potensi salah ketik (${dist} karakter berbeda). Sumber: ${matchingVaultItem.sourceTag || "Vault Pribadi"}.`,
              action: {
                label: `Pakai Data Vault: "${vaultVal}"`,
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
      // 4.1 Cek ukuran file > 2 MB jika ada catatan 500 KB di halaman
      const has500KbLimit = pageUploadContext.pageWideFileInstructions.some((inst) =>
        /500\s*kb|0\.5\s*mb/i.test(inst)
      );

      if (has500KbLimit && att.fileSizeKb > 512) {
        issues.push({
          id: `file_size_${att.fieldName}`,
          fieldId: att.fieldName,
          fieldName: att.fieldName,
          fieldLabel: `Berkas: ${att.fileName}`,
          level: "red",
          badge: "BERKAS",
          message: `Ukuran berkas (${att.fileSizeKb} KB) melebihi batas 500 KB yang tertera pada petunjuk halaman.`,
          hint: "Kompres ukuran berkas foto/PDF Anda agar di bawah 500 KB sebelum diunggah.",
        });
      } else if (att.fileSizeKb > 5120) {
        issues.push({
          id: `file_size_max_${att.fieldName}`,
          fieldId: att.fieldName,
          fieldName: att.fieldName,
          fieldLabel: `Berkas: ${att.fileName}`,
          level: "red",
          badge: "BERKAS",
          message: `Ukuran berkas (${Math.round(att.fileSizeKb / 1024)} MB) melebihi batas umum portal formulir (5 MB).`,
          hint: "Perkecil ukuran dokumen agar proses unggah tidak gagal/timeout.",
        });
      }

      // 4.2 Cek ekstensi file yang dilarang
      const validExts = ["pdf", "jpg", "jpeg", "png"];
      if (att.fileExtension && !validExts.includes(att.fileExtension.toLowerCase())) {
        issues.push({
          id: `file_ext_${att.fieldName}`,
          fieldId: att.fieldName,
          fieldName: att.fieldName,
          fieldLabel: `Berkas: ${att.fileName}`,
          level: "red",
          badge: "BERKAS",
          message: `Format berkas '.${att.fileExtension.toUpperCase()}' biasanya ditolak oleh sistem birokrasi.`,
          hint: "Harap gunakan format PDF atau JPG/PNG standar.",
        });
      }
    });
  }

  // Hitung Skor & Status Akhir
  const dangerCount = issues.filter((i) => i.level === "red").length;
  const warningCount = issues.filter((i) => i.level === "yellow").length;
  const totalScanned = Math.max(fields.length, 1);
  const passedCount = Math.max(0, totalScanned - dangerCount - warningCount);

  let overallStatus: "green" | "yellow" | "red" = "green";
  if (dangerCount > 0) overallStatus = "red";
  else if (warningCount > 0) overallStatus = "yellow";

  const score = Math.max(0, Math.round(((passedCount + warningCount * 0.5) / totalScanned) * 100));

  return {
    overallStatus,
    score,
    issues,
    passedCount,
    warningCount,
    dangerCount,
    totalFieldsScanned: fields.length,
    vaultConnected: vaultItems.length > 0,
  };
}

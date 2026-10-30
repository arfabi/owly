// ============================================================================
// SAVVY.AI — Pre-Submit Regex & Consistency FSM Validator (Traffic Light)
// Instantaneous (<50ms) client-side verification preventing disqualification
// ============================================================================

export interface AuditIssue {
  field: string;
  level: "green" | "yellow" | "red";
  message: string;
  juknisRef?: string;
}

export interface AuditReport {
  overallStatus: "green" | "yellow" | "red";
  score: number; // 0 - 100
  issues: AuditIssue[];
  passedCount: number;
  warningCount: number;
  dangerCount: number;
}

export function validateIndonesianNIK(nik: string): { isValid: boolean; reason?: string; parsed?: any } {
  const clean = nik.replace(/\D/g, "");
  if (clean.length !== 16) {
    return { isValid: false, reason: "NIK harus tepat 16 digit angka numerik." };
  }

  const prov = parseInt(clean.substring(0, 2), 10);
  if (prov < 11 || prov > 94) {
    return { isValid: false, reason: `Kode provinsi '${prov}' tidak terdaftar di Kemendagri.` };
  }

  let day = parseInt(clean.substring(6, 8), 10);
  const isFemale = day > 40;
  if (isFemale) day -= 40;

  const month = parseInt(clean.substring(8, 10), 10);
  if (day < 1 || day > 31 || month < 1 || month > 12) {
    return { isValid: false, reason: "Tanggal lahir yang dienkode dalam NIK tidak valid." };
  }

  return {
    isValid: true,
    parsed: { provinceCode: prov, birthDay: day, birthMonth: month, isFemale },
  };
}

export function validatePassportNumber(passport: string): { isValid: boolean; reason?: string } {
  const clean = passport.trim().toUpperCase();
  // Standard ICAO 9303: 1 letter + 7 or 8 digits
  const passportRegex = /^[A-Z][0-9]{7,8}$/;
  if (!passportRegex.test(clean)) {
    return { isValid: false, reason: "Format Paspor standar RI / ICAO harus 1 huruf diikuti 7-8 angka (Contoh: A1234567)." };
  }
  return { isValid: true };
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Runs full pre-submit form audit on collected form values
 */
export function auditFormData(formData: Record<string, string>): AuditReport {
  const issues: AuditIssue[] = [];

  // 1. Audit NIK
  if (formData.nik) {
    const nikCheck = validateIndonesianNIK(formData.nik);
    if (!nikCheck.isValid) {
      issues.push({
        field: "NIK",
        level: "red",
        message: nikCheck.reason!,
        juknisRef: "UU Adminduk & Juknis LPDP Bab II (Pendaftar)",
      });
    } else {
      issues.push({
        field: "NIK",
        level: "green",
        message: `NIK valid (${nikCheck.parsed.isFemale ? "Perempuan" : "Laki-laki"}, tgl ${nikCheck.parsed.birthDay}/${nikCheck.parsed.birthMonth}).`,
      });
    }
  }

  // 2. Audit Nama Lengkap
  if (formData.nama) {
    const name = formData.nama.trim();
    if (name.length < 3) {
      issues.push({
        field: "Nama Lengkap",
        level: "red",
        message: "Nama terlalu pendek (kurang dari 3 karakter).",
      });
    } else if (/\d/.test(name)) {
      issues.push({
        field: "Nama Lengkap",
        level: "red",
        message: "Nama mengandung angka. Nama harus sesuai persis dengan KTP/Ijazah.",
        juknisRef: "Juknis LPDP Bab II.1",
      });
    } else {
      issues.push({
        field: "Nama Lengkap",
        level: "green",
        message: "Format nama sesuai standar identitas resmi.",
      });
    }
  }

  // 3. Audit Paspor jika ada
  if (formData.passport) {
    const passCheck = validatePassportNumber(formData.passport);
    if (!passCheck.isValid) {
      issues.push({
        field: "Nomor Paspor",
        level: "red",
        message: passCheck.reason!,
        juknisRef: "Schengen Visa Code Article 12",
      });
    } else {
      issues.push({
        field: "Nomor Paspor",
        level: "green",
        message: "Format nomor paspor valid sesuai ICAO Doc 9303.",
      });
    }
  }

  // 4. Audit Email
  if (formData.email) {
    if (!validateEmail(formData.email)) {
      issues.push({
        field: "Email",
        level: "red",
        message: "Format alamat email tidak valid.",
      });
    } else {
      issues.push({
        field: "Email",
        level: "green",
        message: "Format alamat email valid untuk menerima notifikasi verifikasi.",
      });
    }
  }

  // 5. Audit Usia & Tanggal Lahir (Cross-Check Consistency)
  if (formData.tanggal_lahir) {
    const birthDate = new Date(formData.tanggal_lahir);
    const now = new Date();
    const age = now.getFullYear() - birthDate.getFullYear();

    if (age > 35 && (!formData.kategori || formData.kategori.toLowerCase().includes("reguler"))) {
      issues.push({
        field: "Usia Pendaftar",
        level: "yellow",
        message: `Usia terhitung ${age} tahun. Batas pendaftar Magister Reguler LPDP adalah 35 tahun. Pastikan Anda memilih jalur Afirmasi jika memenuhi syarat.`,
        juknisRef: "Juknis LPDP 2026 Bab II (Batas Usia)",
      });
    } else {
      issues.push({
        field: "Usia Pendaftar",
        level: "green",
        message: `Usia ${age} tahun memenuhi kriteria pendaftaran.`,
      });
    }
  }

  // 6. Audit Skor Bahasa (TOEFL / IELTS)
  if (formData.toefl_ielts) {
    const score = parseFloat(formData.toefl_ielts);
    if (!isNaN(score)) {
      if (score < 500 && score > 9.0) {
        issues.push({
          field: "Skor Bahasa",
          level: "red",
          message: "Skor TOEFL ITP minimal 500 atau IELTS 6.0 untuk beasiswa luar negeri.",
          juknisRef: "Juknis LPDP Bab V (Standar Sertifikat Bahasa)",
        });
      } else {
        issues.push({
          field: "Skor Bahasa",
          level: "green",
          message: "Skor bahasa memenuhi ambang minimum standar penerimaan.",
        });
      }
    }
  }

  const dangerCount = issues.filter((i) => i.level === "red").length;
  const warningCount = issues.filter((i) => i.level === "yellow").length;
  const passedCount = issues.filter((i) => i.level === "green").length;

  let overallStatus: "green" | "yellow" | "red" = "green";
  if (dangerCount > 0) overallStatus = "red";
  else if (warningCount > 0) overallStatus = "yellow";

  const total = issues.length || 1;
  const score = Math.max(0, Math.round(((passedCount + warningCount * 0.5) / total) * 100));

  return {
    overallStatus,
    score,
    issues,
    passedCount,
    warningCount,
    dangerCount,
  };
}

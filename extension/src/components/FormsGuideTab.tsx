import React, { useState, useEffect } from "react";
import { useLanguage } from "../lib/i18n/LanguageContext";
import {
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { agentLog } from "../lib/agentLogger";
import { sendTabMessage } from "../lib/tabMessenger";

interface FieldItem {
  id: string;
  name: string;
  label: string;
  localizedLabel?: string;
  badgeType: "official" | "curated" | "ai";
  badgeLabel?: string;
  meaning: string;
  howTo: string;
  example: string;
  pitfall: string;
  vaultKey?: "nik" | "nama" | "tanggal_lahir" | "alamat" | "email" | "no_hp";
  fallbackValue?: string;
  type?: string;
}

// Semantic Field Guidance Classifier - Maps any field by label, name, id, and type
export function classifyFieldGuidance(raw: any, isId: boolean): FieldItem {
  const label = (raw.label || raw.name || raw.id || "Kolom").trim();
  const name = (raw.name || "").toLowerCase();
  const id = (raw.id || "").toLowerCase();
  const type = (raw.type || "text").toLowerCase();
  const placeholder = (raw.placeholder || "").toLowerCase();
  const text = `${label} ${name} ${id} ${placeholder}`.toLowerCase();

  // 1. Photo / Pas Foto / Avatar
  if (
    text.includes("foto") ||
    text.includes("photo") ||
    text.includes("picture") ||
    text.includes("avatar") ||
    text.includes("pasfoto") ||
    text.includes("selfie")
  ) {
    return {
      id: raw.id || "photo",
      name: raw.name || "photo",
      label: raw.label || (isId ? "Pas Foto Resmi" : "Formal Photo"),
      localizedLabel: isId ? "Pas Foto Resmi Pemohon" : "Applicant Formal Photo",
      badgeType: "official",
      badgeLabel: isId ? "Official Guidance" : "Official Guidance",
      meaning: isId
        ? "Foto potret resmi terbaru dengan latar belakang polos (putih/merah) sesuai regulasi imigrasi/visa."
        : "Recent official portrait photograph with a plain background as mandated by immigration regulations.",
      howTo: isId
        ? "Gunakan foto formal 6 bulan terakhir, format JPG/PNG, wajah menghadap tegak ke kamera tanpa kacamata hitam atau penutup kepala santai."
        : "Use a recent formal photo (last 6 months), JPG/PNG format, looking straight at the camera without dark glasses or face coverings.",
      example: "photo_formal.jpg (maks. 2 MB, rasio 3.5 x 4.5 cm)",
      pitfall: isId
        ? "Mengunggah foto selfie, berlatar pemandangan, resolusi rendah, atau pakaian santai tanpa kerah akan ditolak otomatis."
        : "Uploading casual selfies, blurry photos, or patterned backgrounds will cause instant rejection.",
      type: "file",
    };
  }

  // 2. Passport / Travel Document Number
  if (
    (text.includes("passport") || text.includes("paspor") || text.includes("travel doc") || text.includes("document")) &&
    (text.includes("no") || text.includes("nomor") || text.includes("number"))
  ) {
    return {
      id: raw.id || "passport_no",
      name: raw.name || "passport_no",
      label: raw.label || (isId ? "Nomor Paspor / Dokumen" : "Passport / Document No."),
      localizedLabel: isId ? "Nomor Dokumen Paspor" : "Passport Document Number",
      badgeType: "official",
      badgeLabel: "Official Guidance",
      meaning: isId
        ? "Nomor unik dokumen paspor yang tercetak di sudut kanan atas halaman biodata paspor fisik."
        : "Unique document number printed on the top-right corner of the physical passport bio page.",
      howTo: isId
        ? "Ketik kombinasi huruf dan angka persis sesuai fisik paspor. Hati-hati membedakan angka 0 (nol) dengan huruf O, serta angka 1 dengan huruf I."
        : "Type exact alphanumeric string from physical passport. Distinguish carefully between number 0 and letter O, and 1 and I.",
      example: "A 1234567 atau B 9876543",
      pitfall: isId
        ? "Salah satu digit saja pada nomor paspor menyebabkan visa tidak terbit atau Anda ditolak saat boarding penerbangan."
        : "A single typo in the passport number causes invalid visas and boarding denial at the airport.",
      type,
    };
  }

  // 3. Passport Issuing Country / Nationality / Region
  if (
    text.includes("country") ||
    text.includes("negara") ||
    text.includes("nationality") ||
    text.includes("kewarganegaraan") ||
    text.includes("region") ||
    text.includes("issuing")
  ) {
    return {
      id: raw.id || "country",
      name: raw.name || "country",
      label: raw.label || (isId ? "Negara Penerbit / Kewarganegaraan" : "Issuing Country / Region"),
      localizedLabel: isId ? "Negara Penerbit Paspor" : "Passport Issuing Country",
      badgeType: "official",
      badgeLabel: "Official Guidance",
      meaning: isId
        ? "Negara atau yurisdiksi resmi yang menerbitkan dokumen paspor/perjalanan Anda."
        : "Official state or jurisdiction that issued your travel passport.",
      howTo: isId
        ? "Pilih nama negara yang menerbitkan paspor Anda dari daftar dropdown (misal: INDONESIA)."
        : "Select the passport issuing country from the dropdown (e.g., INDONESIA).",
      example: "INDONESIA (IDN)",
      pitfall: isId
        ? "Pastikan tidak tertukar antara negara tempat tinggal sekarang dengan negara yang menerbitkan paspor fisik."
        : "Do not confuse your current residence with the physical passport issuing nation.",
      type,
    };
  }

  // 4. Passport Bio Page Upload / Scan Paspor
  if (
    text.includes("passport") ||
    text.includes("paspor") ||
    text.includes("biography") ||
    text.includes("biodata") ||
    text.includes("travel document")
  ) {
    return {
      id: raw.id || "passport_page",
      name: raw.name || "passport_page",
      label: raw.label || (isId ? "Halaman Biodata Paspor" : "Passport Biography Page"),
      localizedLabel: isId ? "Halaman Biodata Paspor" : "Passport Biography Page",
      badgeType: "official",
      badgeLabel: "Official Guidance",
      meaning: isId
        ? "Halaman identitas paspor yang memuat data diri, foto, dan 2 baris kode MRZ (Machine Readable Zone)."
        : "Passport identity page containing personal data, photo, and 2-line MRZ machine-readable code.",
      howTo: isId
        ? "Unggah hasil scan atau foto jelas seluruh halaman biodata paspor. 4 sudut halaman wajib terlihat utuh tanpa terpotong."
        : "Upload a clean scan/photo of the complete passport bio page. All 4 corners must be visible and untruncated.",
      example: "passport_bio.pdf / .jpg (minimal 300 DPI, tajam)",
      pitfall: isId
        ? "Pantulan kilau lampu (glare) yang menutupi teks, atau bayangan jari yang menutupi kode MRZ akan langsung ditolak sistem."
        : "Glare obscuring text or fingers covering the MRZ code will cause automatic rejection.",
      type: "file",
    };
  }

  // 5. Document Type / Jenis Dokumen
  if (
    text.includes("document type") ||
    text.includes("doc_type") ||
    text.includes("tipe dokumen") ||
    text.includes("jenis dokumen")
  ) {
    return {
      id: raw.id || "document_type",
      name: raw.name || "document_type",
      label: raw.label || (isId ? "Jenis Dokumen Perjalanan" : "Document Type"),
      localizedLabel: isId ? "Jenis Dokumen Perjalanan" : "Travel Document Type",
      badgeType: "official",
      badgeLabel: "Official Guidance",
      meaning: isId
        ? "Kategori paspor atau dokumen sah yang digunakan untuk permohonan."
        : "Category of travel document used for this application.",
      howTo: isId
        ? "Pilih 'Ordinary Passport' untuk paspor biasa 48 halaman reguler, atau pilih Paspor Diplomatik/Dinas jika pemegang paspor resmi kenegaraan."
        : "Select 'Ordinary Passport' for regular passport holders, or Diplomatic/Official for state officials.",
      example: "Ordinary Passport (Paspor Biasa)",
      pitfall: isId
        ? "Salah memilih jenis dokumen mengharuskan pembatalan permohonan dan pembayaran biaya ulang."
        : "Selecting the wrong document category requires canceling the submission and starting over.",
      type,
    };
  }

  // 6. Mother's Name / Nama Ibu Kandung
  if (text.includes("mother") || text.includes("ibu") || text.includes("induk")) {
    return {
      id: raw.id || "mother_name",
      name: raw.name || "mother_name",
      label: raw.label || (isId ? "Nama Ibu Kandung" : "Mother's Name"),
      localizedLabel: isId ? "Nama Lengkap Ibu Kandung" : "Mother's Full Legal Name",
      badgeType: "official",
      badgeLabel: "Official Guidance",
      meaning: isId
        ? "Nama lengkap ibu kandung pemohon yang tercatat sah pada Akta Kelahiran dan Kartu Keluarga."
        : "Biological mother's full legal name as registered in birth certificate and civil registry.",
      howTo: isId
        ? "Ketik nama lengkap ibu kandung persis sesuai dokumen pencatatan sipil resmi keluarga."
        : "Type the complete legal name of your mother exactly as shown on civil registry documents.",
      example: "Siti Rahmawati",
      pitfall: isId
        ? "Nama ibu kandung digunakan untuk validasi silang keamanan anti-pemalsuan identitas."
        : "Mother's name is used for anti-fraud cross-referencing against civil databases.",
      type,
    };
  }

  // 7. Place of Birth / Tempat Lahir
  if (
    text.includes("place of birth") ||
    text.includes("tempat lahir") ||
    text.includes("birth place") ||
    text.includes("pob") ||
    text.includes("birthplace")
  ) {
    return {
      id: raw.id || "place_of_birth",
      name: raw.name || "place_of_birth",
      label: raw.label || (isId ? "Tempat Lahir (Place of Birth)" : "Place of Birth"),
      localizedLabel: isId ? "Tempat Lahir (Kota/Kabupaten)" : "Place of Birth (City)",
      badgeType: "official",
      badgeLabel: "Official Guidance",
      meaning: isId
        ? "Kota atau kabupaten tempat Anda dilahirkan sesuai dengan yang tertera pada paspor fisik dan akta kelahiran."
        : "City or municipality where you were born, as printed on your passport and birth certificate.",
      howTo: isId
        ? "Tuliskan nama Kota/Kabupaten (contoh: JAKARTA atau BANDUNG). Jangan menuliskan nama rumah sakit atau kecamatan."
        : "Type the City/Municipality name (e.g. JAKARTA). Do not write hospital names or subdistricts.",
      example: "JAKARTA",
      pitfall: isId
        ? "Ejaan nama tempat lahir wajib sama persis dengan yang tercetak pada halaman paspor fisik Anda."
        : "The spelling must match the Place of Birth text printed on your physical passport page exactly.",
      type,
    };
  }

  // 8a. Date of Birth / Tanggal Lahir
  if (
    text.includes("date of birth") ||
    text.includes("tanggal lahir") ||
    text.includes("birth date") ||
    text.includes("dob") ||
    text.includes("tgl_lahir") ||
    (text.includes("birth") && text.includes("date"))
  ) {
    return {
      id: raw.id || "tanggal_lahir",
      name: raw.name || "tanggal_lahir",
      label: raw.label || (isId ? "Tanggal Lahir (Date of Birth)" : "Date of Birth"),
      localizedLabel: isId ? "Tanggal Lahir Pemohon" : "Applicant Date of Birth",
      badgeType: "official",
      badgeLabel: "Official Guidance",
      meaning: isId
        ? "Tanggal kelahiran sah pemohon sesuai dokumen identitas paspor dan akta lahir."
        : "Official date of birth according to official identity documents.",
      howTo: isId
        ? "Gunakan format tanggal sesuai petunjuk kolom (DD/MM/YYYY) atau gunakan alat pemilih kalender yang tersedia."
        : "Use DD/MM/YYYY format or the calendar picker tool.",
      example: "19/08/1998",
      pitfall: isId
        ? "Hati-hati dengan format tanggal (jangan tertukar antara format hari-bulan DD/MM dengan bulan-hari MM/DD)."
        : "Beware of date format inversion (do not confuse DD/MM with MM/DD).",
      vaultKey: "tanggal_lahir",
      fallbackValue: "1998-08-19",
      type,
    };
  }

  // 8b. Date of Issue / Tanggal Diterbitkan (Paspor / Visa)
  if (
    text.includes("date of issue") ||
    text.includes("issue date") ||
    text.includes("tanggal dikeluarkan") ||
    text.includes("tanggal terbit") ||
    text.includes("tgl terbit") ||
    text.includes("issuance") ||
    (text.includes("issue") && (text.includes("date") || text.includes("tgl") || text.includes("dd/mm") || type === "date"))
  ) {
    return {
      id: raw.id || "date_of_issue",
      name: raw.name || "date_of_issue",
      label: raw.label || (isId ? "Tanggal Penerbitan Paspor (Date of Issue)" : "Passport Date of Issue"),
      localizedLabel: isId ? "Tanggal Penerbitan Paspor" : "Passport Date of Issue",
      badgeType: "official",
      badgeLabel: "Official Guidance",
      meaning: isId
        ? "Tanggal resmi saat dokumen paspor fisik Anda diterbitkan oleh kantor imigrasi atau perwakilan konsuler."
        : "Official date when your passport was issued by the immigration authority.",
      howTo: isId
        ? "Pilih atau ketik tanggal penerbitan persis seperti yang tercetak pada kolom 'Date of issue' di halaman identitas paspor fisik Anda (format DD/MM/YYYY)."
        : "Select or type the issue date matching the 'Date of issue' field in your physical passport (DD/MM/YYYY).",
      example: "15/01/2024",
      pitfall: isId
        ? "Jangan tertukar antara Tanggal Terbit (Date of Issue) dengan Tanggal Habis Berlaku (Date of Expiry)."
        : "Do not confuse Date of Issue with Date of Expiry.",
      type: "date",
    };
  }

  // 8c. Date of Expiry / Tanggal Habis Berlaku Paspor
  if (
    text.includes("date of expiry") ||
    text.includes("expiry date") ||
    text.includes("expiration") ||
    text.includes("tanggal habis berlaku") ||
    text.includes("berlaku s/d") ||
    text.includes("valid until") ||
    (text.includes("expir") && (text.includes("date") || text.includes("tgl") || text.includes("dd/mm") || type === "date"))
  ) {
    return {
      id: raw.id || "date_of_expiry",
      name: raw.name || "date_of_expiry",
      label: raw.label || (isId ? "Tanggal Habis Berlaku (Date of Expiry)" : "Passport Date of Expiry"),
      localizedLabel: isId ? "Tanggal Habis Berlaku Paspor" : "Passport Expiry Date",
      badgeType: "official",
      badgeLabel: "Official Guidance",
      meaning: isId
        ? "Batas akhir masa berlaku paspor fisik Anda yang tercantum pada kolom 'Date of expiry'."
        : "Final expiration date of your passport as printed in the 'Date of expiry' field.",
      howTo: isId
        ? "Pilih tanggal kedaluwarsa paspor persis sesuai yang tercetak di halaman biodata paspor fisik Anda."
        : "Enter the expiration date exactly as printed on the physical passport bio page.",
      example: "15/01/2034",
      pitfall: isId
        ? "Regulasi internasional mewajibkan paspor memiliki masa berlaku minimal 6 bulan dari rencana tanggal perjalanan."
        : "International regulations mandate a minimum of 6 months passport validity from travel date.",
      type: "date",
    };
  }

  // 9. Sex / Gender / Jenis Kelamin
  if (
    text.includes("sex") ||
    text.includes("gender") ||
    text.includes("kelamin") ||
    text.includes("male") ||
    text.includes("female") ||
    text.includes("pria") ||
    text.includes("wanita")
  ) {
    return {
      id: raw.id || "sex",
      name: raw.name || "sex",
      label: raw.label || (isId ? "Jenis Kelamin (Sex)" : "Sex / Gender"),
      localizedLabel: isId ? "Jenis Kelamin (L/P)" : "Sex / Gender (M/F)",
      badgeType: "official",
      badgeLabel: "Official Guidance",
      meaning: isId
        ? "Jenis kelamin sah pemohon yang tercatat pada paspor resmi (M/F)."
        : "Legal sex of the applicant as recorded on physical passport (M/F).",
      howTo: isId
        ? "Pilih Male (Pria) atau Female (Wanita) sesuai kode huruf pada paspor Anda."
        : "Select Male or Female matching the sex marker on your passport.",
      example: "MALE",
      pitfall: isId
        ? "Pilihan jenis kelamin wajib sesuai data paspor fisik untuk sinkronisasi kode MRZ."
        : "Must match the sex indicator in your passport MRZ code.",
      type,
    };
  }

  // 10. Phone Number / WhatsApp / Seluler
  if (
    text.includes("phone") ||
    text.includes("telepon") ||
    text.includes("no_hp") ||
    text.includes("handphone") ||
    text.includes("mobile") ||
    text.includes("whatsapp") ||
    text.includes("telp")
  ) {
    return {
      id: raw.id || "no_hp",
      name: raw.name || "no_hp",
      label: raw.label || (isId ? "Nomor Telepon / WhatsApp" : "Phone Number"),
      localizedLabel: isId ? "Nomor Telepon / WhatsApp" : "Phone / WhatsApp Number",
      badgeType: "curated",
      badgeLabel: "Owly Curated",
      meaning: isId
        ? "Nomor telepon seluler aktif yang dapat menerima panggilan, SMS, atau WhatsApp."
        : "Active mobile telephone number that can receive voice calls, SMS, and WhatsApp.",
      howTo: isId
        ? "Jika kode negara (+62) berada di dropdown terpisah, ketik nomor diawali angka 8 tanpa angka 0 di depan."
        : "If country code (+62) is selected separately, type number starting with 8 without leading 0.",
      example: "081234567890 (atau 81234567890 jika ada kode negara terpisah)",
      pitfall: isId
        ? "Nomor tidak aktif menyebabkan Anda gagal menerima kode OTP verifikasi akun."
        : "An unreachable phone number prevents OTP codes and important status calls from being received.",
      vaultKey: "no_hp",
      fallbackValue: "081234567890",
      type,
    };
  }

  // 11. Email / Username Akun Portal
  if (
    text.includes("email") ||
    text.includes("mail") ||
    text.includes("surel") ||
    text.includes("username") ||
    name === "_username" ||
    id === "_username" ||
    type === "email"
  ) {
    return {
      id: raw.id || "email",
      name: raw.name || "email",
      label: raw.label || (isId ? "Alamat Email Aktif" : "Email Address"),
      localizedLabel: isId ? "Alamat Surel / Email Aktif" : "Active Email Address",
      badgeType: "official",
      badgeLabel: "Official Guidance",
      meaning: isId
        ? "Alamat surat elektronik utama untuk pengiriman konfirmasi, aktivasi akun, dan dokumen e-Visa / barcode."
        : "Primary email address for receiving verification, receipts, and e-Visa documents.",
      howTo: isId
        ? "Ketik alamat email pribadi yang aktif dan dapat diakses dengan aman setiap saat."
        : "Type your primary personal email that is actively monitored.",
      example: "budi.santoso@gmail.com",
      pitfall: isId
        ? "Typo satu huruf pada domain email (misal: gamil.com) berakibat dokumen visa Anda terkirim ke alamat lain."
        : "A typo in the email domain will prevent receiving the eVisa or send it to an unknown recipient.",
      vaultKey: "email",
      fallbackValue: "budi.santoso@alumni.ui.ac.id",
      type: "email",
    };
  }

  // 12. Full Name (Applicant) - Strictly excludes username, mother, father, file, doc
  if (
    text.includes("fullname") ||
    text.includes("nama lengkap") ||
    text.includes("full_name") ||
    (text.includes("nama") && !text.includes("ibu") && !text.includes("mother") && !text.includes("user")) ||
    (text.includes("name") &&
      !text.includes("ibu") &&
      !text.includes("mother") &&
      !text.includes("user") &&
      !text.includes("file") &&
      !text.includes("doc") &&
      !text.includes("host") &&
      !text.includes("nick"))
  ) {
    return {
      id: raw.id || "nama_lengkap",
      name: raw.name || "nama_lengkap",
      label: (raw.label && !raw.label.toLowerCase().includes("nik") && !raw.label.toLowerCase().includes("identification"))
        ? raw.label
        : (isId ? "Nama Lengkap (Full Name)" : "Full Legal Name"),
      localizedLabel: isId ? "Nama Lengkap Sesuai Paspor / KTP" : "Full Name (Passport / ID)",
      badgeType: "official",
      badgeLabel: "Official Guidance",
      meaning: isId
        ? "Nama lengkap sah pemohon sesuai identitas paspor/KTP tanpa gelar atau singkatan."
        : "Legal full name as registered on passport/ID card without unprinted abbreviations.",
      howTo: isId
        ? "Tuliskan nama lengkap persis sesuai ejaan pada paspor fisik. Jika nama hanya 1 kata, periksa instruksi portal."
        : "Type full name exactly as printed in physical passport. Check portal rules if single-word name.",
      example: "Budi Santoso",
      pitfall: isId
        ? "Perbedaan ejaan satu huruf dengan paspor akan menyebabkan verifikasi imigrasi ditolak saat di bandara."
        : "A single letter discrepancy with passport will cause airport immigration check failure.",
      vaultKey: "nama",
      fallbackValue: "Budi Santoso",
      type: "text",
    };
  }

  // 13. NIK / KTP / National ID
  if (text.includes("nik") || text.includes("ktp") || text.includes("national id") || text.includes("kependudukan")) {
    return {
      id: raw.id || "nik",
      name: raw.name || "nik",
      label: (raw.label && !raw.label.toLowerCase().includes("nama") && !raw.label.toLowerCase().includes("full name"))
        ? raw.label
        : (isId ? "Nomor Induk Kependudukan (NIK)" : "National Identification Number (NIK)"),
      localizedLabel: isId ? "Nomor Induk Kependudukan (16 Digit)" : "National Identification Number",
      badgeType: "official",
      badgeLabel: "Official Guidance",
      meaning: isId
        ? "Nomor identitas kependudukan tunggal 16 digit yang diterbitkan Dinas Dukcapil."
        : "16-digit national identification number issued by civil registry.",
      howTo: isId
        ? "Ketik 16 digit angka tanpa spasi atau tanda baca."
        : "Type 16 numeric digits without spaces or dashes.",
      example: "3271041908980002",
      pitfall: isId
        ? "Pastikan tidak menggunakan NIK lama jika Anda baru memperbarui Kartu Keluarga."
        : "Ensure NIK matches your latest civil registry record.",
      vaultKey: "nik",
      fallbackValue: "3271041908980002",
      type,
    };
  }

  // 14. Address / Alamat
  if (text.includes("alamat") || text.includes("address") || text.includes("domisili") || text.includes("residence")) {
    return {
      id: raw.id || "alamat",
      name: raw.name || "alamat",
      label: raw.label || (isId ? "Alamat Domisili" : "Residential Address"),
      localizedLabel: isId ? "Alamat Domisili / Tempat Tinggal" : "Residential / Domicile Address",
      badgeType: "curated",
      badgeLabel: "Owly Curated",
      meaning: isId
        ? "Alamat tempat tinggal resmi saat ini."
        : "Official current residential address.",
      howTo: isId
        ? "Tuliskan nama jalan, nomor rumah, RT/RW, kelurahan, dan kota domisili."
        : "Enter street name, house number, neighborhood, and city.",
      example: "Jl. Sudirman No. 45, Jakarta Pusat",
      pitfall: isId
        ? "Kelengkapan kode pos dan RT/RW penting untuk pengiriman dokumen fisik jika diperlukan."
        : "Include complete postal code for physical document delivery.",
      vaultKey: "alamat",
      fallbackValue: "Jl. Sudirman No. 45, Jakarta Pusat",
      type,
    };
  }

  // 15. Generic File Upload
  if (type === "file" || text.includes("upload") || text.includes("unggah") || text.includes("berkas") || text.includes("dokumen")) {
    return {
      id: raw.id || "upload_file",
      name: raw.name || "upload_file",
      label: raw.label || (isId ? "Unggah Dokumen Lampiran" : "Upload Document"),
      localizedLabel: isId ? `Berkas Lampiran (${raw.label || "Dokumen"})` : `Attachment File (${raw.label || "Document"})`,
      badgeType: "official",
      badgeLabel: "Official Guidance",
      meaning: isId
        ? `Dokumen lampiran pendukung untuk kolom ${raw.label || "ini"}.`
        : `Supporting document attachment for ${raw.label || "this field"}.`,
      howTo: isId
        ? "Unggah dokumen asli berwarna (format PDF atau JPG/PNG, ukuran maks. 2 MB) dengan hasil scan tajam dan tidak buram."
        : "Upload original color scan (PDF, JPG or PNG, max 2 MB) with sharp, legible resolution.",
      example: "dokumen_asli.pdf (maks. 2 MB)",
      pitfall: isId
        ? "Dokumen fotokopi hitam putih atau hasil scan terpotong akan langsung ditolak pada tahap verifikasi administrasi."
        : "Black & white photocopies or cropped scans will be disqualified.",
      type: "file",
    };
  }

  // 16. Fallback Generic Field
  return {
    id: raw.id || "field",
    name: raw.name || "field",
    label: raw.label || (isId ? "Kolom Formulir" : "Form Field"),
    localizedLabel: isId ? `Isian: ${raw.label || "Kolom Form"}` : `Field: ${raw.label || "Form Input"}`,
    badgeType: "ai",
    badgeLabel: "AI Guidance",
    meaning: isId
      ? `Kolom isian data ${raw.label || "ini"} sesuai instruksi formulir pada website.`
      : `Input field for ${raw.label || "this item"} following web form instructions.`,
    howTo: isId
      ? "Masukkan informasi yang akurat dan sah sesuai dokumen resmi pendukung Anda."
      : "Enter accurate information corresponding to your official supporting documents.",
    example: isId ? "Isi data sesuai dokumen resmi" : "Enter data matching official records",
    pitfall: isId
      ? "Periksa kembali ejaan huruf dan format data sebelum melanjutkan ke langkah berikutnya."
      : "Double-check spelling and format before moving forward.",
    type,
  };
}

function getDefaultFields(isId: boolean): FieldItem[] {
  return [
    {
      id: "nik",
      name: "nik",
      label: isId ? "Nomor Induk Kependudukan (NIK)" : "National ID Number (NIK)",
      badgeType: "official",
      badgeLabel: isId ? "🟢 Panduan Resmi" : "🟢 Official Guidance",
      meaning: isId
        ? "Nomor identitas kependudukan tunggal 16 digit yang diterbitkan resmi oleh Dinas Dukcapil."
        : "A 16-digit continuous citizen identification number issued by the civil registry.",
      howTo: isId
        ? "Ketik 16 digit angka tanpa spasi, titik, atau tanda hubung (-). Wajib persis sesuai e-KTP fisik terbaru."
        : "Enter 16 continuous digits without spaces or dashes. Must match your latest physical ID card.",
      example: "3271041908980002",
      pitfall: isId
        ? "Jangan gunakan NIK lama pada fotokopi Kartu Keluarga jika Anda baru saja pindah domisili."
        : "Do not use an outdated identification number if you have recently relocated your registered residence.",
      vaultKey: "nik",
      fallbackValue: "3271041908980002",
    },
    {
      id: "nama_lengkap",
      name: "nama_lengkap",
      label: isId ? "Nama Lengkap (Sesuai e-KTP)" : "Full Legal Name",
      badgeType: "official",
      badgeLabel: isId ? "🟢 Panduan Resmi" : "🟢 Official Guidance",
      meaning: isId
        ? "Nama sah pendaftar yang tercatat pada sistem administrasi kependudukan negara."
        : "Full official legal name as recorded in national civil administration systems.",
      howTo: isId
        ? "Tuliskan nama lengkap tanpa gelar akademik/keagamaan, kecuali formulir memiliki kolom gelar tersendiri."
        : "Enter your full legal name without academic titles, unless a dedicated field is provided.",
      example: "Budi Santoso",
      pitfall: isId
        ? "Perbedaan satu huruf antara KTP dan Ijazah dapat menyebabkan verifikasi manual tertolak."
        : "A single letter mismatch with educational diplomas may cause manual verification rejection.",
      vaultKey: "nama",
      fallbackValue: "Budi Santoso",
    },
    {
      id: "tanggal_lahir",
      name: "tanggal_lahir",
      label: isId ? "Tanggal Lahir" : "Date of Birth",
      badgeType: "curated",
      badgeLabel: isId ? "🔵 Owly Curated" : "🔵 Owly Curated",
      meaning: isId
        ? "Tanggal kelahiran sesuai akta kelahiran resmi dan e-KTP."
        : "Official date of birth matching civil birth records and government identity cards.",
      howTo: isId
        ? "Pilih tanggal dari kalender atau gunakan format YYYY-MM-DD sesuai standar portal."
        : "Select your birth date from calendar picker or enter ISO format YYYY-MM-DD.",
      example: "1998-08-19",
      pitfall: isId
        ? "Pastikan batas usia pendaftaran belum melewati ketentuan maksimal per 31 Desember tahun berjalan."
        : "Ensure you do not exceed the maximum cut-off age as of December 31 of current year.",
      vaultKey: "tanggal_lahir",
      fallbackValue: "1998-08-19",
    },
    {
      id: "alamat_ktp",
      name: "alamat",
      label: isId ? "Alamat Domisili KTP" : "Residential Address",
      badgeType: "curated",
      badgeLabel: isId ? "🔵 Owly Curated" : "🔵 Owly Curated",
      meaning: isId
        ? "Alamat tempat tinggal resmi yang tertera pada kartu identitas penduduk."
        : "Official registered residential address printed on government identification documents.",
      howTo: isId
        ? "Ketik nama jalan, nomor rumah, RT/RW, kelurahan, dan kecamatan secara lengkap."
        : "Enter complete street address, house/unit number, neighborhood, and city.",
      example: "Jl. Sudirman No. 45 RT 02/RW 04, Jakarta Pusat",
      pitfall: isId
        ? "Jangan hanya menuliskan nama kota, kelengkapan RT/RW sering menjadi syarat verifikasi kurir dokumen."
        : "Do not only specify the city; postal code and neighborhood details are required for courier delivery.",
      vaultKey: "alamat",
      fallbackValue: "Jl. Sudirman No. 45, Jakarta Pusat",
    },
    {
      id: "no_hp",
      name: "no_hp",
      label: isId ? "Nomor WhatsApp / Seluler" : "Mobile / WhatsApp Number",
      badgeType: "curated",
      badgeLabel: isId ? "🔵 Owly Curated" : "🔵 Owly Curated",
      meaning: isId
        ? "Nomor telepon aktif yang terhubung dengan layanan pesan singkat dan WhatsApp."
        : "Active mobile phone number connected to SMS messaging and WhatsApp channels.",
      howTo: isId
        ? "Gunakan format nomor nasional diawali 08 atau format internasional (+62)."
        : "Use national phone format starting with 08 or international format (+62).",
      example: "081234567890",
      pitfall: isId
        ? "Nomor yang tidak aktif saat proses wawancara atau verifikasi OTP akan menggugurkan pendaftaran."
        : "An inactive mobile number during OTP verification or interview calls will forfeit your application.",
      vaultKey: "no_hp",
      fallbackValue: "081234567890",
    },
    {
      id: "email",
      name: "email",
      label: isId ? "Alamat Email Aktif" : "Active Email Address",
      badgeType: "curated",
      badgeLabel: isId ? "🔵 Owly Curated" : "🔵 Owly Curated",
      meaning: isId
        ? "Surat elektronik utama untuk penerimaan aktivasi akun, verifikasi, dan pengumuman kelulusan."
        : "Primary email address for account activation links, verification codes, and final results.",
      howTo: isId
        ? "Gunakan email pribadi permanen berformat nama lengkap (hindari email instansi yang bisa kedaluwarsa)."
        : "Use a permanent personal email address with your full name (avoid temporary school/work emails).",
      example: "budi.santoso@alumni.ui.ac.id",
      pitfall: isId
        ? "Typo satu huruf pada domain email mengakibatkan Anda kehilangan akses tautan aktivasi tes."
        : "A single typo in your email domain causes permanent loss of login credentials and test links.",
      vaultKey: "email",
      fallbackValue: "budi.santoso@alumni.ui.ac.id",
    },
  ];
}

interface FormsGuideTabProps {
  isVaultUnlocked: boolean;
  isFormAnalyzed: boolean;
  onAnalyzeForm?: () => void;
  onBackToAssistant?: () => void;
  onNavigateTab?: (tabId: "guide" | "vault" | "audit") => void;
}

export function FormsGuideTab({
  isVaultUnlocked,
  isFormAnalyzed,
  onBackToAssistant,
  onNavigateTab,
}: FormsGuideTabProps) {
  const { language } = useLanguage();
  const isId = language === "id";

  const [rawScannedFields, setRawScannedFields] = useState<any[]>([]);
  const [fields, setFields] = useState<FieldItem[]>(() => getDefaultFields(isId));
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [hasAutofilled, setHasAutofilled] = useState(false);
  const [vaultData, setVaultData] = useState<Record<string, string>>({
    nik: "3271041908980002",
    nama: "Budi Santoso",
    tanggal_lahir: "1998-08-19",
    alamat: "Jl. Sudirman No. 45, Jakarta Pusat",
    email: "budi.santoso@alumni.ui.ac.id",
    no_hp: "081234567890",
  });

  // Sync vault data from storage if available
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(["savvy_vault_plain"], (res) => {
        if (res?.savvy_vault_plain && typeof res.savvy_vault_plain === "object") {
          setVaultData((prev) => ({ ...prev, ...(res.savvy_vault_plain as Record<string, string>) }));
        }
      });
    }
  }, [isVaultUnlocked]);

  // Load scanned fields from cache if exists
  useEffect(() => {
    if (!isFormAnalyzed) {
      setRawScannedFields([]);
      setFields(getDefaultFields(isId));
      setCurrentFieldIndex(0);
      return;
    }
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(["savvy_page_fields"], (res) => {
        if (res?.savvy_page_fields && Array.isArray(res.savvy_page_fields) && res.savvy_page_fields.length > 0) {
          setRawScannedFields(res.savvy_page_fields);
        }
      });
    }
  }, [isFormAnalyzed, isId]);

  // Whenever scanned fields or language change, classify fields semantically
  useEffect(() => {
    if (rawScannedFields.length > 0) {
      const classified = rawScannedFields.map((f) => classifyFieldGuidance(f, isId));
      setFields(classified);
    } else {
      setFields(getDefaultFields(isId));
    }
  }, [rawScannedFields, isId]);

  // Listen to FIELD_SELECTED_FROM_PAGE from content script (clicking number badge on webpage)
  useEffect(() => {
    const messageListener = (msg: any) => {
      if (msg?.type === "FIELD_SELECTED_FROM_PAGE") {
        if (typeof msg.fieldIndex === "number" && msg.fieldIndex >= 0 && msg.fieldIndex < fields.length) {
          setCurrentFieldIndex(msg.fieldIndex);
          setHasAutofilled(false);
          agentLog.perception(`🎯 Field #${msg.fieldIndex + 1} selected directly from page click.`);
        }
      }
    };

    if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(messageListener);
      return () => {
        chrome.runtime.onMessage.removeListener(messageListener);
      };
    }
  }, [fields.length]);

  const currentField = fields[currentFieldIndex] || getDefaultFields(isId)[0];
  const hasVaultKey = !!(currentField.vaultKey && vaultData[currentField.vaultKey]);

  // Helper function to navigate between fields (Before / Next)
  const handleNavigateField = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= fields.length) return;
    setCurrentFieldIndex(newIndex);
    setHasAutofilled(false);

    const targetField = fields[newIndex];
    agentLog.action(`🧭 Navigating to Field #${newIndex + 1}: ${targetField.label}`);

    // Send command to web page to scroll and spotlight this field
    sendTabMessage({
      type: "NAVIGATE_TO_FIELD",
      fieldIndex: newIndex,
      fieldId: targetField.id,
      fieldName: targetField.name,
    });
  };

  // Determine Vault Data preview value
  const rawVaultVal =
    (currentField.vaultKey && vaultData[currentField.vaultKey]) ||
    currentField.fallbackValue ||
    "";

  const getMaskedVal = (val: string) => {
    if (!val) return "";
    if (val.length <= 4) return val[0] + "xxx";
    return val.substring(0, 3) + "x".repeat(Math.max(4, val.length - 5)) + val.slice(-2);
  };

  const displayVaultVal = isVaultUnlocked ? rawVaultVal : getMaskedVal(rawVaultVal);

  // Single-Field Autofill action
  const handleFillFromVault = () => {
    if (!isVaultUnlocked) {
      if (onNavigateTab) {
        onNavigateTab("vault");
      }
      return;
    }

    sendTabMessage({
      type: "INJECT_VALUE",
      fieldIndex: currentFieldIndex,
      fieldId: currentField.id,
      fieldName: currentField.name,
      value: rawVaultVal,
    });

    setHasAutofilled(true);
    agentLog.action(`⚡ Single-field autofilled: '${currentField.label}'`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-800 text-left">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 px-3.5 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
        <button
          onClick={onBackToAssistant}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-savvy-blue transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-savvy-blue" />
          <span>{isId ? "Kembali ke AI Assistant" : "Back to AI Assistant"}</span>
        </button>

        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-50 text-savvy-blue border border-blue-200/80">
          {isId ? `Kolom ${currentFieldIndex + 1} dari ${fields.length}` : `Field ${currentFieldIndex + 1} of ${fields.length}`}
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {/* Active Field Focus Banner */}
        <div className="bg-savvy-soft-blue border border-savvy-blue/30 rounded-2xl p-3.5 flex items-start justify-between gap-2 shadow-2xs">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-savvy-blue text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-savvy-blue animate-pulse shrink-0" />
              <span className="truncate">#{currentFieldIndex + 1}. {currentField.label}</span>
            </div>
            <div className="text-[11px] text-slate-700 mt-1 font-semibold leading-tight flex items-baseline gap-1.5 flex-wrap">
              <span className="text-slate-400 font-medium text-[10px] uppercase tracking-wider">{isId ? "Artinya:" : "Meaning:"}</span>
              <span className="text-slate-900 font-bold">{currentField.localizedLabel || currentField.label}</span>
            </div>
          </div>

          {/* 3-Tier Dynamic Badge */}
          {currentField.badgeType === "official" && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px] border border-emerald-300 shrink-0">
              🟢 {currentField.badgeLabel || "Official Guidance"}
            </span>
          )}
          {currentField.badgeType === "curated" && (
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[10px] border border-blue-300 shrink-0">
              🔵 {currentField.badgeLabel || "Owly Curated"}
            </span>
          )}
          {currentField.badgeType === "ai" && (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-extrabold text-[10px] border border-amber-300 shrink-0">
              🟡 {currentField.badgeLabel || "AI Guidance"}
            </span>
          )}
        </div>

        {/* 4-Element Guidance Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3.5 text-xs text-left">
          {/* 1. Arti Istilah / Field Meaning */}
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              {isId ? "ARTI ISTILAH:" : "FIELD MEANING:"}
            </span>
            <p className="text-slate-900 font-semibold mt-1 leading-snug">
              {currentField.meaning}
            </p>
          </div>

          {/* 2. Cara Mengisi / How to Fill */}
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              {isId ? "CARA MENGISI:" : "HOW TO FILL:"}
            </span>
            <p className="text-slate-600 mt-1 leading-snug">
              {currentField.howTo}
            </p>
          </div>

          {/* 3. Contoh Valid / Valid Example */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              {isId ? "CONTOH VALID:" : "VALID EXAMPLE:"}
            </span>
            <code className="text-savvy-blue font-mono font-bold text-xs mt-1 block">
              {currentField.example}
            </code>
          </div>

          {/* 4. Jebakan Umum / Common Pitfall */}
          <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200/90">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{isId ? "JEBAKAN UMUM (PITFALL):" : "COMMON PITFALL:"}</span>
            </span>
            <p className="text-[11px] text-amber-950 mt-1 leading-snug">
              {currentField.pitfall}
            </p>
          </div>

          {/* 5. Data Anda (Dari Vault / Status Pengisian) */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/90 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-savvy-blue" />
                <span>{hasVaultKey ? (isId ? "DATA ANDA (DARI VAULT):" : "YOUR DATA (FROM VAULT):") : (isId ? "STATUS PENGISIAN:" : "INPUT STATUS:")}</span>
              </span>
              <div className="font-mono font-bold text-xs text-slate-800 mt-0.5">
                {hasVaultKey
                  ? displayVaultVal
                  : currentField.type === "file"
                  ? (isId ? "Unggah berkas langsung di halaman" : "Upload file directly on web page")
                  : (isId ? "Diisi / dipilih langsung pada formulir" : "Fill / select directly on form")}
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500">
              {hasVaultKey
                ? isVaultUnlocked
                  ? (isId ? "Terbuka" : "Unlocked")
                  : (isId ? "Terkunci" : "Locked")
                : (isId ? "Manual / Web" : "Manual / Web")}
            </span>
          </div>
        </div>

        {/* Tombol: Isi Kolom dari Vault ATAU Petunjuk Langsung */}
        {hasVaultKey ? (
          <button
            onClick={handleFillFromVault}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
              !isVaultUnlocked
                ? "bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200"
                : hasAutofilled
                ? "bg-savvy-green text-white hover:opacity-95"
                : "bg-savvy-gradient text-white hover:opacity-95 shadow-sm shadow-savvy-blue/20"
            }`}
          >
            {!isVaultUnlocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>{isId ? "Buka Vault untuk Mengisi Kolom" : "Unlock Vault to Fill Field"}</span>
              </>
            ) : hasAutofilled ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isId ? "Kolom Berhasil Diisi!" : "Field Filled Successfully!"}</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>{isId ? `Isi Kolom Ini dari Vault (${displayVaultVal.slice(0, 8)}...)` : `Fill Field from Vault (${displayVaultVal.slice(0, 8)}...)`}</span>
              </>
            )}
          </button>
        ) : (
          <div className="w-full py-2.5 px-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200/90">
            {currentField.type === "file" ? (
              <>
                <span>📁</span>
                <span>{isId ? "Klik tombol Upload pada halaman web untuk memilih berkas" : "Click Upload button on web page to select file"}</span>
              </>
            ) : (
              <>
                <span>✏️</span>
                <span>{isId ? "Isi atau pilih opsi ini langsung pada halaman formulir" : "Enter or select option directly on the web form"}</span>
              </>
            )}
          </div>
        )}

        {/* Tombol Navigasi: Before & Next */}
        <div className="grid grid-cols-2 gap-2 pt-1 pb-2">
          <button
            onClick={() => handleNavigateField(currentFieldIndex - 1)}
            disabled={currentFieldIndex === 0}
            className={`py-2 px-3 rounded-xl border font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              currentFieldIndex === 0
                ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-2xs"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{isId ? "Sebelumnya" : "Previous"}</span>
          </button>

          <button
            onClick={() => handleNavigateField(currentFieldIndex + 1)}
            disabled={currentFieldIndex === fields.length - 1}
            className={`py-2 px-3 rounded-xl border font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              currentFieldIndex === fields.length - 1
                ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed"
                : "bg-white text-savvy-blue border-blue-200 hover:bg-blue-50/50 hover:border-savvy-blue shadow-2xs"
            }`}
          >
            <span>{isId ? "Selanjutnya" : "Next"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

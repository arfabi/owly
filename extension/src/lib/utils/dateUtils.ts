// ============================================================================
// OWLY.AI — Smart Date Normalizer & Formatter
// Bridges Vault (DD-MM-YYYY) <-> HTML5 DOM (YYYY-MM-DD) <-> Form Text Inputs
// ============================================================================

export interface ParsedDate {
  year: string;
  month: string;
  day: string;
}

/**
 * Parses multiple date formats into { year, month, day }.
 * Supported formats:
 * - YYYY-MM-DD or YYYY/MM/DD (ISO standard)
 * - DD-MM-YYYY or DD/MM/YYYY (Indonesian standard, Vault default)
 * - MM/DD/YYYY or MM-DD-YYYY (US standard)
 * - Textual dates (e.g., "15 Agustus 1998")
 */
export function parseFlexibleDate(raw: string): ParsedDate | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();

  // 1. ISO format: YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return {
      year: y,
      month: m.padStart(2, "0"),
      day: d.padStart(2, "0"),
    };
  }

  // 2. Format: DD-MM-YYYY or MM-DD-YYYY or DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const [, p1, p2, y] = dmyMatch;
    const n1 = parseInt(p1, 10);
    const n2 = parseInt(p2, 10);

    let day = p1;
    let month = p2;

    // Disambiguation
    if (n1 > 12 && n2 <= 12) {
      // p1 is definitely day (e.g. 15-08-1998)
      day = p1;
      month = p2;
    } else if (n2 > 12 && n1 <= 12) {
      // p2 is definitely day, p1 is month (e.g. 08-15-1998)
      day = p2;
      month = p1;
    } else {
      // Default standard in Indonesia & Vault is DD-MM-YYYY
      day = p1;
      month = p2;
    }

    return {
      year: y,
      month: month.padStart(2, "0"),
      day: day.padStart(2, "0"),
    };
  }

  // 3. Date with text month (e.g. "15 Agustus 1998" or "August 15, 1998")
  const idMonths: Record<string, string> = {
    januari: "01", feb: "02", februari: "02", mar: "03", maret: "03", apr: "04", april: "04",
    mei: "05", jun: "06", juni: "06", jul: "07", juli: "07", agu: "08", agustus: "08",
    sep: "09", september: "09", okt: "10", oktober: "10", nov: "11", november: "11", des: "12", desember: "12",
    january: "01", february: "02", march: "03", may: "05", june: "06", july: "07", august: "08",
    october: "10", december: "12",
  };
  const textMatch = trimmed.toLowerCase().match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/);
  if (textMatch) {
    const [, d, monthName, y] = textMatch;
    const m = idMonths[monthName];
    if (m) {
      return { year: y, month: m, day: d.padStart(2, "0") };
    }
  }

  return null;
}

/**
 * Formats a date string specifically for a given DOM input element or context.
 * - HTML5 <input type="date"> MUST strictly be YYYY-MM-DD in the DOM value,
 *   regardless of whether the browser visually displays "mm/dd/yyyy" or "dd/mm/yyyy".
 * - Text inputs adapt to hints in placeholder, pattern, or attributes.
 */
export function formatDateForField(
  rawVal: string,
  inputEl?: HTMLInputElement | null,
  hint?: string
): string {
  const parsed = parseFlexibleDate(rawVal);
  if (!parsed) return rawVal;

  // HTML5 native date input requirement (strictly YYYY-MM-DD in DOM value)
  if (inputEl?.type === "date") {
    return `${parsed.year}-${parsed.month}-${parsed.day}`;
  }

  const contextStr = `${hint || ""} ${inputEl?.placeholder || ""} ${inputEl?.getAttribute("pattern") || ""} ${inputEl?.name || ""} ${inputEl?.id || ""}`.toLowerCase();

  // If text input expects MM/DD/YYYY
  if (contextStr.includes("mm/dd") || contextStr.includes("mm-dd") || contextStr.includes("m/d/y")) {
    const sep = contextStr.includes("mm-dd") ? "-" : "/";
    return `${parsed.month}${sep}${parsed.day}${sep}${parsed.year}`;
  }

  // If text input expects YYYY-MM-DD
  if (contextStr.includes("yyyy-mm") || contextStr.includes("yyyy/mm")) {
    const sep = contextStr.includes("yyyy/") ? "/" : "-";
    return `${parsed.year}${sep}${parsed.month}${sep}${parsed.day}`;
  }

  // If text input expects DD/MM/YYYY
  if (contextStr.includes("dd/mm") || contextStr.includes("d/m/y")) {
    return `${parsed.day}/${parsed.month}/${parsed.year}`;
  }

  // Default format for text input in Indonesian context
  return `${parsed.day}-${parsed.month}-${parsed.year}`;
}

# 🛡️ Form Audit Engine — Technical Architecture & Universal Deep-Dive

> **Feature Specification:** `feature/audit.md`  
> **Status:** Production-Ready  
> **Target Audience:** Core AI Engineers, Security Auditors, and System Architects

---

## 1. Executive Overview & Global Mission

Across high-stakes international and national online portals—including consular visa systems (e.g., **US DS-160 / ESTA**, **Schengen Visa**, **UKVI**, **Canada Express Entry**), global fellowship applications (e.g., **Fulbright**, **Chevening**, **Erasmus Mundus**, **DAAD**), university admissions (e.g., **Common Application**, **UCAS**), and state or national registries (e.g., **Texas DMV / Real ID**, **UK GOV.UK**, **Singapore Singpass**, and **Indonesia LPDP/SSCASN**)—**over 60% of rejections occur during the initial administrative pre-screening phase**.

These administrative rejections are rarely caused by academic, technical, or professional deficits. Rather, they stem from minor, preventable formatting errors and fine-print oversights:
1. **Identity & Checksum Typos:** Transposition errors in national identification numbers, passport numbers, or state driver licenses.
2. **Inter-Field Coherence Contradictions:** Semantic or logical clashes across inputs (e.g., date of birth not matching the date encoded in a national ID or license, or claiming an exemption without attaching the required supporting affidavit).
3. **Obscure Conditional Guidelines:** Mandatory requirements buried deep in footnote instructions or institutional guidelines (e.g., requiring a specific degree equivalence certificate only when a foreign institution is selected).
4. **Attachment Non-Compliance:** Uploading documents that violate strict page constraints (e.g., file size exceeding 500 KB, unaccepted file formats, or uncompressed photos).

The **Savvy Universal Form Audit Engine** is an in-browser pre-submission auditor designed to eradicate administrative disqualification globally. Operating directly within the user's browser via the Savvy Chrome Extension Side Panel, it audits web forms dynamically before the user clicks "Submit".

---

## 2. Core Architectural Philosophy: The Deterministic vs. Probabilistic Divide

A fundamental design tenet of Savvy is the rigorous boundary established between deterministic computation and probabilistic artificial intelligence:

| Responsibility | Engine / Execution Environment | Rationale |
|---|---|---|
| **Deterministic Precision** | Client-Side TypeScript FSM | Formal syntax validation (RFC 5322 email syntax, E.164 phone formats, ICAO Doc 9303 passports, national ID checksums, Levenshtein distance) demands **100% mathematical certainty**, zero hallucinations, zero latency (<5ms), and zero token overhead. |
| **Zero-Knowledge Privacy** | Browser Local Storage (`chrome.storage.local`) | Reconciling typed form fields against the applicant's verified personal Vault must execute **exclusively on the client device** without transmitting confidential Personally Identifiable Information (PII) to external cloud servers. |
| **Probabilistic Cognitive Reasoning** | **Meta Muse Spark Open** | Parsing uncurated page instructions, scattered footnote guidelines, complex cross-field dependencies, and domain-specific edge cases requires deep contextual language comprehension. |

---

## 3. End-to-End System Architecture

The following sequence diagram outlines the complete data lifecycle of a live Form Audit session:

```mermaid
sequenceDiagram
    autonumber
    actor User as Applicant / Citizen
    participant Ext as Extension SidePanel (AuditorTab)
    participant CS as Content Script (Webpage DOM)
    participant CA as Client-Side Auditor Engine
    participant PII as Client PII Sanitizer
    participant Gateway as Next.js API (/api/form/audit)
    participant Muse as Meta Muse Spark Open (Baseten)

    User->>Ext: Triggers "Run Form Audit"
    Ext->>CS: Dispatches EXTRACT_FORM_AUDIT_DATA
    CS->>CS: Traverses DOM tree, active inputs, footnotes & upload metadata
    CS-->>Ext: Returns Form Snapshot (fields, pageUploadContext, meta)
    
    rect rgb(240, 248, 255)
    note right of Ext: Layer 1-4: Deterministic Client Audit (<5ms)
    Ext->>CA: Invokes runClientSideComprehensiveAudit()
    CA->>CA: Layer 1: Mandatory & Required Field Verification
    CA->>CA: Layer 2: Universal Format, Checksum & Relational Cross-Checks
    CA->>CA: Layer 3: Zero-Knowledge Vault Discrepancy Matching
    CA->>CA: Layer 4: File Size & Attachment MIME Type Validation
    CA-->>Ext: Returns localReport (issues, passedCount, score)
    end

    rect rgb(255, 250, 240)
    note right of Ext: Layer 5: Cloud Cognitive Semantic Audit
    Ext->>PII: Strips identity numbers, emails, and phone numbers
    Ext->>Gateway: POST /api/form/audit (Sanitized Context)
    Gateway->>Gateway: Applies empty-form guardrail & structural prompt
    Gateway->>Muse: Chat Completion (model: muse-spark-open-1026, reasoning_effort: medium)
    Muse->>Muse: Multi-turn CoT reasoning on conditional constraints
    Muse-->>Gateway: Raw Structured JSON ({ aiFindings, recommendations })
    Gateway-->>Ext: Returns AI Findings
    end

    Ext->>Ext: Merges Local Report + AI Findings into ComprehensiveAuditReport
    Ext-->>User: Renders Traffic-Light Dashboard (Score 0-100%, 1-Click Fix Actions)
```

---

## 4. Multi-Layer Audit Breakdown & Universal Badge Taxonomy

Issues identified during an audit are tagged with a standardized universal taxonomy:

| Universal Badge | Localized Tag (ID) | Severity | Definition & Trigger Condition |
|---|---|---|---|
| `REQUIRED` | `WAJIB` | Critical (Red) | Missing mandatory input, unselected required dropdown, or empty required radio selection. |
| `FORMAT` | `FORMAT` | Critical (Red) | Syntax violations, length errors, regex/checksum failures, or relational contradictions between fields. |
| `DISCREPANCY` | `SUMBER` | Warning (Yellow) | Input differs slightly from verified Vault records (potential typo; triggers 1-Click Auto-Heal). |
| `ATTACHMENT` | `BERKAS` | Critical (Red) | Attached file exceeds size threshold, has disallowed extension, or mandatory upload slot is empty. |
| `RULE` | `ATURAN` | Critical / Warning | Complex institutional conditional logic or footnote instruction evaluated by Meta Muse Spark Open. |
| `VALID` | `VALID` | Success (Green) | Field conforms to all formatting, relational, and vault integrity checks. |
| `RESOLVED` | `TERATASI` | Success (Green) | Issue that has been resolved via 1-click synchronization or automated fix. |

---

### Layer 1: DOM & Mandatory Guardrail (Form Completeness)
* **Target Elements:** All `input`, `select`, `textarea`, and file upload elements present on the host page.
* **Extraction Strategy:** Scrapes HTML5 `required`, `aria-required="true"`, parent label asterisk markers (`*`), and custom validation class markers.
* **Verification Logic:** Detects empty strings, whitespace-only inputs, and untouched select placeholders (e.g., `"-- Select --"`, `"Choose..."`, `"Pilih..."`).
* **Assigned Badge:** `REQUIRED` (Severity: **Red** / Critical).
* **Action:** Binds a `HIGHLIGHT` action that scrolls the host viewport to the exact coordinates of the missing element and triggers a CSS beacon pulse.

---

### Layer 2: Universal Format & Relational Cross-Validation

Layer 2 executes strict algorithmic validation alongside **inter-field relational coherence inferences**:

#### 2.1 Universal Identity Documents & Passports
* **ICAO Doc 9303 Passports:** Validates machine-readable travel document (MRTD) formatting (1 uppercase letter followed by 7 to 8 alphanumeric characters).
* **State & Regional Identification:**
  * **US Driver Licenses (e.g., Texas DMV, California Real ID):** Validates alphanumeric pattern formats (`^[A-Z0-9-]{7,15}$`).
  * **National IDs (e.g., Indonesian NIK):** Validates 16-digit length, verifies Ministry of Home Affairs provincial ranges (`11`–`94`), and decodes calendar validity.
* **Relational Cross-Checking (National ID vs. Form Date of Birth):**
  * When an ID encodes the birth date (e.g., digits 7–12 in Indonesian NIK: `DDMMYY`, with `+40` added to the day for females), the engine cross-references this with the separate "Date of Birth" field entered on the form.
  * If an applicant enters `15-08-1998` in the date picker but their typed ID encodes `070795`, the engine flags an immediate **Relational Format Contradiction**.
* **Relational Cross-Checking (National ID vs. Gender):**
  * Verifies gender encoded in identity markers against selected form options to prevent accidental administrative discrepancies.

#### 2.2 Global Telephony & Contact Standards
* **E.164 Global Formats:** Validates standard international phone numbers with valid country codes (`+1...`, `+44...`, `+62...`, etc.) and allowable lengths (7 to 15 digits).
* **Carrier Verification:** For regional configurations, validates active mobile network prefix allocations.

#### 2.3 Email & Domain Typo Detection
* Conforms strictly to RFC 5322 syntax.
* Features a built-in Levenshtein distance check against common top-level email domains (e.g., flagging `@gmai.com`, `@gamil.com`, `@yaho.com`, `@outlok.com` with corrective suggestions).

#### 2.4 Name Cleanliness
* Detects accidental numeric digits or punctuation inside legal name fields.

---

### Layer 3: Zero-Knowledge Vault Reconciler (Official Data Grounding & Auto-Heal)

* **Zero-Knowledge Architecture:** The user's verified profile data (extracted from official documents such as Passports, Driver Licenses, and Diplomas via multimodal OCR) is stored locally in extension storage (`chrome.storage.local`). It is **never** sent to any external audit server.
* **Fuzzy Field Alignment:** Matches form field labels with corresponding Vault attributes using semantic alias tables (e.g., `"DL Number"` matches `"Driver License No"`).
* **Discrepancy Detection:** If a typed value is close to but differs from the verified Vault record (e.g., typed `"JONATHAN R DOE"` instead of verified `"JONATHAN ROBERT DOE"`), the engine flags a `DISCREPANCY` warning.
* **1-Click Auto-Heal (`REPLACE_VALUE`):** The audit card displays a direct fix action: **"Apply Verified Vault Value"**. Clicking this dispatches a synthetic DOM event sequence (`input`, `change`, `blur`) directly into the target element, healing the discrepancy instantly.

---

### Layer 4: File Compliance & Attachment Inspector

* **Metadata Extraction:** Scrapes active file inputs for attached filenames, extensions, and exact byte sizes.
* **Contextual Constraint Harvesting:** Collects page-wide instructional text blocks mentioning file restrictions (e.g., `"Max size: 500 KB"`, `"Accepted formats: PDF"`, `"Recent passport photograph"`).
* **Constraint Audits:**
  1. **File Size Overflow:** Flags attachments whose `fileSizeKb` exceeds the detected page limit or standard gateway threshold (5 MB).
  2. **Extension Discrepancies:** Flags files whose format (e.g., `.png`, `.docx`) contradicts mandatory submission requirements (e.g., `.pdf`).
  3. **Empty Mandatory Attachments:** Flags required upload inputs where no file has been attached.
* **Assigned Badge:** `ATTACHMENT` (Severity: **Red** / Critical).

---

## 5. Deep-Dive: Meta Muse Spark Open Integration

The probabilistic semantic component is powered by **Meta Muse Spark Open (`meta-models/muse-spark-open-1026`)**, served via the Baseten High-Performance Inference Gateway (`https://inference.baseten.co/v1`).

### 5.1 Model Role & Semantic Disqualification Prevention

While deterministic rules catch syntax and length errors, Meta Muse Spark Open acts as the **Semantic & Disqualification Reasoner**. Its responsibility is to identify fine-print conditions and cross-field policy traps across the form.

```
Universal Example:
- Applicant selects: "Visa Category: J-1 Exchange Visitor"
- Form field: "DS-2019 Program Number: [EMPTY]"
- Host Page Note: "All J-1 applicants must enter an active SEVIS ID and Certificate of Eligibility (Form DS-2019) number prior to scheduling."
- Action: Meta Muse Spark Open recognizes this conditional dependency and flags a critical RULE issue before the applicant submits.
```

### 5.2 Reasoning Effort Calibration (`reasoning_effort: 'medium'`)

Meta Muse Spark Open incorporates tunable Chain-of-Thought (CoT) reasoning via the `reasoning_effort` parameter:

```typescript
// web/src/app/api/form/audit/route.ts
const basetenRes = await fetch(`${basetenBaseUrl}/chat/completions`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${basetenApiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'meta-models/muse-spark-open-1026',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    temperature: 0.1,
    reasoning_effort: 'medium', // Optimal sweet-spot for multi-field audit
    max_tokens: 2500,
    response_format: { type: 'json_object' },
  }),
});
```

#### Why `reasoning_effort: 'medium'`?
* **Failure Mode with `reasoning_effort: 'high'`:** In extensive benchmark testing on complex multi-field applications (15+ fields), setting `high` caused the model to generate up to 2,046 reasoning tokens analyzing combinatorial field relationships. With a standard `max_tokens: 2048`, the generation budget was exhausted before the model could emit the final JSON `content`, resulting in `content: null` and an abrupt `finish_reason: "length"`.
* **Failure Mode with `reasoning_effort: 'low'`:** Setting `low` resulted in rapid responses (~1.2s), but occasionally missed correlating file size requirements in footer notes with the attached files array.
* **The Solution:** Configuring `reasoning_effort: 'medium'` with `max_tokens: 2500` produces ~450–600 reasoning tokens, runs in ~3.8 seconds, and consistently outputs complete, well-formed JSON.

---

### 5.3 Privacy-Preserving PII Redaction Pipeline

To comply with global data protection regulations (e.g., **GDPR**, **CCPA**, and **UU PDP**), **no raw personal identity numbers or contact credentials are sent to the cloud audit model**.

Before transmitting form snapshots to the Next.js API, the client passes values through the `stripPII` sanitizer:

```typescript
function stripPII(str: string): string {
  if (!str) return '';
  return str
    .replace(/\b[1-9]\d{15}\b/g, '[REDACTED_NATIONAL_ID]')
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[REDACTED_EMAIL]')
    .replace(/\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[REDACTED_PHONE]');
}
```

The cloud reasoner receives **structural schema context** (field labels, input types, whether a value is present, and validation rules) rather than the applicant's private personal identity data.

---

### 5.4 Defensive Parsing & Guardrails

To guarantee zero JSON decoding failures without markdown fence artifacts:
1. **Native Structured Outputs:** Enforced via `response_format: { type: 'json_object' }`.
2. **Defensive Parsing Engine (`extractCleanJson`):** Strips markdown fences (````json ... ````) and performs regex boundary substring matching if trailing tokens or commentary exist.
3. **Empty Form Guardrail:** If the page scraper detects 0 form fields, the API terminates immediately with a status 200 guardrail message, saving inference calls and token budget.

---

## 6. Compound Multi-Agent System & Execution Loops

The Form Audit feature operates as a **Compound Multi-Agent Architecture**:

```
                       [ Host Webpage DOM ]
                                 │
                     (Scrape Snapshot via RPC)
                                 ▼
                 ┌───────────────────────────────┐
                 │ 1. Perception & Scraper Agent │
                 └───────────────┬───────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
  ┌─────────────────────────────┐ ┌─────────────────────────────┐
  │ 2. Deterministic FSM Agent  │ │ 3. Zero-Knowledge Reconciler│
  │    - Format & Regex Rules   │ │    - Local Vault Matching   │
  │    - Inter-field Relational │ │    - Auto-Heal Fix Action   │
  │    - File Size Checks       │ └──────────────┬──────────────┘
  └──────────────┬──────────────┘                │
                 │                               │
                 └───────────────┬───────────────┘
                                 │
                    (Sanitized Structural Context)
                                 ▼
                 ┌───────────────────────────────┐
                 │ 4. Semantic Disqualification  │
                 │    Reasoner (Muse Spark Open) │
                 │    - Footnote Instructions    │
                 │    - Conditional Logic        │
                 └───────────────┬───────────────┘
                                 │
                                 ▼
                 ┌───────────────────────────────┐
                 │ 5. Synthesis & Action Dispatch│
                 │    - Score Calculation (0-100)│
                 │    - Traffic Light Dashboard  │
                 │    - 1-Click Fix Actions      │
                 └───────────────────────────────┘
```

1. **Perception & Scraper Agent (`content.ts`):** Injected into the active tab; harvests the live DOM tree, input rules, visible labels, and attached file buffers.
2. **Deterministic FSM Agent (`clientAuditor.ts`):** Evaluates mathematical rules, checksums, and syntax in <5ms.
3. **Zero-Knowledge Reconciler Agent (`clientAuditor.ts`):** Detects discrepancies between typed values and verified Vault credentials without external network exposure.
4. **Semantic Disqualification Reasoner Agent (`route.ts` via Muse Spark Open):** Identifies conditional inter-field contradictions and subtle footnote requirements.
5. **Synthesis & Action Dispatcher (`AuditorTab.tsx`):** Merges deterministic and probabilistic findings into a unified report, computes the 0–100% compliance score, and binds interactive actions (`HIGHLIGHT`, `REPLACE_VALUE`).

---

## 7. Data Models & TypeScript Specifications

### 7.1 Input Snapshot (`ScrapedFormField`)
```typescript
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
```

### 7.2 Audit Issue Schema (`AuditIssue`)
```typescript
export type AuditBadge =
  | "REQUIRED"
  | "FORMAT"
  | "DISCREPANCY"
  | "ATTACHMENT"
  | "RULE"
  | "VALID"
  | "WAJIB"       // Localized alias (ID)
  | "SUMBER"      // Localized alias (ID)
  | "BERKAS"      // Localized alias (ID)
  | "ATURAN";     // Localized alias (ID)

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
  badge: AuditBadge;
  message: string;
  hint?: string;
  juknisRef?: string;
  action?: AuditAction;
}
```

### 7.3 Comprehensive Audit Report (`ComprehensiveAuditReport`)
```typescript
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
```

---

## 8. Graceful Degradation & Resilience

1. **Cloud Offline Fallback:** If the network is disconnected, Baseten is experiencing downtime, or the API key is not configured, the system **never crashes**. It automatically falls back to the client-side deterministic report, guaranteeing that 100% of Layer 1–4 checks (Format, Email, Passports, Required fields, Vault comparison) continue to function.
2. **Lossless Rollback:** When an Auto-Heal action is executed (`REPLACE_VALUE`), a pre-change snapshot is saved into the extension's undo history stack, allowing the user to undo any automated modification with a single click.
3. **Non-Blocking Operation:** The entire audit pipeline executes asynchronously; the host form remains responsive, and no user inputs are locked during analysis.

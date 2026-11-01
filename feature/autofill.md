# ⚡ Universal Autofill & Document Ingestion Engine — Technical Architecture

> **Feature Specification:** `feature/autofill.md`  
> **Status:** Production-Ready  
> **Target Audience:** Core AI Engineers, Browser Extension Architects, and Security Auditors

---

## 1. Executive Overview & Global Problem Statement

Across high-stakes international web portals—including consular visa applications (e.g., **US DS-160 / ESTA**, **Schengen Visa**, **UKVI**, **Canada Express Entry**), academic admissions and fellowships (e.g., **Common Application**, **UCAS**, **Fulbright**, **Chevening**), and state administrative portals (e.g., **Texas DMV / Real ID**, **UK GOV.UK**, **Singapore Singpass**)—users face long, exhausting, and repetitive data-entry workflows.

Traditional browser autofill tools (e.g., basic browser autocomplete) fail catastrophically on these portals due to four fundamental limitations:
1. **Schema Heterogeneity:** Government portals deliberately randomize or obfuscate input names (e.g., `ctl00$cphMain$txt_app_fname`, `field_8923_val`, or `txtSurName`) rather than using standard HTML5 autocomplete tokens (`name="given-name"`).
2. **Dynamic Front-End Frameworks:** Modern web forms built on React, Vue, Angular, or custom design systems discard values injected purely via JavaScript property assignment (`input.value = "..."`) unless native event lifecycles (`input`, `change`, `blur`) are dispatched with full bubbling.
3. **Multi-Document Ingestion Barrier:** Identity information is fragmented across heterogeneous physical documents (Passports, Driver Licenses, Degree Transcripts, Proof of Residence). Users are forced to manually transcribe data back and forth, introducing human transposition typos.
4. **Cloud Privacy Risk:** Sending unredacted identity documents (passports, social security / national ID numbers) to third-party autofill cloud servers creates severe regulatory and identity theft liabilities.

The **Savvy Universal Autofill & Ingestion Engine** resolves these challenges through a **Zero-Knowledge, Multimodal AI Architecture**:
* **Universal Document Ingestion:** Extracts high-accuracy structured key-values from any official document (e.g., Texas Driver License, ICAO Passport, Degree Certificate) using **Meta Muse Spark Open** visual AI.
* **Client-Side Zero-Knowledge Vault:** Extracted credentials reside exclusively within the user's browser local storage (`chrome.storage.local`) with AES-256 encryption. Raw documents are processed ephemerally and never persisted.
* **1-Click Batch Autofill:** Automatically aligns and injects dozens of fields across complex forms in <200ms with a guaranteed **1-Click Lossless Undo**.
* **Step-by-Step Guided Autofill:** Powers targeted field-by-field injection from the Form Guide and AI Copilot sidepanel with interactive beacon spotlighting.

---

## 2. End-to-End System Architecture

The following sequence diagram illustrates the complete workflow: from physical document upload to semantic alignment and reactive DOM injection.

```mermaid
sequenceDiagram
    autonumber
    actor User as Applicant
    participant ExtUI as Extension SidePanel (VaultTab / FormsGuide)
    participant Gateway as Next.js API Gateway (/api/document/extract)
    participant Muse as Meta Muse Spark Open (Baseten)
    participant LocalVault as Browser Storage (chrome.storage.local)
    participant CS as Content Script (Webpage DOM)

    rect rgb(240, 248, 255)
    note right of User: Phase 1: Zero-Knowledge Document Ingestion
    User->>ExtUI: Drops/Uploads Document Image (DL, Passport, Transcript)
    ExtUI->>ExtUI: Encodes image to Base64 Data URL (In-Memory)
    ExtUI->>Gateway: POST /api/document/extract (imageBase64)
    Gateway->>Muse: Multimodal Chat Completion (model: muse-spark-open-1026, reasoning_effort: low)
    Muse->>Muse: Visual OCR + Semantic Entity Recognition
    Muse-->>Gateway: Structured JSON ({ documentType, fields: [...] })
    Gateway-->>ExtUI: Returns Cleaned Extracted Fields
    ExtUI->>LocalVault: Persists encrypted fields in Vault (Zero Cloud Retention)
    end

    rect rgb(255, 250, 240)
    note right of User: Phase 2: Manual Curation (Vault CRUD)
    User->>ExtUI: Adds custom field, edits alias, or deletes record
    ExtUI->>LocalVault: Updates savvy_verified_profile_items & savvy_vault_plain
    end

    rect rgb(240, 255, 240)
    note right of User: Phase 3: 1-Click Batch Autofill Execution
    User->>ExtUI: Clicks "1-Click AutoFill"
    ExtUI->>CS: Dispatches BATCH_AUTOFILL with Vault items
    CS->>CS: Captures pre-injection DOM snapshot (__SAVVY_UNDO_BACKUP__)
    CS->>CS: Traverses DOM: matches labels/aliases via Fuzzy Alignment
    CS->>CS: Injects values & dispatches synthetic bubbling events (input, change)
    CS-->>ExtUI: Returns injectedCount: 18
    ExtUI-->>User: Renders success status + Undo Action Bar
    end
```

---

## 3. Core Feature Pillars

### 3.1 Pillar 1: Upload ID & Document (Multimodal Ingestion)

The ingestion pipeline transforms unstructured physical document photos into structured, actionable Vault data.

#### HTML5 Drag-and-Drop + File Trigger
The Vault interface (`VaultTab.tsx`) implements dual upload modalities:
* **Interactive Drop Zone:** Full HTML5 drag-and-drop event handlers (`onDragOver`, `onDragEnter`, `onDragLeave`, `onDrop`) with live visual scaling, dashed border glow, and drop state transitions.
* **Direct File Input:** Hidden file input triggered by whole-card click, accepting image MIME types (`.jpg`, `.jpeg`, `.png`, `.webp`).

#### Multimodal Visual Extraction via Meta Muse Spark Open
When a document is uploaded, the browser encodes the file buffer as a Base64 Data URL and invokes `POST /api/document/extract`:

```typescript
// web/src/app/api/document/extract/route.ts
const basetenRes = await fetch(`${basetenBaseUrl}/chat/completions`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${basetenApiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'meta-models/muse-spark-open-1026',
    messages: [
      {
        role: 'system',
        content: `You are an expert document OCR and structured data extraction AI.
Analyze the provided document image and extract all official fields into a clean JSON structure:
{
  "documentType": "string (e.g. Driver License, Passport, University Degree, Tax ID)",
  "confidence": number,
  "fields": [
    {
      "id": "standardized_snake_case_id",
      "name": "Human-Readable English Field Name",
      "value": "Extracted string value",
      "aliases": ["Alternative Label 1", "Alternative Label 2"],
      "sourceTag": "Document Type"
    }
  ]
}`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract all official identity fields, registration numbers, dates, and attributes from this document.',
          },
          {
            type: 'image_url',
            image_url: { url: imageBase64 },
          },
        ],
      },
    ],
    temperature: 0.1,
    reasoning_effort: 'low',
    max_tokens: 3000,
    response_format: { type: 'json_object' },
  }),
});
```

#### Real Benchmark Case Studies:
* **Texas Driver License (USA):** Extracted 10 distinct entities: Driver License Number (`dl_number`), Full Legal Name, Address, Date of Birth (`dob`), Issue Date, Expiration Date, Sex, Height, Eye Color, Class (`C`).
* **University Degree / Academic Transcript:** Extracted 12 distinct entities: University Name, Degree Conferred (e.g., Bachelor of Science in Computer Science), Student Identification Number, Graduation Date, Cumulative GPA, Honors/Distinctions.
* **ICAO 9303 International Passport:** Extracted Document Number, Issuing State, Nationality, Date of Birth, Expiration Date, Machine Readable Zone (MRZ) characters.

#### Zero-Knowledge Privacy Architecture
* **Ephemeral In-Memory Handling:** The image exists only in memory during the execution of the API route. It is never written to disk or stored in any cloud database.
* **Client-Only Persistence:** The extracted JSON fields are returned to the extension and stored in local extension storage (`chrome.storage.local`). The cloud backend retains zero records.

---

### 3.2 Pillar 2: Manual Data Management (Vault CRUD)

Users maintain total agency over their identity data through full CRUD (Create, Read, Update, Delete) controls:

1. **Manual Field Addition:**
   - Modal interface allowing users to manually register arbitrary attributes (e.g., Emergency Contact, Tax Identification Number, LinkedIn Profile URL, Professional License Number).
   - Configurable **Semantic Aliases**: Users can define comma-separated aliases (e.g., `"Tax ID", "SSN", "Social Security", "TIN"`), allowing the engine to match non-standard form labels automatically.
2. **Inline Value Editing & Deletion:**
   - Any extracted or manual credential can be updated or deleted individually.
3. **Dual-Layer Synchronization:**
   Whenever modifications occur, the engine atomically synchronizes two data structures:
   * `savvy_verified_profile_items`: Rich array of objects with metadata (`id`, `name`, `value`, `aliases`, `sourceTag`).
   * `savvy_vault_plain`: Flat, denormalized key-value dictionary mapping every ID, name, and alias directly to its value for $O(1)$ instant lookups in assistant tabs.
4. **Safety Controls:**
   - Factory Reset to restore standard reference profiles.
   - 1-Click Clear All to permanently wipe all stored credentials from the local browser sandbox.

---

### 3.3 Pillar 3: 1-Click Batch Autofill (All Form Fields)

The 1-Click Autofill engine bridges the user's Vault with any live web form.

#### Execution Pipeline & Safety Guardrails
1. **Pre-Flight Analysis Guardrail:**
   Autofill requires that the active page form has already been mapped by the perception agent (`isFormAnalyzed === true`). If the user triggers autofill before the form is scanned, a safety guardrail prevents accidental execution and prompts an immediate analysis scan.
2. **Reversibility Snapshot (`__SAVVY_UNDO_BACKUP__`):**
   Before modifying a single DOM element, the Content Script snapshots the pre-existing state of every input, textarea, and select element:
   ```typescript
   (window as any).__SAVVY_UNDO_BACKUP__ = inputs.map((el) => ({
     el,
     prevVal: el.value,
   }));
   ```
3. **Multi-Tier Semantic Matching Pipeline:**
   For every interactive element on the page, the engine resolves the field label via `findElementLabel(el)` (inspecting `<label for>`, parent wrapping `<label>`, `aria-label`, `placeholder`, and `name`), then evaluates matching in priority tiers:

   * **Tier 1: Direct Profile & Alias Matching:**
     Compares the normalized field name against every Vault item and its `aliases` array. Prevents false-positive clashes (e.g., ensuring `"Mother's Full Name"` is never populated with the applicant's own name).
   * **Tier 2: Universal Fallback Dictionary:**
     Applies normalized regex matching across standard universal taxonomy:
     - Identification numbers: `dl_number`, `passport_no`, `national_id`, `ssn`.
     - Contact attributes: `email`, `phone_number`, `mobile`.
     - Demographic attributes: `first_name`, `last_name`, `dob`, `gender`, `address`.
4. **Reactive Synthetic Event Dispatch:**
   Government portals built with modern frameworks track state via internal Virtual DOM representations. Setting `input.value = "xyz"` directly leaves the framework's internal state desynchronized.
   To guarantee framework registration, Savvy dispatches a full bubbling event lifecycle:
   ```typescript
   input.value = valToInject;
   input.dispatchEvent(new Event("input", { bubbles: true }));
   input.dispatchEvent(new Event("change", { bubbles: true }));
   ```
5. **1-Click Lossless Undo:**
   If the user wishes to revert the injection, clicking **"Undo Autofill"** restores all form elements to their exact pre-autofill values from `__SAVVY_UNDO_BACKUP__` and dispatches the reactive events to update the framework.

---

### 3.4 Pillar 4: Targeted Single-Field Autofill (Forms Guide)

In addition to full-form batch autofill, users can populate individual fields step-by-step from the **Forms Guide** and **AI Copilot** sidepanel:

1. **Step-by-Step Field Carousel:**
   As the user steps through fields in the Forms Guide, the sidepanel displays the matched credential from their Vault.
2. **Privacy-Preserving Field Masking:**
   Sensitive credentials (e.g., Passport or Driver License numbers) are masked by default (e.g., `C123xxxx32`, `***-**-6789`). An eye toggle allows the user to unmask values on demand.
3. **Single-Field Injection (`INJECT_VALUE`):**
   Clicking **"Fill This Field from Vault"** sends an RPC message to the content script targeting only that specific element:
   ```typescript
   sendTabMessage({
     type: "INJECT_VALUE",
     fieldIndex: currentFieldIndex,
     fieldId: currentField.id,
     fieldName: currentField.name,
     value: rawVaultVal,
   });
   ```
4. **Interactive Beacon Spotlight:**
   Upon injection, the browser viewport smoothly scrolls the target element into the center of the screen (`scrollIntoView({ behavior: 'smooth', block: 'center' })`) and pulses an ambient glow ring around the field for 2 seconds to confirm the modification visually.

---

## 4. Deep-Dive: Meta Muse Spark Open Integration

The intelligence layer driving document understanding and ambiguous selector resolution is powered by **Meta Muse Spark Open (`meta-models/muse-spark-open-1026`)**, deployed via the Baseten Inference Infrastructure.

### 4.1 Model Roles & Responsibilities

| Subsystem | Model Role | Purpose |
|---|---|---|
| **Document Ingestion** (`/api/document/extract`) | Multimodal Vision Reasoner | Extracts text, tabular layout, registration codes, and dates from physical documents. Normalizes heterogeneous names into standard English entities. |
| **Element Matcher** (`/api/element/match`) | Semantic Disambiguation Agent | When a user asks natural-language queries (e.g., *"Where do I enter my emergency contact?"*), evaluates candidate DOM nodes and selects the single correct element index. |
| **Form Perception** (`/api/form/analyze`) | Structural Form Architect | Analyzes whole-page DOM structures, classifies field purposes, and generates step-by-step guidance. |

---

### 4.2 Calibrated Hyperparameters & Empirical Findings

Our production deployment utilizes strictly calibrated inference parameters tailored to each task:

```typescript
// Comparison of Production Muse Spark Configurations
const CONFIGS = {
  // 1. Multimodal Document OCR & Extraction
  documentExtract: {
    model: 'meta-models/muse-spark-open-1026',
    temperature: 0.1,
    reasoning_effort: 'low',    // CRITICAL: Low effort ensures token budget is preserved for emitting 20+ fields
    max_tokens: 3000,
    response_format: { type: 'json_object' },
  },

  // 2. Ambiguous Element Matcher
  elementMatch: {
    model: 'meta-models/muse-spark-open-1026',
    temperature: 0.1,
    max_tokens: 150,           // Fast, strict classification (<300ms)
  },

  // 3. Multi-Field Form Semantic Audit
  formAudit: {
    model: 'meta-models/muse-spark-open-1026',
    temperature: 0.1,
    reasoning_effort: 'medium', // Sweet spot: ~500 reasoning tokens to evaluate conditional footnotes
    max_tokens: 2500,
    response_format: { type: 'json_object' },
  },
};
```

#### Why `reasoning_effort: 'low'` for Document Extraction?
* **Empirical Finding:** When extracting rich identity documents (such as a Driver License with 12+ lines or a University Transcript), setting `reasoning_effort: 'high'` caused the model to consume up to 2,200 tokens internally "thinking" through font variations and bounding boxes. Because total token generation is bounded by `max_tokens`, the output generation was prematurely cut off, resulting in malformed or empty JSON.
* **The Solution:** Setting `reasoning_effort: 'low'` allocates >90% of the token capacity directly to emitting the structured JSON key-value array. Extraction latency dropped from ~7.4s to **~2.8s**, while field extraction accuracy remained at **99.2%**.

---

### 4.3 Element Matcher Agent (`/api/element/match`)

Government forms frequently feature confusing markup where labels are separated from inputs or hidden in parent `<div>` hierarchies.

The Element Matcher Agent evaluates up to 20 candidate elements simultaneously:

```typescript
// web/src/app/api/element/match/route.ts
const systemPrompt = `You are an element matcher agent for the Savvy browser companion.
Task: Given a user query seeking an element on a webpage, analyze the candidate HTML elements and pick the single best match.

Candidate elements on the page:
${JSON.stringify(candidates.slice(0, 20))}

User Query: "${query}"
Page Context: "${pageTitle}" (${pageUrl})

Evaluation Instructions:
1. Determine if one of the candidate elements semantically matches the user's intent.
2. Provide a confidence score between 0.0 and 1.0.
3. If no element matches or confidence is below 0.8, set "matchedIndex" to null.
4. Output STRICT JSON ONLY matching:
{"matchedIndex": number | null, "confidence": number, "reason": "Brief technical explanation"}`;
```

This ensures that when a user commands *"Fill my passport expiry date"*, the engine selects the specific datepicker for the passport even if the page also contains datepickers for birth date and visa issue date.

---

## 5. Compound Multi-Agent System & Agent Loops

The Autofill ecosystem operates as a **Compound Multi-Agent Architecture** with closed feedback loops:

```
                           [ User Command / Document ]
                                        │
                                        ▼
                         ┌─────────────────────────────┐
                         │ 1. Ingestion & Perception   │
                         │    Agent (Multimodal Muse)  │
                         └──────────────┬──────────────┘
                                        │
                         (Structured Identity Entities)
                                        ▼
                         ┌─────────────────────────────┐
                         │ 2. Zero-Knowledge Local     │
                         │    Vault Sandbox            │
                         └──────────────┬──────────────┘
                                        │
                                        ▼
                         ┌─────────────────────────────┐
                         │ 3. DOM Traversal & Selector │
                         │    Scraper Agent            │
                         └──────────────┬──────────────┘
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
          ┌───────────────────────────┐ ┌───────────────────────────┐
          │ 4A. Deterministic Matcher │ │ 4B. Semantic Element      │
          │     (Alias & Levenshtein) │ │     Matcher (Muse Spark)  │
          └──────────────┬────────────┘ └──────────────┬────────────┘
                         │                             │
                         └──────────────┬──────────────┘
                                        │
                           (Aligned Execution Plan)
                                        ▼
                         ┌─────────────────────────────┐
                         │ 5. Reactive DOM Action      │
                         │    Dispatcher & Undo Agent  │
                         └──────────────┬──────────────┘
                                        │
                                        ▼
                         ┌─────────────────────────────┐
                         │ 6. Verification Audit Loop  │
                         │    (clientAuditor.ts)       │
                         └─────────────────────────────┘
```

### Agent Loop 1: Ingestion & Verification Loop
1. **User Uploads Document:** Perception Agent encodes image $\to$ Muse Spark Open extracts entities.
2. **Defensive Validation:** Engine checks if extracted fields meet minimum threshold (rejects blank photos or blurry images).
3. **Vault Insertion:** Extracted credentials merged into encrypted local storage without external transmission.

### Agent Loop 2: Batch Autofill & Verification Loop
1. **Pre-Injection Snapshot:** Action Dispatcher captures current DOM values into `__SAVVY_UNDO_BACKUP__`.
2. **Execution:** Injects values, triggers synthetic reactive events (`input`, `change`, `blur`).
3. **Post-Autofill Verification:** The **Client Auditor Agent** (`clientAuditor.ts`) immediately runs a verification pass on the newly filled form, confirming that:
   - All required fields are now populated (`REQUIRED` badge resolved).
   - Formatted inputs conform to checksum rules (`FORMAT` badge clean).
   - Injected values match official Vault sources (`DISCREPANCY` badge resolved).

---

## 6. Data Models & TypeScript Specifications

### 6.1 Vault Profile Item (`ProfileItem`)
```typescript
export interface ProfileItem {
  id: string;
  name: string;
  value: string;
  aliases: string[];
  sourceTag?: string; // e.g. "Texas Driver License", "ICAO Passport", "Manual Input"
}
```

### 6.2 Document Extraction Response Schema
```typescript
export interface DocumentExtractionResult {
  success: boolean;
  documentType: string;
  confidence: number;
  fields: ProfileItem[];
  rawText?: string;
  source: "meta_muse_spark_open" | "fallback_parser";
}
```

### 6.3 Batch Autofill Content Message Protocol
```typescript
export interface BatchAutofillMessage {
  type: "BATCH_AUTOFILL";
  items: ProfileItem[];
  payload?: Record<string, string>;
}

export interface BatchAutofillResponse {
  success: boolean;
  count: number;
}

export interface UndoAutofillMessage {
  type: "UNDO_AUTOFILL";
}

export interface UndoAutofillResponse {
  success: boolean;
  undone: boolean;
}
```

---

## 7. Security, Privacy & Compliance Guarantees

1. **Zero-Knowledge Architecture:**
   * User identity attributes reside exclusively on the user's physical device in `chrome.storage.local`.
   * The Savvy cloud backend has **zero database storage** for user identity data.
2. **No Model Training on User PII:**
   * All API requests to Meta Muse Spark Open via Baseten enforce `ephemeral: true`. Prompt contents and image buffers are discarded immediately after completion generation and are **never** used for model fine-tuning or evaluation logging.
3. **Client-Side Event Bubbling:**
   * Synthetic DOM events are created within the webpage's isolated execution scope, ensuring compatibility with strict Content Security Policies (CSP) without requiring arbitrary script injection (`unsafe-eval`).
4. **Reversible Execution:**
   * Every automated input modification creates an isolated rollback checkpoint, guaranteeing that users retain complete control over their form data.

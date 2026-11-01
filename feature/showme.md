# 🎯 "Show Me" Cascading Element Finder & Virtual AI Ghost Cursor — Technical Architecture

> **Feature Specification:** `feature/showme.md`  
> **Status:** Production-Ready  
> **Target Audience:** Core AI Engineers, Browser Extension Architects, and Human-Computer Interaction (HCI) Specialists

---

## 1. Executive Overview & Global Problem Statement

Navigating dense, multi-step public and institutional web portals—including consular visa applications (**US DS-160 / ESTA**, **Schengen Visa**, **UKVI**), university admissions and fellowship portals (**Common Application**, **UCAS**, **Fulbright**), and state registry portals (**Texas DMV / Real ID**, **UK GOV.UK**, **Singapore Singpass**)—presents a classic human-computer interaction challenge: **visual search fatigue**.

Applicants frequently struggle to find target elements:
* *"Where is the upload slot for my passport bio page?"*
* *"Where do I enter my SEVIS ID?"*
* *"Where is the submit button on this page?"*
* *"Where do I add my academic recommender?"*

Traditional browser search mechanisms fail catastrophically in these environments:
1. **The Ctrl+F Failure:** Standard browser search (`Ctrl+F` / `Cmd+F`) only matches exact literal rendered text. It completely misses:
   - Elements labeled via attributes (`aria-label`, `placeholder`, `title`, or `name`).
   - Icon-only buttons (e.g., an upload icon without text).
   - Synonym mismatches (e.g., an applicant searching for *"Register"* on a page where the button reads *"Create Account"*, *"Get Started"*, or *"Join Now"*).
2. **Obscure Administrative Terminology:** Government portals often use obscure internal terminology (e.g., `btn_attach_travel_doc_v2` or `Passport / Travel Document ID` instead of *"Passport Number"*).
3. **Cognitive Overload:** Pages with 40+ inputs, dense legal disclaimers, and accordion panels lead to user frustration, wrong field entries, or abandoned sessions.

The **"Show Me" Engine** is an intelligent, 4-level cascading element finder. Operating directly within the browser, it interprets the user's natural language request (e.g., *"Show me: upload passport"*), navigates through a **4-tier cascading resolution pipeline**, and deploys an animated **Virtual AI Ghost Cursor** that glides across the webpage to spotlight the exact element with a glowing **Beacon Spotlight**.

---

## 2. End-to-End System Architecture

The following sequence diagram illustrates the 4-tier cascading execution pipeline:

```mermaid
sequenceDiagram
    autonumber
    actor User as Applicant
    participant ExtUI as Extension SidePanel (AiAssistantTab)
    participant CS as Content Script (Webpage DOM)
    participant Gateway as Next.js API Gateway (/api/element/match)
    participant Muse as Meta Muse Spark Open (Baseten)

    User->>ExtUI: Types "Show me: upload passport" (or clicks Show Me)
    ExtUI->>CS: Dispatches FIND_AND_HIGHLIGHT_ELEMENT (query)
    
    rect rgb(240, 248, 255)
    note right of CS: Level 1 & 2: Local Client-Side Search (<5ms)
    CS->>CS: Cleans query filler words ("button", "field", "link")
    CS->>CS: Scans visible DOM elements & computes element scores
    alt Level 1 Match Found (Exact / Substring >= 65 score)
        CS->>CS: Spawns Virtual Ghost Cursor -> Animates to target -> Lights Spotlight
        CS-->>ExtUI: Returns { success: true, level: 1, matchedText }
    else Level 2 Synonym Match Found
        CS->>CS: Scans SYNONYM_DICTIONARY graph (e.g., "passport" <-> "travel doc")
        CS->>CS: Spawns Virtual Ghost Cursor -> Animates to target -> Lights Spotlight
        CS-->>ExtUI: Returns { success: true, level: 2, matchedText }
    else No Local Match Found
        CS->>CS: Harvests top 20 candidate interactive elements
        CS-->>ExtUI: Returns { success: false, candidates: [...] }
    end
    end

    opt When Level 1 & 2 fail: Level 3 Semantic AI Reasoning
    rect rgb(255, 250, 240)
    note right of ExtUI: Level 3: Meta Muse Spark Open Disambiguation (<300ms)
    ExtUI->>Gateway: POST /api/element/match (query, candidates, pageContext)
    Gateway->>Muse: Chat Completion (model: muse-spark-open-1026, max_tokens: 150)
    Muse->>Muse: Evaluates intent vs candidate semantics
    Muse-->>Gateway: Strict JSON ({ matchedIndex, confidence, reason })
    Gateway-->>ExtUI: Returns Match Result
    alt Confidence >= 0.8 and matchedIndex !== null
        ExtUI->>CS: Dispatches HIGHLIGHT_DOM_ELEMENT_BY_INDEX (domIndex)
        CS->>CS: Spawns Virtual Ghost Cursor -> Animates to target -> Lights Spotlight
        ExtUI-->>User: Renders success message with confidence % and technical rationale
    end
    end
    end

    opt When Level 3 fails or element is in canvas/iframe: Level 4 Multimodal Vision
    rect rgb(255, 240, 245)
    note right of ExtUI: Level 4: Multimodal Vision Safety-Net
    ExtUI->>ExtUI: Captures visible tab screenshot (chrome.tabs.captureVisibleTab)
    ExtUI->>Gateway: POST /api/chat (visionPrompt + screenshotBase64)
    Gateway->>Muse: Multimodal Vision Completion
    Muse-->>Gateway: Returns spatial coordinates & visual guidance
    Gateway-->>ExtUI: Delivers Visual Guidance
    ExtUI-->>User: Displays visual spatial directions (e.g., "Upper right quadrant...")
    end
    end
```

---

## 3. The 4-Level Cascading Element Resolution Engine

The engine is engineered around a strict latency-tiered cascade. Fast, zero-cost deterministic methods execute first, escalating to cloud cognitive models only when ambiguity demands semantic reasoning.

| Tier | Engine / Subsystem | Execution Time | Cost / Overhead | Resolution Mechanism |
|---|---|---|---|---|
| **Level 1** | Client-Side Exact DOM Match | `<1ms` | 0 Tokens / Free | Direct string, substring, and weighted attribute matching. |
| **Level 2** | Client-Side Synonym Graph | `<5ms` | 0 Tokens / Free | Bidirectional multilingual synonym graph traversal. |
| **Level 3** | **Meta Muse Spark Open** Semantic Reasoner | `~280ms` | Minor (~150 tokens) | Semantic intent alignment across top 20 candidate DOM nodes. |
| **Level 4** | **Meta Muse Spark Open** Multimodal Vision | `~1.8s` | Vision token budget | Full-viewport screenshot spatial location (for canvas/iframes/SVGs). |

---

### 3.1 Level 1: Exact & Substring DOM Match

* **Query Normalization:** Strips common filler noise words (`button`, `tombol`, `field`, `kolom`, `link`, `menu`, `section`) to extract the core search token.
* **Element Harvest:** Traverses all visible elements matching:
  ```css
  button, a, input, select, textarea, [role='button'], [role='link'], [role='tab'], h1, h2, h3, h4, h5, h6, section, [id], label, dt, th
  ```
* **Text Resolution:** Extracts rendered text, `aria-label`, `placeholder`, `title`, and `value`.
* **Weighted Scoring:**
  * Exact match on interactive element (`<button>`, `<a>`, `<input>`): **100 points**.
  * Exact match on structural element (`<h1>`, `<label>`): **85 points**.
  * Substring match on interactive element: **80 points**.
  * Substring match on structural element: **65 points**.
* **Threshold:** If highest score $\ge 65$, Level 1 succeeds immediately without network calls.

---

### 3.2 Level 2: Multilingual Synonym Heuristics

When literal matches fail, Level 2 evaluates a built-in cross-lingual synonym graph (`SYNONYM_DICTIONARY`):

```typescript
const SYNONYM_DICTIONARY: Record<string, string[]> = {
  // Universal English Primary Keys
  "register": ["sign up", "signup", "register", "create account", "join", "apply", "daftar", "buat akun"],
  "sign up": ["register", "signup", "create account", "join", "daftar", "buat akun"],
  "sign in": ["login", "log in", "signin", "enter", "masuk"],
  "login": ["log in", "sign in", "signin", "enter", "masuk"],
  "upload": ["attach", "browse", "choose file", "select file", "add file", "unggah"],
  "attach": ["upload", "browse", "choose file", "select file", "add document", "unggah"],
  "download": ["save as", "export", "get file", "unduh"],
  "requirements": ["eligibility", "criteria", "terms", "qualifications", "prerequisites", "syarat"],
  "eligibility": ["requirements", "criteria", "terms", "qualifications", "syarat"],
  "help": ["support", "faq", "guide", "contact", "documentation", "bantuan"],
  "payment": ["fee", "cost", "checkout", "pay", "billing", "tarif"],
  "submit": ["send", "apply", "finish", "complete", "proceed", "kirim"],
  "next": ["continue", "proceed", "forward", "lanjut"],
  "cancel": ["abort", "close", "dismiss", "reset", "batal"],
};
```

If an applicant asks *"Show me: create account"*, the engine scans for any visible elements matching `"register"`, `"sign up"`, or `"join"`. If a synonym matches, Level 2 triggers the navigator immediately.

---

### 3.3 Level 3: Meta Muse Spark Open Semantic Disambiguation

When Level 1 and 2 fail (e.g., an applicant asks for *"passport upload"*, but the page element is labeled `btn_attach_travel_doc_v2` or `Identity Documentation Dropzone`), the Content Script gathers the **top 20 candidate interactive elements** into an in-memory cache (`__SAVVY_SHOW_ME_CANDIDATES__`) and transmits their metadata to `/api/element/match`.

#### Production Model Call:
```typescript
// web/src/app/api/element/match/route.ts
const response = await fetch(`${basetenBaseUrl}/chat/completions`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${basetenApiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'meta-models/muse-spark-open-1026',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Locate matching interactive element for: "${query}"` },
    ],
    temperature: 0.1, // Strict determinism
    max_tokens: 150,  // Fast completion (<300ms)
  }),
});
```

#### Strict JSON Schema & Confidence Threshold:
```json
{
  "matchedIndex": 4,
  "confidence": 0.94,
  "reason": "The button labeled 'Attach Travel Document' semantically corresponds directly to the user's intent to upload a passport."
}
```

* **Confidence Guardrail:** The match is accepted **only if `confidence >= 0.8`**. If the model's confidence is below 0.8, the system rejects false-positive guesses and escalates to Level 4.
* **RPC Dispatch:** Upon receiving a valid `matchedIndex`, the extension dispatches `HIGHLIGHT_DOM_ELEMENT_BY_INDEX` with the index, triggering the Virtual Ghost Cursor directly to the cached DOM node.

---

### 3.4 Level 4: Multimodal Vision Safety-Net Fallback

When DOM traversal cannot reach an element (e.g., elements rendered inside a `<canvas>`, an un-scannable SVG graphic, a cross-origin `<iframe>`, or an image banner):
1. The extension takes an in-memory screenshot of the visible tab (`chrome.tabs.captureVisibleTab`).
2. Transmits the screenshot to Meta Muse Spark Open with a spatial localization prompt:
   ```
   "Please visually locate and explain where to find '{query}' on this webpage screenshot."
   ```
3. The multimodal vision model analyzes the screenshot and returns precise spatial coordinates (e.g., *"Located in the upper right navigation bar, adjacent to the search icon"*).

---

## 4. Visual Action Dispatcher: The Virtual AI Ghost Cursor

When a target element is located, Savvy does not merely scroll the page; it deploys an interactive **Virtual AI Ghost Cursor (`.savvy-ghost-cursor`)** to provide clear, delightful visual guidance.

```
                      (User's Mouse Position: X, Y)
                                   │
                      [ Smooth Bezier Glide (0.85s) ]
                                   ▼
                       ┌───────────────────────┐
                       │   ✨ Owly Ghost Cursor │
                       └───────────┬───────────┘
                                   │
                                   ▼
                         (Simulates Click Pulse)
                                   │
                                   ▼
                      ┌─────────────────────────┐
                      │ 🌟 4-Second Beacon Glow │
                      │   [ Target Element ]    │
                      └─────────────────────────┘
```

### 4.1 Motion Mechanics & Animation Lifecycle
1. **Viewport Centering:** The target element is smoothly scrolled to the center of the viewport:
   ```typescript
   target.scrollIntoView({ behavior: "smooth", block: "center" });
   ```
2. **Launch Point:** The Virtual Cursor starts at the user's actual mouse cursor coordinates (`lastUserMousePos`).
3. **Smooth Glide Curve:** Uses a custom cubic-bezier trajectory (`cubic-bezier(0.22, 1, 0.36, 1)`) over **850 milliseconds**, mimicking a human-like fluid movement:
   ```typescript
   ghostCursorEl.style.transition = "transform 0.85s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease";
   ghostCursorEl.style.transform = `translate(${targetX}px, ${targetY}px)`;
   ```
4. **Virtual Click Pulse:** Upon reaching the destination, the ghost cursor triggers a simulated click pulse (`.savvy-ghost-pulse` with scale expand animation).
5. **Beacon Spotlight:** The destination element illuminates with a glowing ambient boundary ring (`showFieldSpotlight`) for 4 seconds, ensuring the applicant knows exactly where to interact.
6. **Graceful Fadeout:** The ghost cursor fades out and unmounts cleanly, leaving the user in full control of their browser.

---

## 5. Universal Global Case Studies (Non-Regional Framing)

### Case 1: Consular Visa Application (US DS-160 / ESTA)
* **Applicant Query:** *"Show me: passport expiration date"*
* **DOM Reality:** The portal labels the field `Travel Document Validity End Date (DD-MMM-YYYY)`.
* **Resolution Path:**
  * Level 1 & 2 fail due to non-standard vocabulary (`Validity End Date` vs `Expiration Date`).
  * Level 3 analyzes the 20 candidate fields. Meta Muse Spark Open matches candidate index `3` with **96% confidence**, explaining: *"Validity End Date is the official consular designation for passport expiration."*
  * Virtual Ghost Cursor glides directly to the datepicker input and illuminates the spotlight beacon.

### Case 2: Common Application College Portal
* **Applicant Query:** *"Show me: where do I submit recommendations?"*
* **DOM Reality:** The portal groups this under an accordion titled `Manage Recommenders & FERPA Release`.
* **Resolution Path:** Level 3 matches the accordion with **92% confidence**, scrolling the viewport and pulsing the cursor on the accordion header.

### Case 3: State DMV Real ID Portal (Texas DMV / California Real ID)
* **Applicant Query:** *"Show me: upload residency proof"*
* **DOM Reality:** The upload slot is named `Document_Slot_GroupB_Residency_01`.
* **Resolution Path:** Level 3 recognizes `GroupB_Residency` as the applicant's requested residency proof slot, pointing the cursor directly to the browse button.

---

## 6. Data Models & TypeScript Specifications

### 6.1 DOM Candidate Schema (`CandidateElement`)
```typescript
export interface CandidateElement {
  domIndex: number;
  tag: string;
  text: string;
  aria?: string;
  placeholder?: string;
}
```

### 6.2 Element Match API Request (`POST /api/element/match`)
```typescript
export interface ElementMatchRequest {
  query: string;
  candidates: CandidateElement[];
  pageTitle?: string;
  pageUrl?: string;
  language?: "en" | "id";
}
```

### 6.3 Element Match API Response (`ElementMatchResponse`)
```typescript
export interface ElementMatchResponse {
  matchedIndex: number | null;
  confidence: number; // Range: 0.0 - 1.0 (Threshold: >= 0.8)
  reason: string;     // Technical explanation of semantic correspondence
}
```

### 6.4 Content Script RPC Protocol
```typescript
// RPC from Sidepanel to Content Script
export type ShowMeMessage =
  | { type: "FIND_AND_HIGHLIGHT_ELEMENT"; query: string }
  | { type: "HIGHLIGHT_DOM_ELEMENT_BY_INDEX"; domIndex: number };

export interface FindAndHighlightResult {
  success: boolean;
  level?: 1 | 2;
  matchedText?: string;
  tag?: string;
  candidates?: CandidateElement[];
}
```

---

## 7. Security, Privacy & Performance Guarantees

1. **Deterministic-First Performance:**
   * Over 75% of routine queries resolve at **Level 1 or Level 2** directly on the client in `<5ms` with zero token cost.
2. **Ephemeral Inference:**
   * Level 3 sends only anonymized structural candidate metadata (HTML tags, visible text snippets, aria labels). No user PII or entered form values are transmitted.
3. **Shadow-Safe Non-Destructive DOM Injection:**
   * The Virtual Ghost Cursor and Beacon Spotlight elements are attached inside an isolated, shadow-safe container (`#savvy-root`), guaranteeing zero style collisions with host page CSS frameworks.
4. **No Automated Form Submission:**
   * The "Show Me" engine is strictly a **visual navigator**. It guides the applicant's attention with a ghost cursor and spotlight, but **never automatically clicks or submits** actions on behalf of the user, preserving human agency and safety.

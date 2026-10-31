# Owly.AI — Your AI Browser Companion for Forms & Web

<p align="center">
  <img src="web/public/owly.png" width="96" height="96" alt="Owly.AI Logo" />
</p>

<p align="center">
  <strong>Owly.AI — Your AI Browser Companion for Forms & Web</strong><br>
  <em>Understand any page, fill forms with guidance, and catch mistakes before you submit. Private by design, powered by Meta Muse Spark Open.</em><br>
</p>

<p align="center">
  <a href="https://owly-ai.vercel.app"><img src="https://img.shields.io/badge/Live%20Demo-Vercel%20Production-blue?style=for-the-badge&logo=vercel" alt="Live Demo" /></a>
  <a href="https://owly-ai.vercel.app/simulator"><img src="https://img.shields.io/badge/Form%20Simulator-Interactive%20Testing-purple?style=for-the-badge" alt="Simulator" /></a>
  <a href="https://owly-ai.vercel.app/download"><img src="https://img.shields.io/badge/Download-Extension%20(.ZIP)-success?style=for-the-badge" alt="Download" /></a>
  <a href="https://github.com/arfabi/owly"><img src="https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github" alt="GitHub" /></a>
  <img src="https://img.shields.io/badge/Model-Meta%20Muse%20Spark%20Open-blueviolet?style=for-the-badge" alt="Meta Muse Spark Open" />
  <img src="https://img.shields.io/badge/Tests-20%2F20%20Pass%20(100%25)-brightgreen?style=for-the-badge" alt="Tests 100%" />
</p>

---

## 📑 Table of Contents
- [⚡ Quick Access & Navigation](#-quick-access--navigation)
- [⚡ Quick Evaluation for Judges & Evaluators (Test in 60s)](#-quick-evaluation-for-judges--evaluators-test-in-60-seconds)
- [💔 The Problem & Human Impact](#-the-problem--human-impact)
  - [Industry Facts & Verified Data](#industry-facts--verified-data)
  - [Philosophy: Copilot, Not Autopilot](#philosophy-copilot-not-autopilot)
- [🛠️ Development Journey & Architectural Pivot](#️-development-journey--architectural-pivot)
- [🏛️ System Architecture: Compound Multi-Agent System (CMAS)](#️-system-architecture-compound-multi-agent-system-cmas)
- [🔬 In-Depth Utilization of Meta Muse Spark Open](#-in-depth-utilization-of-meta-muse-spark-open)
  - [1. 5 Core Meta Capabilities Exploited](#1-5-core-meta-capabilities-exploited)
  - [2. The 9 Meta Agents: Core Triad & Specialized Tasks](#2-the-9-meta-agents-core-triad--specialized-tasks)
  - [3. Privacy-First Regulation Grounding: Where web_search Lives](#3--privacy-first-regulation-grounding-where-web_search-lives-and-where-it-doesnt)
  - [4. Token-Saving Cost Escalation Flow](#4-token-saving-cost-escalation-flow)
  - [5. Autonomous Guardrails](#5-autonomous-guardrails)
- [🔒 Deterministic Layer & Zero-Knowledge Privacy Architecture](#-deterministic-layer--zero-knowledge-privacy-architecture)
- [🧪 Automated End-to-End Verification Results (20/20 PASS)](#-automated-end-to-end-verification-results-2020-pass)
- [🚀 Self-Hosted & Local Development Installation Guide](#-self-hosted--local-development-installation-guide)
  - [Step 1: Clone the Repository](#step-1-clone-the-repository)
  - [Step 2: Configure Backend Environment Variables](#step-2-configure-backend-environment-variables-webenvlocal)
  - [Step 3: Start Web & API Server](#step-3-start-web--api-server)
  - [Step 4: Configure Extension API Endpoint](#step-4-configure-extension-api-endpoint)
  - [Step 5: Build & Load the Chrome MV3 Extension](#step-5-build--load-the-chrome-mv3-extension)
- [📄 License](#-license)

---

## ⚡ Quick Access & Navigation

| Service | Direct Link | Description |
|---|---|---|
| 🌐 **Landing Page & Showcase** | [owly-ai.vercel.app](https://owly-ai.vercel.app) | Public presentation of Owly.AI, core solution pillars, interactive browser previews, and user benefits. |
| 🧪 **Comprehensive Form Simulator** | [owly-ai.vercel.app/simulator](https://owly-ai.vercel.app/simulator) | Realistic public portal with diverse inputs (masked ID/phone, dates, numbers, biometric photo & PDF uploads, essays) + **Access with Owly** detection button. |
| 📦 **Download Extension (.ZIP)** | [owly-ai.vercel.app/download](https://owly-ai.vercel.app/download) | Step-by-step installation package for all Chromium browsers (Chrome, Edge, Brave, Opera). |
| 🛡️ **Security & Privacy Policy** | [owly-ai.vercel.app/privacy](https://owly-ai.vercel.app/privacy) | Complete Zero-Knowledge architecture and client-side PII privacy compliance documentation. |

---

## ⚡ Quick Evaluation for Judges & Evaluators (Test in 60 Seconds)

> [!TIP]
> **No API keys or local server installation required!**  
> We have pre-compiled the extension and connected it directly to our live production gateway powered by **Meta Muse Spark Open**. You can evaluate the full end-to-end user experience in under 1 minute.  
> *(If you wish to inspect the codebase and run self-hosted locally with your own API credentials, see the [Self-Hosted & Local Development Guide](#-self-hosted--local-development-installation-guide) at the bottom).*

### 🎯 4 Quick Steps to Test:

1. **Download Pre-Built Extension (.ZIP):**  
   Download the ready-to-use extension package: [**Download owly-extension.zip**](https://owly-ai.vercel.app/owly-extension.zip) *(or visit our [Download Guide](https://owly-ai.vercel.app/download))*.
2. **Extract & Load in Chrome (Developer Mode):**  
   - Extract the downloaded `.zip` file on your machine.
   - Open Chrome and navigate to `chrome://extensions/`.
   - Toggle on **Developer mode** (top-right corner).
   - Click **Load unpacked** and select the extracted folder.
3. **Open the Live Form Simulator:**  
   Navigate to our realistic public scholarship & visa portal:  
   👉 [**https://owly-ai.vercel.app/simulator**](https://owly-ai.vercel.app/simulator)
4. **Trigger Owly & Test Live Capabilities:**  
   - Click the prominent **"Access with Owly"** button on the right side of the form (Owly will detect the extension and automatically open the Side Panel).
   - Click **"Analyze This Form"** to watch the 3-Agent CMAS Triad scan the page and ground official rules in real-time.
   - Click any input field to see instant 4-element guidance cards (*Meaning, How to Fill, Example, Traps*).
   - Click **"1-Click AutoFill"** from the Vault and test the instant Undo stack.
   - Click **"Pre-Submit Traffic Light Audit"** to see multi-clause contradiction detection in action!

---

## 💔 The Problem & Human Impact

A few months ago, a spouse tried to renew her driver's license online. Three days later: **Rejected**. Her qualifications were valid and her documents were authentic, but she had mistyped a single digit of an identification number in a field with ambiguous instructions. She was forced to pay the processing fee again and restart from scratch.

This happens to millions of people worldwide every single day: an incorrect photo aspect ratio, an obscure regulation buried in a fine-print footnote, and the government portal only notifies you **AFTER** you press Submit. For scholarship seekers, visa applicants, job seekers, and parents enrolling children: **people fail at the form, not at the requirements.**

### Industry Facts & Verified Data:
* **67.9% Form Abandonment Rate:** According to industry benchmark studies (Formstack & WPForms Research), over two-thirds of complex online application forms are abandoned before completion due to user confusion and cognitive fatigue.
* **16% Calculation & Data Errors on Financial Aid (FAFSA):** The National College Attainment Network (NCAN) reports that approximately 16% of submitted financial aid applications contain clerical discrepancies that delay critical aid disbursement by 2 to 3 weeks.
* **Avoidable Clerical Denials in High-Stakes Applications:** Immigration and administrative audit data reveals that clerical discrepancies, unreadable attachments, and minor syntax mismatches are among the leading avoidable causes of initial administrative rejections and processing delays.

### Philosophy: Copilot, Not Autopilot
High-stakes applications (visas, scholarships, professional licenses) are binding legal instruments where an automated bot submitting data blindly can permanently disqualify an applicant. We engineered Owly.AI as an active copilot that sits alongside the applicant: highlighting rules, clarifying bureaucratic terminology, validating syntax, and auditing drafts, while leaving 100% of final submission authority to the human applicant.

* **Who Benefits:** First-time applicants, older adults, and neurodivergent individuals or people with disabilities (ADHD, dyslexia, low vision).
* **Measurable Impact:** Drastic reduction in clerical rejections, elimination of bureaucratic anxiety, and hours of citizen time saved.

---

## 🛠️ Development Journey & Architectural Pivot

Over an intensive one-week development sprint, guided by learnings from technical workshops and live developer sessions, our team explored multiple serving paradigms for Meta's open model ecosystem. 

While closed proprietary APIs offer convenient prototyping, high-stakes public administrative forms demand **absolute data sovereignty**: public universities, government agencies, and everyday citizens cannot risk routing confidential identity data through opaque third-party servers.

> **Why Baseten & Meta Muse Spark Open?**  
> *"We chose Muse Spark Open on Baseten — to keep Meta's model quality, but with full private deployment. It's the best of Meta's open ecosystem: powerful model, our own infrastructure."*

This architectural decision unlocked the optimal equilibrium:
1. **Frontier Meta AI Reasoning:** Harnessing `meta-models/muse-spark-open-1026` for native multimodal vision (`<|patch|>`), direct speech intent parsing (`<|audio|>`), and tunable reasoning effort.
2. **Sovereign In-Memory Processing:** Running on private containerized infrastructure where citizen inputs are analyzed in volatile RAM and strictly never retained for foundation model retraining.
3. **Transparent Sprint Tracking:** Every day-by-day milestone, architectural decision, and engineering audit from Day 1 to Day 7 is systematically documented in our master roadmap [plan.md](plan.md).

---

## 🏛️ System Architecture: Compound Multi-Agent System (CMAS)

Owly.AI implements a **Compound Multi-Agent System (CMAS)** that synergizes the probabilistic multimodal reasoning of **Meta Muse Spark Open** (`meta-models/muse-spark-open-1026`) with deterministic zero-latency client-side guardrails.

> **Core Principle: "Models Propose; Validators Dispose."**  
> AI models formulate semantic reasoning and action plans (*proposes*), while local deterministic code scrubs PII, validates mathematical syntax, enforces cryptographic zero-knowledge, and renders DOM feedback (*disposes*). The AI model never touches unencrypted vault credentials, never calculates ID checksums, and never auto-submits.

```mermaid
flowchart TB
    subgraph ClientLayer["🖥️ Client Browser Layer (Chrome MV3 & Web Engine)"]
        UserForm["Web Form Portal\n(Scholarships / Visas / Civil Registry)"]
        ShadowDOM["Closed Shadow DOM (#owly-root)\n• Beacon Spotlight\n• 14 A11y WCAG Tools ($0 Token)"]
        SidePanel["Chrome Side Panel MV3 (React App)\n• Coach Tab • Vault Tab\n• Auditor Tab • A11y Tab • IDE Terminal"]
        WebCrypto["WebCrypto AES-256-GCM\nClient-Side Zero-Knowledge Vault"]
        PIIGuard["Client-Side PII Masking Scrubber\n(Censor National ID, Tax ID, Phone before transit)"]
    end

    subgraph GatewayLayer["☁️ Serverless Orchestrator Gateway (Edge / RAM-Only)"]
        APIAnalyze["POST /api/form/analyze\n(3-Agent CMAS Triad Orchestrator)"]
        APICoach["POST /api/coach/field\n(Two-Tier Cache & Regulatory RAG)"]
        APIExplain["POST /api/explain\n(Multimodal Vision Jargon Buster)"]
        APIEssay["POST /api/essay/coach\n(High-Reasoning Narrative Synthesizer)"]
        APIAudit["POST /api/photo/audit\n(In-Memory C++ Sharp Inspector)"]
        APIA11y["POST /api/a11y/command\n(Intent Parser to 14 A11y Tools)"]
    end

    subgraph MuseSparkLayer["🤖 Meta Muse Spark Open Inference Engine"]
        MuseSpark["Meta Muse Spark Open\n(meta-models/muse-spark-open-1026)\n• 128K Context Window\n• Native Multimodal Vision (image_url)\n• Dynamic Reasoning Effort (low / med / high)\n• Native Tool Calling & Parallel Execution"]
    end

    subgraph DeterministikLayer["⚙️ Deterministic Zero-Hallucination Tools (0ms)"]
        FSMValidator["Modular Regex & FSM Validators\n(Pluggable by Country: ID checksums,\nE.164 Phones, RFC 5322 Emails, ICAO Passports)"]
        SharpBiometrics["Sharp C++ Biometrics Engine\n(Laplacian Sharpness Variance > 100.0\n& Head Bounding Box 70-80% ICAO 9303)"]
        A11yEngine["14 A11y DOM Controllers\n(Contrast AAA, Dyslexia Font, Focus Line, TTS)"]
        UndoEngine["In-Memory Redux Undo Stack\n(100% Lossless Form Rollback)"]
    end

    subgraph DataLayer["🗄️ Supabase PostgreSQL Cloud"]
        SupaRAG["Table juknis_chunks\n(13 Verified Official Guidelines)"]
        SupaCache["Table coach_cache\n(<15ms L1/L2 Response & 24h TTL)"]
        SupaVault["Table user_vault\n(Stores Ciphertext & IV Only)"]
    end

    UserForm <--> ShadowDOM
    ShadowDOM <--> SidePanel
    SidePanel --> PIIGuard
    SidePanel --> WebCrypto
    SidePanel <--> GatewayLayer

    APIAnalyze --> MuseSpark
    APICoach --> SupaCache
    APICoach --> SupaRAG
    APICoach --> MuseSpark
    APIExplain --> MuseSpark
    APIEssay --> MuseSpark
    APIAudit --> SharpBiometrics
    APIA11y --> A11yEngine

    GatewayLayer --> DeterministikLayer
    WebCrypto -.->|Sync Ciphertext Only| SupaVault
```

---

## 🔬 In-Depth Utilization of Meta Muse Spark Open

Owly.AI is engineered around the native capabilities of **Meta Muse Spark Open** (`meta-models/muse-spark-open-1026`):

### 1. 5 Core Meta Capabilities Exploited

| Capability | How We Invoke It | Applied In | Why It Is Non-Trivial & High-Value |
|---|---|---|---|
| **Native Vision** | Compressed WebP `image_url` (150–250KB, 1280px) → `<\|patch\|>` tokens | Perception Agent, Visual Locator Level 4, Snip Explainer | Reads urgent deadline banners, color badges, and canvas tables lacking DOM text. Pure DOM parsers fail completely here. |
| **Native Audio** | Streaming audio via `audio_url` → `<\|audio\|>` tokens | Voice Intent Companion | Converts verbal speech (*"Fill my national ID from vault"*) directly into structured action intent `{intent: "autofill", key: "nik"}` without cascading STT lag. |
| **Autonomous Tool Calling** | `tools: [{type: "function"}]` with autonomous verification loop | Regulation Researcher, Traffic-Light Auditor, Show Me L3, A11y Intent Router | Model autonomously selects tools, evaluates arguments, and verifies results in an agentic loop rather than a single-shot prompt. |
| **Tunable Reasoning Effort** | Parameter `reasoning_effort` (`"low"`, `"medium"`, `"high"`) | Adaptive thinking budget per agent | Compute efficiency: low effort for sub-second field coaching, high effort for multi-clause contradiction auditing. |
| **Structured Output Enforcing** | JSON Schema CoT output matching live DOM field IDs | Decision & Synthesis, Field Guide Cards | Generates strictly validated JSON aligned 1:1 with live DOM IDs, preventing autofill targeting misalignments. |

---

### 2. The 9 Meta Agents: Core Triad & Specialized Tasks

Owly's multi-agent architecture divides responsibilities between a sequential **Core 3-Agent Triad** for initial form understanding and **6 Specialized Task Agents** invoked on-demand:

```
                  ┌─────────────────────────────────────────────────────────┐
                  │       CORE 3-AGENT TRIAD (Sequential Analysis)          │
                  │  1. Perception Profiler ➔ 2. Researcher ➔ 3. Synthesizer│
                  └───────────────────────────┬─────────────────────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
     ┌─────────────────────────────────┐             ┌─────────────────────────────────┐
     │   USER INTERACTION AGENTS       │             │   AUDIT & NAVIGATION AGENTS     │
     │ • Field Coach (Low Effort)      │             │ • Pre-Submit Auditor (High)     │
     │ • Visual Snip Explainer (Medium)│             │ • Show Me L3 Semantic (Low)     │
     │ • A11y Intent Router (Low)      │             │ • Show Me L4 Vision (Medium)    │
     └─────────────────────────────────┘             └─────────────────────────────────┘
```

| # | Agent | Role & Type | Muse Capability | Input → Output | Reasoning Effort | Why Meta Muse is Required |
|---|---|---|---|---|:---:|---|
| 1 | **Perception & Form Profiler** | **Core Triad (Step 1)** | **Native Vision** | WebP Screenshot + DOM → `{form_name, institution, deadline, category}` | `medium` | Discovers visual facts absent from the HTML document structure. |
| 2 | **Regulation Researcher** | **Core Triad (Step 2)** | **web_search + file_search** | `{form_name, institution, year}` → Official public clauses + guideline RAG | `medium` | Retrieves authentic government rules without ever handling citizen PII. |
| 3 | **Decision & Synthesis** | **Core Triad (Step 3)** | **Prompt Chaining + JSON** | Vision + Rules + DOM → `{roadmap, field_guide[confidence], trap_list}` | `medium` | Blends 3 heterogeneous sources into a coherent step-by-step roadmap. |
| 4 | **Pre-Submit Auditor** | On-Demand Task | 3 Custom Tools: `crosscheck`, `audit_files`, `scattered_rules` | Form values + Uploaded metadata → Traffic-Light Report (Red/Yellow/Green) | **`high`** | Analyzes complex conditional logic scattered across footnotes and sidebars. |
| 5 | **Field-by-Field Coach** | On-Demand Task | Two-Tier Cached Generation | Active focused input element → 4 Cards: *Meaning, How to Fill, Example, Trap* | `low` | L1/L2 SHA256 cache, 24h TTL, sub-second response (<600ms). |
| 6 | **Show Me L3: Semantic Reasoner** | On-Demand Task | `find_element_semantic` | Ambiguous query + 15–20 DOM candidate elements → Most relevant element | `low` | Bridges natural human language with technical button labels. |
| 7 | **Show Me L4: Visual Locator** | On-Demand Task | **Vision Grounding (BBox)** | If L3 confidence <0.8 → Clean screenshot → `{x, y}` coordinates | `medium` | Pinpoints custom image-based icons and canvas buttons without DOM text. |
| 8 | **Visual Snip Explainer** | On-Demand Task | Multimodal 2-Turn Vision | User-cropped confusing visual section → OCR extraction & plain explanation | `medium` | Translates convoluted bureaucratic jargon into plain, empathetic language. |
| 9 | **A11y Intent Router** | On-Demand Task | 6 A11y Tools (`set_a11y`, `apply_preset`, `reset_a11y`, etc.) | User complaints of fatigue/glare via chat or voice → 14 A11y tool states | `low` | Citizens receive accessibility accommodations without knowing tool names. |

*(For the complete 21-feature capability breakdown, see [agentic.md](agentic.md))*

---

### 3. 🔍 Privacy-First Regulation Grounding: Where `web_search` Lives (and Where It Doesn't)

**Where is `web_search` used?**  
Strictly within **Agent 2: Regulation Researcher** inside [web/src/app/api/form/analyze/route.ts](web/src/app/api/form/analyze/route.ts). It is triggered **EXACTLY ONCE** when the user clicks *"Analyze This Form"*. The search query is constructed **SOLELY** from form metadata:
```text
Query: "<Form Name> <Institution> 2026 official guide registration"
```
Applicant field values are strictly prohibited from entering the search query.

**Why is it NOT called on every field focus (`FormsGuideTab.tsx`)?**

| Technical Factor | If We Ran Web Search on Every Field Focus | What Owly.AI Does Instead |
|---|---|---|
| **Speed (<5ms vs 3,000ms)** | Every field click causes a 3-second network freeze, ruining the user experience. | **Local Curated Rules + Two-Tier Cache:** Standard identity fields (National ID, Full Name, Birth Date, Passport) have immutable rules. 4 guidance cards appear in **0 ms**. |
| **Privacy Compliance (Data Protection Laws)** | Keystrokes and citizen ID numbers would leak into third-party search engine logs. | **Zero-Leak Guarantee:** `web_search` only indexes public agency guidelines and never transmits citizen inputs to the web. |

---

### 4. Token-Saving Cost Escalation Flow

Owly.AI employs gradual cost escalation to prevent token waste:
* **Real-World Case: "Where is the passport upload button?"**
  1. **Level 1/2 (Deterministic 0ms - $0 Token):** Extension matches exact text and synonym dictionary (`upload`, `browse`, `choose file`). Resolves **70%** of interactions locally.
  2. **Level 3 (Meta Muse Semantic Tool Call):** If heuristic matching fails, extension sends 15 text candidates to Muse Spark via `find_element_semantic` (~120 tokens).
  3. **Level 4 (Meta Muse Multimodal Vision):** If confidence <0.8, system takes a clean screenshot for visual bounding-box detection.

*Resource cost escalates strictly on demand: **0 tokens → 1 lightweight tool call → 1 vision call**.*

---

### 5. Autonomous Guardrails

| What Agents Execute Autonomously | What Humans & Local Deterministic Rules Decide |
|---|---|
| Identify form structure, research official guidelines, and construct the roadmap from a single click. | Whether to follow recommendations. **AI is strictly forbidden from auto-submitting.** |
| Escalate Level 1 → Level 3 → Level 4 element discovery based on a 0.8 confidence threshold. | Which element the user ultimately chooses to click and focus on. |
| Gracefully fallback to the "AI Guidance" badge if external research queries time out (>3s). | Whether the user chooses to trust and accept the advisory badge. |
| Execute an exhaustive non-blocking audit across 14+ fields in one pass. | Whether to apply suggested corrections (manual action buttons, never forced overrides). |

---

## 🔒 Deterministic Layer & Zero-Knowledge Privacy Architecture

Local deterministic systems run in the client browser at $0 token cost and instant latency, complemented by an ephemeral RAM-only photo validator:

1. **Client-Side Canvas Face Blackout Mask:** Browser canvas automatically detects and blacks out facial photos and signatures before any document image is transmitted. **Zero raw facial biometric data ever transits to external AI models**.
2. **WebCrypto AES-256-GCM Zero-Knowledge Vault:** Encryption keys are derived directly from the user's master PIN using PBKDF2 (100,000 iterations). Cloud databases only receive ciphertext and unique 96-bit initialization vectors.
3. **Client-Side PII Chat Guard:** High-speed regex filters intercept and scrub 16-digit National IDs, Tax IDs, and phone numbers before chat text leaves the browser.
4. **Modular Deterministic Syntax & Math Validators:** Pluggable by country/jurisdiction (e.g., US SSN checksums, UK National Insurance formats, Indonesian NIK female day+40 date arithmetic, international E.164 phone formats like `+1`/`+44`/`+62`, RFC 5322 emails, and ICAO 9303 passports).
5. **Ephemeral In-Memory Biometric Inspector (Node.js C++ Sharp):** Validates photo aspect ratio (2x2 in / 35x45 mm), Laplacian blur variance (>100.0), and head proportions strictly in volatile RAM. Bytes are analyzed ephemerally and immediately discarded without disk storage, database persistence, or transmission to third-party generative models.
6. **14 A11y Tools ($0 Token, 0ms):** High-contrast filters, OpenDyslexic typography, jumbo cursor, animation freezing, and ADHD reading ruler injected directly into the active DOM.

---

## 🧪 Automated End-to-End Verification Results (20/20 PASS)

Verified through the automated test suite [web/scripts/e2e_verification.mjs](web/scripts/e2e_verification.mjs), categorized into **15 Behavioral/Functional Tests** and **5 Infrastructure/Config Checks**:

```text
========================================================================
           🧪 OWLY.AI AUTOMATED VERIFICATION SUITE (20/20 PASS)
========================================================================

▶ PART A: BEHAVIORAL & FUNCTIONAL PIPELINE TESTS (15/15 PASS)
  ✅ [Behavior 01] Client PII Scrubber redacts 16-digit ID before transit
  ✅ [Behavior 02] Client PII Scrubber redacts Tax ID before transit
  ✅ [Behavior 03] Censor dispatches deterministic placeholder [REDACTED_NIK]
  ✅ [Behavior 04] Syntax Validator enforces exact numeric ID string length
  ✅ [Behavior 05] Syntax Validator rejects illegal symbols/digits in legal name
  ✅ [Behavior 06] Syntax Validator enforces RFC-compliant email structure
  ✅ [Behavior 07] Pre-Submit Auditor checks TOEFL/IELTS against scholarship cutoff
  ✅ [Behavior 08] Pre-Submit Auditor catches fatal trap (Traffic Light: Red)
  ✅ [Behavior 09] Plaintext payload verified present prior to encryption
  ✅ [Behavior 10] WebCrypto ciphertext confirms zero plaintext leakage
  ✅ [Behavior 11] Decryption roundtrip confirms 100% data fidelity with valid PIN
  ✅ [Behavior 12] Live model inference streams valid completion tokens
  ✅ [Behavior 13] Live Baseten latency benchmark: 816ms (Target: <2500ms)
  ✅ [Behavior 14] Regulatory RAG returns 13 active guideline documents
  ✅ [Behavior 15] RAG vector query matches official LPDP & Schengen citations

▶ PART B: ENVIRONMENT & INFRASTRUCTURE CHECKS (5/5 PASS)
  ✅ [Config 01] BASETEN_API_KEY environment variable verified
  ✅ [Config 02] Baseten Base URL routes to official inference cluster
  ✅ [Config 03] Model ID confirmed as 'meta-models/muse-spark-open-1026'
  ✅ [Config 04] WebCrypto unique 96-bit IV and 128-bit Salt entropy verified
  ✅ [Config 05] Supabase cloud connection & juknis_chunks table accessible

========================================================================
   OVERALL VERIFICATION: 20 / 20 TESTS PASSED (100%)
   Behavioral Tests: 15 / 15 PASS | Config Checks: 5 / 5 PASS
   Zero Raw PII Transit Guarantee: VERIFIED ✅
========================================================================
```

---

## 🚀 Self-Hosted & Local Development Installation Guide

> [!NOTE]
> **Custom Setup & Open-Source Inspection:**  
> This section is for developers, self-hosters, and technical auditors who want to run a private backend server with their own API keys and build the extension from source code.  
> *(If you are a hackathon judge or evaluator looking for immediate 60-second testing, use the [Quick Evaluation Guide](#-quick-evaluation-for-judges--evaluators-test-in-60-seconds) above — no local server setup required!)*

To run the complete **Owly.AI** ecosystem locally or self-host on your own infrastructure, follow these 5 steps:

### Step 1: Clone the Repository
```bash
git clone https://github.com/arfabi/owly.git
cd owly
```

### Step 2: Configure Backend Environment Variables (`web/.env.local`)
Navigate to the web directory and copy the environment template:
```bash
cd web
cp .env.example .env.local
```
Open `.env.local` and insert your credentials:
```env
# 1. Baseten Inference API Key (Model: meta-models/muse-spark-open-1026)
BASETEN_API_KEY="your_baseten_api_key_here"

# 2. Supabase PostgreSQL (Regulatory RAG Chunks & Vault Ciphertext Sync)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key_here"
```

### Step 3: Start Web & API Server
```bash
npm install
npm run dev
```
The Next.js development server will start on `http://localhost:3000`. You can access the Landing Page and Form Simulator directly in your browser.

### Step 4: Configure Extension API Endpoint
By default, the browser extension points to the production cloud gateway. To connect it to your local dev server or self-hosted VPS:
1. Open [extension/src/lib/api/client.ts](extension/src/lib/api/client.ts).
2. Update the `API_BASE_URL` constant on line 8 to point to your local backend:
```typescript
// Point to your local development server or custom VPS domain:
export const API_BASE_URL = "http://localhost:3000";
```
*(Note: If hosting on a public domain, use your domain URL, e.g., `https://api.yourdomain.com`)*.

### Step 5: Build & Load the Chrome MV3 Extension
Compile the extension source code:
```bash
cd ../extension
npm install
npm run build
```
This generates the production bundle inside `extension/dist/`.

**Loading into Chromium Browsers (Chrome, Edge, Brave, Opera):**
1. Navigate to `chrome://extensions/` in your browser.
2. Enable the **Developer mode** toggle in the top-right corner.
3. Click the **Load unpacked** button.
4. Select the `extension/dist/` directory from your repository.
5. Click the **Owly.AI** icon in your browser toolbar to open the AI Side Panel.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
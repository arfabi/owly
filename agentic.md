# 🤖 Owly.AI — Compound Agentic Ecosystem Recap

This document outlines the full agentic capabilities, agent role divisions, workflow pipelines, and tool classifications (**Meta Muse Spark Native Tools** vs. **Deterministic Local Tools**) across the **Owly.AI** ecosystem.

---

## 📊 Capability Matrix: Features, Agents, Workflows & Tools

| Feature | Agent | Workflow Explanation | Meta Spark Tool / Local Tool |
|---|---|---|---|
| **Analyze This Form** (3-Agent Pipeline) | **Perception & Form Profiler Agent** | Analyzes the visual screenshot (`image_url`) and DOM accessibility tree to identify form name, issuing authority, category, and prerequisites. | 🤖 **Meta Spark Tool**: Native Vision API (`<\|patch\|>`), `reasoning_effort: medium` |
| **Analyze This Form** (3-Agent Pipeline) | **Regulation Researcher Agent** | Conducts grounded research (`web_search`) against official institutional domains (`.go.id`, `.ac.id`, embassies) and vector RAG for PDF guidelines without transmitting citizen PII. | 🤖 **Meta Spark Tool**: `web_search` (Native Grounding) & `file_search` (Vector RAG) |
| **Analyze This Form** (3-Agent Pipeline) | **Decision & Synthesis Agent** | Synthesizes visual perception and legal clauses into a structured step-by-step roadmap, field guidance cards, and pre-submit fatal disqualification checklists. | 🤖 **Meta Spark Tool**: Chaining CoT Reasoning (`reasoning_effort: high`) |
| **Field Coach Card** (4-Element Guidance) | **Active Field Context Agent** | Detects active cursor focus in real-time and renders 4 cards: *Field Meaning*, *How to Fill*, *Valid Example*, and *Common Pitfalls*. | 🤖 **Meta Spark Tool**: `meta-models/muse-spark-open-1026` (Reasoning Effort: 32 tokens) |
| **Show Me: Level 1 & 2** (Fast Element Finder) | **Client-Side Heuristic Matcher** | Locates buttons, links, or sections on the page via exact text matching (`textContent`, `aria-label`) and a local semantic synonym dictionary in **0 ms**. | ⚙️ **Local Tool**: TypeScript DOM Matcher & Semantic Synonym Dictionary |
| **Show Me: Level 3** (Semantic Element Finder) | **Semantic Reasoner Agent** | Dispatches 15–20 text candidates from the DOM to the model to assess semantic intent when keywords are ambiguous or do not match directly. | 🤖 **Meta Spark Tool**: Muse Spark Function Calling (`find_element_semantic`) |
| **Show Me: Level 4** (Multimodal Vision Fallback) | **Visual Locator Agent** | Captures a clean screenshot to identify the exact visual coordinates `{x, y}` of graphical buttons or canvas elements lacking DOM text. | 🤖 **Meta Spark Tool**: Multimodal Vision Grounding (`capture_current_screen`) |
| **Visual Navigator** (Show Me Feedback) | **Ghost Pointer & Spotlight Agent** | Animates a virtual hovering cursor (*AI Ghost Cursor*) and fires a targeted beacon spotlight (*Beacon Spotlight*) directly at the target element coordinates. | ⚙️ **Local Tool**: Closed Shadow DOM CSS Keyframe Animator & Virtual Cursor Controller |
| **Visual Snip Explainer** (Lightshot Snip) | **Visual Snip Context Agent** | Crops a user-selected 2-turn visual area, extracts text, and translates confusing clauses, seals, or diagrams into plain, empathetic language. | 🤖 **Meta Spark Tool**: Multimodal Image-to-Text Vision Prompt & CoT Reasoning |
| **Pre-Submit Auditor** (Syntax Validation) | **Deterministic Syntax & Math Validator** | Verifies national ID 16-digit checksums, female date offsets (+40), phone formats (`+62/08`), RFC 5322 emails, and ICAO passports instantly (<5ms). | ⚙️ **Local Tool**: TypeScript Finite State Machine (FSM) Regex Validator |
| **Pre-Submit Auditor** (Biometric Photo Audit) | **Biometric Photo Quality Inspector** | Checks passport photo sharpness (Laplacian blur variance > 100.0) and 70–80% head proportion per ICAO Doc 9303 without cloud pixel transmission. | ⚙️ **Local Tool**: In-Memory WebAssembly/C++ `sharp` Kernel Inspector |
| **Pre-Submit Auditor** (Confidential Data Matching) | **Zero-Knowledge Vault Reconciler** | Verifies form inputs against local user profile archives using Levenshtein distance without exposing the vault PIN to AI. | ⚙️ **Local Tool**: In-Browser Fuzzy Levenshtein Matcher (0 network transit) |
| **Pre-Submit Auditor** (Complex Contradiction Reasoning) | **Ambiguity & Disqualification Buster** | Analyzes fine-print footnotes, conditional criteria (e.g., affirmative vs. regular GPA thresholds), and conflicting clauses to generate a Traffic-Light report. | 🤖 **Meta Spark Tool**: Muse Spark Deep Reasoning (`reasoning_effort: high`, 256 tokens) |
| **Interactive Voicebot** (Live Talk & PTT) | **Audio Activity & VAD Agent** | Monitors microphone audio stream via Web Audio API, detects speech pauses (RMS threshold), and prevents overlapping two-way audio interference. | ⚙️ **Local Tool**: Web Audio API AudioWorklet & Client-Side RMS VAD Engine |
| **Interactive Voicebot** (Speech-to-Intent) | **Multimodal Audio Agent** | Converts recorded citizen speech directly into command intent or form value extraction via native audio payloads. | 🤖 **Meta Spark Tool**: Native Audio Comprehension (`audio_url`, `<\|audio\|>`) |
| **Interactive Voicebot** (Verbal Response) | **Speech Synthesis Engine** | Reads aloud official guidance responses warmly and concisely without third-party audio token costs. | ⚙️ **Local Tool**: Native Browser Web Speech API (`SpeechSynthesisUtterance`) |
| **Accessibility Hub** (14 Inclusive Tools) | **A11y Intent Router Agent** | Analyzes citizen fatigue or strain complaints in chat (e.g., *"the screen is too bright and text is tiny"*) and autonomously invokes the appropriate tool. | 🤖 **Meta Spark Tool**: Muse Function Calling (`toggle_a11y_tool`, `set_a11y_level`) |
| **Accessibility Hub** (14 A11y Execution) | **Deterministic DOM Styler** | Injects high-contrast filters, reading spotlights, dyslexia typography, jumbo cursors, animation freezes, and generous reading spacing into host DOM. | ⚙️ **Local Tool**: Chrome Extension Native Content Script DOM CSS Injector |
| **Private Vault** (Secure Storage) | **Zero-Knowledge Encryption Engine** | Encrypts sensitive personal credentials (national IDs, diplomas, tax records) with user PIN-derived keys (PBKDF2 100k iterations) before Supabase sync. | ⚙️ **Local Tool**: WebCrypto SubtleCrypto AES-256-GCM (128-bit salt, 96-bit IV) |
| **Chat & Log Privacy Guard** | **Client-Side PII Scrubber** | Intercepts and redacts confidential identity numbers before messages are dispatched to remote LLM endpoints. | ⚙️ **Local Tool**: Client-Side Regex Interceptor & Stream Masker |
| **1-Click AutoFill & Recovery** | **Deterministic Field Mapper** | Fills all form fields from encrypted vault data in 1 click and manages form history with a 20-step lossless undo stack. | ⚙️ **Local Tool**: Synthetic DOM Event Dispatcher (`input`, `change`, `blur`) & Redux Undo Stack |

---

## 🏛️ Separation of Concerns: Probabilistic vs. Deterministic

Owly.AI enforces a strict architectural boundary regarding compute responsibilities:

1. **Meta Muse Spark Open (`meta-models/muse-spark-open-1026`)**:
   - Dedicated to **high-order probabilistic reasoning**, such as complex document visual comprehension (*Native Vision*), verbal intent extraction (*Native Audio*), dynamic regulation indexing (*web_search*), policy synthesis, and semantic inference.
2. **Deterministic Local Tools (Client-Side Browser)**:
   - Dedicated to **100% certainty and absolute security**, such as mathematical ID validation, AES-256-GCM cryptography, client PII censorship, accessibility CSS injection, and lossless form rollback. These run locally with <5ms latency and $0 token cost.

---

## 📡 Real-Time Observability & Telemetry

Every execution across the agent ecosystem emits standardized telemetry:
- **Server-Sent Events (SSE)**: Streams multi-agent reasoning tokens directly to the side panel console.
- **Agent Logger (7 Domains)**: `PERCEPTION`, `REASONING`, `PLANNER`, `ACTION`, `SECURITY`, `VOICE`, and `GATEWAY` can be monitored live via the extension IDE terminal and Chrome DevTools (`F12 > Console`).

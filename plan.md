# Master Implementation Plan — Owly.AI

Master roadmap and task tracker for **Owly.AI** — Browser-native Compound Multi-Agent Assistant for Public Form Applicants and Web Navigation, powered by **Meta Muse Spark Open** (`meta-models/muse-spark-open-1026`).

---

## 📊 Scoreboard & Progress Overview

| Priority | Category | Total Tasks | Completed | Pending | Progress |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **P0** | Foundation, Specs & Core Architecture | 8 | 8 | 0 | **100%** |
| **P1** | Web Showcase, MV3 Extension Client & Simulator | 11 | 11 | 0 | **100%** |
| **P2** | Backend API Gateway & Meta Muse Spark Open Engine | 8 | 8 | 0 | **100%** |
| **P3** | On-Device AI Models, Cryptographic Vault & A11y Hub | 6 | 6 | 0 | **100%** |
| **P4** | End-to-End Testing, Security & Benchmark Verification | 5 | 5 | 0 | **100%** |
| **P5** | Documentation, Open-Source Packaging & Self-Hosting | 5 | 5 | 0 | **100%** |
| **TOTAL**| **All Milestones** | **43** | **43** | **0** | **100%** |

---

## 🎯 P0: Foundation, Architecture & Design Specs (CRITICAL FOUNDATION)
*Foundational product requirements, unified design language, localization dictionaries, and data schemas.*

- [x] **P0.1: Product Requirements Document (PRD)**
  - Path: [`prd.md`](file:///d:/webdev/laragon/www/savvy/prd.md)
  - Zero-portal integration rule, 3 core solution pillars (Understand, Fill, Audit), 14 deterministic A11y tools, dual-trigger autofill (single vs. batch) with safe undo, zero-pixel biometric photo compliance.
- [x] **P0.2: Compound Multi-Agent Architecture Blueprint (CMAS)**
  - Paths: [`README.md`](file:///d:/webdev/laragon/www/savvy/README.md) & [`agentic.md`](file:///d:/webdev/laragon/www/savvy/agentic.md)
  - Orchestration pipeline for 9 specialized Meta agents, prompt chaining, reasoning effort budgets (8, 32, 256, 512 tokens), and privacy-first regulation grounding (`web_search` restricted to Agent 2).
- [x] **P0.3: User Journey & Friction Mapping (3-Y Framework)**
  - Persona mapping (scholarship applicants, visa seekers, public job applicants, neurodivergent users, and older adults) addressing Ambiguity, Complexity, and Bureaucratic Anxiety.
- [x] **P0.4: Unified Design System (SkyAgent UI Aesthetic)**
  - Modern light theme (`#FFFFFF`, slate typography, `#2563EB` royal blue accent, floating capsule navigation pill, subtle dot grid, Lucide icons, Inter & Geist typography).
- [x] **P0.5: Modular Localization Dictionary (i18n)**
  - Paths: `web/src/lib/i18n/translations.ts` & `extension/src/lib/i18n/translations.ts`
  - Zero hardcoded strings rule. Full coverage for American English (`en` - default) and Indonesian (`id`).
- [x] **P0.6: Production PostgreSQL Database DDL (Supabase Schema)**
  - Path: `supabase/schema.sql`
  - Core tables: `profiles`, `chat_sessions` (with `compacted_summary`), `chat_messages` (PII-sanitized), `user_vault` (WebCrypto AES-256-GCM `ciphertext`), `coach_cache` (SHA-256 hashed queries), and `juknis_chunks` (13 official PDF guidelines).
- [x] **P0.7: Monorepo Clean Git Ignore Rules**
  - Paths: `.gitignore` (root) & `extension/.gitignore`
  - Complete exclusion of `node_modules/`, `dist/`, `.next/`, `*.log`, and sensitive `.env*` secret files.
- [x] **P0.8: Technical Research & AI Stack Finalization**
  - Baseten Inference API verified with active live tests: model `meta-models/muse-spark-open-1026`, dynamic reasoning control, multimodal vision `<|patch|>`, tool calling, and streaming tokens.

---

## 🚀 P1: Web Showcase & Chrome Extension MV3 Client
*Public-facing landing page, interactive mock portal, form simulator, and Chrome Extension MV3 side panel.*

- [x] **P1.1: Next.js Web Showcase Landing Page**
  - Path: `web/src/app/landingpage/page.tsx`
  - SkyAgent light aesthetic, floating capsule navbar with Language Switcher, hero browser frame, 3-pillar Bento Grid, public portal marquee, 14 A11y cards, and step-by-step guides.
- [x] **P1.2: Dual-Mode Form Simulator**
  - Paths: `web/src/app/landingpage/page.tsx` (In-page HTML interactive demo) & `web/src/app/landingpage/simulator/page.tsx` (Dedicated real-world form portal).
  - Portal simulation with diverse inputs (masked ID/phone, dates, numbers, biometric photo & PDF uploads, essays) + **Access with Owly** detection button and missing extension modal.
- [x] **P1.3: Chrome Extension MV3 Manifest & Build Configuration**
  - Paths: `extension/public/manifest.json`, `extension/vite.config.ts`, `extension/sidepanel.html`
  - Configured with `sidePanel`, `storage`, `activeTab`, and `scripting` permissions. Vite multi-entry build outputting to `extension/dist/`.
- [x] **P1.4: Extension Background Service Worker**
  - Path: `extension/src/background.ts`
  - Auto-open side panel on action click (`chrome.sidePanel.setPanelBehavior`), active tab URL listener, and message broker between content script and side panel.
- [x] **P1.5: Content Script with Closed Shadow DOM & A11y Controllers**
  - Path: `extension/src/content.ts`
  - Non-polluting `#owly-root` shadow container, active element Beacon Spotlight, form DOM scanner, visual numbered badges, autofill injector with change events, and 14 A11y WCAG 2.2 AAA DOM manipulators.
- [x] **P1.6: Side Panel React Application (4 Core Tabs)**
  - Path: `extension/src/App.tsx` & `extension/src/components/`
  - Responsive Chrome side panel containing Field Coach (`FormsGuideTab.tsx`), Encrypted Vault (`VaultTab.tsx`), Pre-Submit Auditor (`AuditTab.tsx`), and AI Assistant with 14 A11y tools (`AiAssistantTab.tsx`).
- [x] **P1.7: Local Storage & State Synchronization**
  - Path: `extension/src/lib/i18n/LanguageContext.tsx`
  - Automatic persistence of language preference (`en` / `id`) and vault unlocked state to `chrome.storage.local`.
- [x] **P1.8: Connect Web Simulator & Extension to Live Backend API**
  - Paths: `web/src/app/landingpage/simulator/page.tsx` & `extension/src/lib/api/client.ts`
  - Connected directly to `/api/form/analyze`, `/api/coach/field` (Two-Tier Cache), `/api/explain`, and `/api/photo/audit`.
- [x] **P1.9: Content Script Visual Snip & Canvas Blackout Mask ("Explain This")**
  - Path: `extension/src/content.ts`
  - Implement canvas/DOM cropping with automatic client-side PII blackout masking (covering faces and sensitive input values with black blocks) before sending to Muse Spark Open Vision.
- [x] **P1.10: Client-Side PII Chat Guard & Censor Interceptor**
  - Path: `extension/src/lib/privacy/censor.ts`
  - High-speed regex filters on chat inputs to censor National IDs, Tax IDs, and phone numbers before message submission, directing users to store sensitive credentials in their private local vault.
- [x] **P1.11: Show Me 4-Level Cascading Element Finder**
  - Path: `extension/src/content.ts` & `extension/src/components/AiAssistantTab.tsx`
  - Cascading resolution: Level 1/2 Heuristics (0ms, 0 tokens) → Level 3 Muse Semantic Tool Call → Level 4 Multimodal Vision Grounding → AI Ghost Cursor pointer animation.

---

## ⚡ P2: Backend API Gateway & Meta Muse Spark Open Integration
*Serverless Node.js endpoints bridging user requests to Muse Spark Open on Baseten, Juknis RAG Store, and Supabase.*

- [x] **P2.1: Backend Project Setup & Environment Configuration**
  - Path: `web/src/app/api/` (Next.js Serverless API Gateway on Vercel)
  - Configured `.env.local` with `BASETEN_API_KEY`, `BASETEN_BASE_URL=https://inference.baseten.co/v1`, `MUSE_SPARK_MODEL_NAME=meta-models/muse-spark-open-1026`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- [x] **P2.2: 3-Agent Triad Form Analysis Endpoint (`/api/form/analyze`)**
  - Path: `web/src/app/api/form/analyze/route.ts`
  - Orchestrates Agent 1 (Profiler via Native Vision), Agent 2 (Regulation Researcher via `web_search` and vector RAG), and Agent 3 (Synthesis with `reasoning_effort: "high"`).
- [x] **P2.3: Field Coach RAG Endpoint (`/api/coach/field`)**
  - Path: `web/src/app/api/coach/field/route.ts`
  - Flow: Query `coach_cache` in Supabase; on miss, retrieve `juknis_chunks`, invoke Muse Spark Open, generate 4-element guidance card (meaning, how to fill, example, pitfalls), cache result, and return.
- [x] **P2.4: Multimodal Snip Explainer Endpoint (`/api/explain`)**
  - Input: `{ image_base64, context_label, portal_url, language }`
  - Flow: Muse Spark Open Multimodal Vision (`image_url` data URI). Jargon Buster + plain language explanation + document specimen reference.
- [x] **P2.5: Essay Coach Narrative Generator (`/api/essay/coach`)**
  - Input: `{ prompt_topic, bullet_points: string[], max_words, language }`
  - Flow: Structured prompt to Muse Spark Open with `reasoning_effort: "high"` for structured academic narrative synthesis without hallucinating facts.
- [x] **P2.6: Zero-Pixel Photo Compliance Audit (`/api/photo/audit`)**
  - Input: `multipart/form-data` image file.
  - Flow: In-memory C++ `sharp` analysis: aspect ratio (2x2 in / 35x45mm), Laplacian blur variance (>100 sharpness threshold), and 70–80% head bounding box. Never modifies pixels.
- [x] **P2.7: Autonomous Accessibility Intent Router (`/api/a11y/command`)**
  - Input: User complaint string (e.g., *"the screen is too bright and text is tiny"*).
  - Flow: Muse Spark function calling with 6 tools (`set_accessibility_feature`, `apply_preset`, etc.) to return exact A11y DOM commands.
- [x] **P2.8: Regulatory Juknis Store Ingestion Script**
  - Path: `web/scripts/seed_juknis_chunks.mjs`
  - Ingest official PDF guidelines (LPDP 2026 Booklet, Schengen Visa Handbook, Civil Service Guide) into Supabase `juknis_chunks` table (13 chunks live seeded).

---

## 🔒 P3: On-Device AI Models, Cryptographic Vault & A11y Hub
*Client-side execution for zero-latency, private document processing without cloud transit.*

- [x] **P3.1: WebCrypto AES-256-GCM Vault Engine & Cloud Ciphertext Sync**
  - Path: `extension/src/lib/crypto/vault.ts` & `web/src/lib/crypto/vault.ts`
  - PBKDF2 key derivation from user PIN (100,000 iterations), AES-256-GCM client encryption. Syncs ciphertext & IV to Supabase `user_vault` (server cannot decrypt).
- [x] **P3.2: 1-Click Vault AutoFill & Lossless Undo Stack**
  - Path: `extension/src/content.ts` & `extension/src/components/VaultTab.tsx`
  - Injects values into form elements, triggers framework change events (`input`, `change`, `blur`), and maintains a 20-step Redux undo stack to restore original values instantly.
- [x] **P3.3: Client-Side Web Audio RMS VAD & Live Voice Companion**
  - Path: `extension/src/lib/voice/` & `extension/src/components/AiAssistantTab.tsx`
  - Lightweight Web Audio API RMS energy detector on microphone stream to automatically detect pauses without overlapping audio.
- [x] **P3.4: Native Browser/OS TTS Engine (Web Speech API)**
  - Path: `extension/src/lib/voice/tts.ts`
  - Zero-latency, zero-cost native speech synthesis via `window.speechSynthesis` with bilingual voice selection (en-US, id-ID).
- [x] **P3.5: Client-Side DOM Blackout Masking Engine (Privacy Shield)**
  - Path: `extension/src/content.ts`
  - Automatically draws solid black rectangles over personal inputs and facial photos on canvas before screenshots are sent to multimodal APIs.
- [x] **P3.6: Pre-Submit Regex & Consistency FSM Validator**
  - Path: `extension/src/lib/audit/rules.ts`
  - Instantaneous (<5ms) regex verification for 16-digit National IDs with female date offset, phone numbers (`+62/08`), emails (RFC 5322), and ICAO passports.

---

## 🧪 P4: End-to-End Testing, Security & Benchmark Verification
*Validation across real-world portals, latency audits, and zero-knowledge privacy guarantees.*

- [x] **P4.1: Automated End-to-End Verification Test Suite**
  - Path: `web/scripts/e2e_verification.mjs`
  - 20/20 test cases passing (100%): PII Censor Guard, Traffic-Light pre-submit rules, AES-256-GCM Vault, live Baseten model ping, and regulatory RAG integrity.
- [x] **P4.2: Zero Raw Cloud Transit & Privacy Audit**
  - Verified 100%: zero raw PII (unmasked IDs, passwords, biometrics) transmitted to cloud; client-side WebCrypto encryption and canvas blackout verified.
- [x] **P4.3: Accessibility WCAG 2.2 AAA Audit**
  - Verified keyboard navigation (`Tab` / `Shift+Tab`), ARIA roles, color contrast ratios, reading rulers, dyslexia fonts, and 14 inclusive tools.
- [x] **P4.4: Cross-Browser & Viewport Responsiveness**
  - Verified on Chromium perimeters (Chrome, Edge, Brave, Opera), Chrome Side Panel MV3, and Web Simulator across mobile, tablet, and desktop viewports.
- [x] **P4.5: Latency & Cost Benchmark**
  - Baseten Muse Spark live response: **816 ms** (<2500ms target), Supabase cache hits: **<15 ms**, token usage capped at ~1k tokens per interaction.

---

## 🏆 P5: Documentation, Open-Source Packaging & Self-Hosting
*Production deliverables, repository polishing, and self-hosted deployment readiness.*

- [x] **P5.1: Bilingual Comprehensive README**
  - Path: [`README.md`](file:///d:/webdev/laragon/www/savvy/README.md)
  - Complete 100% American English documentation: The Problem, Global Statistics, CMAS Architecture, 9-Agent Matrix, 5 Meta Capabilities, and Automated Test Benchmarks.
- [x] **P5.2: Self-Hosted & Local Development 5-Step Guide**
  - Included directly in [`README.md`](file:///d:/webdev/laragon/www/savvy/README.md#L270-L330) with step-by-step instructions for repository cloning, `.env.local` configuration, local server launch, extension endpoint redirection, and Chrome MV3 loading.
- [x] **P5.3: Agentic Capabilities & Tooling Recap Matrix**
  - Path: [`agentic.md`](file:///d:/webdev/laragon/www/savvy/agentic.md)
  - 21-feature capability matrix distinguishing Meta Muse Spark Native Tools from Deterministic Local Tools.
- [x] **P5.4: Live Production Deployment**
  - Web application and API live on Vercel Edge (`https://owly-ai.vercel.app`), with extension zip download packaged at `web/public/owly-extension.zip`.
- [x] **P5.5: Open-Source Licensing & Code Integrity**
  - Distributed under standard permissive MIT License with clean monorepo architecture.

---

## 🔄 Status Legend
- `[x]` **Completed**: Tested, verified, and merged into the active codebase.
- `[ ]` **Pending**: Ready to be implemented according to the priority schedule.

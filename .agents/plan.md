# Master Implementation Plan — Savvy.AI

Master roadmap and task tracker for **Savvy.AI** — Browser-native Compound Multi-Agent Assistant for Public Form Applicants (Meta Global AI Developer Hackathon 2026, Indie Developer Track).

---

## 📊 Scoreboard & Progress Overview

| Priority | Category | Total Tasks | Completed | Pending | Progress |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **P0** | Foundation, Specs & Core Architecture | 8 | 8 | 0 | **100%** |
| **P1** | Web Showcase & MV3 Extension Client | 10 | 8 | 2 | **80%** |
| **P2** | Backend API Gateway & Baseten Inference API (Muse Spark Open) | 8 | 0 | 8 | **0%** |
| **P3** | Real On-Device AI Models & Voice Engine | 6 | 0 | 6 | **0%** |
| **P4** | End-to-End Testing & Security Verification | 5 | 0 | 5 | **0%** |
| **P5** | Hackathon Deliverables & Video Submission | 5 | 0 | 5 | **0%** |
| **TOTAL**| **All Milestones** | **42** | **16** | **26** | **38%** |

---

## 🎯 P0: Foundation, Architecture & Design Specs (CRITICAL FOUNDATION)
*Foundational product requirements, unified design language, localization dictionaries, and data schemas.*

- [x] **P0.1: Product Requirements Document (PRD)**
  - Path: `.agents/prd.md`
  - Zero-portal integration rule, 3 solution pillars (Understand, Fill, Audit), 14 deterministic A11y tools, dual-trigger autofill (single vs. batch) with safe undo, zero-pixel photo compliance.
- [x] **P0.2: Compound Multi-Agent Architecture Blueprint**
  - Path: `.agents/multi_agents.md` & `.agents/architecture.md`
  - Single-hit orchestrator schema, ReAct prompt engineering for Meta Muse Spark 1.3, RAG citation schemas.
- [x] **P0.3: User Journey & Friction Mapping (3-Y Framework)**
  - Path: `.agents/user_journey.md`
  - Persona mapping (LPDP scholars, Schengen visa, CASN, neurodivergent applicants) addressing Ambiguity, Complexity, and Anxiety.
- [x] **P0.4: Unified Design System (SkyAgent Magic UI Aesthetic)**
  - Path: `.agents/design.md`
  - Light theme palette (`#FFFFFF`, slate typography, `#2563EB` royal blue accent, floating capsule pill navbar, subtle dot grid, Lucide icons, Geist typography).
- [x] **P0.5: Modular Localization Dictionary (i18n)**
  - Paths: `web/src/lib/i18n/translations.ts` & `extension/src/lib/i18n/translations.ts`
  - Zero hardcoded strings rule. Full coverage for Indonesian (`id`) and English (`en`), extensible to `zh`, `es`, `ar`.
- [x] **P0.6: Production PostgreSQL Database DDL**
  - Path: `supabase/schema.sql`
  - 5 core tables (`savvy_sessions`, `coach_cache`, `vector_stores`, `feedback_reports`, `user_preferences`) with RLS policies, indexing, and auto-triggers.
- [x] **P0.7: Monorepo Clean Git Ignore Rules**
  - Paths: `.gitignore` (root) & `extension/.gitignore`
  - Complete exclusion of `node_modules/`, `dist/`, `.next/`, `*.log`, and sensitive `.env*` files.
- [x] **P0.8: Technical Research & AI Stack Finalization**
  - Free $150 Baseten Inference API (Muse Spark Open) credits claimed; architecture streamlined exclusively on Baseten Inference API (Muse Spark Open) without GPU middleware dependencies (no Baseten).

---

## 🚀 P1: Web Showcase & Chrome Extension MV3 Client
*Public-facing landing page, interactive mock portal, web simulator, and actual Chrome Extension MV3 side panel code.*

- [x] **P1.1: Next.js Web Showcase Landing Page**
  - Path: `web/src/app/landingpage/page.tsx`
  - SkyAgent light aesthetic, floating capsule navbar with LanguageSwitcher, hero browser frame, 3-pillar Bento Grid, public portal marquee, 14 A11y cards, and step-by-step guides.
- [x] **P1.2: Interactive LPDP 2026 Mock Portal**
  - Path: `web/src/app/landingpage/mock-portal/page.tsx`
  - Standalone testing ground for public form applicants with real-time field validation, NIK 16-digit regex check, photo upload, and pre-submit auditing.
- [x] **P1.3: Interactive In-Browser Extension Simulator**
  - Path: `web/src/app/landingpage/simulator/page.tsx`
  - Web-based simulator for judges and evaluators without installing extension. Dual mode (Docked Browser Portal vs. Side Panel Standalone), 4 reactive tabs, 14 A11y toggles.
- [x] **P1.4: Chrome Extension MV3 Manifest & Build Configuration**
  - Paths: `extension/public/manifest.json`, `extension/vite.config.ts`, `extension/sidepanel.html`
  - Configured with `sidePanel`, `storage`, `activeTab`, and `scripting` permissions. Vite multi-entry build outputting to `extension/dist`.
- [x] **P1.5: Extension Background Service Worker**
  - Path: `extension/src/background.ts`
  - Auto-open side panel on action click (`chrome.sidePanel.setPanelBehavior`), active tab URL listener, message broker between content script and side panel.
- [x] **P1.6: Content Script with Closed Shadow DOM & A11y Controllers**
  - Path: `extension/src/content.ts`
  - Non-polluting `#savvy-root` shadow container, active element spotlight beacon, form DOM scanner, autofill injector with change events, and 14 A11y WCAG 2.2 AAA DOM manipulators.
- [x] **P1.7: Side Panel React Application (4 Core Tabs)**
  - Path: `extension/src/App.tsx` & `extension/src/components/`
  - Responsive layout for Chrome side panel containing Field Coach, Encrypted Vault, Pre-Submit Auditor, and Accessibility HUB.
- [x] **P1.8: Local Storage & State Synchronization**
  - Path: `extension/src/lib/i18n/LanguageContext.tsx`
  - Automatic persistence of language preference and unlocked state to `chrome.storage.local`.
- [ ] **P1.9: Connect Extension Side Panel to Live Backend API**
  - Connect `extension/src/components/CoachTab.tsx` and `AuditorTab.tsx` to live backend endpoints instead of static fallback data.
- [ ] **P1.10: Content Script Visual Snip & Masking Overlay ("Explain This")**
  - Implement canvas/DOM cropping with automatic client-side PII redacting (masking text/numbers with black bars) before sending snip to vision model.

---

## ⚡ P2: Backend API Gateway & Baseten Inference API (Muse Spark Open) Integration
*Serverless Node.js endpoints bridging user requests to Meta Muse Spark 1.3, Juknis RAG Store, and Supabase.*

- [ ] **P2.1: Backend Project Setup & Environment Configuration**
  - Path: `backend/`
  - Dependencies: `@supabase/supabase-js`, `dotenv`, `cors`, `zod`, `sharp`, `form-data`.
  - Configured `.env` matching `.env.example` with `META_MODEL_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] **P2.2: Field Coach RAG Endpoint (`/api/coach/field`)**
  - Input: `{ portal_id, field_id, field_name, label_text, context_text }`
  - Flow: Query `coach_cache` in Supabase; if miss, invoke Juknis RAG Store (`file_search` tool) with Juknis LPDP/Visa documents. Format response with official rule, pitfall, and page citation.
- [ ] **P2.3: General Assistant & Voice Chat Endpoint (`/api/chat`)**
  - Input: `{ session_id, message, form_context, language }`
  - Flow: ReAct streaming agent using Meta Muse Spark 1.3 with tool definitions (`file_search`, `set_accessibility_feature`, `recommend_vault_field`).
- [ ] **P2.4: Multimodal Snip Explainer Endpoint (`/api/explain`)**
  - Input: `{ image_base64, context_label, portal_url }`
  - Flow: Meta Muse Spark Vision multimodal reasoning. Jargon Buster + plain language explanation + document specimen reference.
- [ ] **P2.5: Essay Coach Narrative Generator (`/api/essay/coach`)**
  - Input: `{ prompt_topic, bullet_points: string[], max_words, language }`
  - Flow: Structured prompt to Muse Spark enforcing strict factual adherence (zero hallucinated facts) + academic flow transformation.
- [ ] **P2.6: Zero-Pixel Photo Compliance Audit (`/api/photo/audit`)**
  - Input: `multipart/form-data` image file.
  - Flow: In-memory `sharp` analysis: aspect ratio (2x2 inch / 35x45mm), Laplacian blur variance (>100 sharpness threshold), background color neutrality, file size check. Never alter pixels.
- [ ] **P2.7: Audio Transcription Gateway (`/api/voice/transcribe`)**
  - Input: `audio/wav` or `audio/webm` blob.
  - Flow: Proxy to `Muse Voice Transcribe` API; return clean transcribed string with timestamp and detected language.
- [ ] **P2.8: Regulatory Vector Store Ingestion Script**
  - Path: `backend/scripts/seed_vector_stores.ts`
  - Ingest official PDF guidelines (LPDP 2026 Booklet, Schengen Visa Application Handbook, OSS User Guide) into Juknis RAG Store via API.

---

## 🔒 P3: Real On-Device AI Models & Voice Engine
*Client-side execution for zero-latency, private document processing without cloud transit.*

- [ ] **P3.1: WebCrypto AES-256-GCM Vault Engine**
  - Path: `extension/src/lib/crypto/vault.ts` & `frontend/src/lib/crypto/vault.ts`
  - PBKDF2 key derivation from user Master Password, AES-256-GCM encryption/decryption of Vault records in `chrome.storage.local`.
- [ ] **P3.2: Multimodal Document Vision Extractor (Muse Spark Open)**
  - Path: `extension/src/lib/ai/doc_extractor.ts`
  - Implement consent modal (UU PDP compliance) and send document image in-RAM as Base64 to Muse Spark Open (Meta) for zero-storage extraction into encrypted Vault.
- [ ] **P3.3: Client-Side Silero VAD Voice Detection**
  - Path: `extension/src/lib/voice/vad.ts`
  - Run lightweight Silero VAD (1 MB ONNX) on microphone stream to automatically trigger speech-to-text without pressing buttons.
- [ ] **P3.4: Native Browser/OS TTS Engine (Web Speech API)**
  - Path: `extension/src/lib/voice/tts.ts`
  - Implement zero-latency, zero-cost native Browser/OS speech synthesis via `window.speechSynthesis` with voice selection (id-ID, en-US) and pitch/rate controls.
- [ ] **P3.5: Client-Side DOM Masking Engine (Privacy Shield)**
  - Path: `extension/src/lib/privacy/masking.ts`
  - Automatic detection of sensitive input fields (password, credit card, NIK values) and black-bar overlay before sending any screenshots to the backend.
- [ ] **P3.6: Pre-Submit Regex & Consistency FSM Validator**
  - Path: `extension/src/lib/audit/rules.ts`
  - Instantaneous (<50ms) regex verification for NIK (16 digits), passport number, dates, emails, and postal codes before LLM inference.

---

## 🧪 P4: End-to-End Testing & Security Verification
*Validation across real-world portals, latency audits, and zero-knowledge privacy guarantees.*

- [ ] **P4.1: Test Suite for LPDP 2026 Portal Simulation**
  - Verify complete applicant journey: Focus on NIK -> Field Coach card -> Single autofill -> Essay coach -> Photo audit -> Pre-submit green light.
- [ ] **P4.2: Zero Cloud Transit & Security Audit**
  - Inspect network tab during all operations to guarantee zero raw PII (unmasked NIK/passwords) is ever transmitted to cloud APIs or Supabase.
- [ ] **P4.3: Accessibility WCAG 2.2 AAA Audit**
  - Automated testing with axe-core / Lighthouse verifying keyboard navigation (`Tab` / `Shift+Tab`), ARIA roles, color contrast ratios, and screen-reader friendliness.
- [ ] **P4.4: Cross-Browser & Resolution Testing**
  - Test Chrome Extension Side Panel on standard 1080p, 1440p, and 4K displays; test Web Showcase on mobile, tablet, and desktop viewports.
- [ ] **P4.5: Latency & Cost Benchmark**
  - Benchmark Field Coach cache hits (<10ms), RAG queries (<1.8s), local OCR (<600ms), and confirm $0 token waste for 14 accessibility tools.

---

## 🏆 P5: Hackathon Deliverables & Video Submission
*Packaging the submission for the Meta Global AI Developer Hackathon 2026 (Indie Developer Track).*

- [ ] **P5.1: 3-Minute Walkthrough Video Recording**
  - Script & record:
    1. Hook (15s): The friction and anxiety of public forms.
    2. Pillar 1: Understand (45s): Field Coach RAG, official citations, voicebot.
    3. Pillar 2: Fill (45s): Encrypted Vault, 1-click autofill with Safe Undo, Essay Coach.
    4. Pillar 3: Audit (45s): Traffic light auditor, zero-pixel photo compliance, consistency check.
    5. Tech Stack & Meta AI Architecture (30s): Muse Spark, Vector Store, Muse Voice.
- [ ] **P5.2: Public GitHub Repository Optimization**
  - Polish `README.md` with visual architecture diagrams, installation instructions, environment setup, and demo GIF animations.
- [ ] **P5.3: Meta AI Dev Credits & API Usage Proof**
  - Document Baseten Inference API (Muse Spark Open) endpoint calls, token usage logs (`docs/muse-code-log.md`), and compliance with hackathon rules.
- [ ] **P5.4: Pitch Deck / Slide Deck (PDF)**
  - 10-slide pitch: Problem, Solution, Target Personas, Tech Stack, Competitive Advantage (Zero-Integration + Zero-Knowledge), Roadmap.
- [ ] **P5.5: Final Submission Form on Devpost / Hackathon Portal**
  - Submit repository URL, video link, demo link, and project description before the deadline.

---

## 🔄 Status Legend
- `[x]` **Completed**: Tested, verified, and merged into the active codebase.
- `[ ]` **Pending**: Ready to be implemented according to the priority schedule.

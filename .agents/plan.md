# Master Implementation Plan — Savvy.AI

Master roadmap and task tracker for **Savvy.AI** — Browser-native Compound Multi-Agent Assistant for Public Form Applicants (Meta Global AI Developer Hackathon 2026, Indie Developer Track).

---

## 📊 Scoreboard & Progress Overview

| Priority | Category | Total Tasks | Completed | Pending | Progress |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **P0** | Foundation, Specs & Core Architecture | 8 | 8 | 0 | **100%** |
| **P1** | Web Showcase, MV3 Extension Client & Meta Auth | 11 | 8 | 3 | **73%** |
| **P2** | Backend API Gateway & Baseten Muse Spark Open | 8 | 3 | 5 | **38%** |
| **P3** | Real On-Device AI Models, Vault & Voice Engine | 6 | 0 | 6 | **0%** |
| **P4** | End-to-End Testing & Security Verification | 5 | 0 | 5 | **0%** |
| **P5** | Hackathon Deliverables & Video Submission | 5 | 0 | 5 | **0%** |
| **TOTAL**| **All Milestones** | **43** | **19** | **24** | **44%** |

---

## 🎯 P0: Foundation, Architecture & Design Specs (CRITICAL FOUNDATION)
*Foundational product requirements, unified design language, localization dictionaries, and data schemas.*

- [x] **P0.1: Product Requirements Document (PRD)**
  - Path: [prd.md](file:///d:/webdev/laragon/www/savvy/.agents/prd.md)
  - Zero-portal integration rule, 3 solution pillars (Understand, Fill, Audit), 14 deterministic A11y tools, dual-trigger autofill (single vs. batch) with safe undo, zero-pixel photo compliance.
- [x] **P0.2: Compound Multi-Agent Architecture Blueprint**
  - Path: [multi_agents.md](file:///d:/webdev/laragon/www/savvy/.agents/multi_agents.md) & [architecture.md](file:///d:/webdev/laragon/www/savvy/.agents/architecture.md)
  - Single-hit orchestrator schema, ReAct prompt engineering for Meta Muse Spark Open (`meta-models/muse-spark-open-1026`) via Baseten Inference API, RAG citation schemas.
- [x] **P0.3: User Journey & Friction Mapping (3-Y Framework)**
  - Path: [user_journey.md](file:///d:/webdev/laragon/www/savvy/.agents/user_journey.md)
  - Persona mapping (LPDP scholars, Schengen visa, CASN, neurodivergent applicants) addressing Ambiguity, Complexity, and Anxiety.
- [x] **P0.4: Unified Design System (SkyAgent Magic UI Aesthetic)**
  - Path: [design.md](file:///d:/webdev/laragon/www/savvy/.agents/design.md)
  - Light theme palette (`#FFFFFF`, slate typography, `#2563EB` royal blue accent, floating capsule pill navbar, subtle dot grid, Lucide icons, Geist typography).
- [x] **P0.5: Modular Localization Dictionary (i18n)**
  - Paths: `web/src/lib/i18n/translations.ts` & `extension/src/lib/i18n/translations.ts`
  - Zero hardcoded strings rule. Full coverage for Indonesian (`id`) and English (`en`), extensible to `zh`, `es`, `ar`.
- [x] **P0.6: Production PostgreSQL Database DDL (Supabase + Meta Auth)**
  - Path: `supabase/schema.sql`
  - Core tables: `profiles` (Meta/Facebook OAuth, 50k MAU free tier), `chat_sessions` (dengan `compacted_summary`), `chat_messages` (PII-sanitized), `user_vault` (WebCrypto AES-GCM `ciphertext`), `coach_cache`, dan `juknis_chunks`.
- [x] **P0.7: Monorepo Clean Git Ignore Rules**
  - Paths: `.gitignore` (root) & `extension/.gitignore`
  - Complete exclusion of `node_modules/`, `dist/`, `.next/`, `*.log`, and sensitive `.env*` files.
- [x] **P0.8: Technical Research & AI Stack Finalization**
  - Baseten Inference API setup verified with active live tests in `playground/` (reasoning effort, tool calling, multimodal vision, conversation chain).

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
- [ ] **P1.10: Content Script Visual Snip & DOM Blackout Mask ("Explain This")**
  - Path: [ocr.md](file:///d:/webdev/laragon/www/savvy/.agents/ocr.md)
  - Implement canvas/DOM cropping with automatic client-side PII black-out masking (menutup foto wajah dan kotak input sensitif dengan blok hitam) sebelum dikirim ke Muse Spark Open Vision.
- [ ] **P1.11: Extension Meta Social Auth & PII Chat Guard**
  - Path: `extension/src/components/AuthModal.tsx` & `extension/src/lib/privacy/censor.ts`
  - Integrasi login Facebook/Instagram via Supabase Auth (Free Tier 50k MAU). Client-side regex sensor pada input chat untuk menyamarkan NIK/NPWP/Rekening dan menampilkan pesan peringatan langsung mengarahkan user menyimpannya di Vault Pribadi.

---

## ⚡ P2: Backend API Gateway & Baseten Inference API Integration
*Serverless Node.js endpoints bridging user requests to Muse Spark Open on Baseten, Juknis RAG Store, and Supabase.*

- [x] **P2.1: Backend Project Setup & Environment Configuration**
  - Path: `web/src/app/api/` (Next.js Serverless API Gateway on Vercel)
  - Dependencies: `@supabase/supabase-js`, `@vercel/analytics`, `dotenv`.
  - Configured `.env.local` dengan `BASETEN_API_KEY`, `BASETEN_BASE_URL=https://inference.baseten.co/v1`, `MUSE_SPARK_MODEL_NAME=meta-models/muse-spark-open-1026`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- [x] **P2.2: Field Coach RAG Endpoint (`/api/coach/field`)**
  - Path: `web/src/app/api/coach/field/route.ts`
  - Flow: Query `coach_cache` in Supabase; if miss, invoke Juknis RAG chunks (`juknis_chunks`), panggil Muse Spark Open di Baseten, generate 4-elemen (meaning, how_to_fill, example, pitfalls) + badge referensi halaman juknis, simpan ke cache dan return.
- [x] **P2.3: General Assistant Chat & Compacting Engine (`/api/chat`)**
  - Path: `web/src/app/api/chat/route.ts`
  - Flow: 
    1. Filter & redact PII teks (NIK/NPWP).
    2. Ambil `compacted_summary` dari sesi + 10 pesan percakapan terakhir (sliding window).
    3. Eksekusi inferensi via Baseten `meta-models/muse-spark-open-1026`.
    4. Jika pesan aktif > 10, trigger background compacting via Muse Spark Open untuk memperbarui `chat_sessions.compacted_summary`.
- [ ] **P2.4: Multimodal Snip Explainer Endpoint (`/api/explain`)**
  - Input: `{ image_base64, context_label, portal_url }`
  - Flow: Muse Spark Open Multimodal Vision (`image_url` data URI). Jargon Buster + plain language explanation + document specimen reference.
- [ ] **P2.5: Essay Coach Narrative Generator (`/api/essay/coach`)**
  - Input: `{ prompt_topic, bullet_points: string[], max_words, language }`
  - Flow: Structured prompt to Muse Spark Open dengan `reasoning_effort: "high"` untuk penalaran terstruktur tanpa halusinasi fakta.
- [ ] **P2.6: Zero-Pixel Photo Compliance Audit (`/api/photo/audit`)**
  - Input: `multipart/form-data` image file.
  - Flow: In-memory `sharp` analysis: aspect ratio (2x2 inch / 35x45mm), Laplacian blur variance (>100 sharpness threshold), background color neutrality, file size check. Never alter pixels.
- [ ] **P2.7: Audio Transcription Gateway (`/api/voice/transcribe`)**
  - Input: `audio/wav` or `audio/webm` blob / data URI.
  - Flow: Endpoint transkripsi / fallback ke browser Web Speech STT bawaan.
- [ ] **P2.8: Regulatory Juknis Store Ingestion Script**
  - Path: `backend/scripts/seed_juknis_chunks.ts`
  - Ingest official PDF guidelines (LPDP 2026 Booklet, Schengen Visa Application Handbook, OSS User Guide) ke dalam tabel `juknis_chunks` Supabase.

---

## 🔒 P3: Real On-Device AI Models, Vault & Voice Engine
*Client-side execution for zero-latency, private document processing without cloud transit.*

- [ ] **P3.1: WebCrypto AES-256-GCM Vault Engine & Cloud Ciphertext Sync**
  - Path: `extension/src/lib/crypto/vault.ts` & `frontend/src/lib/crypto/vault.ts`
  - PBKDF2 key derivation dari user Master Password, enkripsi AES-256-GCM di sisi klien. Menyimpan ciphertext & IV ke Supabase `user_vault` (server hanya menyimpan ciphertext tanpa bisa mendekripsi).
- [ ] **P3.2: Multimodal Document Vision Extractor (Muse Spark Open via Baseten)**
  - Path: `extension/src/lib/ai/doc_extractor.ts` & [ocr.md](file:///d:/webdev/laragon/www/savvy/.agents/ocr.md)
  - Implement consent modal (UU PDP compliance) dan DOM Blackout Mask (menutup foto wajah sebelum kirim). Kirim potongan data dokumen sebagai in-RAM Base64 ke Muse Spark Open di Baseten untuk diekstrak langsung ke Vault terenkripsi.
- [ ] **P3.3: Client-Side Silero VAD Voice Detection**
  - Path: `extension/src/lib/voice/vad.ts`
  - Run lightweight Silero VAD (1 MB ONNX) on microphone stream to automatically trigger speech-to-text without pressing buttons.
- [ ] **P3.4: Native Browser/OS TTS Engine (Web Speech API)**
  - Path: `extension/src/lib/voice/tts.ts`
  - Zero-latency, zero-cost native Browser/OS speech synthesis via `window.speechSynthesis` dengan voice selection (id-ID, en-US) dan kontrol nada/kecepatan.
- [ ] **P3.5: Client-Side DOM Blackout Masking Engine (Privacy Shield)**
  - Path: `extension/src/lib/privacy/masking.ts`
  - Otomatis merender layer canvas hitam pekat di atas field data pribadi pengguna dan foto biometrik sebelum screenshot dikirim ke API.
- [ ] **P3.6: Pre-Submit Regex & Consistency FSM Validator**
  - Path: `extension/src/lib/audit/rules.ts`
  - Instantaneous (<50ms) regex verification for NIK (16 digits), passport number, dates, emails, and postal codes before LLM inference.

---

## 🧪 P4: End-to-End Testing & Security Verification
*Validation across real-world portals, latency audits, and zero-knowledge privacy guarantees.*

- [ ] **P4.1: Test Suite for LPDP 2026 Portal Simulation**
  - Verify complete applicant journey: Focus on NIK -> Field Coach card -> Single autofill -> Essay coach -> Photo audit -> Pre-submit green light.
- [ ] **P4.2: Zero Cloud Transit & Security Audit**
  - Inspect network tab during all operations to guarantee zero raw PII (unmasked NIK/passwords/biometrics) is ever transmitted to cloud APIs or Supabase.
- [ ] **P4.3: Accessibility WCAG 2.2 AAA Audit**
  - Automated testing with axe-core / Lighthouse verifying keyboard navigation (`Tab` / `Shift+Tab`), ARIA roles, color contrast ratios, and screen-reader friendliness.
- [ ] **P4.4: Cross-Browser & Resolution Testing**
  - Test Chrome Extension Side Panel on standard 1080p, 1440p, and 4K displays; test Web Showcase on mobile, tablet, and desktop viewports.
- [ ] **P4.5: Latency & Cost Benchmark**
  - Benchmark Field Coach cache hits (<10ms), Baseten Muse Spark responses (<1.8s), sliding window token usage (<1.2k tokens), and confirm $0 token waste for 14 accessibility tools.

---

## 🏆 P5: Hackathon Deliverables & Video Submission
*Packaging the submission for the Meta Global AI Developer Hackathon 2026 (Indie Developer Track).*

- [ ] **P5.1: 3-Minute Walkthrough Video Recording**
  - Script & record:
    1. Hook (15s): The friction and anxiety of public forms.
    2. Pillar 1: Understand (45s): Field Coach RAG, official citations, voicebot.
    3. Pillar 2: Fill (45s): Encrypted Vault, 1-click autofill with Safe Undo, Essay Coach.
    4. Pillar 3: Audit (45s): Traffic light auditor, zero-pixel photo compliance, consistency check.
    5. Tech Stack & Meta AI Architecture (30s): Muse Spark Open on Baseten, Web Speech API, DOM Blackout Mask.
- [ ] **P5.2: Public GitHub Repository Optimization**
  - Polish `README.md` with visual architecture diagrams, installation instructions, environment setup, and demo GIF animations.
- [ ] **P5.3: Meta AI Dev Credits & Baseten Inference Proof**
  - Document Baseten Inference API endpoint calls, token usage logs (`docs/muse-code-log.md`), and compliance with hackathon rules.
- [ ] **P5.4: Pitch Deck / Slide Deck (PDF)**
  - 10-slide pitch: Problem, Solution, Target Personas, Tech Stack, Competitive Advantage (Zero-Integration + Zero-Knowledge), Roadmap.
- [ ] **P5.5: Final Submission Form on Devpost / Hackathon Portal**
  - Submit repository URL, video link, demo link, and project description before the deadline.

---

## 🔄 Status Legend
- `[x]` **Completed**: Tested, verified, and merged into the active codebase.
- `[ ]` **Pending**: Ready to be implemented according to the priority schedule.

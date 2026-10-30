# Development Journal — Savvy.AI

Personal dev logbook, daily progress, reflections, and architectural decisions during the development of **Savvy.AI** for the Meta Global AI Developer Hackathon 2026.

---

## 📅 October 27, 2026 — Planning & Tech Stack Definition

### 🎯 Primary Focus Today
Today's core focus was drafting a comprehensive roadmap and architecture, conducting in-depth research on model capabilities, and selecting an optimal, cost-effective, and reliable tech stack for both the browser extension and backend services.

### 📝 Notes & Progress
1. **Drafting & Refining Project Plans (PRD & Architecture):**
   - Structured the complete product requirements in `prd.md`.
   - Focused 100% on the citizen/applicant browser extension (*Savvy.AI*) operating with zero-integration across portals, without requiring SDKs or government portal changes.
   - Adopted strict international regulatory compliance: official visa/passport guidelines (US Dept of State & ICAO 9303) strictly prohibit digital retouching or generative alteration of biometric photos. Accordingly, image editing features have been replaced with a deterministic **Photo Compliance Audit** tool and a quick link to external utilities.

2. **Finalizing Extension Features:**
   - **Pilar Understand:** Technical guidelines RAG Chatbot via Juknis RAG Store (`file_search`), Handsfree Voicebot (Silero VAD + Muse Voice Transcribe + Browser/OS Native Web Speech API), Lipsync Avatar, Explain This (Multimodal Snip), and Accessibility HUB (ADHD focus bar, OpenDyslexic).
   - **Pilar Fill:** Multiple independent Vaults with AES-256-GCM encryption + Master Password (PBKDF2-SHA256), Lock/Unlock functionality, ID card scan extraction into Vault via Muse Spark Open Multimodal Vision (in-RAM only, UU PDP consent), and **Essay Coach** (3 bullet points → formal narrative draft without hallucinated facts).
   - **Pilar Audit:** Pre-Submit Traffic Light Auditor (Red/Yellow/Green), **Consistency Checker Agent** (cross-field validation), and Photo Compliance Audit (`sharp` in-memory).
   - **Robust Element Resolution & Caching:** Multi-layer locator engine (5 layers: Semantic A11y, Stable Attributes, Section Path, Geometric DOM, Fuzzy Search) and shared cache by field signature with single-flight request deduplication.

3. **Selecting an Optimal, Pure Meta AI Stack:**
   - **On-Device Extension:**
     - Security: `WebCrypto API` (AES-256-GCM + PBKDF2 Master Password)
     - Audio & Voice: `Silero VAD` (1 MB local) + Web Speech API (native zero-latency Browser/OS TTS)
   - **Cloud AI Inference (100% via Baseten Inference API (Muse Spark Open)):**
     - Primary Brain: `Muse Spark Open` (ReAct orchestrator, Field Coach, Essay Coach, Consistency Checker, Vision Multimodal)
     - Document Retrieval: `Muse Vector Store` (`file_search` tool)
     - Primary STT: `Muse Voice Transcribe`
     - Visual Segmentation Fallback: `SAM 3.1 Open 0.87B`
     - Agentic Engineering Log: `Muse Code` (`docs/muse-code-log.md`)
   - **Audio Presentation:** Native Browser/OS Web Speech API (`window.speechSynthesis`) for zero-latency, zero-cost, and 100% on-device speech synthesis.
   - **Gateway & Database:** Vercel Node.js Serverless + Supabase (PostgreSQL, Auth, RLS).

4. **Account Registration & Claiming Free Credits:**
   - Registered on the **Meta API Dev** portal to claim $150 free credits for Baseten Inference API (Muse Spark Open).
   - Streamlined architecture to run exclusively on Baseten Inference API (Muse Spark Open), eliminating external GPU platforms (Baseten) to maximize reliability and reduce stack complexity.

5. **User Journey & Friction Mapping (`user_journey.md`):**
   - Established dedicated `user_journey.md` in `.agents/` documenting the **3-Y Friction Framework** (Ambiguity, Complexity, Anxiety) mapped directly to 4 citizen personas (Scholarship Applicants, Visa/Passport Applicants, Public Service Seekers, and Neurodivergent/Accessibility Seekers).
   - Mapped the end-to-end user journey directly to Savvy.AI features across the 3 pillars: Understand, Fill, and Audit.

6. **Single-Hit Compound Multi-Agent Architecture (`multi_agents.md`):**
   - Formulated the high-efficiency compound multi-agent blueprint for **Muse Spark Open**.
   - Fully defined concrete agent swarms, prompt templates, and JSON schemas for core features:
     1. **Analyze Form Multi-Agent:** Section & Flow Mapper (Agent A), Vault Semantic Key Matcher (Agent B), Prerequisite & Attachment Detector (Agent C), and Form Companion Synthesizer (Agent D).
     2. **Traffic Light Auditor Multi-Agent:** Syntax & Regex Validator (Agent A), Cross-Field & Regulatory Consistency Checker (Agent B), Document & Photo Compliance Inspector (Agent C), and Traffic Light Synthesizer with 1-Click Remedies (Agent D).
     3. **Explain This Multi-Agent:** Legal & Regulatory Grounding (Agent A), Jargon Buster / Plain Language (Agent B), Practical Action & Specimen Advisor (Agent C), and Dual Synthesizer with visual markdown & clean voice script (Agent D).
---

## 📅 October 28, 2026 — Design System, Interactive Showcase, Simulator, & Chrome Extension MV3 Implementation

### 🎯 Primary Focus Today
Today's objectives centered on transitioning architecture and product requirements into working code: unifying the design system around the SkyAgent aesthetic, establishing a zero-hardcoded modular localization foundation (i18n), implementing an interactive web showcase with a dedicated extension Simulator (`/simulator`), developing the production Chrome Extension Manifest V3 codebase, and hardening monorepo Git hygiene.

### 📝 Notes & Progress

1. **Accessibility HUB Analysis & Decision Framework (14 Deterministic Tools):**
   - Conducted an in-depth audit of the 14 client-side accessibility tools specified in WCAG 2.2 AAA guidelines (Reading Spotlight, TTS, Contrast Mode, Highlight Links, Bigger Text Size, Text Spacing, Pause Animations, Hide Images, Dyslexia Friendly, Page Zoom, Big Cursor, Invert Colors, Desaturate, and Tooltips).
   - Formulated a unified tool invocation contract: `set_accessibility_feature(feature_name: string, enabled: boolean, options?: object)`.
   - Outlined AI reasoning trigger conditions: Meta Muse Spark autonomously recommends tools when detecting user distress, cognitive fatigue, visual strain, or ADHD task-switching friction.

2. **Database Schema & PRD Architecture Alignment:**
   - Unified the production PostgreSQL DDL across 5 core tables:
     - `savvy_sessions`: Tracks user session progress and form completion states.
     - `coach_cache`: Shared vector and field query cache to prevent redundant LLM inferences.
     - `vector_stores`: Metadata and indexing status for official regulatory handbooks (Juknis).
     - `feedback_reports`: Anonymized user telemetry and accuracy ratings.
     - `user_preferences`: Stored settings (preferred language, accessibility defaults).
   - Enforced strict Row Level Security (RLS) policies, indexes, and updated timestamp triggers in `supabase/schema.sql`.

3. **Dual-Trigger Autofill & Safe Undo Specification:**
   - Formulated the single-field autofill mechanism attached directly to individual 4-element guidance cards.
   - Formulated the batch 1-click autofill flow with an instantaneous `Safe Undo` rollback capability.
   - Re-verified strict client-side encryption (WebCrypto AES-256-GCM) ensuring zero cloud transit for raw PII (NIK, passport, diplomas).

4. **Design System Modernization (SkyAgent Magic UI Aesthetic):**
   - Consolidated `design-extension.md` and `design-frontend.md` into a single, cohesive `.agents/design.md`.
   - Calibrated styling to match the clean light aesthetic of SkyAgent: `#FFFFFF` background, slate typography, `#2563EB` royal blue accent, floating capsule pill navbar, subtle dot grid, and soft ambient gradient glows.
   - Standardized typography on Geist Sans / Inter with Geist Mono for tabular data, and integrated Lucide React (`lucide-react`) across all components.

5. **Strict Modular Localization (i18n):**
   - Built a comprehensive localization dictionary in `frontend/src/lib/i18n/translations.ts` and `extension/src/lib/i18n/translations.ts` supporting Indonesian (`id`) and English (`en`).
   - Enforced a zero-hardcoded strings policy across all UI components, buttons, tabs, alerts, and tooltips.
   - Implemented reactive `LanguageContext` providers with automatic synchronization to `chrome.storage.local` (extension) and `localStorage` (web).

6. **Web Showcase & Interactive Mock Portal (`frontend/`):**
   - **Landing Page (`/`)**: Built with Next.js App Router and Turbopack. Features a hero section with a simulated browser viewport, a 3-pillar Bento Grid, a public portal marquee, 14 interactive accessibility tiles, and step-by-step guides.
   - **Mock Portal (`/mock-portal`)**: Developed an interactive LPDP 2026 scholarship application form with real-time field validation, NIK format checking, biometric photo upload requirements, and pre-submit auditing.

7. **Dedicated Extension Simulator (`/simulator`):**
   - Responded to user feedback by transforming the standalone extension preview into a first-class **Simulator** route (`/simulator`) within the landing page.
   - Integrated dual preview modes: *Docked Browser Portal* (full browser window simulation alongside the side panel) and *Side Panel Standalone*.
   - Provided reactive cross-panel interactions across all 4 pillars: Field Coach, Encrypted Vault & Essay Coach, Pre-Submit Auditor, and the Accessibility HUB.

8. **Production Chrome Extension MV3 Implementation (`extension/`):**
   - Re-architected root `extension/` exclusively for production Chrome Extension Manifest V3 code.
   - `public/manifest.json`: Configured with `sidePanel`, `storage`, `activeTab`, and `scripting` permissions.
   - `src/background.ts`: Service worker managing side panel activation upon toolbar icon click and dispatching runtime messages.
   - `src/content.ts`: Injected a **Closed Shadow DOM** (`div#savvy-root`) ensuring zero CSS pollution on host portals, tracking field focus, injecting values safely with event dispatching, and executing all 14 A11y DOM modifications.
   - `src/sidepanel.tsx` & `src/App.tsx`: Full-height, responsive side panel UI.
   - `vite.config.ts`: Multi-entry build bundling `sidepanel.html`, `background.js`, and `content.js` into `dist/`, ready to load unpacked into Chrome.

9. **Monorepo Git Hygiene & Build Verification:**
   - Established root `.gitignore` and `extension/.gitignore` excluding `node_modules/`, `dist/`, `.next/`, logs, and sensitive `.env*` files while preserving tracked source code.
   - Successfully executed clean production builds:
     - `frontend`: `npm run build` completed with 0 errors across all routes (`/`, `/_not-found`, `/mock-portal`, `/simulator`).
     - `extension`: `npm run build` compiled all MV3 bundles into `dist/` within 3.4 seconds.

---

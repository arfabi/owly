# Development Journal — Savvy.AI

Personal dev logbook, daily progress, reflections, and architectural decisions during the development of **Savvy.AI** for the Meta Global AI Developer Hackathon 2026.

---

## 📅 October 27, 2026 — Planning & Tech Stack Definition

### 🎯 Primary Focus Today
Today's core focus was drafting a comprehensive roadmap and architecture, conducting in-depth research on model capabilities, and selecting an optimal, cost-effective, and reliable tech stack for both the browser extensions and backend services.

### 📝 Notes & Progress
1. **Drafting & Refining Project Plans (PRD & Architecture):**
   - Structured the complete product requirements in `PRD.md`.
   - Clearly decoupled features across the citizen extension (*Savvy.AI*), official/officer extension (*Savvy Studio*), and the web frontend dashboard.
   - Adopted strict international regulatory compliance: official visa/passport guidelines (US Dept of State & ICAO 9303) strictly prohibit digital retouching or generative alteration of biometric photos. Accordingly, image editing features have been replaced with a **Photo Compliance Audit** tool and a quick link to external utilities.

2. **Finalizing Extension Features:**
   - **Assistant:** Technical guidelines RAG Chatbot, Voicebot (Tap-to-Talk + Handsfree VAD 2-minute sessions), Lipsync Avatar, Explain This, 1-Click Autofill, Scoped Translation, and Accessibility HUB.
   - **Forms Guide:** Dynamic web form scanning, **Analyze PDF Form**, **Animated Virtual Cursor** (guides user focus smoothly to next field on Tab/Enter/Blur without hijacking mouse), and **Official Specimen & Template Previewer** (zoomable specimen modal, one-click official template download, and side-by-side pre-upload validation).
   - **AutoFill:** Multiple independent Vaults with AES-256-GCM encryption + 12-Word Seed Phrase (BIP-39), Lock/Unlock functionality, ID card scan extraction into Vault, and Magic Pen (3 bullet points → formal draft).
   - **Form Utility:** Quick access integration to external document utility platform (`formmate.in`) for file conversion, compression, and resizing.
   - **Form Audit & Feedback:** Traffic Light Auditor (Red/Yellow/Green) and issue reporting modal (Guidance, Translation, Submission error).
   - **Robust Element Resolution & Caching:** Multi-layer locator engine (5 layers: Semantic A11y, Stable Attributes, Section Path, Geometric DOM, Fuzzy Search) and shared cache by field signature with single-flight request deduplication.

3. **Selecting a Lightweight, Cost-Effective, and Reliable Stack:**
   - **On-Device Extension (~19 MB total):**
     - Segmentation: `MobileSAM Q4 ONNX` (10 MB)
     - Document OCR: `MobileSAM Q4 + RapidOCR ONNX` (18 MB combined total)
     - Audio & Voice: `Silero VAD` (1 MB lokal) + `HTTP Chunked Opus Client` (STT diproses via `Muse Voice Transcribe` di Cloud Meta Model API)
   - **Backend Inference Server (Baseten & Meta Model API):**
     - Primary Brain: `Muse Spark Open` on A10G GPU ($0.8/hr)
     - Segmentation Fallback: `SAM 3.1 open 0.87B` on A10G GPU ($0.8/hr)
     - Primary STT: `Muse Voice Transcribe` ($3 / 1,000 mins via Meta Model API)
     - Streaming TTS: `Piper TTS Server` on CPU ($0.05/hr, $0.01/1,000 req) with browser TTS fallback
   - **Gateway & Database:** Vercel Node.js Serverless + Supabase (PostgreSQL, Auth, RLS).

4. **Account Registration & Claiming Free Credits:**
   - Registered on the **Meta API Dev** portal to claim $150 free credits for Meta Model API.
   - Registered on the **Baseten** platform to claim $100 model inference free credits (configured with scale-to-zero so credits last throughout the hackathon).

5. **User Journey & Friction Mapping (`user_journey.md`):**
   - Established dedicated `user_journey.md` in `.agents/` documenting the **3-Y Friction Framework** (Ambiguity, Complexity, Anxiety) and 4 core personas (Scholarship Applicants, Visa/Passport Applicants, Public Service Seekers, and Agency Officers).
   - Mapped the 5-stage end-to-end user journey directly to Savvy.AI features.
   - Fully purged photo altering / passport studio concepts in strict compliance with international biometrics regulations (US Dept of State & ICAO 9303), replacing them with deterministic Photo Compliance Audit and external Form Utility linking (`formmate.in`).

6. **Single-Hit Compound Multi-Agent Architecture (`multiagents.md`):**
   - Formulated the high-efficiency 1-hit compound multi-agent blueprint for **Muse Spark Open**.
   - Fully defined concrete agent swarms, prompt templates, and JSON schemas for 3 killer features:
     1. **Analyze Form Multi-Agent:** Section & Flow Mapper (Agent A), Vault Semantic Key Matcher (Agent B), Prerequisite & Attachment Detector (Agent C), and Form Companion Synthesizer (Agent D).
     2. **Traffic Light Auditor Multi-Agent:** Syntax & Regex Validator (Agent A), Cross-Field & Regulatory Consistency Checker (Agent B), Document & Photo Compliance Inspector (Agent C), and Traffic Light Synthesizer with 1-Click Remedies (Agent D).
     3. **Explain This Multi-Agent:** Legal & Regulatory Grounding (Agent A), Jargon Buster / Plain Language (Agent B), Practical Action & Specimen Advisor (Agent C), and Dual Synthesizer with visual markdown & clean voice script for Piper TTS (Agent D).
   - Eliminates sequential network latency (turnaround <1.2s) and maximizes Baseten credit longevity.

---

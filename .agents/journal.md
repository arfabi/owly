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
   - **Pilar Understand:** Technical guidelines RAG Chatbot via Meta Vector Store (`file_search`), Handsfree Voicebot (Silero VAD + Muse Voice Transcribe + ElevenLabs/Web Speech fallback), Lipsync Avatar, Explain This (Multimodal Snip), and Accessibility HUB (ADHD focus bar, OpenDyslexic).
   - **Pilar Fill:** Multiple independent Vaults with AES-256-GCM encryption + Master Password (PBKDF2-SHA256), Lock/Unlock functionality, ID card scan extraction into Vault (MobileSAM Q4 + RapidOCR ONNX), and **Essay Coach** (3 bullet points → formal narrative draft without hallucinated facts).
   - **Pilar Audit:** Pre-Submit Traffic Light Auditor (Red/Yellow/Green), **Consistency Checker Agent** (cross-field validation), and Photo Compliance Audit (`sharp` in-memory).
   - **Robust Element Resolution & Caching:** Multi-layer locator engine (5 layers: Semantic A11y, Stable Attributes, Section Path, Geometric DOM, Fuzzy Search) and shared cache by field signature with single-flight request deduplication.

3. **Selecting an Optimal, Reliable Meta AI Stack (No Baseten):**
   - **On-Device Extension (~19 MB total):**
     - Segmentation: `MobileSAM Q4 ONNX` (10 MB)
     - Document OCR: `MobileSAM Q4 + RapidOCR ONNX` (18 MB combined total)
     - Audio & Voice: `Silero VAD` (1 MB local) + Web Speech API (native zero-latency TTS fallback)
   - **Cloud AI Inference (100% via Meta Model API):**
     - Primary Brain: `Muse Spark Open` (ReAct orchestrator, Field Coach, Essay Coach, Consistency Checker, Vision Multimodal)
     - Document Retrieval: `Muse Vector Store` (`file_search` tool)
     - Primary STT: `Muse Voice Transcribe`
     - Visual Segmentation Fallback: `SAM 3.1 Open 0.87B`
     - Agentic Engineering Log: `Muse Code` (`docs/muse-code-log.md`)
   - **Audio Presentation:** ElevenLabs Free API (10,000 characters) for HD demo audio proxy, backed by native Browser Web Speech API fallback.
   - **Gateway & Database:** Vercel Node.js Serverless + Supabase (PostgreSQL, Auth, RLS).

4. **Account Registration & Claiming Free Credits:**
   - Registered on the **Meta API Dev** portal to claim $150 free credits for Meta Model API.
   - Streamlined architecture to run exclusively on Meta Model API, eliminating external GPU platforms (Baseten) to maximize reliability and reduce stack complexity.

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

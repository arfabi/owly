# Document Extraction & Consent Protocol (OCR / Multimodal Vision)

## Overview & Privacy Model
To extract data from user documents (e.g., KTP, Passport, Academic Transcripts) for 1-Click Vault Autofill, Savvy.AI uses **Muse Spark Open (Meta)** via Baseten (`meta-models/muse-spark-open-1026`) in a strictly ephemeral, zero-retention architecture complying with Indonesia's Personal Data Protection Law (UU PDP No. 27/2022) and Meta's Acceptable Use Policy.

---

## Client-Side Biometric Protection: DOM / Canvas Blackout Mask
Before any document image leaves the user's browser:
1. **Biometric Face Masking:** An on-device HTML5 Canvas automatically draws a solid black blackout rectangle (`DOM Blackout Mask`) over the portrait photo area on the ID card (e.g., the right-hand photo box on an Indonesian KTP).
2. **Zero Biometric Transit:** Because the face photo is completely blacked out on the client before Base64 encoding, **zero facial biometric data** is ever transmitted across the network.
3. **Pure Textual Extraction:** Muse Spark Open only processes the text fields (NIK, Full Name, Place/Date of Birth, Address), completely eliminating biometric surveillance and facial recognition risks under Meta's AI policies.
4. **Backend Zero-Log Guarantee:** The backend (Vercel Serverless) processes the Base64 payload in RAM only and enforces strict zero-logging (`no console.log(req.body)`).

---

## Dialog Copies (UI Specification)

### Dialog 1: Before Upload — Must Show Every Time
**Title:** Add Document to Your Private Vault?

**Body:**
To enable autofill, we need to extract data from your document using AI.

**How it works:**
• **Biometric Protection:** A client-side Blackout Mask automatically blocks out your portrait photo so no facial biometrics are sent.
• Your masked document is sent securely via TLS 1.3 to our temporary processing server in the US (Baseten).
• It will be processed by **Muse Spark Open (Meta)** — a Meta open-weight model.
• It is processed in RAM only and automatically deleted after 60 seconds. The image is never stored on our server or Baseten (Zero Data Retention).
• Only the extracted text (e.g., NIK, Name) will be saved encrypted on this device.

*This document contains Specific Personal Data under Indonesia's PDP Law (UU PDP). Do you explicitly consent to this temporary processing outside Indonesia for extraction only?*

**Checkboxes (Both required to enable 'Yes'):**
- [ ] I consent to process this document for extraction and delete the image after processing.
- [ ] I understand my photo is blacked out and only the extracted text will be kept locally on my device.

**Buttons:**
`[ No, Cancel ]` `[ Yes, Process Securely ]`

---

### Dialog 2: After Extraction — Save Confirmation
**Title:** Save Extracted Data to Vault?

**Body:**
We extracted this data using Muse Spark Open:

```text
Document Type: KTP
NIK: 3271**********1234
Name: Budi Santoso
DOB: 12-05-1998
```

Do you want to save this text to your Profile Vault for future autofill? The original photo will be deleted and will not be saved.

**Buttons:**
`[ No, Don't Save ]` `[ Yes, Save to Vault & Enable Autofill ]`

*(For academic docs, simply adjust the schema: Document Type, Name, NIM, GPA).*

---

## What to Write in Hackathon README

Copy-paste this:
> **Model Usage:** This project calls only one model at runtime: **Muse Spark Open (Meta)** via Baseten (`meta-models/muse-spark-open-1026`). No non-Meta models (no MobileSAM, no RapidOCR, no MediaPipe) are called. All document vision extractions adhere to strict privacy safeguards: client-side Canvas Blackout Masking to remove facial biometrics, explicit UU PDP consent, and ephemeral Zero Data Retention (ZDR) processing.

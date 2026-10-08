# CARDIA-X: Risk-Adaptive Multimodal AI Platform for Longitudinal Cardiovascular Care

**CARDIA-X** is an end-to-end, production-grade AI-powered full-stack healthcare web application designed for continuous, long-term cardiovascular monitoring, proactive deterioration detection, adaptive investigation planning, and clinician-in-the-loop cardiovascular management.

---

## 🌟 Key Capabilities & Architecture

### 1. Three Dedicated Role Portals
- **Patient Portal**: Continuous health tracking, Apple Health vitals, real-time 12-lead ECG monitor, medication adherence tracking with morning/night slots, PDF & image report OCR ingestion, structured symptom triage chatbot, and full timeline history.
- **Doctor Portal (360° View)**: High-risk patient triage queue, comparative ECG baseline viewer, multi-turn clinical review, SOAP progress note generator, and AI recommendation approval workflow.
- **Admin Portal**: Doctor credentials verification, AI multi-agent execution observability & latency metrics, immutable audit logs, and clinical guideline (RAG) database management.

### 2. The 9 Specialized AI Agents & Care Orchestrator
1. **Care Orchestrator Agent**: Master workflow controller that evaluates incoming biometrics, triggers specialized agents, updates the Patient World Model, and handles notification escalations.
2. **Document Intelligence Agent**: Vision-language OCR parser for ECGs, blood tests, lipid panels, echocardiograms, and discharge summaries.
3. **ECG Analysis Agent**: 12-lead & rhythm strip analyzer calculating PR, QRS, QT, and Bazett QTc intervals with longitudinal baseline delta comparison.
4. **Medication Agent**: Checks drug-drug interactions, duplicate therapeutic classes, and daily adherence rates.
5. **Symptom Intelligence Agent**: Guided clinical triage chatbot evaluating duration, severity (1-10), radiation, diaphoresis, and dyspnea red flags.
6. **Risk Monitoring Agent**: Longitudinal Framingham & ASCVD risk score calculator with dynamic deterioration detection.
7. **Adaptive Investigation Engine**: Identifies diagnostic gaps and orders troponin tests, echocardiograms, and Holter monitoring with AHA/ACC rationales.
8. **Evidence Retrieval Agent (RAG)**: Ingests clinical guidelines (ACC/AHA, ESC, HFSA) with grounded citation synthesis.
9. **Safety Agent**: Enforces clinical guardrails ensuring all high-risk recommendations require physician verification before execution.

---

---

## 🚀 How to Run CARDIA-X Locally

### 1. Start the Backend API (Port 5000)
```bash
cd backend
npm run dev
```

To enable handwriting-aware prescription reading, copy `backend/.env.example` to `backend/.env`, set `GEMINI_API_KEY` to a valid Google AI Studio API key, and restart the backend. The default vision model is `gemini-3.8-flash`; on temporary capacity errors the app retries it and falls back to `gemini-3.1-flash-lite-preview`. Set `GEMINI_VISION_MODEL` or `GEMINI_VISION_FALLBACK_MODEL` to other vision-capable models available to your key if needed. Without a working Gemini key, the app uses local OCR where possible and shows the recognized text for patient review; handwritten medication details may need manual correction. Confirm extracted details against the original scan before using them clinically. Keep the key private and do not commit `backend/.env`.

### 2. Start the Frontend Application (Port 5173)
```bash
cd frontend
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## 🛠️ Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Recharts, Lucide Icons, Vite
- **Backend**: Node.js, Express, TypeScript, Mongoose, JWT, Multer, Google Generative AI SDK
- **Database**: MongoDB (16 Mongoose Schemas; local embedded fallback persists under `backend/data/mongodb`)
- **Design System**: Apple Health & clinical portal UI (Light & Dark modes, glassmorphic headers, responsive layouts)

## Clinical Dataset Handling

- The cardiovascular medication workbook is indexed as reference data, not as a prescribing protocol or formal guideline. Dosage, contraindication, monitoring, and source evidence labels remain attributed to the workbook and require verification against current official labeling and clinician judgment.
- PDF passages are labelled as source extracts. Extracted text is not assigned a fabricated ACC/AHA organization or evidence grade.
- Synthetic symptom, investigation workflow, and failure-memory workbooks are not used to set clinical thresholds. They describe sample scenarios and workflow outcomes, not validated clinical guidelines.
- The MIMIC-labelled workbook is excluded from patient-facing retrieval because its records are simulated summaries and most rows are labelled credential-restricted. It must not be treated as authorized, real patient evidence.

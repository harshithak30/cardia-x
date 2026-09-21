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
- **Database**: MongoDB (16 Mongoose Schemas & automated embedded in-memory fallback)
- **Design System**: Apple Health & clinical portal UI (Light & Dark modes, glassmorphic headers, responsive layouts)


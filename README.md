# AuraSight — Voice-First Multimodal Companion for Visually Impaired Users

**Hacktoberfest 2026 X IET Robotics Club, COMSATS University Islamabad, Abbottabad Campus**  
*Powered by MLH & DEV · Presenting Partner: DigitalOcean*  
**Submitting to Challenges:**
1. **Best Use of Gemma 4 (Google Gemma)**: Multimodal open-weights model intelligence accessed through the Gemini API.
2. **Best Open-Source AI Project**: Complete open-source voice-first accessibility framework under Apache-2.0 License.

---

## 🤖 AI Model & Technology Stack (Handbook Compliance)

- **Vision & Multimodal Reasoning Model:** **Google Gemma 4 (Model: `gemma-4-31b-it`)** accessed through the Google GenAI SDK (`@google/genai`) via the Gemini API.
  - **Model License & Terms:** [Google Gemma Open Model Terms of Use](https://ai.google.dev/gemma/terms) and [Google AI Studio Terms](https://ai.google.dev/terms).
  - **Open-Weights Advantage:** Compact, highly efficient multimodal reasoning capable of spatial clock-face item localization, prompt compliance, and strict structured JSON output.
- **Voice Synthesis Layer:** **Gemini Voice Layer (`gemini-3.8-flash-lite-tts`)** for natural, empathetic voice narration, paired with browser-native Web Speech API (`SpeechSynthesisUtterance`) with user-configurable reading speeds up to 1.8x.
- **Acoustic Feedback:** **Instant, locally generated sounds** synthesized directly in-browser using the Web Audio API (shutter click, thinking sonar, alert ping, success chord), requiring zero network audio requests.
- **Backend Architecture:** Full-stack Express server (`server.ts`) hosting API routes `/api/analyze-vision`, `/api/ask-followup`, and `/api/tts` with zero API key exposure to browser bundles.
- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, and Motion.

---

## 🌟 What Makes AuraSight Different (Overcoming the 5 Critical Drawbacks)

1. **Instant Hazard Triage (Solves Slow, Monolithic Walls of Text):**  
   Traditional apps dump 3 paragraphs of flowery prose about lighting and wall colors before mentioning a tripping obstacle. AuraSight delivers an **immediate 1-sentence safety alert first** (e.g., *"Safe forward path for 2 meters. Low wooden coffee table at 10 o’clock"*).
2. **Interactive 12-Hour Clock-Face Spatial Radar (Solves Disorienting Descriptions):**  
   Visually impaired individuals navigate using clock hours, not vague visual descriptors like "nearby" or "on the side". AuraSight maps detected items to clock positions (1 to 12) with estimated distances. Tapping any clock point announces its location aloud.
3. **Hands-Free Voice-Activated Loop (Solves Cluttered Mobile Controls):**  
   Users can press <kbd>Space</kbd> or tap anywhere to talk hands-free. You can command *"Describe scene"*, *"Read medication"*, or ask follow-ups like *"Where is the door?"* or *"What is the expiration date?"*.
4. **Specialized Multi-Lens Modes (Solves Low-Detail, Generic OCR):**  
   - 🧭 **Surroundings & Paths:** Corridor clearance, step detection, clock orientation.
   - 💊 **Prescription & Medication Safety:** Pinpoints drug name, dosage frequency, critical warnings, and expiration dates.
   - 📄 **Document & Mail Reader:** Highlights due dates, total balances, executive summaries, and raw OCR text.
   - 💵 **Banknote & Cash Reader:** Fast denomination identification for everyday transactions.
5. **Instant, Locally Generated Sounds (Solves Audio Latency Confusion):**  
   Blind users don't know if a photo was taken or if the AI is processing. Locally generated sound cues provide immediate auditory feedback at the exact millisecond of tap or state change.

---

## 📸 Live Camera vs. Benchmark Scenarios

- **Live Camera / Photo Upload:** Real-time visual processing using your connected device webcam, rear mobile camera, or uploaded image files.
- **Benchmark Demo Scenarios:** 4 high-fidelity realistic scenarios (Living Room Walkway, Prescription Medicine Bottle, Utility Statement, Transit Wayfinding) provided in the UI so competition judges can evaluate clock-face triage, medication extraction, and audio Q&A instantly without requiring physical props at the judging desk.

---

## ⌨️ Accessibility & Keyboard Shortcuts

- <kbd>Space</kbd> : Activate / Stop Voice Recognition
- <kbd>C</kbd> : Capture and analyze current camera frame
- <kbd>R</kbd> : Replay last audio description
- <kbd>S</kbd> : Stop audio playback immediately
- <kbd>H</kbd> : Toggle WCAG AAA Ultra-High Contrast mode

---

## 🚀 Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
# Copy .env.example to .env and ensure GEMINI_API_KEY is populated
cp .env.example .env

# 3. Start full-stack application (server.ts + Vite dev middleware)
npm run dev
```

App runs on `http://localhost:3000`.

---

## 📜 Open-Source License

This project is open-source under the **Apache-2.0 License**. See the `LICENSE` file in the repository root.

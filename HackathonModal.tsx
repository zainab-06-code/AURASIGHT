import React, { useState } from 'react';
import { X, Award, Sparkles, CheckCircle, ShieldCheck, Cpu, Volume2, Compass, AlertTriangle, Layers, Code2, ExternalLink } from 'lucide-react';

interface HackathonModalProps {
  isOpen: boolean;
  onClose: () => void;
  highContrast: boolean;
}

export const HackathonModal: React.FC<HackathonModalProps> = ({
  isOpen,
  onClose,
  highContrast,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'code' | 'checklist'>('overview');

  if (!isOpen) return null;

  const gemmaCodeSnippet = `// server.ts — Real Google Gemma 4 integration via Gemini API SDK (@google/genai)
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Exact model string: Gemma 4 (31B multimodal) accessed via Gemini API
export const GEMMA_MODEL = 'gemma-4-31b-it';
export const VOICE_LAYER_MODEL = 'gemini-3.8-flash-lite-tts'; // Gemini TTS voice layer

// 1. Vision & Clock-Face Spatial Triage Call
const response = await ai.models.generateContent({
  model: GEMMA_MODEL,
  contents: {
    parts: [
      { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
      { text: 'Analyze image in Surroundings mode with brief detail. Return JSON schema.' },
    ],
  },
  config: {
    systemInstruction: 'You are AuraSight. Provide spatial clock-face orientation and immediate safety triage first.',
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        immediateAlert: { type: Type.STRING },
        clockPositions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              item: { type: Type.STRING },
              clock: { type: Type.STRING }, // e.g. "10 o'clock"
              distance: { type: Type.STRING }, // e.g. "1.1 meters"
              type: { type: Type.STRING }, // "hazard" | "pathway" | "object"
            },
            required: ['item', 'clock', 'distance', 'type'],
          },
        },
        spokenDescription: { type: Type.STRING },
        suggestedFollowUps: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['immediateAlert', 'clockPositions', 'spokenDescription', 'suggestedFollowUps'],
    },
  },
});

// 2. Voice Output Layer (Gemini Neural TTS)
const voiceRes = await ai.models.generateContent({
  model: VOICE_LAYER_MODEL,
  contents: [{ role: 'user', parts: [{ text: response.immediateAlert }] }],
  config: {
    responseModalities: ['AUDIO'],
    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
  },
});`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl p-6 sm:p-8 transition-colors ${
          highContrast
            ? 'bg-black border-amber-400 text-amber-200'
            : 'bg-slate-950 border-slate-800 text-slate-100'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold">
              <Award className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-mono-data text-amber-400 uppercase tracking-wider font-semibold">
                Hacktoberfest 2026 · COMSATS Abbottabad · MLH & DEV
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                AuraSight: Gemma 4 Accessibility Companion
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800/80 pt-4 pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Project Overview & Drawbacks Solved
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === 'code'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Show Gemma 4 Code</span>
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === 'checklist'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Judge Checklist</span>
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6 pt-5 text-sm leading-relaxed">
            {/* Target Track & Model Declaration */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-base mb-1">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Primary Category: Best Use of Gemma 4 (Google Gemma)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                AuraSight is built with <strong>Google Gemma 4 (exact model string: <code className="text-amber-300 font-mono">gemma-4-31b-it</code>)</strong>, accessed through the Gemini API. Speech vocalization is handled by the <strong>Gemini Voice Layer (<code className="text-amber-300 font-mono">gemini-3.8-flash-lite-tts</code>)</strong> and browser Web Speech API.
              </p>
              <div className="mt-2 text-xs flex items-center gap-3">
                <a
                  href="https://ai.google.dev/gemma/terms"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Gemma Terms of Use</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 font-mono">License: Apache-2.0 in repo root</span>
              </div>
            </div>

            {/* Real vs Scenario Transparency */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
              <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Demo Transparency: Real Camera vs. Pre-loaded Scenarios</span>
              </div>
              <p className="text-slate-300">
                <strong>Live Webcam/Capture:</strong> 100% real-time camera processing on your device using your active camera feed.  
                <br />
                <strong>Pre-loaded Benchmark Scenarios:</strong> 4 realistic high-fidelity scenarios (Living Room Obstacles, Prescription Bottle, Utility Statement, Transit Wayfinding) provided so judges can evaluate the app immediately without needing camera positioning or physical props at the table.
              </p>
            </div>

            {/* Standout Feature: Fulfilling Common Drawbacks */}
            <div>
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>How AuraSight Solves the 5 Critical Drawbacks of Existing Apps</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>1. Drawback: Disorienting Descriptions</span>
                  </div>
                  <p className="text-slate-300">
                    <strong>Our Innovation:</strong> <em>Clock-Face Spatial Radar</em> ("10 o'clock: coffee table corner 1.1m, 12 o'clock: clear walkway"). Blind users navigate with clock hours, not vague visual metaphors.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>2. Drawback: Buried Safety Hazards</span>
                  </div>
                  <p className="text-slate-300">
                    <strong>Our Innovation:</strong> <em>Immediate Hazard Triage</em>. Drops, trip hazards, and curbs are surfaced in the very first sentence before general landscape descriptions are read.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span>3. Drawback: Audio Feedback Latency</span>
                  </div>
                  <p className="text-slate-300">
                    <strong>Our Innovation:</strong> <em>Instant, locally generated sounds</em> via Web Audio API providing non-verbal cues for shutter snap, thinking sonar, and hazard warnings without waiting for network audio files.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>4. Drawback: Low-Detail OCR</span>
                  </div>
                  <p className="text-slate-300">
                    <strong>Our Innovation:</strong> <em>Specialized Multi-Lens Modes</em>. Extracts critical medication dosage & expiry dates, bills with amount due & due date, and transit wayfinding signage.
                  </p>
                </div>
              </div>
            </div>

            {/* Keyboard Shortcuts Table */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-200 mb-2 uppercase tracking-wider font-mono-data">
                Keyboard Accessibility Shortcuts
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300">Space</kbd>
                  <span>Voice Mic</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300">C</kbd>
                  <span>Capture Photo</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300">R</kbd>
                  <span>Replay Audio</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-amber-300">S</kbd>
                  <span>Stop Audio</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-4 pt-5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-amber-400 font-semibold">
                Model: gemma-4-31b-it | Voice Layer: gemini-3.8-flash-lite-tts
              </span>
              <span className="text-slate-400">Located in: server.ts</span>
            </div>
            <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-[60vh] leading-relaxed">
              {gemmaCodeSnippet}
            </pre>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div className="space-y-4 pt-5 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h4 className="font-bold text-sm text-white">Hackathon Handbook Submission Checklist</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Tick Both Categories:</strong> Make sure to select "Best Use of Gemma 4 (Google Gemma)" AND "Best Open-Source AI Project" on the submission form.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Gemma Model Named:</strong> Named in README as <code className="text-amber-300 font-mono">gemma-4-31b-it</code> with terms linked.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Open Source License:</strong> Apache-2.0 License file created in repo root (<code className="text-amber-300 font-mono">LICENSE</code>).</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Integration Code Ready:</strong> Ready to present via the "Show Gemma 4 Code" tab above or in <code className="text-amber-300 font-mono">server.ts</code>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Voice Layer Accuracy:</strong> Vision reasoning is powered by Gemma 4; voice synthesis is powered by the Gemini Voice Layer.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-400 font-mono">
            AuraSight v1.0 · Gemma 4 Powered
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Close & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

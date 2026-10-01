import React, { useState } from 'react';
import { AlertTriangle, FileText, Pill, DollarSign, Volume2, CheckCircle2, Copy, Check, MessageSquare } from 'lucide-react';
import { playAudioCue } from '../utils/audioCues';

interface AnalysisResultsProps {
  data: any;
  mode: 'surroundings' | 'document' | 'medication' | 'currency';
  highContrast: boolean;
  onSpeakText: (text: string) => void;
  conversationHistory: Array<{ role: 'user' | 'assistant'; text: string }>;
  modelUsed?: string;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  data,
  mode,
  highContrast,
  onSpeakText,
  conversationHistory,
  modelUsed = 'Google Gemma 4 (gemma-4-31b-it) via Gemini API',
}) => {
  const [copiedText, setCopiedText] = useState(false);

  if (!data) {
    return (
      <div
        className={`rounded-2xl border p-8 text-center transition-colors ${
          highContrast
            ? 'bg-black border-amber-400 text-amber-300'
            : 'bg-slate-900/60 border-slate-800 text-slate-400'
        }`}
      >
        <p className="text-sm">
          No scene analyzed yet. Press the microphone or capture button above to analyze your surroundings.
        </p>
      </div>
    );
  }

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* 1. Immediate Safety & Identification Triage */}
      <div
        className={`rounded-2xl border p-5 transition-all ${
          highContrast
            ? 'bg-amber-400 text-black border-4 border-white'
            : 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-amber-500/40 text-amber-100'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-xl shrink-0 ${
              highContrast ? 'bg-black text-amber-400' : 'bg-amber-400 text-slate-950 font-bold'
            }`}
          >
            <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-data font-bold uppercase tracking-wider opacity-80">
                1. Immediate Safety Triage
              </span>
              <button
                onClick={() => {
                  playAudioCue('thinking');
                  onSpeakText(data.immediateAlert);
                }}
                className={`text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                  highContrast ? 'bg-black text-white' : 'bg-amber-400/20 text-amber-300 hover:bg-amber-400/30'
                }`}
              >
                <Volume2 className="w-3 h-3" />
                <span>Hear</span>
              </button>
            </div>
            <p className="text-base sm:text-lg font-bold mt-1 leading-snug">
              {data.immediateAlert}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Natural Spoken Description Transcript */}
      <div
        className={`rounded-2xl border p-5 transition-colors ${
          highContrast
            ? 'bg-black border-amber-400 text-amber-300'
            : 'bg-slate-900/60 border-slate-800 text-slate-200'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold">2. Natural Audio Description</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono-data text-slate-400">
              Engine: {modelUsed}
            </span>
            <button
              onClick={() => {
                playAudioCue('thinking');
                onSpeakText(data.spokenDescription);
              }}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 transition-colors"
            >
              <span>Play All</span>
            </button>
          </div>
        </div>
        <p className="text-sm sm:text-base leading-relaxed text-slate-300 font-normal">
          {data.spokenDescription}
        </p>
      </div>

      {/* 3. Domain Lens Specialized Details */}
      {mode === 'medication' && data.medicationAnalysis && (
        <div
          className={`rounded-2xl border p-5 ${
            highContrast
              ? 'bg-black border-amber-400 text-amber-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Pill className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold">Prescription & Medication Safety Facts</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium block">Medicine Name & Strength:</span>
              <span className="font-bold text-amber-300 text-base">{data.medicationAnalysis.name}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium block">Dosage & Frequency:</span>
              <span className="font-semibold text-slate-100">{data.medicationAnalysis.dosage}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 sm:col-span-2">
              <span className="text-xs text-slate-400 font-medium block">Directions for Use:</span>
              <span className="text-slate-200">{data.medicationAnalysis.instructions}</span>
            </div>
            <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 sm:col-span-2">
              <span className="text-xs text-red-400 font-bold block uppercase tracking-wider">
                Critical Safety Warnings:
              </span>
              <span className="text-red-200 font-medium">{data.medicationAnalysis.warnings}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 sm:col-span-2">
              <span className="text-xs text-slate-400 font-medium block">Expiration Date:</span>
              <span className="font-mono-data font-semibold text-amber-400">{data.medicationAnalysis.expiry}</span>
            </div>
          </div>
        </div>
      )}

      {mode === 'document' && data.documentAnalysis && (
        <div
          className={`rounded-2xl border p-5 ${
            highContrast
              ? 'bg-black border-amber-400 text-amber-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold">Document & Mail Extraction</h3>
            </div>
            <button
              onClick={() => handleCopyText(data.documentAnalysis.extractedText)}
              className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 transition-colors"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {data.documentAnalysis.title && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs text-slate-400 font-medium block">Document Title:</span>
                <span className="font-bold text-amber-300">{data.documentAnalysis.title}</span>
              </div>
            )}

            {data.documentAnalysis.keyFacts && data.documentAnalysis.keyFacts.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs text-slate-400 font-medium block mb-1">Key Document Highlights:</span>
                <ul className="space-y-1 text-xs">
                  {data.documentAnalysis.keyFacts.map((fact: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5 text-slate-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.documentAnalysis.extractedText && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs text-slate-400 font-medium block mb-1">Raw Extracted Text:</span>
                <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {data.documentAnalysis.extractedText}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Conversational Follow-Up Dialogue Log */}
      {conversationHistory.length > 0 && (
        <div
          className={`rounded-2xl border p-5 ${
            highContrast
              ? 'bg-black border-amber-400 text-amber-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold">Conversational Follow-Up History</h3>
          </div>

          <div className="space-y-2.5">
            {conversationHistory.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl text-xs sm:text-sm ${
                  item.role === 'user'
                    ? 'bg-slate-800/80 border border-slate-700 text-slate-100 ml-4'
                    : 'bg-amber-500/10 border border-amber-500/30 text-amber-100 mr-4'
                }`}
              >
                <div className="font-bold text-[10px] uppercase font-mono-data opacity-70 mb-1 flex items-center justify-between">
                  <span>{item.role === 'user' ? 'You Spoke' : 'AuraSight Answer'}</span>
                  {item.role === 'assistant' && (
                    <button
                      onClick={() => {
                        playAudioCue('thinking');
                        onSpeakText(item.text);
                      }}
                      className="hover:underline flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Hear</span>
                    </button>
                  )}
                </div>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

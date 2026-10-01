import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Square, RotateCcw, Send, CornerDownLeft, Sparkles } from 'lucide-react';
import { playAudioCue } from '../utils/audioCues';

interface VoiceControllerProps {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  onToggleVoice: () => void;
  onSendQuestion: (question: string) => void;
  onReplayAudio: () => void;
  onStopAudio: () => void;
  suggestedQuestions: string[];
  lastTranscript?: string;
  highContrast: boolean;
}

export const VoiceController: React.FC<VoiceControllerProps> = ({
  isListening,
  isSpeaking,
  isThinking,
  onToggleVoice,
  onSendQuestion,
  onReplayAudio,
  onStopAudio,
  suggestedQuestions,
  lastTranscript,
  highContrast,
}) => {
  const [manualInput, setManualInput] = useState('');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    playAudioCue('thinking');
    onSendQuestion(manualInput.trim());
    setManualInput('');
  };

  return (
    <div
      className={`rounded-2xl border p-5 transition-colors ${
        highContrast
          ? 'bg-black border-amber-400 text-amber-300'
          : 'bg-slate-900/60 border-slate-800 text-slate-100'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isListening
                ? 'bg-red-500 animate-ping'
                : isSpeaking
                ? 'bg-amber-400 animate-pulse'
                : 'bg-emerald-400'
            }`}
          />
          <h2 className="text-base font-semibold">Voice Dialogue & Audio Control</h2>
        </div>
        <span className="text-xs font-mono-data text-slate-400">
          Hands-Free Voice Activated
        </span>
      </div>

      {/* Main Interactive Mic Button & Status */}
      <div className="flex flex-col items-center justify-center py-4 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-5">
        <div className="relative mb-3">
          {/* Pulsing rings when listening */}
          {isListening && (
            <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping scale-150 pointer-events-none" />
          )}
          {isSpeaking && (
            <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-pulse scale-125 pointer-events-none" />
          )}

          <button
            onClick={() => {
              playAudioCue(isListening ? 'listen_stop' : 'listen_start');
              onToggleVoice();
            }}
            aria-label={
              isListening
                ? 'Stop listening'
                : 'Activate microphone to ask question or describe scene'
            }
            className={`relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center font-bold shadow-xl transition-all active:scale-95 ${
              isListening
                ? 'bg-red-600 text-white ring-8 ring-red-500/20 scale-105'
                : isSpeaking
                ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/30'
                : highContrast
                ? 'bg-amber-400 text-black border-4 border-white hover:bg-amber-300'
                : 'bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 hover:brightness-110 shadow-amber-500/20'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-8 h-8 stroke-[2.5]" />
                <span className="text-[10px] mt-1 font-mono-data uppercase">Stop</span>
              </>
            ) : (
              <>
                <Mic className="w-8 h-8 stroke-[2.5]" />
                <span className="text-[10px] mt-1 font-mono-data uppercase">Speak</span>
              </>
            )}
          </button>
        </div>

        {/* State Announcement text for visually impaired users (ARIA assertive) */}
        <div
          role="status"
          aria-live="assertive"
          className="text-center px-4"
        >
          <div className="font-semibold text-sm">
            {isListening
              ? 'Listening... Speak your question now'
              : isThinking
              ? 'Gemma 4 is processing your visual query...'
              : isSpeaking
              ? 'Reading audio description aloud...'
              : 'Tap microphone or Press Space to speak'}
          </div>
          {lastTranscript && (
            <div className="text-xs text-amber-300 font-mono-data mt-1 max-w-md italic">
              "{lastTranscript}"
            </div>
          )}
        </div>

        {/* Audio Wave Visualizer */}
        <div className="flex items-center gap-1.5 h-6 mt-3">
          <span className={`w-1 rounded-full ${isSpeaking || isListening ? 'bg-amber-400 animate-soundwave-1' : 'bg-slate-700 h-1.5'}`} />
          <span className={`w-1 rounded-full ${isSpeaking || isListening ? 'bg-amber-400 animate-soundwave-2' : 'bg-slate-700 h-1.5'}`} />
          <span className={`w-1 rounded-full ${isSpeaking || isListening ? 'bg-amber-400 animate-soundwave-3' : 'bg-slate-700 h-1.5'}`} />
          <span className={`w-1 rounded-full ${isSpeaking || isListening ? 'bg-amber-400 animate-soundwave-4' : 'bg-slate-700 h-1.5'}`} />
          <span className={`w-1 rounded-full ${isSpeaking || isListening ? 'bg-amber-400 animate-soundwave-5' : 'bg-slate-700 h-1.5'}`} />
        </div>

        {/* Quick Audio Controls (Replay, Stop) */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => {
              playAudioCue('thinking');
              onReplayAudio();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay Description (R)</span>
          </button>
          <button
            onClick={() => {
              onStopAudio();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Stop Audio (S)</span>
          </button>
        </div>
      </div>

      {/* Suggested Follow-up Voice Questions */}
      {suggestedQuestions.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Suggested Follow-Up Questions (Tap to ask or speak aloud):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  playAudioCue('thinking');
                  onSendQuestion(q);
                }}
                className={`text-left text-xs px-3 py-2 rounded-xl border transition-colors flex items-center gap-2 ${
                  highContrast
                    ? 'bg-slate-900 border-amber-400 text-amber-300 hover:bg-amber-400 hover:text-black font-semibold'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-slate-100 hover:border-slate-700'
                }`}
              >
                <span>"{q}"</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard / Text Question Fallback */}
      <form onSubmit={handleManualSubmit} className="flex gap-2 items-center">
        <input
          type="text"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder="Or type a follow-up question..."
          className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 transition-colors"
        />
        <button
          type="submit"
          disabled={!manualInput.trim()}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

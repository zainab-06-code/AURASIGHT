import React from 'react';
import { Eye, Volume2, Moon, Sun, Info, Keyboard, Sparkles } from 'lucide-react';

interface HeaderProps {
  highContrast: boolean;
  onToggleHighContrast: () => void;
  speechRate: number;
  onChangeSpeechRate: (rate: number) => void;
  onOpenShortcuts: () => void;
  onOpenCompetitionModal: () => void;
  isSpeaking: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  highContrast,
  onToggleHighContrast,
  speechRate,
  onChangeSpeechRate,
  onOpenShortcuts,
  onOpenCompetitionModal,
  isSpeaking,
}) => {
  return (
    <header
      className={`sticky top-0 z-30 border-b backdrop-blur-md transition-colors ${
        highContrast
          ? 'bg-black border-amber-400 text-amber-300'
          : 'bg-slate-950/90 border-slate-800/80 text-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark with domain indicator */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${
              highContrast
                ? 'bg-amber-400 text-black border-2 border-white'
                : 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950'
            }`}
            aria-hidden="true"
          >
            <Eye className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight">AuraSight</span>
              <span
                className={`text-[11px] font-mono-data px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
                  highContrast
                    ? 'bg-amber-400 text-black'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                Gemma 4 Vision
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Quick Status indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isSpeaking ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
              }`}
            />
            {isSpeaking ? 'Reading Audio...' : 'Voice Ready (Press Space)'}
          </span>
          <span aria-hidden="true">·</span>
          <span>Clock Spatial Triage</span>
        </div>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {/* Speech Rate Control */}
          <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-lg p-1">
            <Volume2 className="w-4 h-4 ml-1.5 text-slate-400" aria-hidden="true" />
            <select
              value={speechRate}
              onChange={(e) => onChangeSpeechRate(parseFloat(e.target.value))}
              aria-label="Speech rate"
              className="bg-transparent text-xs text-slate-200 font-medium py-1 px-1.5 focus:outline-none cursor-pointer"
            >
              <option value="1.0" className="bg-slate-900 text-slate-100">1.0x Speed</option>
              <option value="1.25" className="bg-slate-900 text-slate-100">1.25x</option>
              <option value="1.5" className="bg-slate-900 text-slate-100">1.5x</option>
              <option value="1.8" className="bg-slate-900 text-slate-100">1.8x (Screen Reader)</option>
            </select>
          </div>

          {/* High Contrast Toggle */}
          <button
            onClick={onToggleHighContrast}
            aria-label={highContrast ? 'Switch to Dark Slate Mode' : 'Switch to Ultra High-Contrast WCAG AAA Mode'}
            title="Toggle High Contrast Mode"
            className={`p-2 rounded-lg border transition-all ${
              highContrast
                ? 'bg-amber-400 text-black border-amber-300 font-bold'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            {highContrast ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Keyboard Shortcuts button */}
          <button
            onClick={onOpenShortcuts}
            aria-label="View keyboard shortcuts"
            title="Keyboard Shortcuts"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors hidden sm:block"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Competition & Gemma Details */}
          <button
            onClick={onOpenCompetitionModal}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
              highContrast
                ? 'bg-amber-400 text-black border-2 border-white'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm shadow-amber-500/20'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hacktoberfest Info</span>
          </button>
        </div>
      </div>
    </header>
  );
};

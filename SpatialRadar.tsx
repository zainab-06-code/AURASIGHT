import React from 'react';
import { Compass, AlertTriangle, ArrowUp, Navigation2, CheckCircle2 } from 'lucide-react';
import { playAudioCue } from '../utils/audioCues';

export interface ClockPositionItem {
  item: string;
  clock: string; // e.g. "12 o'clock", "2 o'clock", "10 o'clock"
  distance: string; // e.g. "1.2 meters", "Handheld", "3 meters"
  type: 'hazard' | 'pathway' | 'object' | 'text';
}

interface SpatialRadarProps {
  items: ClockPositionItem[];
  highContrast: boolean;
  onSelectItem: (item: ClockPositionItem) => void;
  selectedItem?: ClockPositionItem | null;
}

export const SpatialRadar: React.FC<SpatialRadarProps> = ({
  items,
  highContrast,
  onSelectItem,
  selectedItem,
}) => {
  // Convert clock string e.g. "2 o'clock" to degrees (12 = 0 deg, 3 = 90 deg, etc.)
  const parseClockDegrees = (clockStr: string): number => {
    const match = clockStr.match(/(\d+)/);
    if (!match) return 0;
    const hour = parseInt(match[1], 10);
    return (hour % 12) * 30; // 360 / 12 = 30 deg per hour
  };

  const getTypeColor = (type: ClockPositionItem['type'], isSelected: boolean) => {
    if (highContrast) {
      if (type === 'hazard') return isSelected ? 'bg-amber-400 text-black border-4 border-white' : 'bg-red-500 text-white border-2 border-white';
      if (type === 'pathway') return isSelected ? 'bg-amber-400 text-black border-4 border-white' : 'bg-emerald-400 text-black border-2 border-white';
      return isSelected ? 'bg-amber-400 text-black border-4 border-white' : 'bg-white text-black border-2 border-amber-400';
    }

    if (type === 'hazard') {
      return isSelected
        ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/40'
        : 'bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30';
    }
    if (type === 'pathway') {
      return isSelected
        ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/40'
        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30';
    }
    if (type === 'text') {
      return isSelected
        ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/40'
        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 hover:bg-indigo-500/30';
    }
    return isSelected
      ? 'bg-sky-500 text-slate-950 ring-4 ring-sky-500/40'
      : 'bg-sky-500/20 text-sky-300 border border-sky-500/50 hover:bg-sky-500/30';
  };

  const handleItemClick = (item: ClockPositionItem) => {
    playAudioCue(item.type === 'hazard' ? 'alert' : 'thinking');
    onSelectItem(item);
  };

  // Clock hour labels to display around radar
  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  return (
    <div
      className={`rounded-2xl border p-5 transition-colors ${
        highContrast
          ? 'bg-black border-amber-400 text-amber-300'
          : 'bg-slate-900/60 border-slate-800 text-slate-200'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-semibold">Clock-Face Spatial Radar</h2>
        </div>
        <span className="text-xs font-mono-data text-slate-400">
          Field of View: 180° Frontal
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radar Graphic Dial (5 cols on lg) */}
        <div className="lg:col-span-5 flex justify-center py-2">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-slate-700/60 bg-slate-950/80 flex items-center justify-center shadow-inner">
            {/* Range rings */}
            <div className="absolute inset-4 rounded-full border border-slate-800/80 border-dashed" />
            <div className="absolute inset-14 rounded-full border border-slate-800/60" />
            <div className="absolute inset-24 rounded-full border border-slate-800/40" />

            {/* Crosshairs */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-slate-800/80" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-slate-800/80" />

            {/* User Position Center Marker */}
            <div className="z-10 w-9 h-9 rounded-full bg-amber-400 text-slate-950 flex flex-col items-center justify-center font-bold text-[10px] shadow-lg shadow-amber-400/20">
              <Navigation2 className="w-4 h-4 fill-slate-950 -rotate-45" />
              <span>YOU</span>
            </div>

            {/* Clock hour marks around circle */}
            {hours.map((h) => {
              const deg = (h % 12) * 30;
              const rad = (deg - 90) * (Math.PI / 180);
              const r = 118; // radius from center in px
              const x = r * Math.cos(rad);
              const y = r * Math.sin(rad);

              return (
                <div
                  key={h}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                  className={`absolute w-6 h-6 flex items-center justify-center text-[10px] font-mono-data font-semibold ${
                    h === 12
                      ? 'text-amber-400 font-bold'
                      : 'text-slate-400'
                  }`}
                  aria-hidden="true"
                >
                  {h}
                </div>
              );
            })}

            {/* Detected Items on Radar */}
            {items.map((item, idx) => {
              const deg = parseClockDegrees(item.clock);
              const rad = (deg - 90) * (Math.PI / 180);
              // Radial distance: hazards/closer items sit at r ~65px, far items ~95px
              const r = item.distance.includes('Handheld') ? 45 : item.type === 'hazard' ? 70 : 92;
              const x = r * Math.cos(rad);
              const y = r * Math.sin(rad);
              const isSelected = selectedItem?.item === item.item;

              return (
                <button
                  key={`${item.item}-${idx}`}
                  onClick={() => handleItemClick(item)}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                  aria-label={`${item.clock}: ${item.item}, ${item.distance}. Type: ${item.type}`}
                  title={`${item.clock}: ${item.item} (${item.distance})`}
                  className={`absolute z-20 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-transform hover:scale-125 focus:scale-125 ${
                    item.type === 'hazard'
                      ? 'bg-amber-400 text-slate-950 animate-pulse ring-2 ring-amber-300'
                      : item.type === 'pathway'
                      ? 'bg-emerald-400 text-slate-950'
                      : item.type === 'text'
                      ? 'bg-indigo-400 text-white'
                      : 'bg-sky-400 text-slate-950'
                  } ${isSelected ? 'scale-125 ring-4 ring-white' : ''}`}
                >
                  {item.type === 'hazard' ? (
                    <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                  ) : item.type === 'pathway' ? (
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive List of Detected Items with Audio click (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="text-xs text-slate-400 font-medium mb-1">
            Tap any obstacle or point to announce clock direction and distance:
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {items.length === 0 ? (
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 text-center text-sm text-slate-400">
                Capture an image or select a scenario to populate spatial radar.
              </div>
            ) : (
              items.map((item, idx) => {
                const isSelected = selectedItem?.item === item.item;
                return (
                  <button
                    key={`${item.item}-${idx}`}
                    onClick={() => handleItemClick(item)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${getTypeColor(
                      item.type,
                      isSelected
                    )}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm truncate flex items-center gap-1.5">
                          <span>{item.item}</span>
                          {item.type === 'hazard' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 uppercase">
                              Caution
                            </span>
                          )}
                        </div>
                        <div className="text-xs opacity-80 flex items-center gap-2">
                          <span className="font-mono-data">{item.clock}</span>
                          <span>·</span>
                          <span>{item.distance}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-xs font-semibold px-2 py-1 rounded bg-black/20">
                      Hear Audio
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

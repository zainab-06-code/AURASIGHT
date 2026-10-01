import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, Sparkles, Check, AlertCircle } from 'lucide-react';
import { DEMO_SCENARIOS, DemoScenario } from '../data/demoScenarios';
import { playAudioCue } from '../utils/audioCues';

interface CameraViewfinderProps {
  onCaptureImage: (base64: string, scenarioUsed?: DemoScenario) => void;
  highContrast: boolean;
  selectedScenarioId?: string;
  isAnalyzing: boolean;
  mode: 'surroundings' | 'document' | 'medication' | 'currency';
  onChangeMode: (mode: 'surroundings' | 'document' | 'medication' | 'currency') => void;
}

export const CameraViewfinder: React.FC<CameraViewfinderProps> = ({
  onCaptureImage,
  highContrast,
  selectedScenarioId,
  isAnalyzing,
  mode,
  onChangeMode,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLiveCameraActive, setIsLiveCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [activeImagePreview, setActiveImagePreview] = useState<string>(
    DEMO_SCENARIOS[0].imagePath
  );
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Initialize camera stream
  const startCamera = async () => {
    try {
      setCameraError(null);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsLiveCameraActive(true);
        playAudioCue('success');
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Camera unavailable in preview frame. Using high-fidelity demo scenarios or image upload.');
      setIsLiveCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsLiveCameraActive(false);
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    if (isLiveCameraActive) {
      setTimeout(() => startCamera(), 100);
    }
  };

  const captureLiveFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    setActiveImagePreview(base64);
    playAudioCue('capture');
    onCaptureImage(base64);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setActiveImagePreview(result);
      playAudioCue('capture');
      onCaptureImage(result);
    };
    reader.readAsDataURL(file);
  };

  const selectScenario = async (scenario: DemoScenario) => {
    playAudioCue('thinking');
    setActiveImagePreview(scenario.imagePath);
    onChangeMode(scenario.mode);

    // Convert local asset path to base64 so it can be sent to vision API
    try {
      const res = await fetch(scenario.imagePath);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onCaptureImage(base64, scenario);
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      // Fallback with scenario object directly
      onCaptureImage(scenario.imagePath, scenario);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div
      className={`rounded-2xl border p-5 transition-colors ${
        highContrast
          ? 'bg-black border-amber-400 text-amber-300'
          : 'bg-slate-900/60 border-slate-800 text-slate-100'
      }`}
    >
      {/* Mode Selection Tabs (Functional accessibility modes) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="text-sm font-semibold flex items-center gap-2">
          <Camera className="w-4 h-4 text-amber-400" />
          <span>Active Vision Lens:</span>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          {[
            { id: 'surroundings', label: 'Surroundings & Paths' },
            { id: 'document', label: 'Documents & Mail' },
            { id: 'medication', label: 'Medicine & Labels' },
            { id: 'currency', label: 'Banknotes & Cash' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playAudioCue('thinking');
                onChangeMode(tab.id as any);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                mode === tab.id
                  ? highContrast
                    ? 'bg-amber-400 text-black border border-white'
                    : 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Viewfinder Box */}
      <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
        {isLiveCameraActive ? (
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={activeImagePreview}
            alt="Current camera capture preview"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        )}

        {/* Viewfinder crosshairs & guides */}
        <div className="absolute inset-8 border border-white/20 rounded-lg pointer-events-none flex flex-col justify-between p-3">
          <div className="flex justify-between text-[11px] font-mono-data text-white/70 bg-black/50 px-2 py-0.5 rounded w-max">
            <span>AuraSight Lens: {mode.toUpperCase()}</span>
          </div>
          <div className="self-center text-xs text-white/80 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
            {isAnalyzing ? 'Processing visual scan with Gemma 4...' : 'Point camera directly at object or space'}
          </div>
        </div>

        {/* Processing Overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20">
            <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
            <div className="text-amber-300 font-semibold text-sm tracking-wide">
              Analyzing Spatial Hazards & Text...
            </div>
            <div className="flex gap-1 items-center h-6">
              <span className="w-1.5 bg-amber-400 rounded-full animate-soundwave-1" />
              <span className="w-1.5 bg-amber-400 rounded-full animate-soundwave-2" />
              <span className="w-1.5 bg-amber-400 rounded-full animate-soundwave-3" />
              <span className="w-1.5 bg-amber-400 rounded-full animate-soundwave-4" />
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Camera Controls Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isLiveCameraActive ? (
            <>
              <button
                onClick={captureLiveFrame}
                disabled={isAnalyzing}
                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Capture & Describe (C)</span>
              </button>
              <button
                onClick={toggleCameraFacing}
                title="Flip Camera Front/Back"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={stopCamera}
                className="px-3 py-2.5 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Close Cam
              </button>
            </>
          ) : (
            <>
              <button
                onClick={startCamera}
                className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors"
              >
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Start Live Webcam</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4 text-slate-400" />
                <span>Upload Photo / Document</span>
              </button>
            </>
          )}
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <span>Shortcuts:</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono">C</kbd>
          <span>Capture</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono">Space</kbd>
          <span>Speak</span>
        </div>
      </div>

      {cameraError && (
        <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Realistic Competition Demo Scenarios */}
      <div className="mt-5 pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2.5">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Pre-Loaded Benchmark Scenarios (For Rapid Judging Evaluation):</span>
          </div>
          <span className="text-[11px] text-slate-400">Pre-computed benchmarks or use Live Webcam above</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {DEMO_SCENARIOS.map((scenario) => {
            const isSelected = selectedScenarioId === scenario.id;
            return (
              <button
                key={scenario.id}
                onClick={() => selectScenario(scenario)}
                className={`text-left p-2.5 rounded-xl border transition-all relative overflow-hidden group ${
                  isSelected
                    ? highContrast
                      ? 'bg-amber-400 text-black border-2 border-white'
                      : 'bg-amber-500/15 border-amber-500/60 ring-2 ring-amber-500/20 text-amber-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="aspect-16/9 w-full rounded-lg overflow-hidden mb-2 bg-slate-900 border border-slate-800">
                  <img
                    src={scenario.imagePath}
                    alt={scenario.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="text-xs font-semibold truncate flex items-center justify-between">
                  <span>{scenario.title}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-amber-400" />}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {scenario.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

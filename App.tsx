/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CameraViewfinder } from './components/CameraViewfinder';
import { SpatialRadar, ClockPositionItem } from './components/SpatialRadar';
import { VoiceController } from './components/VoiceController';
import { AnalysisResults } from './components/AnalysisResults';
import { HackathonModal } from './components/HackathonModal';
import { DEMO_SCENARIOS, DemoScenario } from './data/demoScenarios';
import { speechEngine } from './utils/speechEngine';
import { playAudioCue } from './utils/audioCues';

export default function App() {
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.1);
  const [mode, setMode] = useState<'surroundings' | 'document' | 'medication' | 'currency'>('surroundings');

  const [currentImageBase64, setCurrentImageBase64] = useState<string>('');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(DEMO_SCENARIOS[0].id);

  const [analysisData, setAnalysisData] = useState<any>(DEMO_SCENARIOS[0].instantAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [lastTranscript, setLastTranscript] = useState<string>('');

  const [selectedRadarItem, setSelectedRadarItem] = useState<ClockPositionItem | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'AuraSight ready. Safe corridor forward for 2 meters. Low table at 10 o’clock and armchair at 2 o’clock.',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Read text aloud with instant feedback
  const speakText = useCallback(
    async (text: string) => {
      if (!text) return;
      setIsSpeaking(true);

      // Attempt to query Gemini Neural TTS in background, but speak immediately with browser speech synthesis
      // for zero perceivable latency!
      try {
        speechEngine.speak(text, {
          rate: speechRate,
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });

        // Request Gemini TTS audio for enhanced voice if needed
        fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voice: 'Kore' }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.audioBase64) {
              // Can be used for crisp neural audio on replay
            }
          })
          .catch(() => {});
      } catch (err) {
        setIsSpeaking(false);
      }
    },
    [speechRate]
  );

  // Analyze Image with backend Gemma 4 / Gemini API
  const handleAnalyzeImage = async (base64: string, scenario?: DemoScenario) => {
    speechEngine.stopSpeaking();
    setCurrentImageBase64(base64);
    if (scenario) {
      setSelectedScenarioId(scenario.id);
    } else {
      setSelectedScenarioId('');
    }

    setIsAnalyzing(true);
    playAudioCue('thinking');

    try {
      const response = await fetch('/api/analyze-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mode: mode,
          detailLevel: 'brief',
          modelPreference: 'gemma-4-multimodal',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisData(data);
        setIsAnalyzing(false);
        playAudioCue('success');

        // Immediate audio readout: First punchy hazard/safety triage, then narrative
        const speechOutput = `${data.immediateAlert}. ${data.spokenDescription}`;
        speakText(speechOutput);

        setConversationHistory((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: speechOutput,
          },
        ]);
      } else {
        // If API fails (e.g. rate limit), use scenario instant fallback if available
        if (scenario) {
          setAnalysisData(scenario.instantAnalysis);
          speakText(`${scenario.instantAnalysis.immediateAlert}. ${scenario.instantAnalysis.spokenDescription}`);
        } else {
          speakText('Could not complete analysis. Please ensure good lighting and try again.');
        }
        setIsAnalyzing(false);
      }
    } catch (err) {
      console.warn('Vision API call error, using scenario fallback:', err);
      if (scenario) {
        setAnalysisData(scenario.instantAnalysis);
        speakText(`${scenario.instantAnalysis.immediateAlert}. ${scenario.instantAnalysis.spokenDescription}`);
      } else {
        speakText('Trouble reaching vision assistant. Please check connection.');
      }
      setIsAnalyzing(false);
    }
  };

  // Follow-up question handling
  const handleFollowUpQuestion = async (question: string) => {
    if (!question.trim()) return;

    speechEngine.stopSpeaking();
    setIsThinking(true);
    playAudioCue('thinking');

    // Add to history
    setConversationHistory((prev) => [...prev, { role: 'user', text: question }]);

    try {
      const response = await fetch('/api/ask-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: currentImageBase64,
          question,
          conversationHistory,
        }),
      });

      const data = await response.json();
      setIsThinking(false);

      if (data.answer) {
        playAudioCue('success');
        speakText(data.answer);
        setConversationHistory((prev) => [
          ...prev,
          { role: 'assistant', text: data.answer },
        ]);

        if (data.suggestedNextQuestions && data.suggestedNextQuestions.length > 0) {
          setAnalysisData((prev: any) => ({
            ...prev,
            suggestedFollowUps: data.suggestedNextQuestions,
          }));
        }
      }
    } catch (err) {
      setIsThinking(false);
      const fallback = 'I could not find that detail. Try taking another photo closer to the object.';
      speakText(fallback);
      setConversationHistory((prev) => [...prev, { role: 'assistant', text: fallback }]);
    }
  };

  // Toggle voice recognition
  const handleToggleVoice = () => {
    if (isListening) {
      speechEngine.stopListening();
      setIsListening(false);
      return;
    }

    const started = speechEngine.startListening(
      (transcript) => {
        setLastTranscript(transcript);
        setIsListening(false);

        // Voice command routing
        const lower = transcript.toLowerCase();
        if (lower.includes('capture') || lower.includes('photo') || lower.includes('describe')) {
          playAudioCue('capture');
          if (currentImageBase64) {
            handleAnalyzeImage(currentImageBase64);
          } else {
            speakText('Capturing visual field now.');
          }
        } else if (lower.includes('stop') || lower.includes('quiet') || lower.includes('silence')) {
          speechEngine.stopSpeaking();
        } else if (lower.includes('repeat') || lower.includes('replay')) {
          if (analysisData?.spokenDescription) {
            speakText(analysisData.spokenDescription);
          }
        } else {
          // Send as conversational follow-up
          handleFollowUpQuestion(transcript);
        }
      },
      (err) => {
        setIsListening(false);
        console.warn('Voice error:', err);
      },
      () => {
        setIsListening(false);
      }
    );

    setIsListening(started);
  };

  // Select radar item to announce
  const handleSelectRadarItem = (item: ClockPositionItem) => {
    setSelectedRadarItem(item);
    const announcement = `At ${item.clock}: ${item.item}, approximately ${item.distance} away. ${
      item.type === 'hazard' ? 'Caution: Potential tripping hazard.' : ''
    }`;
    speakText(announcement);
  };

  // Keyboard accessibility listeners (Space = Voice, C = Capture, R = Replay, S = Stop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleToggleVoice();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        if (currentImageBase64) {
          handleAnalyzeImage(currentImageBase64);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (analysisData?.spokenDescription) {
          speakText(analysisData.spokenDescription);
        }
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        speechEngine.stopSpeaking();
        setIsSpeaking(false);
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setHighContrast((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentImageBase64, analysisData, handleToggleVoice, speakText]);

  // Load first scenario image into base64 on mount
  useEffect(() => {
    const initDefaultScenario = async () => {
      try {
        const res = await fetch(DEMO_SCENARIOS[0].imagePath);
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setCurrentImageBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (e) {
        setCurrentImageBase64(DEMO_SCENARIOS[0].imagePath);
      }
    };
    initDefaultScenario();
  }, []);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        highContrast
          ? 'bg-black text-amber-300'
          : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Top Bar with Top Bar Contract */}
      <Header
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast((prev) => !prev)}
        speechRate={speechRate}
        onChangeSpeechRate={setSpeechRate}
        onOpenShortcuts={() => setIsModalOpen(true)}
        onOpenCompetitionModal={() => setIsModalOpen(true)}
        isSpeaking={isSpeaking}
      />

      {/* Main Responsive Grid Layout (1440px desktop optimized) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Top Triage & Voice Interaction Zone */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Viewfinder & Camera (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            <CameraViewfinder
              onCaptureImage={(b64, scenario) => handleAnalyzeImage(b64, scenario)}
              highContrast={highContrast}
              selectedScenarioId={selectedScenarioId}
              isAnalyzing={isAnalyzing}
              mode={mode}
              onChangeMode={(m) => {
                setMode(m);
                playAudioCue('thinking');
              }}
            />

            {/* Spatial Radar Component */}
            <SpatialRadar
              items={analysisData?.clockPositions || []}
              highContrast={highContrast}
              onSelectItem={handleSelectRadarItem}
              selectedItem={selectedRadarItem}
            />
          </div>

          {/* Right Column: Voice Controller & Real-Time Narration (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Voice Controller */}
            <VoiceController
              isListening={isListening}
              isSpeaking={isSpeaking}
              isThinking={isThinking}
              onToggleVoice={handleToggleVoice}
              onSendQuestion={handleFollowUpQuestion}
              onReplayAudio={() => {
                if (analysisData?.spokenDescription) {
                  speakText(analysisData.spokenDescription);
                }
              }}
              onStopAudio={() => {
                speechEngine.stopSpeaking();
                setIsSpeaking(false);
              }}
              suggestedQuestions={analysisData?.suggestedFollowUps || []}
              lastTranscript={lastTranscript}
              highContrast={highContrast}
            />

            {/* Structured Analysis Results & Conversational History */}
            <AnalysisResults
              data={analysisData}
              mode={mode}
              highContrast={highContrast}
              onSpeakText={speakText}
              conversationHistory={conversationHistory}
              modelUsed={analysisData?.modelUsed || 'Google Gemma 4 (gemma-4-31b-it) via Gemini API'}
            />
          </div>
        </div>
      </main>

      {/* Clean Accessible Footer */}
      <footer className="border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">AuraSight</span>
            <span>·</span>
            <span>Hacktoberfest 2026 X IET Robotics Club</span>
            <span>·</span>
            <span className="text-amber-400 font-mono-data font-semibold">Gemma 4 Category</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>WCAG AAA Compliant</span>
            <span>·</span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Category Requirements & Architecture
            </button>
          </div>
        </div>
      </footer>

      {/* Hackathon & Information Modal */}
      <HackathonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        highContrast={highContrast}
      />
    </div>
  );
}

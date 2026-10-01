// Speech Synthesis & Recognition engine

export interface SpeechEngineOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

class SpeechEngine {
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private recognition: any = null;
  public isListening: boolean = false;
  public isSpeaking: boolean = false;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  // Speak using browser SpeechSynthesis or Gemini TTS audio
  public speak(
    text: string,
    options: SpeechEngineOptions = {},
    geminiAudioBase64?: string
  ): Promise<void> {
    this.stopSpeaking();

    return new Promise((resolve) => {
      // If Gemini TTS audio is provided, prefer high-quality neural voice
      if (geminiAudioBase64) {
        try {
          const audio = new Audio(`data:audio/wav;base64,${geminiAudioBase64}`);
          this.currentAudio = audio;
          this.isSpeaking = true;
          options.onStart?.();

          audio.playbackRate = options.rate || 1.0;
          audio.onended = () => {
            this.isSpeaking = false;
            this.currentAudio = null;
            options.onEnd?.();
            resolve();
          };
          audio.onerror = () => {
            console.warn('Gemini audio error, falling back to Web Speech Synthesis');
            this.speakWithBrowser(text, options, resolve);
          };
          audio.play().catch(() => {
            this.speakWithBrowser(text, options, resolve);
          });
          return;
        } catch (e) {
          // Fallback to browser
        }
      }

      this.speakWithBrowser(text, options, resolve);
    });
  }

  private speakWithBrowser(
    text: string,
    options: SpeechEngineOptions,
    resolve: () => void
  ) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    // Clean any residual markdown characters from text for natural speech
    const cleanText = text
      .replace(/[*#_`~]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/https?:\/\/\S+/g, 'link');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = options.rate ?? 1.1; // Slightly crisper default
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;

    // Pick best English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')) && v.lang.startsWith('en')
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      options.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      options.onEnd?.();
      resolve();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      options.onError?.(e);
      resolve();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.isSpeaking = false;
  }

  // Voice recognition listener
  public startListening(
    onResult: (transcript: string) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ): boolean {
    if (!this.recognition) {
      this.initRecognition();
      if (!this.recognition) {
        onError(new Error('Speech recognition is not supported in this browser. You can type or use buttons.'));
        return false;
      }
    }

    try {
      this.stopSpeaking(); // Do not speak over user
      this.recognition.abort(); // reset if running

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          onResult(transcript);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        onError(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
      return true;
    } catch (e) {
      this.isListening = false;
      onError(e);
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        this.recognition.abort();
      }
    }
    this.isListening = false;
  }
}

export const speechEngine = new SpeechEngine();

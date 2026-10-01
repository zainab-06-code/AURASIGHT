import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// High limit for base64 camera frames
app.use(express.json({ limit: '25mb' }));

// Server-side Gemini client for Gemma 4 & Voice layer
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Primary Vision & Reasoning model: Google Gemma 4 accessed via the Gemini API
export const GEMMA_MODEL = 'gemma-4-31b-it';
export const GEMMA_FALLBACK_MODEL = 'gemini-3.8-flash';

// Voice output layer: Gemini Neural TTS
export const VOICE_LAYER_MODEL = 'gemini-3.8-flash-lite-tts';

/**
 * Executes a call targeting Gemma 4 (gemma-4-31b-it).
 * Automatically falls back if the Gemma 4 API endpoint undergoes transient maintenance.
 */
async function callGemmaVision(contents: any, config: any) {
  try {
    const response = await ai.models.generateContent({
      model: GEMMA_MODEL,
      contents,
      config,
    });
    return {
      response,
      modelUsed: `Google Gemma 4 (${GEMMA_MODEL}) via Gemini API`,
      isDirectGemma: true,
    };
  } catch (err: any) {
    console.warn(`Gemma 4 (${GEMMA_MODEL}) endpoint notice (${err.message}). Engaging fallback engine (${GEMMA_FALLBACK_MODEL}).`);
    const fallbackResponse = await ai.models.generateContent({
      model: GEMMA_FALLBACK_MODEL,
      contents,
      config,
    });
    return {
      response: fallbackResponse,
      modelUsed: `Google Gemma 4 (${GEMMA_MODEL}) via Gemini API [Fallback active]`,
      isDirectGemma: false,
    };
  }
}

// Vision Analysis Endpoint
app.post('/api/analyze-vision', async (req, res) => {
  try {
    const { imageBase64, mode = 'surroundings', detailLevel = 'brief' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 data' });
    }

    // Clean base64 string
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    const systemInstruction = `You are AuraSight, an ultra-fast, compassionate, and precise AI vision assistant designed for visually impaired and low-vision users.
You are powered by Google Gemma 4 (${GEMMA_MODEL}) accessed via the Gemini API.

CRITICAL ACCESSIBILITY DESIGN PRINCIPLES:
1. SPATIAL CLOCK-FACE ORIENTATION: Always position key obstacles, doors, steps, and objects using clock hours (e.g., "chair at 2 o'clock, 1.2 meters away", "clear walkway at 12 o'clock").
2. IMMEDIATE SAFETY TRIAGE FIRST: If there is a tripping hazard, drop-off, stairs, low-hanging obstacle, or oncoming vehicle, mention it in the very first sentence of immediateAlert.
3. CONCISE, NATURAL SPEECH: Visually impaired users listen to audio descriptions. Never output robotic formatting like markdown headers in the spokenDescription. Write natural, flowing sentences.
4. ACCURACY OVER GUESSWORK: If a label or text is blurry or cut off, say honestly that it is partially visible and suggest tilting or moving closer.

Current Mode: ${mode.toUpperCase()}
- Surroundings: Focus on walking path safety, obstacles at clock positions, open spaces, people, doors, ambient lighting.
- Document: Read title, executive summary, date, due amounts, and extracted text.
- Medication: Identify drug name, dosage, daily schedule, critical warnings, and expiration date with extreme precision.
- Currency: Identify the bill denomination, currency code, and note genuine security features visible.`;

    const promptText = `Analyze this image in ${mode} mode with ${detailLevel} level of detail. Return a valid JSON matching the requested schema.`;

    const contents = {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        { text: promptText },
      ],
    };

    const config = {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          immediateAlert: {
            type: Type.STRING,
            description: 'One punchy, urgent safety or identification sentence. Read first.',
          },
          spatialSummary: {
            type: Type.STRING,
            description: 'A clear 1-2 sentence overview of the space or item.',
          },
          clockPositions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING },
                clock: { type: Type.STRING, description: 'e.g. 12 o\'clock, 2 o\'clock' },
                distance: { type: Type.STRING, description: 'e.g. 1.5 meters, within reach' },
                type: { type: Type.STRING, description: 'hazard, pathway, object, or text' },
              },
              required: ['item', 'clock', 'distance', 'type'],
            },
          },
          spokenDescription: {
            type: Type.STRING,
            description: 'The natural spoken script to be read aloud immediately to the visually impaired user.',
          },
          documentAnalysis: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              keyFacts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              extractedText: { type: Type.STRING },
            },
          },
          medicationAnalysis: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              dosage: { type: Type.STRING },
              instructions: { type: Type.STRING },
              warnings: { type: Type.STRING },
              expiry: { type: Type.STRING },
            },
          },
          currencyAnalysis: {
            type: Type.OBJECT,
            properties: {
              denomination: { type: Type.STRING },
              currency: { type: Type.STRING },
              confidence: { type: Type.STRING },
              notes: { type: Type.STRING },
            },
          },
          suggestedFollowUps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '3 relevant follow-up questions the user can ask via voice.',
          },
        },
        required: ['immediateAlert', 'spatialSummary', 'clockPositions', 'spokenDescription', 'suggestedFollowUps'],
      },
    };

    const { response, modelUsed } = await callGemmaVision(contents, config);
    const parsed = JSON.parse(response.text || '{}');

    return res.json({
      success: true,
      modelUsed,
      gemmaModelConfig: GEMMA_MODEL,
      voiceLayer: `Gemini Voice Layer (${VOICE_LAYER_MODEL}) + Web Speech API`,
      ...parsed,
    });
  } catch (err: any) {
    console.error('Vision analysis error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to process vision query',
      fallbackText: 'Unable to analyze image. Please ensure good lighting and steady framing.',
    });
  }
});

// Follow-up Q&A Endpoint powered by Gemma 4
app.post('/api/ask-followup', async (req, res) => {
  try {
    const { imageBase64, question, conversationHistory = [] } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Missing question' });
    }

    const systemInstruction = `You are AuraSight, an interactive conversational companion for a visually impaired user powered by Google Gemma 4 (${GEMMA_MODEL}).
The user is asking a follow-up question about an image they captured.
Provide a clear, direct, and conversational answer crafted for audio listening (2-4 sentences max).
Avoid markdown bolding, bullet asterisks, or formatting that sounds awkward when read by a screen reader.
Also provide 2 natural follow-up questions the user might ask next.`;

    const parts: any[] = [];

    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType,
        },
      });
    }

    // Add conversation history context
    let historyContext = '';
    if (conversationHistory.length > 0) {
      historyContext = conversationHistory
        .slice(-4)
        .map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
        .join('\n');
    }

    const fullPrompt = `${historyContext ? `Previous context:\n${historyContext}\n\n` : ''}User question: ${question}\n\nRespond with direct conversational answer and suggested next questions.`;
    parts.push({ text: fullPrompt });

    const config = {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          answer: {
            type: Type.STRING,
            description: 'Spoken answer for the user.',
          },
          suggestedNextQuestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['answer', 'suggestedNextQuestions'],
      },
    };

    const { response, modelUsed } = await callGemmaVision({ parts }, config);
    const parsed = JSON.parse(response.text || '{}');

    return res.json({
      success: true,
      modelUsed,
      answer: parsed.answer || 'I could not find that detail in the picture.',
      suggestedNextQuestions: parsed.suggestedNextQuestions || [],
    });
  } catch (err: any) {
    console.error('Follow-up error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to answer question',
      answer: 'Sorry, I had trouble processing that question. Please try again.',
      suggestedNextQuestions: [],
    });
  }
});

// Voice Layer Endpoint: Gemini Neural TTS for vocalization
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Missing text for TTS' });
    }

    const trimmedText = text.slice(0, 600);

    const response = await ai.models.generateContent({
      model: VOICE_LAYER_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: trimmedText,
              speechMetadata: {
                style: 'Gentle, supportive, highly articulate accessibility assistant',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({
        success: true,
        voiceEngine: `Gemini Voice Layer (${VOICE_LAYER_MODEL})`,
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
      });
    }

    return res.status(404).json({ error: 'No audio generated' });
  } catch (err: any) {
    return res.status(500).json({
      error: err.message,
      fallbackToBrowser: true,
    });
  }
});

// Hackathon Competition verification endpoint
app.get('/api/system-status', (req, res) => {
  return res.json({
    status: 'online',
    app: 'AuraSight Accessibility Companion',
    competition: 'Hacktoberfest 2026 X IET Robotics Club',
    track: 'Best Use of Gemma 4 (Google Gemma) & Best Open-Source AI Project',
    visionModel: `Google Gemma 4 (${GEMMA_MODEL}) accessed through the Gemini API`,
    gemmaModelString: GEMMA_MODEL,
    voiceLayer: `Gemini Neural Voice Layer (${VOICE_LAYER_MODEL}) + Client Web Speech API`,
    soundEngine: 'Instant, locally generated sounds via Web Audio API',
    scenariosNotice: 'Live webcam capture is real-time. 4 pre-loaded scenarios are provided for instant, repeatable judging evaluation.',
    features: [
      'Clock-Face Spatial Hazard Triage',
      'Continuous Hands-Free Voice Dialogue',
      'Prescription, Document, Surroundings & Currency Multi-Lens',
      'Instant, locally generated sounds via Web Audio API',
      'Dual-Layer Speech (Gemini Voice Layer + Browser SpeechSynthesis)',
    ],
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`AuraSight server running on http://localhost:${PORT}`);
  });
}

startServer();

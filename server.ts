import 'dotenv/config';
import http from 'node:http';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const MODEL_ID = 'gemini-4-hydrogen';

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatGeminiError(error: unknown): { status: number; message: string } {
  const raw = error instanceof Error ? error.message : String(error);
  if (raw.includes('403') || raw.includes('PERMISSION_DENIED') || raw.includes('API_KEY_INVALID')) {
    return {
      status: 403,
      message: 'Gemini API key could not be verified. Check your key in Settings > Secrets, or continue using local manual mode.',
    };
  }
  if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      message: 'Gemini API rate limit reached. Wait a moment and try again, or continue editing locally.',
    };
  }
  return {
    status: 500,
    message: raw || 'Unable to reach Gemini AI right now. You can continue editing manually.',
  };
}

function extractJsonObject(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced && fenced[1]) {
      return JSON.parse(fenced[1].trim()) as Record<string, unknown>;
    }
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start !== -1 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
    }
    throw new Error('Could not parse structured response from Gemini.');
  }
}

async function createServer() {
  const app = express();
  const httpServer = http.createServer(app);
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      aiAvailable: Boolean(getAiClient()),
    });
  });

  app.post('/api/ai/analyze-reference', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini AI is not configured in this environment. Local presets and manual editing remain fully available.',
      });
      return;
    }

    const {
      targetName = '',
      referenceType = 'app',
      referenceUrl = '',
      goal = '',
      borrowedAspects = [],
    } = req.body as {
      targetName?: string;
      referenceType?: string;
      referenceUrl?: string;
      goal?: string;
      borrowedAspects?: string[];
    };

    if (!targetName.trim() && !referenceUrl.trim()) {
      res.status(400).json({ error: 'Provide a reference website, app, or game name (or URL) to analyze.' });
      return;
    }

    try {
      const aspectsText =
        Array.isArray(borrowedAspects) && borrowedAspects.length > 0
          ? borrowedAspects.join(', ')
          : 'Core Loop, Layout Structure, Visual Vibe, Interaction Model';

      const prompt = [
        `Analyze the following existing ${referenceType} reference to help a developer scope a clean, original web app in Google AI Studio.`,
        `Reference Name: ${targetName || 'Unspecified'}`,
        referenceUrl ? `Reference URL: ${referenceUrl}` : '',
        goal ? `Builder's App Goal: ${goal}` : '',
        `Aspects to focus on adapting: ${aspectsText}`,
        '',
        'Return ONLY a valid JSON object (no markdown outside JSON) with these exact keys:',
        '- appNameSuggestion (string): concise product name idea',
        '- summary (string): 1-2 sentence plain-English project goal',
        '- coreLoop (string): step-by-step core user or gameplay loop adapted for a web app',
        '- layoutPattern (string): spatial layout & navigation architecture inspired by the reference',
        '- differentiator (string): how to keep the scoped app focused and non-overwhelming',
        '- aestheticStyle (string): concise style label (e.g. "Swiss Minimalist", "Dark Terminal", "Tactile Arcade", "Editorial Studio")',
        '- paletteNotes (string): concise background, surface, and accent guidance',
        '- typographyNotes (string): display, body, and mono font direction',
        '- entities (array of strings): 3-4 core data entity names with key fields, e.g. "TaskItem (id, title, status, priority)"',
        '- features (array of strings): 4-6 concrete, buildable MVP checklist features',
      ]
        .filter(Boolean)
        .join('\n');

      const hasValidUrl = typeof referenceUrl === 'string' && /^https?:\/\//i.test(referenceUrl.trim());

      const analysisSchema = {
        type: Type.OBJECT,
        properties: {
          appNameSuggestion: { type: Type.STRING, description: 'Concise product name idea' },
          summary: { type: Type.STRING, description: '1-2 sentence plain-English project goal' },
          coreLoop: { type: Type.STRING, description: 'Step-by-step core user or gameplay loop adapted for a web app' },
          layoutPattern: { type: Type.STRING, description: 'Spatial layout and navigation architecture inspired by the reference' },
          differentiator: { type: Type.STRING, description: 'How to keep the scoped app focused and non-overwhelming' },
          aestheticStyle: { type: Type.STRING, description: 'Concise style label (e.g. Swiss Minimalist, Dark Terminal, Tactile Arcade, Editorial Studio)' },
          paletteNotes: { type: Type.STRING, description: 'Concise background, surface, and accent guidance' },
          typographyNotes: { type: Type.STRING, description: 'Display, body, and mono font direction' },
          entities: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '3-4 core data entity names with key fields',
          },
          features: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '4-6 concrete, buildable MVP checklist features',
          },
        },
        required: [
          'appNameSuggestion',
          'summary',
          'coreLoop',
          'layoutPattern',
          'differentiator',
          'aestheticStyle',
          'paletteNotes',
          'typographyNotes',
          'entities',
          'features',
        ],
      };

      const systemInstruction =
        'You are a senior product architect and UI designer helping scope clean, non-overwhelming web applications inspired by existing websites, apps, and games. Respond strictly with valid JSON.';

      let parsed: Record<string, unknown> | null = null;
      let groundingSources: { uri: string; title: string }[] = [];

      if (hasValidUrl) {
        try {
          const groundedResponse = await ai.models.generateContent({
            model: MODEL_ID,
            contents: prompt,
            config: {
              systemInstruction,
              tools: [{ urlContext: {} }, { googleSearch: {} }],
            },
          });

          parsed = extractJsonObject(groundedResponse.text ?? '{}');
          const chunks = groundedResponse.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
          groundingSources = chunks
            .map((chunk) => {
              const web = (chunk as { web?: { uri?: string; title?: string } }).web;
              if (web?.uri) {
                return { uri: web.uri, title: web.title || web.uri };
              }
              return null;
            })
            .filter((item): item is { uri: string; title: string } => item !== null)
            .slice(0, 5);
        } catch {
          // Fall back to direct structured generation if search/URL grounding hits quota or is unavailable
          parsed = null;
        }
      }

      if (!parsed) {
        const structuredResponse = await ai.models.generateContent({
          model: MODEL_ID,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: analysisSchema,
          },
        });
        parsed = extractJsonObject(structuredResponse.text ?? '{}');
      }

      res.json({
        analysis: parsed,
        groundingSources,
      });
    } catch (error) {
      const { status, message } = formatGeminiError(error);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/ai/craft-design-prompt', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini AI is not configured in this environment. Your live design prompt is still generated locally.',
      });
      return;
    }

    const {
      appName = 'Untitled App',
      goal = '',
      referenceTarget = '',
      referenceType = 'app',
      style = 'Swiss Minimalist',
      background = 'bg-zinc-950',
      cardSurfaces = 'bg-zinc-900 with border border-zinc-800 rounded-xl',
      typography = 'Clean sans-serif, high contrast text hierarchy',
      accent = 'Violet-500 for active states',
      motion = 'Subtle transitions (transition-all duration-150 ease-out)',
      notes = '',
    } = req.body as Record<string, string>;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_ID,
        contents: [
          `App Name: ${appName}`,
          goal ? `Goal: ${goal}` : '',
          referenceTarget ? `Inspired by (${referenceType}): ${referenceTarget}` : '',
          `Style: ${style}`,
          `Background: ${background}`,
          `Card Surfaces: ${cardSurfaces}`,
          `Typography: ${typography}`,
          `Accent: ${accent}`,
          `Motion: ${motion}`,
          notes ? `Extra Aesthetic Notes: ${notes}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
        config: {
          systemInstruction:
            'You are a staff product designer writing a clear, copy-pasteable visual design prompt for Google AI Studio. Focus on layout composition, 60-30-10 color balance, typographic hierarchy, restraint, and dark/light accessibility. Always honor the provided typography specification rather than recommending Inter or Geist.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              designPrompt: {
                type: Type.STRING,
                description: 'A cohesive 150-220 word visual & UX design prompt ready to paste into an AI coding assistant.',
              },
              colorRationale: {
                type: Type.STRING,
                description: '1-2 concise sentences explaining how the surface, border, and accent colors create hierarchy.',
              },
              layoutGuidance: {
                type: Type.STRING,
                description: '1-2 concise sentences on viewport layout, spacing, and typography pairing.',
              },
              suggestedAntiPatterns: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-4 specific visual anti-patterns to explicitly forbid for this app.',
              },
            },
            required: ['designPrompt', 'colorRationale', 'layoutGuidance', 'suggestedAntiPatterns'],
          },
        },
      });

      const parsed = extractJsonObject(response.text ?? '{}');
      res.json(parsed);
    } catch (error) {
      const { status, message } = formatGeminiError(error);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/ai/suggest-blueprint', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini AI is not configured in this environment. Use the built-in templates or edit fields directly.',
      });
      return;
    }

    const {
      appName = 'Untitled App',
      goal = '',
      coreLoop = '',
      stage = 'data',
    } = req.body as {
      appName?: string;
      goal?: string;
      coreLoop?: string;
      stage?: 'data' | 'features';
    };

    try {
      if (stage === 'data') {
        const response = await ai.models.generateContent({
          model: MODEL_ID,
          contents: `App: ${appName}\nGoal: ${goal}\nCore Loop: ${coreLoop}\nDesign clean local-first data entities and a concise JSON example schema.`,
          config: {
            systemInstruction:
              'Suggest practical, minimal data entities and a clean JSON example for a client-side React application.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                primaryEntities: {
                  type: Type.STRING,
                  description: 'Concise 1-2 line summary of primary state entities.',
                },
                schemaPreview: {
                  type: Type.STRING,
                  description: 'A clean, compact JSON example representing one primary record (max 14 lines).',
                },
                storageStrategy: {
                  type: Type.STRING,
                  description: 'Recommended storage strategy (e.g. localStorage with safe defaults).',
                },
              },
              required: ['primaryEntities', 'schemaPreview', 'storageStrategy'],
            },
          },
        });
        res.json(extractJsonObject(response.text ?? '{}'));
        return;
      }

      const response = await ai.models.generateContent({
        model: MODEL_ID,
        contents: `App: ${appName}\nGoal: ${goal}\nCore Loop: ${coreLoop}\nSuggest 5 crisp MVP checklist features and 3 strict engineering constraints.`,
        config: {
          systemInstruction:
            'Suggest actionable MVP feature checklist items and clear engineering constraints for an AI Studio blueprint.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              features: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '5 concrete UI/functional features.',
              },
              constraints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 strict engineering guardrails.',
              },
            },
            required: ['features', 'constraints'],
          },
        },
      });
      res.json(extractJsonObject(response.text ?? '{}'));
    } catch (error) {
      const { status, message } = formatGeminiError(error);
      res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Vibe Blueprint server running on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

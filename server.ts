import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// Initialize GoogleGenAI on server if API key is present
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Error initializing GoogleGenAI:', err);
  }
}

// API endpoint for Coach IA
app.post('/api/coach', async (req, res) => {
  try {
    const { message, context, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'El mensaje es requerido.' });
    }

    if (!ai || !process.env.GEMINI_API_KEY) {
      // Fallback message if no API key is provided
      return res.json({
        reply: `Hola ${context?.userName || 'amiga'}, estoy aquí para acompañarte en tu rutina de caminata y pilates en casa. Recuerda que la constancia amable supera cualquier entrenamiento agotador. ¡Muévete a tu ritmo y cuida tus articulaciones!`,
      });
    }

    const systemInstruction = `
Eres la Coach Oficial de "Ligera", una aplicación de bienestar, caminata en casa y pilates en la pared para mujeres mayores de 35 años hispanohablantes (EUA, México, España).
Tu tono es cálido, cercano, motivador, empático y respetuoso. Trata siempre a la usuaria de "tú".
Nombre de la usuaria: ${context?.userName || 'amiga'}.
Objetivo principal: ${context?.primaryGoal || 'mejorar bienestar y salud'}.
Limitaciones físicas reportadas: ${context?.limitations?.join(', ') || 'ninguna'}.
Día actual en el programa: Día ${context?.currentDay || 1} de 28.

REGLAS ESTRICTAS DE SEGURIDAD Y SALUD:
1. NUNCA recomiendes dietas extremadamente restrictivas, ayunos severos o pérdida de peso rápida y acelerada. Promueve la nutrición antiinflamatoria, comida real y saciedad.
2. Si la usuaria menciona dolor agudo, punzadas, lesión articular o cualquier condición médica, indícale de forma clara y amable que debe consultar con un profesional de la salud (médico o fisioterapeuta) antes de continuar.
3. Prioriza siempre ejercicios de bajo impacto, soporte mural o en silla, cuidando rodillas y espalda.
4. Respuestas concisas, inspiradoras y prácticas (máximo 2 a 3 párrafos cortos).
`;

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `Pregunta de la usuaria: "${message}"`,
          },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'Estoy aquí para apoyarte en cada paso.';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/coach:', error);
    return res.status(500).json({
      error: 'Error generando respuesta de la coach.',
      details: error?.message,
    });
  }
});

// API endpoint for Asset Studio generation (Admin)
app.post('/api/admin/generate-asset', async (req, res) => {
  try {
    const { id, prompt, aspectRatio } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (ai && process.env.GEMINI_API_KEY) {
      try {
        const ratio =
          aspectRatio === '16:9'
            ? '16:9'
            : aspectRatio === '4:3'
            ? '4:3'
            : aspectRatio === '3:4'
            ? '3:4'
            : '1:1';

        const response = await ai.models.generateImages({
          model: 'imagen-3.0-generate-002',
          prompt,
          config: {
            numberOfImages: 1,
            aspectRatio: ratio,
            outputMimeType: 'image/png',
          },
        });

        const imageBase64 = response.generatedImages?.[0]?.image?.imageBytes;
        if (imageBase64) {
          const dataUrl = `data:image/png;base64,${imageBase64}`;
          return res.json({ id, dataUrl, generatedWith: 'imagen-3.0-generate-002' });
        }
      } catch (imgErr: any) {
        console.warn('Gemini generateImages note:', imgErr?.message);
      }
    }

    return res.json({
      id,
      dataUrl: null,
      message: 'Placeholder fallback registered',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Ligera full-stack server running at http://localhost:${port}`);
  });
}

startServer();

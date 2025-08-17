// frontend/menus/hackathon/app/api/ai/analyze-profile/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const revalidate = 0;

type Payload = {
  knowledgeTests: { id: string; score: number }[];
  psychoTests: { id: string; score: number }[];
  projects: { title: string; description?: string; tags?: string[] }[];
  baseCompetencies?: Record<string, number>;
  baseRadar?: Record<string, number>;
};

function forceJson<T = any>(text: string): T {
  try {
    // quita markdown ```json ... ```
    const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return JSON.parse(text) as T;
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Missing GOOGLE_API_KEY' }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL ?? 'gemini-1.5-flash' });

    const system = `
Eres un analista educativo. A partir de:
- tests de conocimientos y psico/vocacionales,
- proyectos del alumno (títulos/descripcion),
devuelve SOLO JSON (sin comentarios ni texto extra) con el siguiente esquema:

{
  "adjustedCompetencies": { "<competencia>": 0..100, ... },      // opcional
  "adjustedRadar":        { "<eje_radar>": 0..100, ... },        // opcional
  "suggestedCompetencies":{ "<competencia>": 0..100, ... },      // 🔹 requerido para el mapa estelar
  "relations":            [ ["<compA>", "<compB>"], ... ],        // 🔹 pares relacionados (prerrequisito/afinidad)
  "explanations":         { "competencies": "...", "projects": "...", "radar": "..." }
}

Reglas:
- Usa entre 8 y 16 competencias máximas en "suggestedCompetencies".
- "relations" debe referenciar solo claves presentes en "suggestedCompetencies".
- Valores 0..100; redondea a enteros.
- No incluyas texto fuera del JSON.
    `.trim();

    const user = {
      knowledgeTests: body.knowledgeTests ?? [],
      psychoTests: body.psychoTests ?? [],
      projects: body.projects ?? [],
      baseCompetencies: body.baseCompetencies ?? {},
      baseRadar: body.baseRadar ?? {},
    };

    const result = await model.generateContent([
      { text: system },
      { text: JSON.stringify(user) },
    ]);

    const text = result.response.text();
    const json = forceJson(text);

    return NextResponse.json(json);
  } catch (e: any) {
    console.error('analyze-profile error:', e?.message || e);
    return NextResponse.json({ error: 'IA failure' }, { status: 500 });
  }
}
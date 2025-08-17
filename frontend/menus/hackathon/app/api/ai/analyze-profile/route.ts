// frontend/menus/hackathon/app/api/ai/analyze-profile/route.ts
import { NextResponse } from 'next/server';
import { REF_DB } from './reference';

export const revalidate = 0; // siempre fresco

type NumDict = Record<string, number>;

type AnalyzeProfileIn = {
  knowledgeTests?: { id: string; score: number }[];
  psychoTests?: { id: string; score: number }[];
  projects?: { title: string; description?: string }[];
  baseCompetencies?: NumDict;
  baseRadar?: NumDict;
};

type AnalyzeProfileOut = {
  competencies: string[];
  scores: NumDict;
  relations: [string, string][];
  adjustedRadar?: NumDict;
  suggestedCompetencies?: NumDict; // alias para el front
  explanations?: {
    competencies?: string;
    projects?: string;
    radar?: string;
  };
};

// ---------------- Gemini ----------------
// ---------------- Gemini ----------------
async function askGemini(payload: AnalyzeProfileIn): Promise<AnalyzeProfileOut | null> {
  const key = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  if (!key) return null;

  // Carga perezosa para entornos edge/node
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: modelName });

  const system = `
Eres un analista que SOLO devuelve JSON válido.
Dado un perfil de alumno con tests, rasgos y proyectos:
1) Genera "competencies" (10-14 máx) relevantes.
2) Asigna "scores" 0..100 por competencia.
3) Devuelve "relations" como pares [a,b].
4) Ajusta "adjustedRadar" con 10 ejes si es posible (si vienen ejes base, usa esos keys).
No incluyas texto fuera del JSON.`;

  const prompt = `${system}

Perfil:
${JSON.stringify(payload, null, 2)}

Responde EXACTAMENTE con:
{
  "competencies": string[],
  "scores": { [competency: string]: number },
  "relations": [ [string, string], ... ],
  "adjustedRadar": { [axis: string]: number }
}`;

  try {
    // 👇 Evita el typing de {role, parts}: usa string directo
    const resp: any = await model.generateContent(prompt);
    const txt = (resp?.response?.text?.() || '').trim();
    const jsonStr = txt.startsWith('```') ? txt.replace(/```json|```/g, '').trim() : txt;
    const parsed = JSON.parse(jsonStr);

    const competencies: string[] = Array.isArray(parsed?.competencies)
      ? parsed.competencies.slice(0, 14)
      : [];
    const scores: Record<string, number> =
      parsed?.scores && typeof parsed.scores === 'object' ? parsed.scores : {};
    const rawRelations = Array.isArray(parsed?.relations) ? parsed.relations : [];
    const relations: [string, string][] = rawRelations
      .filter((x: any) => Array.isArray(x) && x.length === 2 && x.every((s) => typeof s === 'string'))
      .slice(0, 64) as [string, string][];
    const adjustedRadar: Record<string, number> | undefined =
      parsed?.adjustedRadar && typeof parsed.adjustedRadar === 'object' ? parsed.adjustedRadar : undefined;

    if (!competencies.length || !Object.keys(scores).length) return null;

    return {
      competencies,
      scores,
      relations,
      adjustedRadar,
      // alias para el front
      suggestedCompetencies: scores,
      explanations: {
        competencies: 'Modelo Gemini: mapeo de tests/proyectos a competencias y relaciones.',
        projects: 'Se priorizaron tópicos de proyectos y fortalezas detectadas.',
        radar: 'Radar ajustado con rasgos psicométricos y base inicial.',
      },
    };
  } catch {
    return null;
  }
}

// ---------------- Fallback heurístico ----------------
function clamp(x: number, lo = 0, hi = 100) {
  return Math.min(hi, Math.max(lo, x));
}

function fallbackHeuristic(payload: AnalyzeProfileIn): AnalyzeProfileOut {
  const scores: NumDict = { ...(payload.baseCompetencies || {}) };

  // tests de conocimiento -> competencias
  for (const t of payload.knowledgeTests || []) {
    const rule = REF_DB.knowledgeToCompetency[t.id];
    if (!rule) continue;
    const score = clamp(Number(t.score) || 0, 0, 100);
    // Umbrales -> delta
    let delta = 0;
    const th = rule.thresholds;
    const del = rule.deltas;
    if (score < th[0]) delta = del[0];
    else if (score < th[1]) delta = del[1];
    else if (score < th[2]) delta = del[2];
    else delta = del[3];

    for (const [comp, w] of Object.entries(rule.weights)) {
      scores[comp] = clamp((scores[comp] ?? 50) + delta * w);
    }
  }

  // proyectos -> pistas de competencias
  for (const p of payload.projects || []) {
    const text = `${p.title} ${p.description || ''}`.toLowerCase();
    for (const [kw, ups] of Object.entries(REF_DB.projectHints?.keywords || {})) {
      if (text.includes(kw.toLowerCase())) {
        for (const [comp, inc] of Object.entries(ups)) {
          scores[comp] = clamp((scores[comp] ?? 50) + inc);
        }
      }
    }
  }

  // relaciones sencillas en cadena
  const competencies = Object.keys(scores)
    .sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0))
    .slice(0, 12);
  const relations: [string, string][] = [];
  for (let i = 0; i < competencies.length - 1; i++) {
    relations.push([competencies[i], competencies[i + 1]]);
  }

  // radar por rasgos (si el FE trae baseRadar, respetamos keys)
  let adjustedRadar: NumDict | undefined = undefined;
  const axes = payload.baseRadar ? Object.keys(payload.baseRadar) : undefined;
  const radar: NumDict = { ...(payload.baseRadar || {}) };

  for (const t of payload.psychoTests || []) {
    const rule = REF_DB.psychoToRadar[t.id];
    if (!rule) continue;
    for (const [axis, w] of Object.entries(rule.weights)) {
      if (axes && !axes.includes(axis)) continue; // respeta los ejes que espera el FE
      const base = radar[axis] ?? 55;
      const inc = (clamp(t.score) - 50) * 0.08 * (rule.invert ? -1 : 1) * w; // pequeño ajuste
      radar[axis] = clamp(base + inc, 0, 100);
    }
  }
  if (Object.keys(radar).length) adjustedRadar = radar;

  return {
    competencies,
    scores,
    relations,
    adjustedRadar,
    suggestedCompetencies: scores,
    explanations: {
      competencies: 'Heurística local: conocimiento + pistas de proyectos.',
      projects: 'Se aplicaron incrementos por palabras clave en descripciones.',
      radar: 'Ejes ajustados a partir de rasgos psicométricos mapeados.',
    },
  };
}

// ---------------- Handler ----------------
export async function POST(req: Request) {
  let payload: AnalyzeProfileIn;
  try {
    payload = (await req.json()) as AnalyzeProfileIn;
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 });
  }

  const byGemini = await askGemini(payload);
  const base = byGemini ?? fallbackHeuristic(payload);

  // Asegura alias y explicaciones para el front
  const result: AnalyzeProfileOut = {
    ...base,
    suggestedCompetencies: base.suggestedCompetencies ?? base.scores,
    explanations: base.explanations ?? {
      competencies: byGemini ? 'Resultado principal por Gemini.' : 'Resultado principal por heurística local.',
    },
  };

  return NextResponse.json(result);
}
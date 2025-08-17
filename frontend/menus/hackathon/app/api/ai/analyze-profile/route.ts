import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { REF_DB, type RefDB } from "./reference";

export const runtime = "nodejs";

type StudentData = {
  knowledgeTests: Array<{ id: string; score: number }>;
  psychoTests:    Array<{ id: string; score: number }>;
  projects:       Array<{ title: string; description?: string; tags?: string[] }>;
  baseCompetencies: { [competency: string]: number }; // 0..100
  baseRadar:        { [axis: string]: number };       // 0..100
};

type AIResponse = {
  adjustedCompetencies: { [competency: string]: number };
  adjustedRadar:        { [axis: string]: number };
  deltas: {
    competencies: { [competency: string]: number };
    radar:        { [axis: string]: number };
  };
  explanations: {
    competencies: string; // breve
    radar:        string; // breve
    projects:     string; // breve
  };
};

const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-pro";

function clamp01(x: number) {
  return Math.max(0, Math.min(100, x));
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({ error: "Missing GOOGLE_API_KEY" }, { status: 500 });
    }
    const input = (await req.json()) as { student: StudentData; reference?: RefDB };
    if (!input?.student) {
      return NextResponse.json({ error: "student payload required" }, { status: 400 });
    }
    const student = input.student;
    const ref: RefDB = input.reference || REF_DB;

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL });

    // Pedimos JSON ESTRICTO
    const system = [
      "Eres un analista educativo. Devuelve SOLO JSON válido con este esquema:",
      `{
        "adjustedCompetencies": { "Competencia": 0-100, ... },
        "adjustedRadar": { "Eje": 0-100, ... },
        "deltas": {
          "competencies": { "Competencia": -15..+15, ... },
          "radar": { "Eje": -15..+15, ... }
        },
        "explanations": { "competencies": "texto", "radar": "texto", "projects": "texto" }
      }`,
      "Reglas:",
      "- Usa la DB de referencia para ponderar tests.",
      "- Para conocimientos, suma deltas sobre baseCompetencies respetando pesos (máx +/-15 por competencia).",
      "- Para psicométricos, ajusta ejes del radar; si 'invert' es true, invierte el efecto.",
      "- Analiza proyectos: infiere tecnologías/áreas desde título/desc/tags y suma pequeñas bonificaciones (<= +5) usando projectHints.",
      "- Nunca generes valores fuera de 0..100. Deltas fuera de -15..+15 NO están permitidos.",
      "- Responde SÓLO JSON, sin comentarios ni markdown."
    ].join("\n");

    const payload = {
      student,
      reference: ref,
      // Reducir ruido: tomen sólo lo que necesitan
    };

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: system }] },
        { role: "user", parts: [{ text: JSON.stringify(payload) }] },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
      } as any,
    });

    const text = result.response.text();
    let parsed: AIResponse;
    try {
      parsed = JSON.parse(text) as AIResponse;
    } catch {
      return NextResponse.json({ error: "LLM returned non-JSON", raw: text }, { status: 502 });
    }

    // Saneamiento servidor (por si el modelo se pasa):
    const safeComp: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed.adjustedCompetencies || {})) {
      safeComp[k] = clamp01(Number(v) || 0);
    }
    const safeRadar: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed.adjustedRadar || {})) {
      safeRadar[k] = clamp01(Number(v) || 0);
    }

    return NextResponse.json({
      adjustedCompetencies: safeComp,
      adjustedRadar: safeRadar,
      deltas: parsed.deltas || { competencies: {}, radar: {} },
      explanations: parsed.explanations || { competencies: "", radar: "", projects: "" },
    } satisfies AIResponse);
  } catch (err: any) {
    console.error("analyze-profile error:", err?.message || err);
    return NextResponse.json({ error: "AI service unavailable" }, { status: 500 });
  }
}
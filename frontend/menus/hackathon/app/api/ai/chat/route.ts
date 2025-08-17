import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";          // El SDK funciona mejor en Node que en Edge
export const revalidate = 0;              // Sin caché
export const dynamic = "force-dynamic";   // Evita páginas estáticas

const MODEL =
  process.env.GOOGLE_GEMINI_MODEL ||
  "gemini-1.5-flash"; // Cambia a "gemini-1.5-pro" si lo prefieres

function getClient() {
  const key = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  if (!key) throw new Error("Missing GOOGLE_API_KEY");
  return new GoogleGenerativeAI(key);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const message: string = body?.message;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Bad request", details: "Campo 'message' requerido (string)" },
        { status: 400 }
      );
    }

    const genAI = getClient();
    const model = genAI.getGenerativeModel({
      model: MODEL,
      // ⬇️ Usa systemInstruction (no envíes role:"system" en contents)
      systemInstruction:
        "Eres un asistente breve, claro y útil para estudiantes. Responde en español, con máximo 4–6 líneas y sin relleno innecesario.",
      generationConfig: {
        maxOutputTokens: 512,
        temperature: 0.7,
      },
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: message }]}],
    });

    const text = result?.response?.text?.() ?? "";
    return NextResponse.json({ reply: text.trim() });
  } catch (err: any) {
    // Normaliza estatus
    const status =
      err?.status ||
      err?.response?.status ||
      (typeof err?.message === "string" && err.message.toLowerCase().includes("quota")
        ? 429
        : 500);

    // Intenta extraer cuerpo del error del SDK
    let details = err?.message || "Unknown error";
    try {
      if (err?.response?.text) {
        const bodyText = await err.response.text();
        if (bodyText) details = bodyText;
      }
    } catch {
      /* ignore */
    }

    console.error("[/api/ai/chat] error:", status, details);
    return NextResponse.json({ error: `Gemini ${status}`, details }, { status });
  }
}

// (Opcional) Health check rápido
export async function GET() {
  return NextResponse.json({
    ok: true,
    model: MODEL,
    env: {
      hasKey: Boolean(process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY),
    },
  });
}
// frontend/menus/hackathon/app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs"; // usar runtime de Node (no Edge)

type Msg = { role: "user" | "ai"; content: string };

const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash"; // cambia a "gemini-1.5-pro" si quieres

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = (await req.json()) as {
      message: string;
      history?: Msg[];
    };

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: "Missing GOOGLE_API_KEY" },
        { status: 500 }
      );
    }
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL });

    // Historial del cliente → formato Gemini (máx. 8 turnos)
    const geminiHistory = (history as Msg[]).slice(-8).map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // --- Contexto pedagógico (system prompt) recomendado ---
    const systemIntro = {
      role: "user" as const,
      parts: [
        {
          text: [
            "Actúa como tutor pedagógico en español para estudiantes de bachillerato.",
            "Responde con claridad, paso a paso, y ejemplos breves cuando aporte.",
            "Si falta información, pide aclaraciones antes de asumir.",
          ].join("\n"),
        },
      ],
    };

    const chat = model.startChat({
      history: [systemIntro, ...geminiHistory].slice(-9), // contexto máximo 9 entradas
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 1024,
      },
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("Gemini error:", err?.message || err);
    return NextResponse.json({ error: "AI service unavailable" }, { status: 500 });
  }
}
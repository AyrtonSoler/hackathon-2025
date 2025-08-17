// frontend/menus/hackathon/lib/profile.ts
const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export type ProfileSummary = {
  knowledgeTests: Array<{ id: string; score: number }>;
  psychoTests:    Array<{ id: string; score: number }>;
  projects:       Array<{ title: string; description?: string }>;
};

export async function getProfileSummary(): Promise<ProfileSummary> {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 3500);

    const r = await fetch(`${API}/api/profile/summary/`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: ctl.signal,
    });
    clearTimeout(t);
    if (!r.ok) throw new Error(`profile summary ${r.status}`);
    const data = await r.json();
    return {
      knowledgeTests: Array.isArray(data.knowledgeTests) ? data.knowledgeTests : [],
      psychoTests:    Array.isArray(data.psychoTests)    ? data.psychoTests    : [],
      projects:       Array.isArray(data.projects)       ? data.projects       : [],
    };
  } catch {
    // 🔁 Fallback alineado a tu REF_DB para que el frontend SIEMPRE pinte
    return {
      knowledgeTests: [
        { id: "js_basics",          score: 72 },
        { id: "react_fundamentals", score: 81 },
      ],
      psychoTests: [
        { id: "enneagram_focus",      score: 62 },
        { id: "bigfive_extroversion", score: 58 },
      ],
      projects: [
        { title: "Ecommerce React", description: "frontend TS + API REST" },
      ],
    };
  }
}
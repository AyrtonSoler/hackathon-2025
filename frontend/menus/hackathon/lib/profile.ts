const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export type ProfileSummary = {
  knowledgeTests: Array<{ id: string; score: number }>;
  psychoTests:    Array<{ id: string; score: number }>;
  projects:       Array<{ title: string; description?: string }>;
};

export async function getProfileSummary(): Promise<ProfileSummary> {
  const r = await fetch(`${API}/api/profile/summary/`, { cache: "no-store" });
  if (!r.ok) throw new Error(`profile summary ${r.status}`);
  return r.json();
}
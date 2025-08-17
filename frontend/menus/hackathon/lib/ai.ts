// frontend/menus/hackathon/lib/ai.ts
export type TestItem = { id: string; score: number };
export type ProjectItem = { title: string; description?: string; tags?: string[] };

export type StudentData = {
  knowledgeTests: TestItem[];
  psychoTests: TestItem[];
  projects: ProjectItem[];
  baseCompetencies: Record<string, number>; // opcional
  baseRadar: Record<string, number>;        // opcional
};

export type AnalyzeProfileOut = {
  // lo que ya teníamos
  adjustedCompetencies?: Record<string, number>;
  adjustedRadar?: Record<string, number>;
  explanations?: { competencies?: string; projects?: string; radar?: string };

  // 🔹 nuevo para el mapa estelar
  suggestedCompetencies?: Record<string, number>; // { "Pensamiento Crítico": 78, ... }
  relations?: Array<[string, string]>;            // [["Pensamiento Crítico","Resolución de Problemas"], ...]
};

export async function analyzeProfile(data: StudentData): Promise<AnalyzeProfileOut> {
  const r = await fetch('/api/ai/analyze-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(`analyze-profile ${r.status}`);
  return r.json();
}
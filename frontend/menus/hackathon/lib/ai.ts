// frontend/menus/hackathon/lib/ai.ts
export type NumDict = Record<string, number>;

export type StudentData = {
  knowledgeTests?: { id: string; score: number }[];
  psychoTests?: { id: string; score: number }[];
  projects?: { title: string; description?: string }[];
  baseCompetencies?: NumDict;
  baseRadar?: NumDict;
};

export type AnalyzeProfileOut = {
  competencies: string[];            // nombres de nodos
  scores: NumDict;                   // score por competencia 0..100
  relations: [string, string][];     // aristas [a,b]
  adjustedRadar?: NumDict;           // radar ajustado (10 ejes o los que corresponda)

  // 🔽 alias opcionales que usa el front actual
  suggestedCompetencies?: NumDict;   // alias de "scores"
  explanations?: {
    competencies?: string;
    projects?: string;
    radar?: string;
  };
};

export async function analyzeProfile(data: StudentData): Promise<AnalyzeProfileOut> {
  const r = await fetch('/api/ai/analyze-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(`analyze-profile ${r.status}`);
  return r.json();
}

export async function getSchema(): Promise<{ radarAxes: string[]; competencies: string[] }> {
  const r = await fetch('/api/ai/schema', { cache: 'no-store' });
  if (!r.ok) throw new Error(`schema ${r.status}`);
  return r.json();
}
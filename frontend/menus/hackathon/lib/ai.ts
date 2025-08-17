export type StudentData = {
  knowledgeTests: Array<{ id: string; score: number }>;
  psychoTests:    Array<{ id: string; score: number }>;
  projects:       Array<{ title: string; description?: string; tags?: string[] }>;
  baseCompetencies: { [competency: string]: number };
  baseRadar:        { [axis: string]: number };
};

export type AnalysisOut = {
  adjustedCompetencies: { [competency: string]: number };
  adjustedRadar:        { [axis: string]: number };
  deltas: {
    competencies: { [competency: string]: number };
    radar:        { [axis: string]: number };
  };
  explanations: {
    competencies: string;
    radar: string;
    projects: string;
  };
};

export async function analyzeProfile(student: StudentData): Promise<AnalysisOut> {
  const r = await fetch("/api/ai/analyze-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student }),
  });
  if (!r.ok) throw new Error(`analyze-profile ${r.status}`);
  return r.json();
}
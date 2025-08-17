// /frontend/menus/hackathon/app/api/ai/schema/route.ts
import { NextResponse } from 'next/server';
import { REF_DB } from '../analyze-profile/reference';

export const revalidate = 0;

type SchemaResponse = {
  radarAxes: string[];
  competencies: string[];
};

const AXES_10 = [
  'Científica',
  'Persuasiva',
  'Artística',
  'Mecánica',
  'Social',
  'Musical',
  'Investigativa',
  'Comunicativa',
  'Emprendedora',
  'Organizativa',
];

export async function GET() {
  // Competencias de referencia a partir del mapeo de conocimientos + hints
  const fromKnowledge = new Set<string>();
  for (const v of Object.values(REF_DB.knowledgeToCompetency)) {
    Object.keys(v.weights).forEach((k) => fromKnowledge.add(k));
  }
  const fromHints = new Set<string>();
  Object.values(REF_DB.projectHints?.keywords || {}).forEach((bonus) =>
    Object.keys(bonus).forEach((k) => fromHints.add(k)),
  );

  const competencies = Array.from(new Set([...fromKnowledge, ...fromHints]));

  const payload: SchemaResponse = {
    radarAxes: AXES_10,
    competencies,
  };
  return NextResponse.json(payload);
}
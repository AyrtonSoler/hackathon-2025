// frontend/menus/hackathon/app/api/ai/schema/route.ts
import { NextResponse } from 'next/server';
import { TEST_DB } from '../../../../lib/reference'; // <- ruta corregida

// evita cacheo en Next App Router
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type SchemaResponse = {
  radarAxes: string[];
  competencies: string[];
};

export async function GET() {
  // Ejes del radar (10 vértices) y competencias para el mapa estelar
  const radarAxes: string[] = Array.from(new Set(TEST_DB.habilidadesVocacionales)).slice(0, 10);
  const competencies: string[] = Array.from(new Set(TEST_DB.habilidadesAcademicas));

  const payload: SchemaResponse = { radarAxes, competencies };
  return NextResponse.json(payload);
}
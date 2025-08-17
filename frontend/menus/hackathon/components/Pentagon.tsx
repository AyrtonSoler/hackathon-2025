'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { analyzeProfile, getSchema } from '../lib/ai';
import { getProfileSummary } from '../lib/profile';

type RadarDict = Record<string, number>;
const clamp01 = (x: number) => Math.max(0, Math.min(100, x));

export default function Pentagon() {
  const [axes, setAxes] = useState<string[]>([]);
  const [radar, setRadar] = useState<RadarDict>({});
  const [loading, setLoading] = useState(true);

  // 1) Cargar ejes del esquema
  useEffect(() => {
    (async () => {
      try {
        const s = await getSchema();
        const ax = Array.isArray(s?.radarAxes) && s.radarAxes.length ? s.radarAxes : [
          'Científica','Persuasiva','Artística','Mecánica','Social',
          'Musical','Investigativa','Comunicativa','Emprendedora','Organizativa',
        ];
        setAxes(ax.slice(0, 10));
      } catch {
        setAxes([
          'Científica','Persuasiva','Artística','Mecánica','Social',
          'Musical','Investigativa','Comunicativa','Emprendedora','Organizativa',
        ]);
      }
    })();
  }, []);

  // 2) Cuando haya ejes, pedir summary y analizar con Gemini (con fallback del server)
  useEffect(() => {
    if (!axes.length) return;
    (async () => {
      try {
        const summary = await getProfileSummary();
        // baseRadar con ejes actuales
        const baseRadar: RadarDict = Object.fromEntries(axes.map(a => [a, 55]));
        const out = await analyzeProfile({
          knowledgeTests: summary.knowledgeTests,
          psychoTests: summary.psychoTests,
          projects: summary.projects,
          baseCompetencies: {}, // radar no usa esto
          baseRadar,
        });
        const result = out?.adjustedRadar ?? baseRadar;
        // asegura que haya valores 0..100 en todos los ejes
        const normalized: RadarDict = Object.fromEntries(
          axes.map(a => [a, clamp01(Number(result[a] ?? 55))])
        );
        setRadar(normalized);
      } catch {
        const base: RadarDict = Object.fromEntries(axes.map(a => [a, 55]));
        setRadar(base);
      } finally {
        setLoading(false);
      }
    })();
  }, [axes.join('|')]);

  // ===== Geometría =====
  const size = 360, padding = 36, steps = 5;
  const R = (size / 2) - padding, cx = size / 2, cy = size / 2;
  const val2r = (v: number) => (clamp01(v) / 100) * R;
  const ang = (i: number, n: number) => -Math.PI/2 + (i*2*Math.PI)/n;
  const polar = (a: number, r: number) => ({ x: cx + r*Math.cos(a), y: cy + r*Math.sin(a) });

  const polygonPoints = useMemo(() => axes.map((axis, i) => {
    const a = ang(i, axes.length);
    const p = polar(a, val2r(radar[axis] ?? 0));
    return `${p.x},${p.y}`;
  }).join(' '), [axes.join('|'), JSON.stringify(radar)]);

  if (loading) {
    return (
      <div className="w-full rounded-xl border bg-white p-4 text-sm text-gray-600">
        Calculando tu radar con IA…
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-2">
        <h3 className="text-base font-semibold">Habilidades Vocacionales (Radar)</h3>
        <p className="text-xs text-gray-500">Generado con Gemini + base de referencia del equipo.</p>
      </div>

      <div className="mx-auto max-w-[520px]">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full">
          {/* Círculos/polígonos concéntricos */}
          {[...Array(steps)].map((_, idx) => {
            const t = (idx + 1) / steps, r = R * t;
            const pts = axes.map((_, i) => {
              const a = ang(i, axes.length), p = polar(a, r);
              return `${p.x},${p.y}`;
            }).join(' ');
            return (
              <polygon key={idx} points={pts} fill="none" stroke="black" strokeOpacity={0.12} strokeWidth={1}/>
            );
          })}

          {/* Ejes */}
          {axes.map((axis, i) => {
            const a = ang(i, axes.length), p = polar(a, R);
            return <line key={axis} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="black" strokeOpacity={0.18} strokeWidth={1}/>;
          })}

          {/* Polígono */}
          <polygon points={polygonPoints} fill="black" fillOpacity={0.1} stroke="black" strokeWidth={2} strokeOpacity={0.8} />

          {/* Puntos y labels */}
          {axes.map((axis, i) => {
            const a = ang(i, axes.length);
            const p = polar(a, val2r(radar[axis] ?? 0));
            const label = polar(a, R + 16);
            return (
              <g key={axis}>
                <circle cx={p.x} cy={p.y} r={3.2} fill="black" />
                <text x={label.x} y={label.y} fontSize={10} textAnchor="middle" dominantBaseline="middle" fill="black">{axis}</text>
                <text x={label.x} y={label.y + 12} fontSize={10} textAnchor="middle" dominantBaseline="middle" fill="black" opacity={0.7}>
                  {Math.round(radar[axis] ?? 0)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
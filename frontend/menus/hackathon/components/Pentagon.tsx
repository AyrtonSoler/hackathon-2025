'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { analyzeProfile } from '../lib/ai';
import { getProfileSummary } from '../lib/profile';

type RadarDict = Record<string, number>;
const clamp01 = (x: number) => Math.max(0, Math.min(100, x));
const LS_KEY = 'ai:radar:v2';

export default function Pentagon() {
  const [axes, setAxes] = useState<string[]>([
    // fallback si el esquema no llega: 10 ejes
    'Disciplina','Colaboración','Autonomía','Liderazgo','Creatividad',
    'Comunicación','Pensamiento Crítico','Resolución de Problemas','Gestión del Tiempo','Adaptabilidad',
  ]);
  const [radar, setRadar] = useState<RadarDict>({});
  const [loading, setLoading] = useState(false);

  // 1) Cargar el esquema (10 vértices) desde /api/ai/schema
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/ai/schema', { cache: 'no-store' });
        if (r.ok) {
          const s = await r.json();
          if (Array.isArray(s?.radarAxes) && s.radarAxes.length) {
            setAxes(s.radarAxes);
          }
        }
      } catch {
        // silencioso: dejamos el fallback
      }
    })();
  }, []);

  // 2) Inicializar radar cuando tengamos ejes (carga base + localStorage)
  useEffect(() => {
    if (!axes.length) return;
    const base: RadarDict = Object.fromEntries(axes.map((k) => [k, 55])) as RadarDict;

    let persisted: any = null;
    try { persisted = JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch {}
    const next: RadarDict = { ...base, ...(persisted || {}) };

    // limpia claves viejas si cambió el set de ejes
    for (const k of Object.keys(next)) if (!axes.includes(k)) delete (next as any)[k];

    setRadar(next);
  }, [axes.join('|')]);

  // ===== Geometría SVG =====
  const size = 420, padding = 40;
  const R = (size / 2) - padding, cx = size / 2, cy = size / 2, steps = 5;
  const valueToRadius = (v: number) => (clamp01(v) / 100) * R;
  const axisAngle = (i: number, n: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const polar = (ang: number, rad: number) => ({ x: cx + rad * Math.cos(ang), y: cy + rad * Math.sin(ang) });

  const polygonPoints = useMemo(
    () =>
      axes
        .map((axis, i) => {
          const a = axisAngle(i, axes.length);
          const r = valueToRadius(radar[axis] ?? 0);
          const p = polar(a, r);
          return `${p.x},${p.y}`;
        })
        .join(' '),
    [axes.join('|'), JSON.stringify(radar)]
  );

  // ===== IA: ajustar automáticamente (sin botones ni alerts) =====
  async function runAIAdjust() {
    setLoading(true);
    try {
      const summary = await getProfileSummary().catch(() => null);

      const out = await analyzeProfile({
        knowledgeTests: summary?.knowledgeTests ?? [],
        psychoTests: summary?.psychoTests ?? [],
        projects: summary?.projects ?? [],
        baseCompetencies: {},
        baseRadar: radar,
      });

      if (out?.adjustedRadar) {
        const next: RadarDict = { ...radar };
        for (const k of axes) {
          const v = Number(out.adjustedRadar[k]);
          next[k] = Number.isFinite(v) ? clamp01(v) : next[k];
        }
        setRadar(next);
        try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
      }
    } catch (e) {
      // Silencioso para no molestar al usuario; revisa consola si necesitas depurar
      console.error('AI adjust failed:', e);
    } finally {
      setLoading(false);
    }
  }

  // Ejecuta IA al montar y cuando cambie el set de ejes
  useEffect(() => {
    if (!axes.length) return;
    runAIAdjust();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axes.join('|')]);

  return (
    <div className="w-full rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-lg font-semibold">Mapa de Habilidades (Radar)</h3>
        <p className="text-xs text-gray-500">
          Ejes dinámicos desde tu base (académicas/vocacionales). Se recalibra automáticamente con IA
          {loading ? ' …calculando' : ''}.
        </p>
      </div>

      <svg viewBox={`0 0 ${size} ${size}`} className="w-full">
        {/* Polígonos concéntricos */}
        {[...Array(steps)].map((_, idx) => {
          const t = (idx + 1) / steps, r = R * t;
          const pts = axes.map((_, i) => {
            const a = axisAngle(i, axes.length);
            const p = polar(a, r);
            return `${p.x},${p.y}`;
          }).join(' ');
          return (
            <polygon
              key={idx}
              points={pts}
              fill="none"
              stroke="black"
              strokeOpacity={0.12}
              strokeWidth={1}
            />
          );
        })}

        {/* Ejes */}
        {axes.map((axis, i) => {
          const a = axisAngle(i, axes.length); const p = polar(a, R);
          return (
            <line
              key={axis}
              x1={cx} y1={cy} x2={p.x} y2={p.y}
              stroke="black"
              strokeOpacity={0.2}
              strokeWidth={1}
            />
          );
        })}

        {/* Polígono de valores */}
        <polygon
          points={polygonPoints}
          fill="OceanBlue"
          fillOpacity={0.1}
          stroke="black"
          strokeWidth={2}
          strokeOpacity={0.8}
        />

        {/* Puntos + labels */}
        {axes.map((axis, i) => {
          const a = axisAngle(i, axes.length);
          const r = valueToRadius(radar[axis] ?? 0);
          const p = polar(a, r);
          const label = polar(a, R + 18);
          return (
            <g key={axis}>
              <circle cx={p.x} cy={p.y} r={3.8} fill="black" />
              <text x={label.x} y={label.y} fontSize={11} textAnchor="middle" dominantBaseline="middle" fill="black">
                {axis}
              </text>
              <text x={label.x} y={label.y + 12} fontSize={10} textAnchor="middle" dominantBaseline="middle" fill="black" opacity={0.7}>
                {Math.round(radar[axis] ?? 0)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
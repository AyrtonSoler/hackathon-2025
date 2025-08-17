'use client';

import React, { useMemo, useState } from 'react';
import { analyzeProfile } from '../lib/ai';
import { getProfileSummary } from '../lib/profile';

type RadarDict = Record<string, number>;

type Props = {
  /** Valores iniciales 0..100 por eje. Si no los pasas, toma un preset. */
  initialRadar?: RadarDict;
};

/** Asegura 0..100 */
const clamp01 = (x: number) => Math.max(0, Math.min(100, x));

/** Orden de ejes que se muestran (5 = pentágono) */
const AXES: string[] = [
  'Disciplina',
  'Colaboración',
  'Autonomía',
  'Liderazgo',
  'Creatividad',
];

/** Preset por defecto si no te pasan initialRadar */
const DEFAULT_RADAR: RadarDict = {
  Disciplina: 55,
  Colaboración: 60,
  Autonomía: 50,
  Liderazgo: 52,
  Creatividad: 58,
};

const LS_KEY = 'ai:radar';

export default function Pentagon({ initialRadar }: Props) {
  // Estado del radar
  const [radar, setRadar] = useState<RadarDict>(() => {
    const base = { ...DEFAULT_RADAR, ...(initialRadar || {}) };
    // Garantiza que existan todas las claves de AXES
    for (const k of AXES) base[k] = clamp01(Number(base[k] ?? 0));
    return base;
  });
  const [loading, setLoading] = useState(false);

  // === Persistencia: cargar desde localStorage al montar
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setRadar((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {}
  }, []);

  // Helper para persistir
  const persistRadar = (next: RadarDict) => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
  };

  // ======= Geometría del radar en SVG =======
  const size = 280;           // viewport
  const padding = 28;         // margen
  const R = (size / 2) - padding; // radio máximo
  const cx = size / 2;
  const cy = size / 2;
  const steps = 5;            // líneas concéntricas

  /** Convierte valor 0..100 en radio 0..R */
  const valueToRadius = (v: number) => (clamp01(v) / 100) * R;

  /** Ángulo (rad) para el eje i de N (comienza arriba -90°) */
  const axisAngle = (i: number, n: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;

  /** Punto cartesiano desde centro, ángulo y radio */
  const polar = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  });

  /** Polígono del radar a partir de valores actuales */
  const polygonPoints = useMemo(() => {
    const pts = AXES.map((axis, i) => {
      const a = axisAngle(i, AXES.length);
      const r = valueToRadius(radar[axis] ?? 0);
      const { x, y } = polar(a, r);
      return `${x},${y}`;
    });
    return pts.join(' ');
  }, [radar]);

  // ======= Acción IA: ajustar con tests psicométricos (reales del backend) =======
  async function onAIAdjust() {
    setLoading(true);
    try {
      // 1) Trae tests psicométricos reales del summary del alumno
      const summary = await getProfileSummary().catch(() => null);

      // 2) Llama al endpoint de IA con el radar actual y los psychoTests reales
      const out = await analyzeProfile({
        knowledgeTests: [],
        psychoTests: summary?.psychoTests ?? [], // 🔹 ahora reales
        projects: [],
        baseCompetencies: {},
        baseRadar: radar,                        // estado actual del radar
      });

      // 3) Aplica los ajustes devueltos por Gemini solo a ejes conocidos
      if (out?.adjustedRadar) {
        setRadar((prev) => {
          const next: RadarDict = { ...prev };
          for (const k of Object.keys(out.adjustedRadar)) {
            if (AXES.includes(k)) next[k] = clamp01(Number(out.adjustedRadar[k]) || 0);
          }
          persistRadar(next); // ← guarda en localStorage
          return next;
        });
      }
    } catch (e: any) {
      alert(e?.message ?? 'Error al ajustar con IA');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Mapa de Habilidades (Radar)</h3>
          <p className="text-xs text-gray-500">Haz clic en “Ajustar con IA” para recalibrar con tests psicométricos.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAIAdjust}
            disabled={loading}
            className="rounded bg-emerald-600 px-3 py-1 text-white disabled:opacity-60"
            title="Ajusta los ejes del radar con Gemini"
          >
            {loading ? 'Ajustando…' : 'Ajustar con IA'}
          </button>
          <button
            onClick={() => { localStorage.removeItem(LS_KEY); setRadar(DEFAULT_RADAR); }}
            className="rounded bg-gray-200 px-3 py-1"
            title="Borrar ajuste y volver al preset"
          >
            Restablecer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[auto_220px]">
        {/* Radar SVG */}
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full">
          {/* Círculos / polígonos concéntricos */}
          {[...Array(steps)].map((_, idx) => {
            const t = (idx + 1) / steps;
            const r = R * t;
            const points = AXES.map((_, i) => {
              const a = axisAngle(i, AXES.length);
              const { x, y } = polar(a, r);
              return `${x},${y}`;
            }).join(' ');
            return (
              <polygon
                key={idx}
                points={points}
                fill="none"
                stroke="black"
                strokeOpacity={0.12}
                strokeWidth={1}
              />
            );
          })}

          {/* Ejes */}
          {AXES.map((axis, i) => {
            const a = axisAngle(i, AXES.length);
            const pEnd = polar(a, R);
            return (
              <line
                key={axis}
                x1={cx} y1={cy} x2={pEnd.x} y2={pEnd.y}
                stroke="black"
                strokeOpacity={0.2}
                strokeWidth={1}
              />
            );
          })}

          {/* Polígono de valores */}
          <polygon
            points={polygonPoints}
            fill="black"
            fillOpacity={0.12}
            stroke="black"
            strokeWidth={1.8}
            strokeOpacity={0.8}
          />

          {/* Puntos y labels de cada eje */}
          {AXES.map((axis, i) => {
            const a = axisAngle(i, AXES.length);
            const r = valueToRadius(radar[axis] ?? 0);
            const p = polar(a, r);
            // label un poco más afuera del borde
            const label = polar(a, R + 14);
            return (
              <g key={axis}>
                <circle cx={p.x} cy={p.y} r={3.5} fill="black" />
                <text
                  x={label.x} y={label.y}
                  fontSize={10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="black"
                >
                  {axis}
                </text>
                <text
                  x={label.x} y={label.y + 12}
                  fontSize={10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="black"
                  opacity={0.7}
                >
                  {Math.round(radar[axis] ?? 0)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tabla editable rápida (opcional) */}
        <div className="rounded-lg border p-3">
          <h4 className="mb-2 text-sm font-medium">Editar valores (0–100)</h4>
          <div className="grid grid-cols-2 gap-2">
            {AXES.map((axis) => (
              <div key={axis} className="flex items-center gap-2">
                <label className="w-28 text-xs text-gray-600">{axis}</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={Math.round(radar[axis] ?? 0)}
                  onChange={(e) => {
                    const val = clamp01(Number(e.target.value) || 0);
                    setRadar((prev) => {
                      const next = { ...prev, [axis]: val };
                      persistRadar(next); // ← guarda cambios manuales también
                      return next;
                    });
                  }}
                  className="w-20 rounded border px-2 py-1 text-right"
                />
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Consejo: ajusta manualmente y luego usa “Ajustar con IA” para calibrar con tus tests.
          </p>
        </div>
      </div>
    </div>
  );
}
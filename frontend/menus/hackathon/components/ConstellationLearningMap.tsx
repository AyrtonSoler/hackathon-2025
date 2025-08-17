'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { analyzeProfile, type StudentData } from '../lib/ai';
import { getProjects } from '../lib/portfolio';          // ya lo tienes
import { getProfileSummary } from '../lib/profile';       // ya lo tienes

// ---------- utils ----------
const clamp = (x: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, x));
const radiusFromScore = (s: number) => 4 + (clamp(s) / 100) * 8;   // 4..12
const opacityFromScore = (s: number) => 0.35 + (clamp(s) / 100) * 0.65;

type NodeT = { id: string };
type Graph = { nodes: NodeT[]; edges: [string, string][] };

function groupByRing(ids: string[]) {
  // reparte en anillos para estética
  const rings: string[][] = [[], [], [], []];
  ids.forEach((k, i) => rings[i % rings.length].push(k));
  return rings;
}

function radialLayout(ids: string[], w: number, h: number) {
  const rings = groupByRing(ids);
  const cx = w / 2, cy = h / 2, R0 = Math.min(w, h) * 0.18, step = Math.min(w, h) * 0.12;
  const pos = new Map<string, { x: number; y: number }>();
  rings.forEach((ring, r) => {
    const R = R0 + r * step;
    ring.forEach((id, i) => {
      const theta = (2 * Math.PI * i) / ring.length + r * 0.25;
      pos.set(id, { x: cx + R * Math.cos(theta), y: cy + R * Math.sin(theta) });
    });
  });
  return pos;
}

function Starfield({ width, height, count = 180 }: { width: number; height: number; count?: number }) {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; r: number; d: number }[]>([]);
  useEffect(() => {
    setStars(Array.from({ length: count }).map((_, i) => ({
      id: i, x: Math.random() * width, y: Math.random() * height, r: Math.random() * 1.2 + 0.3, d: 2 + Math.random() * 4,
    })));
  }, [width, height, count]);
  return (
    <svg className="absolute inset-0 w-full h-full" aria-hidden>
      {stars.map(s => (
        <motion.circle
          key={s.id}
          cx={s.x}
          cy={s.y}
          r={s.r}
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 0.8, 0.3] }}
          transition={{ duration: s.d, repeat: Infinity, repeatType: 'mirror' }}
          className="stroke-black fill-black"
        />
      ))}
    </svg>
  );
}

// ---------- componente ----------
export default function ConstellationLearningMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 900, h: 560 });

  const [graph, setGraph] = useState<Graph>({ nodes: [], edges: [] });
  const [scores, setScores] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState('');
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number } | null>(null);
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [loading, setLoading] = useState(false);
  const [explain, setExplain] = useState<string>('');

  // resize
  useEffect(() => {
    const resize = () => {
      const el = containerRef.current;
      if (!el) return;
      setSize({ w: el.clientWidth, h: Math.max(420, Math.floor(el.clientWidth * 0.6)) });
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // layout cuando cambie el grafo/tamaño
  useEffect(() => {
    const ids = graph.nodes.map(n => n.id);
    const pos = radialLayout(ids, size.w, size.h);
    setPositions(pos);
  }, [JSON.stringify(graph.nodes.map(n => n.id)), size.w, size.h]);

  // arrastre básico
  const onPointerDown = (id: string, e: React.PointerEvent<SVGGElement>) => {
    e.preventDefault();
    const p = positions.get(id);
    if (!p) return;
    setDrag({ id, dx: e.clientX - p.x, dy: e.clientY - p.y });
  };
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const x = e.clientX - drag.dx;
      const y = e.clientY - drag.dy;
      setPositions(prev => new Map(prev).set(drag.id, { x, y }));
    };
    const up = () => setDrag(null);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointerleave', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointerleave', up);
    };
  }, [drag]);

  // visible por filtro
  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const ids = new Set(graph.nodes.map(n => n.id));
    if (!q) return ids;
    const out = new Set<string>();
    for (const n of graph.nodes) if (n.id.toLowerCase().includes(q)) out.add(n.id);
    return out;
  }, [filter, JSON.stringify(graph.nodes.map(n => n.id))]);

  // ========= IA: construir grafo desde Gemini =========
  async function recalcWithAI() {
    setLoading(true);
    try {
      const [summary, projs] = await Promise.all([
        getProfileSummary().catch(() => null),
        getProjects().catch(() => []),
      ]);

      const student: StudentData = {
        knowledgeTests: summary?.knowledgeTests ?? [],
        psychoTests: summary?.psychoTests ?? [],
        projects: (projs || []).map((p: any) => ({ title: p.title, description: p.description ?? '', tags: [] })),
        baseCompetencies: {},  // no forzamos base; dejamos que Gemini proponga
        baseRadar: {},
      };

      const out = await analyzeProfile(student);

      const suggested = out?.suggestedCompetencies ?? {};
      const relations = (out?.relations ?? []).filter(
        (pair): pair is [string, string] => Array.isArray(pair) && pair.length === 2 && pair.every(s => typeof s === 'string')
      );

      // construir grafo
      const nodeIds = Object.keys(suggested);
      const nodes: NodeT[] = nodeIds.map(id => ({ id }));
      const validEdges: [string, string][] = relations.filter(([a, b]) => nodeIds.includes(a) && nodeIds.includes(b));

      setGraph({ nodes, edges: validEdges });
      setScores(suggested);
      setExplain(out?.explanations?.competencies || '');
    } catch (e) {
      console.error('AI constellation error', e);
    } finally {
      setLoading(false);
    }
  }

  // calcular al montar
  useEffect(() => {
    recalcWithAI();
  }, []);

  // ====== render ======
  const center = { x: size.w / 2, y: size.h / 2 };

  return (
    <div className="relative w-full rounded-xl border bg-white/90 p-3 shadow" ref={containerRef}>
      {/* barra superior */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <input
          className="rounded border px-3 py-1"
          placeholder="Buscar competencia…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button
          className="rounded bg-emerald-600 px-3 py-1 text-white disabled:opacity-60"
          onClick={recalcWithAI}
          disabled={loading}
          title="Recalcular sugerencias y relaciones con Gemini"
        >
          {loading ? 'Recalculando…' : 'Recalcular con IA'}
        </button>
      </div>

      {/* explicación IA */}
      {explain && (
        <p className="mb-2 text-xs text-gray-600">
          <strong>IA:</strong> {explain}
        </p>
      )}

      {/* fondo estrellas */}
      <div className="relative h-[560px] w-full">
        <Starfield width={size.w} height={size.h} />

        <svg className="absolute inset-0 h-full w-full" aria-label="Mapa estelar de competencias">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* halo central */}
          <circle cx={center.x} cy={center.y} r={Math.min(size.w, size.h) / 2.2} fill="none" stroke="black" strokeOpacity={0.06} />

          {/* aristas */}
          {graph.edges.map(([a, b], i) => {
            const pa = positions.get(a), pb = positions.get(b);
            if (!pa || !pb) return null;
            const avg = ((scores[a] ?? 50) + (scores[b] ?? 50)) / 2;
            return (
              <line
                key={i}
                x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                stroke="black"
                strokeOpacity={opacityFromScore(avg) * 0.6}
                strokeWidth={1.4}
              />
            );
          })}

          {/* nodos */}
          {graph.nodes.map((n) => {
            const p = positions.get(n.id); if (!p) return null;
            const score = scores[n.id] ?? 50;
            const r = radiusFromScore(score);
            const isVisible = visible.has(n.id);
            return (
              <g
                key={n.id}
                className="cursor-pointer select-none"
                onPointerDown={(e) => onPointerDown(n.id, e)}
              >
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={r}
                  filter="url(#glow)"
                  animate={{ opacity: isVisible ? opacityFromScore(score) : 0.2, scale: [1, 1.08, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                  className="fill-black stroke-black"
                  strokeWidth={1.2}
                />
                <title>{`${n.id} — ${Math.round(score)}`}</title>
                <text x={p.x + 10} y={p.y - 10} className="text-xs fill-black">
                  {n.id} <tspan className="opacity-60">({Math.round(score)})</tspan>
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );


}
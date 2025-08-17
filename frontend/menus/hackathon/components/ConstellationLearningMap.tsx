'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { analyzeProfile, type StudentData } from "../lib/ai";
import { getProjects } from "../lib/portfolio";
import { getProfileSummary } from "../lib/profile";

/**
 * Constellation Learning Map + IA
 * -------------------------------------------------------------
 * - Visualiza un grafo de temas como constelación
 * - Permite arrastrar nodos, buscar y resaltar ruta a una meta
 * - Mantiene un "score" 0..100 por nodo
 * - Botón "Ajustar con IA": envía datos hacia Gemini y actualiza scores
 */

// =============== UTILIDADES DE GRAFO =================
// =============== UTILIDADES DE GRAFO =================
function buildAdjacency(edges: string[][]) {
  const out = new Map<string, Set<string>>();
  const nodes = new Set<string>();
  edges.forEach(([a, b]) => {
    nodes.add(a); nodes.add(b);
    if (!out.has(a)) out.set(a, new Set());
    out.get(a)!.add(b);
  });
  return { out, nodes };
}

function bfsPath(
  startSet: Set<string>,
  goal: string,
  out: Map<string, Set<string>>
): string[] | null {
  const queue: string[] = [];
  const parent = new Map<string, string>();
  const visited = new Set<string>();

  for (const s of startSet) { queue.push(s); visited.add(s); }
  while (queue.length) {
    const u = queue.shift()!;
    if (u === goal) {
      const path: string[] = [];
      let cur: string | undefined = goal;
      while (cur != null) { path.push(cur); cur = parent.get(cur); }
      return path.reverse();
    }
    for (const v of (out.get(u) ?? new Set<string>())) {
      if (!visited.has(v)) { visited.add(v); parent.set(v, u); queue.push(v); }
    }
  }
  return null;
}

// ✅ Arreglado: el tipo correcto es string[][]
function topologicalOrder(nodes: Set<string>, edges: string[][]): string[] {
  const indeg = new Map<string, number>([...nodes].map(n => [n, 0]));
  for (const [a, b] of edges) indeg.set(b, (indeg.get(b) || 0) + 1);
  const q = [...[...indeg.entries()].filter(([,d]) => d === 0).map(([n]) => n)];
  const order: string[] = [];
  const out = new Map<string, string[]>();
  for (const [a, b] of edges) {
    if (!out.has(a)) out.set(a, []);
    out.get(a)!.push(b);
  }
  while (q.length) {
    const u = q.shift()!;
    order.push(u);
    for (const v of (out.get(u) || [])) {
      indeg.set(v, indeg.get(v)! - 1);
      if (indeg.get(v) === 0) q.push(v);
    }
  }
  return order.length === nodes.size ? order : order;
}

interface Node {
  id: string;
  level: number;
  tags?: string[];
}

function suggestLearningSequence(known: Set<string>, goal: string, edges: string[][]) {
  const { out, nodes } = buildAdjacency(edges);
  const path = bfsPath(known, goal, out);
  if (!nodes.has(goal)) return { path: null, steps: [], note: "La meta no existe" };

  if (!path) return { path: null, steps: [], note: "No hay ruta desde tus conocimientos actuales" };

  // Orden topológico suave para priorizar prerequisitos
  const topo = topologicalOrder(nodes, edges);
  const unknownOnPath = path.filter(n => !known.has(n));
  const indexInTopo = new Map<string, number>(topo.map((n, i) => [n, i]));
  const steps = [...unknownOnPath].sort((a, b) => (indexInTopo.get(a) ?? 0) - (indexInTopo.get(b) ?? 0));
  return { path, steps, note: null };
}
type Graph = {
  title: string;
  tags: string[];
  nodes: Node[];
  edges: [string, string][]; // ← tuplas
};
// =============== DATOS DE EJEMPLO =================
const SAMPLE_GRAPH = {
  title: "Ruta de Aprendizaje — Programación y CS",
  tags: ["programación", "cs", "algoritmos", "web", "datos"],
  nodes: [
    { id: "Fundamentos de Programación", level: 0, tags: ["lógica", "variables"] },
    { id: "Estructuras de Datos", level: 1, tags: ["listas", "árboles", "hash"] },
    { id: "Algoritmos", level: 1, tags: ["ordenamiento", "búsqueda"] },
    { id: "Complejidad", level: 2, tags: ["O(n)", "análisis"] },
    { id: "POO", level: 1, tags: ["clases", "herencia"] },
    { id: "Bases de Datos", level: 1, tags: ["sql", "modelado"] },
    { id: "Git y Control de Versiones", level: 0, tags: ["git", "github"] },
    { id: "Desarrollo Web Frontend", level: 2, tags: ["html", "css", "js"] },
    { id: "Desarrollo Web Backend", level: 2, tags: ["api", "auth"] },
    { id: "Redes Neuronales", level: 3, tags: ["ml", "ai"] },
    { id: "Estructuras Avanzadas", level: 2, tags: ["grafos", "dp"] },
  ] as Node[],
  edges: [
    ["Fundamentos de Programación", "Estructuras de Datos"],
    ["Fundamentos de Programación", "POO"],
    ["Estructuras de Datos", "Algoritmos"],
    ["Algoritmos", "Complejidad"],
    ["Estructuras de Datos", "Estructuras Avanzadas"],
    ["Fundamentos de Programación", "Desarrollo Web Frontend"],
    ["POO", "Desarrollo Web Backend"],
    ["Bases de Datos", "Desarrollo Web Backend"],
    ["Algoritmos", "Redes Neuronales"],
    ["Git y Control de Versiones", "Desarrollo Web Frontend"],
    ["Git y Control de Versiones", "Desarrollo Web Backend"],
  ] as [string, string][],
};

// =============== LAYOUT (posiciones con estética de constelación) ==============
function radialLayout(nodes: Node[]) {
  const groups = new Map<number, Node[]>();
  nodes.forEach((n) => {
    const lvl = n.level ?? 0; if (!groups.has(lvl)) groups.set(lvl, []);
    groups.get(lvl)!.push(n);
  });
  const entries = [...groups.entries()].sort((a,b) => a[0]-b[0]);
  const placed = new Map<string, {x: number, y: number}>();
  const R0 = 120;
  entries.forEach(([level, arr], gi) => {
    const r = R0 + gi * 60;
    const count = arr.length;
    for (let i = 0; i < count; i++) {
      const theta = (2 * Math.PI * i) / count + gi * 0.2;
      placed.set(arr[i].id, { x: r * Math.cos(theta), y: r * Math.sin(theta) });
    }
  });
  return placed;
}

interface StarfieldProps {
  width: number;
  height: number;
  count?: number;
}

function Starfield({ width, height, count = 200 }: StarfieldProps) {
  const [stars, setStars] = useState<{id:number,x:number,y:number,r:number,d:number}[]>([]);

  useEffect(() => {
    const s = new Array(count).fill(0).map((_,i) => ({
      id: i,
      x: Math.random()*width,
      y: Math.random()*height,
      r: Math.random()*1.2 + 0.3,
      d: 2 + Math.random()*4,
    }));
    setStars(s);
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
          transition={{ duration: s.d, repeat: Infinity, repeatType: "mirror" }}
          className="stroke-black fill-black"
        />
      ))}
    </svg>
  );
}

// Helpers de score → apariencia
const clamp = (x: number) => Math.max(0, Math.min(100, x));
function radiusFromScore(score: number) {
  // 0→4px, 100→10px
  return 4 + (clamp(score) / 100) * 6;
}
function opacityFromScore(score: number) {
  // 0→0.25, 100→1
  return 0.25 + (clamp(score) / 100) * 0.75;
}

// =============== COMPONENTE PRINCIPAL ==============
export default function ConstellationLearningMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [graph, setGraph] = useState<Graph>(SAMPLE_GRAPH);
  const [known, setKnown] = useState(new Set(["Fundamentos de Programación", "Git y Control de Versiones"]));
  const [goal, setGoal] = useState("Desarrollo Web Backend");
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [highlight, setHighlight] = useState({ path: new Set<string>(), steps: [] as string[] });
  const [filter, setFilter] = useState("");
  const [size, setSize] = useState({ w: 900, h: 600 });
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number; rect: DOMRect } | null>(null);

  // Scores por nodo (0..100) y explicaciones IA
  const [scores, setScores] = useState<Record<string, number>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplain, setAiExplain] = useState<{competencies?: string; projects?: string}>({});

  // --- layout responsive
  useEffect(() => {
    const resize = () => {
      const el = containerRef.current;
      if (!el) return;
      setSize({ w: el.clientWidth, h: el.clientHeight });
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // --- posiciones iniciales
  useEffect(() => {
    const center = { x: size.w / 2, y: size.h / 2 };
    const radial = radialLayout(graph.nodes);
    const map = new Map<string, {x:number; y:number}>();
    graph.nodes.forEach(n => {
      const p = radial.get(n.id) || { x: 0, y: 0 };
      map.set(n.id, { x: center.x + p.x, y: center.y + p.y });
    });
    setPositions(map);
  }, [graph, size.w, size.h]);

  // --- ruta recomendada
  useEffect(() => {
    const { path, steps } = suggestLearningSequence(known, goal, graph.edges);
    setHighlight({ path: new Set(path || []), steps });
  }, [known, goal, graph]);

  // --- init de scores (conocidos 70, otros 40)
  useEffect(() => {
    const base: Record<string, number> = {};
    for (const n of graph.nodes) {
      base[n.id] = known.has(n.id) ? 70 : 40;
    }
    setScores(base);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph.nodes.length]); // intencionalmente no depende de 'known' para no pisar cambios manuales
  useEffect(() => {
  try {
    const raw = localStorage.getItem('ai:constellation:scores');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        setScores(parsed);
      }
    }
  } catch {}
}, []);

  // drag & drop
  const onPointerDown = (id: string, e: React.PointerEvent<SVGGElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    setDrag({ id, dx: e.clientX - (positions.get(id)?.x ?? 0), dy: e.clientY - (positions.get(id)?.y ?? 0), rect });
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!drag) return;
    const x = e.clientX - drag.dx;
    const y = e.clientY - drag.dy;
    setPositions(prev => new Map(prev).set(drag.id, { x, y }));
  };
  const onPointerUp = () => setDrag(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointerleave", onPointerUp);
    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointerleave", onPointerUp);
    };
  });

  const visible = useMemo(() => {
    const nodes = graph.nodes || [];
    const q = filter.trim().toLowerCase();
    if (!q) return new Set<string>(nodes.map(n => n.id));
    const set = new Set<string>();
    for (const n of nodes) {
      const hay = (n.id.toLowerCase().includes(q) || (n.tags || []).some(t => t.toLowerCase().includes(q)));
      if (hay) set.add(n.id);
    }
    return set;
  }, [graph, filter]);

  const toggleKnown = (id: string) => {
    setKnown(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setScores(s => ({ ...s, [id]: 40 }));     // baja score por dejar de ser "conocido"
      } else {
        next.add(id);
        setScores(s => ({ ...s, [id]: Math.max(s[id] ?? 0, 70) })); // sube score mínimo
      }
      return next;
    });
  };

  const addNodeQuick = () => {
    const name = prompt("Nombre del tema (nodo)");
    if (!name) return;
    const level = Number(prompt("Nivel/anillo (0,1,2,...)")) || 0;
    const tags = prompt("Tags separadas por coma (opcional)")?.split(",").map(s=>s.trim()).filter(Boolean) || [];
    setGraph(g => ({ ...g, nodes: [...g.nodes, { id: name, level, tags }] }));
    setScores(s => ({ ...s, [name]: 30 }));
  };

  const addEdgeQuick = () => {
    const a = prompt("Prerequisito — de:");
    const b = prompt("…a (tema dependiente):");
    if (!a || !b) return;
    setGraph(g => ({ ...g, edges: [...g.edges, [a,b]] }));
  };

  const exportJSON = () => {
    const payload = { ...graph, scores };
    const data = JSON.stringify(payload, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "constellation-graph.json"; a.click();
    URL.revokeObjectURL(url);
  };
  const importJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result as string);
        if (!obj.nodes || !obj.edges) throw new Error("Formato inválido");
        setGraph({ title: obj.title || SAMPLE_GRAPH.title, tags: obj.tags || [], nodes: obj.nodes, edges: obj.edges });
        setScores(obj.scores || {});
      } catch (e) { alert("JSON inválido"); }
    };
    reader.readAsText(file);
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const center = { x: size.w / 2, y: size.h / 2 };

  // =============== IA: Ajustar mapa con Gemini ===============
async function onAIAdjust() {
  try {
    setAiLoading(true);

    // 1) Trae datos reales del alumno (tests + proyectos)
    const summary = await getProfileSummary().catch(() => null);

    // 2) Si no hay summary, usa fallback a proyectos del backend
    const projectsList = summary?.projects ?? (await getProjects().catch(() => [] as any[]));

    const projectPayload = (projectsList || []).map((p: any) => ({
      title: String(p.title ?? ""),
      description: p.description ? String(p.description) : "",
      tags: [] as string[],
    }));

    // 3) Competencias base: estado actual del grafo (o 70 si es “known”, 40 si no)
    const baseCompetencies: Record<string, number> = {};
    for (const n of graph.nodes) {
      baseCompetencies[n.id] = clamp(
        scores[n.id] ?? (known.has(n.id) ? 70 : 40)
      );
    }

    // 4) Arma payload para Gemini
    const student: StudentData = {
      knowledgeTests: summary?.knowledgeTests ?? [], // 🔹 ahora sí enviamos tests reales
      psychoTests: [],                               // el radar se ajusta en el otro componente
      projects: projectPayload,
      baseCompetencies,
      baseRadar: {},                                 // no se usa aquí
    };

    // 5) Llama a la IA
    const out = await analyzeProfile(student);

    // 6) Aplica ajustes de competencias al mapa
    if (out?.adjustedCompetencies) {
      setScores((prev) => {
        const next = { ...prev };
        for (const [k, v] of Object.entries(out.adjustedCompetencies)) {
          next[k] = clamp(Number(v) || 0);
        }
        try { localStorage.setItem('ai:constellation:scores', JSON.stringify(next)); } catch {}
        return next;
      });
    }

    setAiExplain({
      competencies: out?.explanations?.competencies,
      projects: out?.explanations?.projects,
    });
  } catch (e: any) {
    console.error(e);
    alert(e?.message ?? "Error al ajustar con IA");
  } finally {
    setAiLoading(false);
  }
}
  // =============== RENDERIZADO =================
return (
  <div className="w-full h-screen bg-white relative" ref={containerRef}>
    {/* Panel superior */}
    <div className="absolute left-4 top-4 z-10 flex flex-wrap items-center gap-2 rounded-xl bg-white/90 p-3 shadow">
      <input
        className="rounded border px-3 py-1"
        placeholder="Buscar tema o tag…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <select
        className="rounded border px-3 py-1"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      >
        {graph.nodes.map((n: Node) => (
          <option key={n.id} value={n.id}>{n.id}</option>
        ))}
      </select>
      <button className="rounded bg-blue-600 px-3 py-1 text-white" onClick={addNodeQuick}>+ Nodo</button>
      <button className="rounded bg-blue-600 px-3 py-1 text-white" onClick={addEdgeQuick}>+ Arista</button>
      <button className="rounded bg-gray-200 px-3 py-1" onClick={exportJSON}>Exportar</button>
      <button className="rounded bg-gray-200 px-3 py-1" onClick={() => fileInputRef.current?.click()}>Importar</button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        hidden
        onChange={(e) => { const f = e.target.files?.[0]; if (f) importJSON(f); }}
      />
      <button
        className="rounded bg-emerald-600 px-3 py-1 text-white disabled:opacity-60"
        onClick={onAIAdjust}
        disabled={aiLoading}
        title="Ajusta los puntajes del mapa según tests/proyectos (Gemini)"
      >
        {aiLoading ? "Ajustando..." : "Ajustar con IA"}
      </button>
    </div>

    {/* Explicación IA (breve) */}
    {(aiExplain.competencies || aiExplain.projects) && (
      <div className="absolute right-4 top-4 z-10 max-w-sm rounded-xl bg-white/90 p-3 text-sm shadow">
        {aiExplain.competencies && <p><strong>IA (competencias):</strong> {aiExplain.competencies}</p>}
        {aiExplain.projects && <p className="mt-2"><strong>IA (proyectos):</strong> {aiExplain.projects}</p>}
      </div>
    )}

    {/* Fondo estrellado */}
    <Starfield width={size.w} height={size.h} count={260} />

    {/* lienzo con ejes */}
    <svg className="absolute inset-0 w-full h-full" aria-label="Mapa de constelación">
      {/* halo central sutil */}
      <defs>
        <radialGradient id="halo" r="70%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.06)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Halo central */}
      <circle cx={center.x} cy={center.y} r={Math.min(size.w,size.h)/2.1} fill="url(#halo)" />

      {/* Líneas (edges) */}
      {(graph.edges as [string, string][])?.map((edge, i) => {
      const [a, b] = edge;
      const pa = positions.get(a); const pb = positions.get(b);
      if (!pa || !pb) return null;
      const active = highlight.path.has(a) && highlight.path.has(b);
      const avgScore = ((scores[a] ?? 40) + (scores[b] ?? 40)) / 2; // ← paréntesis correctos
      const strokeOpacity = active ? 1 : opacityFromScore(avgScore) * 0.6;
      return (
        <line
          key={i}
          x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
          stroke="black"
          strokeOpacity={strokeOpacity}
          strokeWidth={active ? 2.4 : 1.2}
        />
  );
})}

      {/* Nodos (estrellas) */}
      {graph.nodes.map((n: Node) => {
        const p = positions.get(n.id); if (!p) return null;
        const isInPath = highlight.path.has(n.id);
        const isVisible = visible.has(n.id);
        const score = scores[n.id] ?? (known.has(n.id) ? 70 : 40);
        const r = radiusFromScore(score) + (isInPath ? 2 : 0);
        const labelVisible = isInPath || isVisible;
        const op = opacityFromScore(score);
        return (
          <g
            key={n.id}
            className="cursor-pointer select-none"
            onPointerDown={(e)=>onPointerDown(n.id, e)}
            onDoubleClick={() => toggleKnown(n.id)}
          >
            <motion.circle
              cx={p.x}
              cy={p.y}
              r={r}
              filter="url(#glow)"
              animate={{ opacity: op, scale: isInPath ? [1,1.12,1] : 1 }}
              transition={{ duration: isInPath ? 1.6 : 0.3, repeat: isInPath ? Infinity : 0 }}
              className="fill-black stroke-black"
              strokeWidth={1.2}
            />

            {labelVisible && (
              <text x={p.x + 10} y={p.y - 10} className="text-xs fill-black">
                {n.id} <tspan className="opacity-60">({Math.round(score)})</tspan>
              </text>
            )}
            {/* Marcador de conocido */}
            {known.has(n.id) && (
              <circle cx={p.x} cy={p.y} r={r+3} className="fill-black/10" />
            )}
          </g>
        );
      })}
    </svg>
  </div>
);}
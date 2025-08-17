
'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * Constellation Learning Map
 * ---------------------------------------------------------------------------
 * Un componente de una sola pieza (single file) que despliega un “árbol de
 * conocimientos” con estética de constelación. Permite:
 * - Visualizar temas como "estrellas" conectadas por prerequisitos.
 * - Sugerir rutas de aprendizaje desde lo que el estudiante ya sabe hasta una
 * meta objetivo, resaltando el camino y el orden recomendado.
 * - Reacomodar estrellas con arrastrar/soltar.
 * - Agregar o editar nodos/relaciones rápidamente con JSON.
 * - Buscar y resaltar temas por nombre o etiqueta.
 *npm install -D tailwindcss postcss autoprefixer
 * Sin dependencias externas (aparte de framer-motion, ya disponible en el entorno).
 * Estilizado con Tailwind. Fondo negro, estrellas con brillo, líneas y animaciones sutiles.
 */

// =============== UTILIDADES DE GRAFO =================
function buildAdjacency(edges: string[][]) {
  const out = new Map<string, Set<string>>();
  const inc = new Map<string, Set<string>>();
  const nodes = new Set<string>();
  edges.forEach(([a, b]) => {
    nodes.add(a); nodes.add(b);
    if (!out.has(a)) out.set(a, new Set());
    if (!inc.has(b)) inc.set(b, new Set());
    out.get(a)!.add(b);
    inc.get(b)!.add(a);
  });
  return { out, inc, nodes };
}

function bfsPath(startSet: Set<string>, goal: string, out: Map<string, Set<string>>, inc: Map<string, Set<string>>): string[] | null {
  // Permite llegar a meta avanzando por prerequisitos: si A->B significa "A es prereq de B",
  // las rutas válidas van de conocidos -> ... -> meta siguiendo aristas en dirección.
  const queue: string[] = [];
  const parent = new Map<string, string>();
  const visited = new Set<string>();

  for (const s of startSet) {
    queue.push(s);
    visited.add(s);
  }
  while (queue.length) {
    const u = queue.shift()!;
    if (u === goal) {
      const path: string[] = [];
      let cur: string | undefined = goal;
      while (cur != null) {
        path.push(cur);
        cur = parent.get(cur);
      }
      return path.reverse();
    }
    const nexts = (out.get(u) ?? new Set<string>());
    for (const v of nexts) {
      if (!visited.has(v)) {
        visited.add(v);
        parent.set(v, u);
        queue.push(v);
      }
    }
  }
  return null;
}

function topologicalOrder(nodes: Set<string>, edges: string[]): string[] {
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
  const { out, inc, nodes } = buildAdjacency(edges);
  if (!nodes.has(goal)) return { path: null, steps: [], note: "La meta no existe" };

  const path = bfsPath(known, goal, out, inc);
  if (!path) return { path: null, steps: [], note: "No hay ruta desde tus conocimientos actuales" };

  // Filtrar nodos no conocidos en el camino y ordenarlos por topología global (suave)
  const topo = topologicalOrder(nodes, edges.flat()); // Corregido: edges debe ser un array de strings para esta función
  const unknownOnPath = path.filter(n => !known.has(n));
  const indexInTopo = new Map<string, number>(topo.map((n, i) => [n, i]));
  const steps = [...unknownOnPath].sort((a, b) => (indexInTopo.get(a) ?? 0) - (indexInTopo.get(b) ?? 0));
  return { path, steps, note: null };
}

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
  ] as string[][],
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
    const r = R0 + gi * 120;
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
  const stars = useMemo(() => (
    new Array(count).fill(0).map((_,i) => ({
      id: i,
      x: Math.random()*width,
      y: Math.random()*height,
      r: Math.random()*1.2 + 0.3,
      d: 2 + Math.random()*4,
    }))
  ), [width, height, count]);

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
          className="fill-white"
        />
      ))}
    </svg>
  );
}

// =============== COMPONENTE PRINCIPAL ==============
export default function ConstellationLearningMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [graph, setGraph] = useState(SAMPLE_GRAPH);
  const [known, setKnown] = useState(new Set(["Fundamentos de Programación", "Git y Control de Versiones"]));
  const [goal, setGoal] = useState("Desarrollo Web Backend");
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [highlight, setHighlight] = useState({ path: new Set<string>(), steps: [] as string[] });
  const [filter, setFilter] = useState("");
  const [size, setSize] = useState({ w: 900, h: 600 });
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number; rect: DOMRect } | null>(null);

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

  useEffect(() => {
    const center = { x: size.w / 2, y: size.h / 2 };
    const radial = radialLayout(graph.nodes);
    const map = new Map();
    graph.nodes.forEach(n => {
      const p = radial.get(n.id) || { x: 0, y: 0 };
      map.set(n.id, { x: center.x + p.x, y: center.y + p.y });
    });
    setPositions(map);
  }, [graph, size.w, size.h]);

  useEffect(() => {
    const { path, steps } = suggestLearningSequence(known, goal, graph.edges);
    setHighlight({ path: new Set(path || []), steps });
  }, [known, goal, graph]);

  const onPointerDown = (id: string, e: React.PointerEvent<SVGGElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    setDrag({ id, dx: e.clientX - positions.get(id)!.x, dy: e.clientY - positions.get(id)!.y, rect });
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
    const q = filter.trim().toLowerCase();
    if (!q) return new Set<string>(graph.nodes.map(n => n.id));
    const set = new Set<string>();
    for (const n of graph.nodes) {
      const hay = (n.id.toLowerCase().includes(q) || (n.tags || []).some(t => t.toLowerCase().includes(q)));
      if (hay) set.add(n.id);
    }
    return set;
  }, [graph, filter]);

  const toggleKnown = (id: string) => {
    setKnown(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const addNodeQuick = () => {
    const name = prompt("Nombre del tema (nodo)");
    if (!name) return;
    const level = Number(prompt("Nivel/anillo (0,1,2,...)")) || 0;
    const tags = prompt("Tags separadas por coma (opcional)")?.split(",").map(s=>s.trim()).filter(Boolean) || [];
    setGraph(g => ({ ...g, nodes: [...g.nodes, { id: name, level, tags }] }));
  };

  const addEdgeQuick = () => {
    const a = prompt("Prerequisito — de:");
    const b = prompt("…a (tema dependiente):");
    if (!a || !b) return;
    setGraph(g => ({ ...g, edges: [...g.edges, [a,b]] }));
  };

  const exportJSON = () => {
    const data = JSON.stringify(graph, null, 2);
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
        setGraph(obj);
      } catch (e) { alert("JSON inválido"); }
    };
    reader.readAsText(file);
  };

  const center = { x: size.w / 2, y: size.h / 2 };

  return (
    <div className="w-full h-full bg-black text-white" ref={containerRef}>
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-4 flex flex-wrap gap-3 items-center justify-between bg-gradient-to-b from-black/70 to-transparent z-20">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-semibold tracking-wide">{graph.title}</div>
          <div className="text-xs text-white/60">{graph.tags?.map(t=>`#${t}`).join("  ")}</div>
        </div>
        <div className="flex gap-2 items-center">
          <input
            className="px-3 py-1.5 rounded-xl bg-white/10 outline-none focus:ring ring-white/20 placeholder-white/60"
            placeholder="Buscar por nombre o tag…"
            value={filter}
            onChange={(e)=>setFilter(e.target.value)}
          />
          <select
            className="px-3 py-1.5 rounded-xl bg-white/10 outline-none focus:ring ring-white/20"
            value={goal}
            onChange={(e)=>setGoal(e.target.value)}
          >
            {graph.nodes.map(n => (
              <option key={n.id} value={n.id}>{n.id}</option>
            ))}
          </select>
          <button onClick={addNodeQuick} className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20">+ Nodo</button>
          <button onClick={addEdgeQuick} className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20">+ Relación</button>
          <button onClick={exportJSON} className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20">Exportar</button>
          <label className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 cursor-pointer">
            Importar
            <input type="file" className="hidden" accept="application/json" onChange={(e)=> e.target.files?.[0] && importJSON(e.target.files[0])} />
          </label>
        </div>
      </div>

      {/* Fondo estrellado */}
      <Starfield width={size.w} height={size.h} count={260} />

      {/* lienzo con ejes */}
      <svg className="absolute inset-0 w-full h-full" aria-label="Mapa de constelación">
        {/* halo central sutil */}
        <defs>
          <radialGradient id="halo" r="70%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={center.x} cy={center.y} r={Math.min(size.w,size.h)/2.1} fill="url(#halo)" />

        {/* Líneas (edges) */}
        {graph.edges.map(([a,b], i) => {
          const pa = positions.get(a); const pb = positions.get(b);
          if (!pa || !pb) return null;
          const active = highlight.path.has(a) && highlight.path.has(b);
          return (
            <line key={i}
              x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
              className={`transition-all ${active ? "stroke-white" : "stroke-white/25"}`}
              strokeWidth={active ? 2.4 : 1}
            />
          );
        })}

        {/* Nodos (estrellas) */}
        {graph.nodes.map((n) => {
          const p = positions.get(n.id); if (!p) return null;
          const isInPath = highlight.path.has(n.id);
          const isVisible = visible.has(n.id);
          const r = isInPath ? 8 : 5;
          const labelVisible = isInPath || isVisible;
          return (
            <g key={n.id} className="cursor-pointer select-none"
               onPointerDown={(e)=>onPointerDown(n.id, e)}
               onDoubleClick={() => toggleKnown(n.id)}
            >
              <motion.circle
                cx={p.x}
                cy={p.y}
                r={r}
                filter="url(#glow)"
                animate={{ opacity: isVisible ? 1 : 0.25, scale: isInPath ? [1,1.2,1] : 1 }}
                transition={{ duration: isInPath ? 1.6 : 0.3, repeat: isInPath ? Infinity : 0 }}
                className={`${known.has(n.id) ? "fill-white" : "fill-transparent"} stroke-white`}
                strokeWidth={known.has(n.id) ? 1 : 1.5}
              />
              {labelVisible && (
                <text x={p.x + 10} y={p.y - 10} className="text-xs fill-white">
                  {n.id}
                </text>
              )}
              {/* Marcador de conocido */}
              {known.has(n.id) && (
                <circle cx={p.x} cy={p.y} r={r+3} className="fill-white/10" />
              )}
            </g>
          );
        })}
      </svg>

      {/* Panel inferior: resumen de ruta */}
      <div className="absolute bottom-0 left-0 w-full p-4 z-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-3">
          <div className="bg-white/5 backdrop-blur rounded-2xl p-4 shadow-xl">
            <div className="text-sm uppercase tracking-widest text-white/70 mb-1">Ruta sugerida</div>
            <div className="text-lg font-semibold mb-2">De tus conocimientos → {goal}</div>
            {highlight.path.size === 0 ? (
              <div className="text-white/70">No se encontró una ruta desde tus conocimientos actuales.</div>
            ) : (
              <div className="flex flex-wrap gap-2 items-center">
                {[...highlight.path].map((n, i, arr) => (
                  <React.Fragment key={n}>
                    <span className="px-2 py-1 rounded-xl bg-white/10">{n}</span>
                    {i < arr.length - 1 && <span className="opacity-60">→</span>}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white/5 backdrop-blur rounded-2xl p-4 shadow-xl">
            <div className="text-sm uppercase tracking-widest text-white/70 mb-1">Pasos recomendados (pendientes)</div>
            {highlight.steps.length === 0 ? (
              <div className="text-white/70">No hay pasos pendientes — ya cumples la ruta o no existe.</div>
            ) : (
              <ol className="list-decimal list-inside leading-7">
                {highlight.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            )}
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-3 flex flex-wrap gap-2 text-sm text-white/80">
          <span className="px-2 py-1 rounded-full bg-white/10">Doble click en una estrella: marcar/desmarcar como conocido</span>
          <span className="px-2 py-1 rounded-full bg-white/10">Arrastra una estrella para reacomodar</span>
          <span className="px-2 py-1 rounded-full bg-white/10">Usa el buscador para resaltar nodos</span>
        </div>
      </div>
    </div>
  );
}

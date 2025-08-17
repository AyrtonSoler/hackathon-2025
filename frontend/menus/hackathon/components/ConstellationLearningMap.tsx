
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
          // Aquí está la corrección: fill y stroke en negro
          className="stroke-black fill-black"
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


// =============== RENDERIZADO =================
return (
<div className="w-full h-screen bg-transparent relative" ref={containerRef}>

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
            className={`transition-all ${active ? "stroke-black" : "stroke-black/25"}`}
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
  className={`${known.has(n.id) ? "fill-black" : "fill-black"} stroke-black`}
  strokeWidth={known.has(n.id) ? 1 : 1.5}
/>


            {labelVisible && (
              <text x={p.x + 10} y={p.y - 10} className="text-xs fill-black">
                {n.id}
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
);

}

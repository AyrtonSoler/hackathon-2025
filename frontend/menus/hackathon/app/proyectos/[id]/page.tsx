'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProject } from '../../../lib/portfolio';
import type { Project } from '../../../lib/portfolio';

export default function ProyectoDetalle() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Project | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getProject(Number(id)).then(setItem).catch(e => setErr(String(e)));
  }, [id]);

  if (err) return <main className="p-4"><p style={{color:'crimson'}}>Error: {err}</p></main>;
  if (!item) return <main className="p-4">Cargando…</main>;

  return (
    <main className="mx-auto max-w-3xl p-4">
      <Link href="/proyectos" className="underline text-sm">← Volver a Proyectos</Link>
      <div className="mt-2 text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</div>
      <h1 className="text-2xl font-semibold">{item.title}</h1>
      <div className="text-sm text-gray-700">{item.institution || '—'}</div>
      <p className="mt-3">{item.description || 'Sin descripción'}</p>
    </main>
  );
}
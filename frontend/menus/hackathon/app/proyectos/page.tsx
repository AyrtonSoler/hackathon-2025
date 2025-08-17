'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createProject, getProjects } from '../../lib/portfolio';
import type { Project } from '../../lib/portfolio';

export default function ProyectosPage() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [inst, setInst] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    getProjects()
      .then(setItems)
      .catch(e => setErr(String(e)))
      .finally(() => setLoading(false));
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const p = await createProject({ institution: inst, title, description: desc });
    setItems(s => [p, ...s]);
    setInst(''); setTitle(''); setDesc('');
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Proyectos y Logros</h1>
        <p className="dashboard-subtitle">Explora lo que has logrado y lo que te espera.</p>
      </header>

      {/* Crear proyecto */}
      <form onSubmit={onCreate} className="card full-width" style={{ marginTop: 16, padding: 16 }}>
        <h2 className="card-title">Crear nuevo proyecto</h2>
        <div className="card-content" style={{ display: 'grid', gap: 8 }}>
          <input className="rounded border p-2" placeholder="Institución (opcional)" value={inst} onChange={e=>setInst(e.target.value)} />
          <input className="rounded border p-2" placeholder="Título del proyecto" value={title} onChange={e=>setTitle(e.target.value)} required />
          <textarea className="rounded border p-2" placeholder="Descripción" rows={3} value={desc} onChange={e=>setDesc(e.target.value)} />
          <button className="link-button" style={{ alignSelf: 'start' }}>Crear</button>
        </div>
      </form>

      {/* Listado */}
      <div className="grid-layout" style={{ gridTemplateColumns: '1fr', gap: 20, marginTop: 20 }}>
        <section className="card full-width">
          <h2 className="card-title">Proyectos Creados</h2>
          <div className="card-content">
            {loading && <p>Cargando…</p>}
            {err && <p style={{ color: 'crimson' }}>Error: {err}</p>}
            {!loading && items.length === 0 && <p>Aún no tienes proyectos.</p>}

            <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 10 }}>
              {items.map(p => (
                <Link
                  key={p.id}
                  href={`/proyectos/${p.id}`}
                  style={{ minWidth: 220, border: '1px solid #ccc', borderRadius: 8, padding: 10, textDecoration: 'none', color: 'inherit' }}
                >
                  <p><strong>{p.title}</strong></p>
                  <p style={{ fontSize: 12, color: '#666' }}>
                    {p.institution || '—'} · {new Date(p.created_at).toLocaleDateString()}
                  </p>
                  <p style={{ marginTop: 6 }}>{p.description?.slice(0, 100) || 'Sin descripción'}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <Link href="/" className="link-button">Volver al Dashboard</Link>
      </div>
    </div>
  );
}
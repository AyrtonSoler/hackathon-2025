
"use client";
import Link from 'next/link';
import Image from 'next/image';
import Pentagon from '../../components/Pentagon';
import React, { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [hobbies, setHobbies] = useState('');

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }
    const savedHobbies = localStorage.getItem('userHobbies');
    if (savedHobbies) {
      setHobbies(savedHobbies);
    }
  }, []);

  const handleEdit = () => setEditing(true);
  const handleSave = () => {
    localStorage.setItem('userHobbies', hobbies);
    setEditing(false);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Mi Perfil Vocacional</h1>
        <p className="dashboard-subtitle">Datos y progreso para tu carrera.</p>
      </header>

      <section className="card full-width" style={{ marginTop: '20px' }}>
        <h2 className="card-title">Datos Personales y Académicos</h2>
        <div className="card-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Image src="/vercel.svg" alt="Foto de Perfil" width={100} height={100} />
            <div>
              <p><strong>Nombre:</strong> {user ? user.name : 'No disponible'}</p>
              <p><strong>Correo:</strong> {user ? user.email : 'No disponible'}</p>
              <p><strong>Institución:</strong> No registrada</p>
              <p><strong>Carrera:</strong> Pendiente</p>
            </div>
            <div style={{ marginLeft: '40px', minWidth: '220px' }}>
              <h3>Gustos y Hobbies</h3>
              {editing ? (
                <div>
                  <textarea
                    value={hobbies}
                    onChange={e => setHobbies(e.target.value)}
                    rows={4}
                    style={{ width: '100%', borderRadius: '6px', padding: '8px' }}
                  />
                  <button onClick={handleSave} style={{ marginTop: '8px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 16px', cursor: 'pointer' }}>Guardar</button>
                </div>
              ) : (
                <div>
                  <p style={{ minHeight: '48px' }}>{hobbies || 'Sin información.'}</p>
                  <button onClick={handleEdit} style={{ background: '#3182ce', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 16px', cursor: 'pointer' }}>Editar</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid-layout" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginTop: '20px' }}>
        <section className="card">
          <h2 className="card-title">Historial de Tests</h2>
          <div className="card-content">
            <ul>
              <li><strong>Test Vocacional SEP:</strong> Resultado “Intereses en tecnología”</li>
              <li><strong>Test CENEVAL:</strong> Puntuación “Nivel avanzado”</li>
              <li><strong>Kuder:</strong> Perfil “Persuasivo y Artístico”</li>
              <li><strong>16PF:</strong> “Sociable y con alta estabilidad”</li>
              <li><strong>Eneatipo:</strong> “Tipo 3, El Triunfador”</li>
            </ul>
          </div>
        </section>
        <section className="card">
          <h2 className="card-title">Habilidades</h2>
          <div className="card-content">
            <div className="flex justify-center">
              <Pentagon />
            </div>
          </div>
        </section>
        <section className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h2 className="card-title" style={{ textAlign: 'center' }}>Competencias y Mapa Estelar</h2>
          <div className="card-content" style={{ textAlign: 'center' }}>
            <p>Explora tus habilidades y el mapa estelar de tu perfil profesional.</p>
            <Link href="/competencias" className="link-button" style={{ marginTop: '10px' }}>
              Ir a Competencias
            </Link>
          </div>
        </section>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Link href="/" className="link-button">Volver al Dashboard</Link>
      </div>
    </div>
  );
}
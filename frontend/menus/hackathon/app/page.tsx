import Link from 'next/link';
import Pentagon from '../components/Pentagon';
import ChatAI from "@/components/ChatAI";
import React from 'react';

export default function HomePage() {
  const skills = [
    { name: 'React', value: 30 },
    { name: 'TypeScript', value: 100 },
    { name: 'CSS', value: 50 },
    { name: 'Node', value: 30 },
    { name: 'SQL', value: 20 },
  ];

  const completedTasks = [
    'Test de Habilidades Técnicas',
    'Proyecto de Automatización 1',
    'Racha de aprendizaje: 5 días seguidos',
    'Curso de Soft Skills Básico',
    'Proyecto de UI/UX',
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Dashboard del Futuro</h1>
        <p className="dashboard-subtitle">Un nuevo camino para tu desarrollo.</p>
      </header>
      
      <div className="grid-layout">

        {/* 1. Mi Perfil Vocacional */}
        <section className="card">
          <h2 className="card-title">Mi Perfil Vocacional</h2>
          <div className="card-content">
            <p>Datos personales, historial de tests y CV vocacional.</p>
            <Link href="/profile" className="link-button">
              Ver mi perfil
            </Link>
          </div>
        </section>

        {/* 2. Mis Competencias */}
        <section className="card">
          <h2 className="card-title">Mis Competencias</h2>
          <div className="card-content">
            <p>Mapa estelar de tus habilidades y carreras sugeridas por afinidad.</p>
            <Link href="/competencias" className="link-button">
              Explorar
            </Link>
          </div>
        </section>

        {/* 3. Comunidad y Motivación */}
        <section className="card">
          <h2 className="card-title">Comunidad</h2>
          <div className="card-content">
            <p>Medallas, logros, rankings y proyectos sugeridos.</p>
            <Link href="/community" className="link-button">
              Conectar
            </Link>
          </div>
        </section>
        
        {/* 4. Recursos y Herramientas - Movido al lado de los otros bloques */}
        <section className="card">
          <h2 className="card-title">Recursos y Herramientas</h2>
          <div className="card-content">
            <p>Tests, quizzes y guías</p>
            <p>----</p>
              <Link
              href="/quizzes"
              className="link-button"
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                backgroundColor: '#0070f3',
                color: 'white',
                fontWeight: 'bold',
                textDecoration: 'none',
              }}
            >
              Ir a Quizzes
            </Link>
          </div>
        </section>

        {/* 5. Resumen de Progreso */}
        <section className="card full-width">
          <h2 className="card-title">Resumen de tu Progreso</h2>
          <div className="card-content">
            <p>Aquí verás tus rachas de aprendizaje.</p>

            {/* Dividido en dos columnas */}
            <div className="radar-chart-columns" style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
              
              {/* Columna izquierda: Pentágono */}
              <div style={{ flex: '0 0 180px', maxWidth: 300, minWidth: 400, textAlign: 'center' }}>
                <h3>Mis Habilidades</h3>
                  <div style={{ display: 'flex', justifyContent: 'center', width: 320, maxWidth: '70%', margin: '0 auto' }}>
                    <Pentagon />
                  </div>
              </div>

              {/* Columna derecha: Slider vertical */}
              <div style={{ flex: 1, marginLeft: '5rem' }}>
                <h3>Tests Completados</h3>
                <div
                  className="slider-container-vertical"
                  style={{
                    maxHeight: '300px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    padding: '0.5rem 0',
                  }}
                >
                  {completedTasks.map((task, index) => (
                    <div
                      key={index}
                      className="competencias-card"
                      style={{
                        background: '#f0f0f0',
                        padding: '1rem',
                        borderRadius: '8px',
                        boxShadow: '0 2px 6px rgba(199, 232, 247, 0.1)',
                      }}
                    >
                      {task}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="suggestions" style={{ marginTop: '1rem' }}>
              Próximos pasos sugeridos:
              <ul>
                <li>Recordatorio: Completa el test de Habilidades Blandas.</li>
                <li>Meta: Trabaja en el Proyecto de Automatización.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 6. Chatbot a Pantalla Completa y dentro de un card */}
        <section className="card full-width">
          <h2 className="card-title">Chat con IA</h2>
          <div style={{ width: '100%' }}>
            <ChatAI />
          </div>
        </section>

      </div>
    </div>
  );
}
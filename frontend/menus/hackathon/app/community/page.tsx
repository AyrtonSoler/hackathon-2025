import Link from 'next/link';
import Image from 'next/image';

export default function CommunityPage() {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Comunidad y Gamificación</h1>
        <p className="dashboard-subtitle">Conéctate, compite y crece con tus compañeros.</p>
      </header>

      {/* Grid de 3 columnas para Gamificación, Rachas y Proyectos */}
      <div className="grid-layout" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginTop: '20px' }}>

        {/* Sección de Gamificación */}
        <section className="card">
          <h2 className="card-title">Medallas y Logros</h2>
          <div className="card-content">
            <p><strong>Medallas:</strong></p>
            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
              <li>🏅 Medalla de "Explorador"</li>
              <li>🏆 Trofeo de "Primer Proyecto"</li>
              <li>🌟 Insignia de "Innovador"</li>
            </ul>
            <p style={{ marginTop: '10px' }}><strong>Rankings:</strong></p>
            <ol>
              <li>Nombre Usuario 1 (1500 pts)</li>
              <li>Tú (1200 pts)</li>
              <li>Nombre Usuario 2 (1150 pts)</li>
            </ol>
          </div>
        </section>

        {/* Sección de Rachas de Aprendizaje */}
        <section className="card">
          <h2 className="card-title">Rachas de Aprendizaje</h2>
          <div className="card-content">
            <p style={{ textAlign: 'center' }}><strong>Tu Racha Actual:</strong> 15 días consecutivos</p>
            {/* Se elimina el grid de rachas de amigos de aquí */}
            <p style={{ marginTop: '20px', textAlign: 'center' }}>¡Mantén tu racha activa para subir en el ranking!</p>
          </div>
        </section>

        {/* Sección de Proyectos Sugeridos */}
        <section className="card">
          <h2 className="card-title">Proyectos Sugeridos</h2>
          <div className="card-content">
            <p>Encuentra proyectos que coincidan con tu perfil e intereses.</p>
            <p style={{ marginTop: '10px' }}><strong>Sugerencia por Afinidad:</strong></p>
            <ul>
              <li><strong>Proyecto 1:</strong> "Web Scraping para Análisis de Mercado"</li>
              <li><strong>Proyecto 2:</strong> "App de Tareas con IA"</li>
            </ul>
            <p style={{ marginTop: '10px' }}>*¿Quieres unirte a un equipo?*</p>
            <Link href="/proyectos" className="link-button">
              Explorar Proyectos
            </Link>
          </div>
        </section>
        
      </div>

      {/* Nueva tarjeta de ancho completo con rachas y competencias de amigos */}
      <section className="card full-width" style={{ marginTop: '20px' }}>
        <h2 className="card-title">Rachas y Competencias de Amigos</h2>
        <div className="card-content">
          <p style={{ marginBottom: '15px' }}>Conoce el progreso semanal de tus amigos y sus competencias.</p>
          
          {/* Contenedor de las 3 columnas para las rachas de amigos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '2em' }}>🔥</span>
              <p><strong>Amigo 1</strong></p>
              <p>20 días de racha</p>
              <p style={{ fontSize: '0.8em', color: '#666' }}>Competencia: Python</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '2em' }}>🚀</span>
              <p><strong>Amigo 2</strong></p>
              <p>18 días de racha</p>
              <p style={{ fontSize: '0.8em', color: '#666' }}>Competencia: UX/UI</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '2em' }}>⚡️</span>
              <p><strong>Amigo 3</strong></p>
              <p>15 días de racha</p>
              <p style={{ fontSize: '0.8em', color: '#666' }}>Competencia: Marketing Digital</p>
            </div>
          </div>
        </div>
      </section>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Link href="/" className="link-button">
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}
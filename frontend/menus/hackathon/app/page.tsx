import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Dashboard del Futuro</h1>
        <p className="dashboard-subtitle">Un nuevo camino para tu desarrollo.</p>
      </header>
      
      <div className="grid-layout">
        {/* 1. Inicio / Dashboard */}
        <section className="card full-width">
          <h2 className="card-title">Resumen de tu Progreso</h2>
          <div className="card-content">
            <p>Aquí verás tus tests completados, proyectos y rachas de aprendizaje.</p>
            <div className="radar-chart-placeholder">
              Gráfica Radar de Hard/Soft Skills
            </div>
            <div className="suggestions">
              Próximos pasos sugeridos:
              <ul>
                <li>Recordatorio: Completa el test de Habilidades Blandas.</li>
                <li>Meta: Trabaja en el Proyecto de Automatización.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 2. Mi Perfil Vocacional */}
        <section className="card">
          <h2 className="card-title">Mi Perfil Vocacional</h2>
          <div className="card-content">
            <p>Datos personales, historial de tests y CV vocacional.</p>
            <Link href="/profile" className="link-button">
              Ver mi perfil
            </Link>
          </div>
        </section>
        
        {/* 3. Mis Competencias */}
        <section className="card">
          <h2 className="card-title">Mis Competencias</h2>
          <div className="card-content">
            <p>Mapa estelar de tus habilidades y carreras sugeridas por afinidad.</p>
            <Link href="/competencias" className="link-button">
              Explorar
            </Link>
          </div>
        </section>

        {/* 4. Comunidad y Motivación */}
        <section className="card">
          <h2 className="card-title">Comunidad</h2>
          <div className="card-content">
            <p>Medallas, logros, rankings y proyectos sugeridos.</p>
            <Link href="/community" className="link-button">
              Conectar
            </Link>
          </div>
        </section>

        {/* 5. Recursos y Herramientas */}
        <section className="card">
          <h2 className="card-title">Recursos y Herramientas</h2>
          <div className="card-content">
            <p>Tests, quizzes, guías y el chatbot con IA.</p>
            <div className="chatbot-placeholder">
              <p>Aquí va el Chatbot con IA.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}//----------------
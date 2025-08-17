import Link from 'next/link';

export default function ProyectosPage() {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Proyectos y Logros</h1>
        <p className="dashboard-subtitle">Explora lo que has logrado y lo que te espera.</p>
      </header>

      {/* Grid de 2 columnas para Proyectos Propios y Sugeridos */}
      <div className="grid-layout" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>

        {/* Sección de Proyectos Propios (Individuales) */}
        <section className="card full-width">
          <h2 className="card-title">Proyectos Creados</h2>
          <div className="card-content">
            <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
              {/* Ejemplo de un proyecto propio */}
              <div style={{ minWidth: '180px', height: '150px', border: '1px solid #ccc', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <p><strong>Proyecto 1</strong></p>
                <p>Descripción breve del proyecto.</p>
              </div>
              {/* Puedes duplicar este div para más proyectos */}
              <div style={{ minWidth: '180px', height: '150px', border: '1px solid #ccc', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <p><strong>Proyecto 2</strong></p>
                <p>Descripción breve del proyecto.</p>
              </div>
              <div style={{ minWidth: '180px', height: '150px', border: '1px solid #ccc', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <p><strong>Proyecto 3</strong></p>
                <p>Descripción breve del proyecto.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Proyectos Sugeridos (Comunidad) */}
        <section className="card full-width">
          <h2 className="card-title">Proyectos Sugeridos</h2>
          <div className="card-content">
            <p style={{ marginBottom: '10px' }}>Basados en tus intereses y habilidades, te sugerimos:</p>
            {/* Ejemplo de un proyecto sugerido */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>⬅️</span>
                <div style={{ minWidth: '180px', height: '150px', border: '1px solid #ccc', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                    <p><strong>Proyecto Sugerido 1</strong></p>
                    <p>Aplicación de E-commerce.</p>
                </div>
                <span>➡️</span>
            </div>
            <p style={{ marginTop: '10px', textAlign: 'center' }}>¡Únete a un equipo para colaborar!</p>
          </div>
        </section>

      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Link href="/" className="link-button">
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}
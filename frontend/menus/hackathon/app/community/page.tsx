
import Link from 'next/link';
import Image from 'next/image';

export default function CommunityPage() {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Rachas de Amigos</h1>
        <p className="dashboard-subtitle">Conéctate, compite y crece con tus compañeros.</p>
      </header>

      {/* Grid de 3 columnas para las tarjetas de amigos */}
      <div className="grid-layout" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginTop: '20px' }}>
        {/* Tarjeta de Amigo 1 */}
        <section className="card">
          <h2 className="card-title">Juan P.</h2>
          <div className="card-content">
            <p><strong>Institución:</strong> Universidad Tecnológica</p>
            <p style={{ marginTop: '10px' }}><strong>Última Competencia:</strong> Desarrollo Web</p>
            <p style={{ marginTop: '10px' }}><strong>Racha Actual:</strong> 25 días 🔥</p>
          </div>
        </section>
        {/* Tarjeta de Amigo 2 */}
        <section className="card">
          <h2 className="card-title">María G.</h2>
          <div className="card-content">
            <p><strong>Institución:</strong> ITESM</p>
            <p style={{ marginTop: '10px' }}><strong>Última Competencia:</strong> Diseño UX/UI</p>
            <p style={{ marginTop: '10px' }}><strong>Racha Actual:</strong> 20 días</p>
          </div>
        </section>
        {/* Tarjeta de Amigo 3 */}
        <section className="card">
          <h2 className="card-title">Carlos R.</h2>
          <div className="card-content">
            <p><strong>Institución:</strong> UNAM</p>
            <p style={{ marginTop: '10px' }}><strong>Última Competencia:</strong> Analítica de Datos</p>
            <p style={{ marginTop: '10px' }}><strong>Racha Actual:</strong> 15 días</p>
          </div>
        </section>
        {/* Tarjeta de Amigo 4 */}
        <section className="card">
          <h2 className="card-title">Enri S.</h2>
          <div className="card-content">
            <p><strong>Institución:</strong> OaxTecPrep</p>
            <p style={{ marginTop: '10px' }}><strong>Última Competencia:</strong> Desarrollo en Python</p>
            <p style={{ marginTop: '10px' }}><strong>Racha Actual:</strong> 2 días</p>
          </div>
        </section>
        {/* Tarjeta de Amigo 5 */}
        <section className="card">
          <h2 className="card-title">Francis K.</h2>
          <div className="card-content">
            <p><strong>Institución:</strong> Humboldt</p>
            <p style={{ marginTop: '10px' }}><strong>Última Competencia:</strong> Design Thinking</p>
            <p style={{ marginTop: '10px' }}><strong>Racha Actual:</strong> 13 días</p>
          </div>
        </section>
        {/* Tarjeta de Amigo 6 */}
        <section className="card">
          <h2 className="card-title">Biktor H.</h2>
          <div className="card-content">
            <p><strong>Institución:</strong> UNAM</p>
            <p style={{ marginTop: '10px' }}><strong>Última Competencia:</strong> Hacking Avanzado</p>
            <p style={{ marginTop: '10px' }}><strong>Racha Actual:</strong> 19 días</p>
          </div>
        </section>
      </div>
      {/* Botones de navegación */}
      <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '15px' }}>
        <Link href="/" className="link-button">
          Volver al Dashboard
        </Link>
        <Link href="/agregar-amigo" className="link-button">
          Agregar Amigo
        </Link>
      </div>
    </div>
  );
}
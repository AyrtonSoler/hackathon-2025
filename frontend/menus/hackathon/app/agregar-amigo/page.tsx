import Link from 'next/link';

export default function AddFriendPage() {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Agregar Amigo</h1>
        <p className="dashboard-subtitle">Esta funcionalidad está en desarrollo.</p>
      </header>

      <section className="card full-width" style={{ marginTop: '20px', textAlign: 'center' }}>
        <div className="card-content">
          <p>La opción para buscar y agregar amigos estará disponible pronto. ¡Gracias por tu paciencia!</p>
        </div>
      </section>
      
      {/* Botones de navegación */}
      <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '15px' }}>
        <Link href="/" className="link-button">
          Volver al Dashboard
        </Link>
        <Link href="/community" className="link-button">
          Volver a Amigos
        </Link>
      </div>
    </div>
  );
}
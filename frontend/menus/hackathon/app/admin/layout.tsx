import Link from 'next/link';
// Opcional: crea un archivo de estilos para admin si lo necesitas

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-container">
      {/* Sidebar de Navegación */}
      <aside className="admin-sidebar">
        <div className="profile-section">
          {/* Aquí iría la foto de perfil del admin */}
          <div className="profile-photo"></div>
          <h2>Administrador(a)</h2>
          <p>Panel de control</p>
        </div>
        <nav className="sidebar-nav">
          <Link href="/admin" className="nav-link">
            Grupos y Estudiantes
          </Link>
          <Link href="/admin/assignments" className="nav-link">
            Trabajos y Quizzes
          </Link>
        </nav>
      </aside>
      {/* Contenido principal de la página */}
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}
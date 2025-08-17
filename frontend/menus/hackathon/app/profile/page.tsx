// frontend/menus/hackathon/app/profile/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import Pentagon from '../../components/Pentagon';

export default function ProfilePage() {
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
              <p><strong>Nombre:</strong> Nombre del Usuario</p>
              <p><strong>Correo:</strong> usuario@ejemplo.com</p>
              <p><strong>Escuela:</strong> Universidad Tecnológica</p>
              <p><strong>Carrera:</strong> Ingeniería en Software</p>
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
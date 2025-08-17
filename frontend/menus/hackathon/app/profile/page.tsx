// En app/profile/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import Pentagon from '../../components/Pentagon';

// Creación de la base de datos local para habilidades vocacionales
const habilidadesVocacionales = [
  { nombre: 'Científica', valor: 4 },
  { nombre: 'Persuasiva', valor: 5 },
  { nombre: 'Artística', valor: 3 },
  { nombre: 'Mecánica', valor: 2 },
  { nombre: 'Social', valor: 5 },
  { nombre: 'Musical', valor: 1 },
];

// Creación de la base de datos local para habilidades académicas
const habilidadesAcademicas = [
  { nombre: 'Administración', valor: 3 },
  { nombre: 'Aritmética', valor: 4 },
  { nombre: 'Biología', valor: 5 },
  { nombre: 'Cálculo', valor: 5 },
  { nombre: 'Derecho', valor: 2 },
  { nombre: 'Economía', valor: 3 },
  { nombre: 'Estadística', valor: 4 },
  { nombre: 'Filosofía', valor: 2 },
  { nombre: 'Física', valor: 4 },
  { nombre: 'Historia', valor: 5 },
  { nombre: 'Literatura', valor: 3 },
  { nombre: 'Matemáticas', valor: 5 },
  { nombre: 'Premedicina', valor: 4 },
  { nombre: 'Psicología', valor: 4 },
  { nombre: 'Química', valor: 3 },
  { nombre: 'Salud', valor: 5 },
];

// Tus habilidades originales
const skills = [
  { name: 'React', value: 80 },
  { name: 'TypeScript', value: 70 },
  { name: 'CSS', value: 90 },
  { name: 'Node', value: 60 },
  { name: 'SQL', value: 50 },
];

export default function ProfilePage() {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Mi Perfil Vocacional</h1>
        <p className="dashboard-subtitle">Datos y progreso para tu carrera.</p>
      </header>

      {/* Secciones con espacio agregado */}
      <section className="card full-width" style={{ marginTop: '20px' }}>
        <h2 className="card-title">Datos Personales y Académicos</h2>
        <div className="card-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Image
              src="/vercel.svg"
              alt="Foto de Perfil"
              width={100}
              height={100}
              className="profile-image"
            />
            <div>
              <p><strong>Nombre:</strong> Nombre del Usuario</p>
              <p><strong>Correo:</strong> usuario@ejemplo.com</p>
              <p><strong>Escuela:</strong> Universidad Tecnológica</p>
              <p><strong>Carrera:</strong> Ingeniería en Software</p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de 3 columnas con espacio superior */}
      <div className="grid-layout" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginTop: '20px' }}>
        {/* Historial de Tests */}
        <section className="card">
          <h2 className="card-title">Historial de Tests</h2>
          <div className="card-content">
            <ul>
              <li><strong>Test Vocacional SEP:</strong> Resultado "Intereses en tecnología"</li>
              <li><strong>Test CENEVAL:</strong> Puntuación "Nivel avanzado"</li>
              <li><strong>Test de Kuder:</strong> Perfil "Persuasivo y Artístico"</li>
              <li><strong>16PF:</strong> "Sociable y con alta estabilidad"</li>
              <li><strong>Eneatipo:</strong> "Tipo 3, El Triunfador"</li>
            </ul>
          </div>
        </section>

        {/* CV Vocacional */}
        <section className="card">
          <h2 className="card-title">Habilidades</h2>
          <div className="card-content">
            <center><Pentagon skills={skills} size={200} /></center>
          </div>
        </section>

        {/* Enlace a la página de Competencias */}
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

      {/* Botón de volver con espacio superior */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Link href="/" className="link-button">
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}
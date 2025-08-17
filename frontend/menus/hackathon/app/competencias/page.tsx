'use client';

import Link from 'next/link';
import ConstellationLearningMap from '../../components/ConstellationLearningMap'; // 👈 Importa el componente

export default function CompetenciasPage() {
  return (
    <div className="competencias-container">
      <h1 className="competencias-title">Mis Competencias y Vocación</h1>
      <p className="competencias-subtitle">
        Explora tu mapa estelar de habilidades y descubre carreras afines.
      </p>

      <div className="competencias-grid">
        {/* Sección para el mapa estelar/grafo */}
        <section className="competencias-card competencias-mapa">
  <h2 className="card-title">Mapa Estelar de Competencias</h2>
  <div className="mapa-placeholder">
    <ConstellationLearningMap />
  </div>
</section>


        {/* Sección para las carreras sugeridas */}
        <section className="competencias-card carreras-sugeridas">
          <h2 className="card-title">Carreras Sugeridas</h2>
          <ul className="carreras-list">
            <li>Ingeniería de Software</li>
            <li>Ciencia de Datos</li>
            <li>Diseño de Experiencia de Usuario (UX)</li>
            <li>Consultor de Negocios</li>
            <li>Analista de Sistemas</li>
          </ul>
        </section>
      </div>

      <div className="back-button-container">
        <Link href="/" className="link-button">
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}
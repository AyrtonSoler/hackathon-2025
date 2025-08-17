'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Barras from '../../components/barras';

type Result = {
  category: string;
  score: number;
};

const sampleResults: Result[] = [
  { category: 'Lógica', score: 85 },
  { category: 'Programación', score: 72 },
  { category: 'Algoritmos', score: 90 },
  { category: 'Estructuras de Datos', score: 65 },
  { category: 'Frontend', score: 95 },
  { category: 'Backend', score: 80 },
];

const completedQuizzes: string[] = [
  'Quiz de Lógica',
  'Quiz de Algoritmos',
  'Quiz de Bases de Datos',
  'Quiz de Redes',
  'Quiz de Desarrollo Web',
];

export default function ResultadosPage() {
  const router = useRouter();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Resultados del Test</h1>
        <p className="dashboard-subtitle">
          Aquí verás tu desempeño y quizzes completados.
        </p>
      </header>

      {/* Contenedor en paralelo: QUIZZES (izq) | GRÁFICA (der) */}
      <div
        style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        {/* 1. Quizzes Completados (izquierda) */}
        <section className="card" style={{ flex: 1, minWidth: 260 }}>
          <h2 className="card-title">Quizzes Completados</h2>
          <div className="card-content">
            <div
              style={{
                maxHeight: '500px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                padding: '0.5rem 0',
              }}
            >
              {completedQuizzes.map((quiz, index) => (
                <div
                  key={index}
                  style={{
                    background: '#f0f0f0',
                    padding: '1rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  }}
                >
                  {quiz}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2. Resultados Gráfica (derecha) */}
        <section className="card" style={{ flex: 2, minWidth: 320 }}>
          <h2 className="card-title">Mi Desempeño</h2>
          <div className="card-content">
            <div style={{ height: '500px' }}>
              <Barras results={sampleResults} />
            </div>
          </div>
        </section>
      </div>

      {/* Botón Regresar */}
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button
          onClick={() => router.back()}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            backgroundColor: '#0070f3',
            color: 'white',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ← Regresar
        </button>
      </div>
    </div>
  );
}

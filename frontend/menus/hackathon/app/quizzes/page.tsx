"use client";
import React, { useState } from 'react';
import Link from 'next/link';

type Quiz = {
  id: number;
  title: string;
  questions: {
    question: string;
    options: string[];
  }[];
};

const quizzes: Quiz[] = [
  {
    id: 1,
    title: 'Quiz de React',
    questions: [
      { question: '¿Qué es JSX?', options: ['JavaScript XML', 'JavaScript eXecute', 'JSON'] },
      { question: '¿Qué hook se usa para estado?', options: ['useEffect', 'useState', 'useMemo'] },
    ],
  },
  {
    id: 2,
    title: 'Quiz de TypeScript',
    questions: [
      { question: '¿Qué es TypeScript?', options: ['Un lenguaje tipado', 'Un framework', 'Una librería'] },
      { question: 'Tipo para cadena de texto?', options: ['string', 'number', 'text'] },
    ],
  },
];

const QuizzesPage: React.FC = () => {
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(quizzes[0] || null);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      
      {/* Aside izquierdo: lista de quizzes */}
      <aside
        style={{
          width: '250px',
          borderRight: '1px solid #ccc',
          padding: '1rem',
          background: '#f7f7f7',
        }}
      >
        <h2>Quizzes</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {quizzes.map(quiz => (
            <li key={quiz.id}>
              <button
                onClick={() => setSelectedQuiz(quiz)}
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem',
                  marginBottom: '0.5rem',
                  borderRadius: '6px',
                  border: selectedQuiz?.id === quiz.id ? '2px solid #0070f3' : '1px solid #ccc',
                  background: selectedQuiz?.id === quiz.id ? '#e0f0ff' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {quiz.title}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Contenido del quiz */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {/* Botón de regreso al Home */}
        <Link href="/" style={{
          display: 'inline-block',
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          background: '#0070f3',
          color: 'white',
          textDecoration: 'none'
        }}>
          ← Regresar al Home
        </Link>

        {selectedQuiz ? (
          <>
            <h2>{selectedQuiz.title}</h2>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {selectedQuiz.questions.map((q, i) => (
                <div key={i} style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
                  <p><strong>Pregunta {i + 1}:</strong> {q.question}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {q.options.map((opt, j) => (
                      <label key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="radio" name={`question-${i}`} value={opt} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>Selecciona un quiz del menú izquierdo.</p>
        )}
      </main>
    </div>
  );
};

export default QuizzesPage;

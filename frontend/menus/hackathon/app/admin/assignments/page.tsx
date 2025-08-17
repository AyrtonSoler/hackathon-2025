// app/admin/assignments/page.tsx
export default function AssignmentsPage() {
  return (
    <div className="dashboard-content">
      <h1 className="dashboard-title">Trabajos y Quizzes Pendientes</h1>

      <section className="card full-width">
        <h2 className="card-title">Quizzes y Proyectos</h2>
        <div className="card-content">
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <div>
              <h3>Quizzes Verificados</h3>
              <p>8 de 10</p>
            </div>
            <div>
              <h3>Proyectos Calificados</h3>
              <p>3 de 13</p>
            </div>
          </div>
          <div style={{ marginTop: '20px' }}>
            <h3>Próximos Vencimientos</h3>
            <ul>
              <li><strong>Proyecto:</strong> Fecha 18 Agosto</li>
              <li><strong>Quiz:</strong> Fecha 20 Agosto</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

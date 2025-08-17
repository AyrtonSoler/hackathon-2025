// app/admin/page.tsx
import { FaUserCircle, FaPlusCircle } from 'react-icons/fa';

export default function AdminPage() {
  return (
    <div className="dashboard-content">
      <h1 className="dashboard-title">Panel de Administración</h1>
      
      <section className="card full-width">
        <h2 className="card-title">Grupos y Estudiantes</h2>
        <div className="card-content">
          <ul className="group-list">
            <li>Grupo de Matemáticas</li>
            <li>Grupo de Física</li>
            <li>Grupo de Historia</li>
          </ul>
        </div>
      </section>

      <section className="card full-width" style={{ marginTop: '20px' }}>
        <h2 className="card-title">Crear</h2>
        <div className="card-content">
          <form className="create-form">
            <div className="form-group">
              <label>Elija una opción</label>
              <select className="form-select">
                <option>Crear Grupo</option>
                <option>Añadir Estudiante</option>
              </select>
            </div>
            <div className="form-group" style={{ marginTop: '10px' }}>
              <label>Elija grupo</label>
              <input type="text" placeholder="Nombre del grupo..." className="form-input" />
            </div>
            <button type="submit" className="create-button">Crear</button>
          </form>
        </div>
      </section>
    </div>
  );
}
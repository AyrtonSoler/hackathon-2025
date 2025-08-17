'use client'; // Esto es necesario para usar hooks de React en el App Router

import { useState, FormEvent } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault(); // Previene que la página se recargue

    // Aquí es donde enviarías los datos a tu API para autenticar al usuario
    console.log('Correo:', email);
    console.log('Contraseña:', password);

    // En una aplicación real, aquí redirigirías al usuario al dashboard o a la página de perfil
  };

  return (
    <main className="form-container">
      <h1>Inicia Sesión</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Entrar
        </button>
      </form>
    </main>
  );
}
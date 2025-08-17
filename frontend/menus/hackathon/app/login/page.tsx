'use client';

import { useState, FormEvent } from 'react';
import styles from './login.module.css'; // 👈 Importas los estilos de forma local

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    console.log('Correo:', email);
    console.log('Contraseña:', password);
  };

  return (
    <main className={styles.formContainer}> {/* Usas la clase a través del objeto 'styles' */}
      <h1>Inicia Sesión</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          Entrar
        </button>
      </form>
    </main>
  );
}
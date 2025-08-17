'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    // Leer usuarios guardados
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[email]) {
      // Guardar usuario actual
      localStorage.setItem('currentUser', JSON.stringify({
        name: users[email].name,
        email: email
      }));
      router.push('/');
    } else {
      setError('No se encontró la cuenta.');
    }
  };

  const handleDeleteAllUsers = () => {
    if (window.confirm('¿Seguro que quieres borrar todos los usuarios? Esta acción no se puede deshacer.')) {
      localStorage.removeItem('users');
      localStorage.removeItem('currentUser');
      setError('Todos los usuarios han sido borrados.');
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h1 className="login-title">Iniciar Sesión</h1>
        <p className="login-subtitle">Introduce tus datos para acceder.</p>
        <div className="form-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{ marginLeft: '8px' }}
            >
              {showPassword ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </div>
        {error && <div style={{ color: 'red', marginBottom: '8px' }}>{error}</div>}
        <button type="submit" className="login-button">
          Entrar
        </button>
        <div className="login-link-container">
          ¿No tienes una cuenta?{' '}
          <Link href="/signup" className="signup-link">
            Crea una.
          </Link>
        </div>
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleDeleteAllUsers}
            style={{ background: '#e53e3e', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
          >
            Borrar todos los usuarios
          </button>
        </div>
      </form>
    </div>
  );
}
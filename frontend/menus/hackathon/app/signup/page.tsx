'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password) {
      setError('Completa todos los campos.');
      return;
    }
    
    if (!isAgreed) {
      setError('Debes aceptar los términos de privacidad para continuar.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[email]) {
      setError('Ya existe una cuenta con ese correo.');
      return;
    }
    
    users[email] = { name, password };
    localStorage.setItem('users', JSON.stringify(users));

    setSuccess('Cuenta creada exitosamente. Redirigiendo...');
    setTimeout(() => {
      router.push('/login');
    }, 1200);
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <h1 className="signup-title">Crear Cuenta</h1>
        <p className="signup-subtitle">Únete a nuestra comunidad hoy mismo.</p>

        <div className="form-group">
          <label htmlFor="name">Nombre</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="form-input"
          />
        </div>

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

        {/* Checkbox con enlace al documento */}
        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center' }}>
          <input
            type="checkbox"
            id="privacy-terms"
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          <label htmlFor="privacy-terms" style={{ margin: 0, fontSize: '0.9em' }}>
            Acepto los <a href="/docs/priv.pdf" target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3', textDecoration: 'underline' }}>términos de privacidad</a>
          </label>
        </div>
        
        {error && <div style={{ color: 'red', marginBottom: '8px' }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: '8px' }}>{success}</div>}
        
        <button type="submit" className="signup-button">
          Registrarse
        </button>
      </form>
    </div>
  );
}
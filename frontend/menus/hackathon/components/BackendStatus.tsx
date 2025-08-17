'use client';

import { useEffect, useState } from 'react';
import { getHealth } from '../lib/api';

export default function BackendStatus() {
  const [status, setStatus] = useState<string>('cargando...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHealth()
      .then((data) => setStatus(data.status))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <p>Error al conectar: {error}</p>;
  }

  return <p>Estado del backend: {status}</p>;
}

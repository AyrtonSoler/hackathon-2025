'use client';

import React from 'react';
import { motion, easeOut } from 'framer-motion';

/**
 * Componente de página de "Próximamente" con un diseño visualmente atractivo y animado.
 */
const ProximamentePage: React.FC = () => {
  // Variantes para animaciones de texto
  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.2,
        ease: easeOut,
      },
    },
  };

  // Variantes para el brillo del botón
  const buttonGlowVariants = {
    initial: {
      boxShadow: '0 0px 0px rgba(139, 92, 246, 0)',
    },
    hover: {
      boxShadow: '0 0px 30px rgba(139, 92, 246, 0.8), 0 0px 60px rgba(139, 92, 246, 0.5)',
      transition: { duration: 0.3 },
    },
  };

  return (
  <div className="flex flex-col justify-between items-center h-screen w-screen bg-[#0A0A0A] text-white relative overflow-hidden">
      
      {/* Fondo de partículas abstractas */}
      <div className="absolute inset-0 z-0 w-full h-full opacity-70">
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(12,192,238,0.3)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
            <radialGradient id="grad2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(139,92,246,0.3)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
            <radialGradient id="grad3" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>
          <motion.circle
            cx="20%" cy="30%" r="100" fill="url(#grad1)"
      animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
  transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.circle
            cx="80%" cy="70%" r="120" fill="url(#grad2)"
      animate={{ x: [0, -40, 0], y: [0, 20, 0], scale: [1, 1.1, 1] }}
  transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          />
          {/* Partícula adicional 1 */}
          <motion.circle
            cx="50%" cy="15%" r="60" fill="url(#grad3)"
            animate={{ x: [0, 30, 0], y: [0, 25, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          />
          {/* Partícula adicional 2 */}
          <motion.circle
            cx="15%" cy="80%" r="80" fill="url(#grad2)"
            animate={{ x: [0, 20, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          />
          {/* Partícula adicional 3 */}
          <motion.circle
            cx="70%" cy="50%" r="50" fill="url(#grad1)"
            animate={{ x: [0, -25, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          />
        </svg>
      </div>

      {/* Contenedor principal del contenido */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center flex-1 text-center max-w-4xl px-8"
      >
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={textVariants}
          className="text-6xl md:text-8xl font-black tracking-tighter leading-tight"
          style={{ color: '#fff' }}
        >
          Próximamente
        </motion.h1>
        <span className="block h-8" />
        <motion.p
          initial="hidden"
          animate="visible"
          variants={textVariants}
          className="text-xl md:text-2xl font-light mb-12 leading-relaxed"
          style={{ color: '#fff' }}
        >
            <br />
          Estamos en las etapas finales para lanzar una experiencia
          innovadora.
          <span className="block h-4" />
          Te garantizamos que la espera valdrá la pena.
          <br />
        </motion.p>

        {/* Botón de Regresar rediseñado */}
      </motion.div>
      <motion.button
        onClick={() => window.history.back()}
        whileHover="hover"
        whileTap={{ scale: 0.95 }}
        variants={buttonGlowVariants}
        className="mb-16 font-extrabold text-white rounded-full border-2 border-purple-500 transition-all duration-300 transform shadow-2xl"
        style={{
          background: 'linear-gradient(45deg, #4F46E5, #9333EA)',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.9)',
          color: '#fff',
          fontSize: '1rem',
          padding: '0.75rem 1.5rem',
          minWidth: '120px',
          minHeight: '40px',
        }}
      >
        ← Regresar
      </motion.button>
*** End Patch
  </div>
  );
};

export default ProximamentePage;

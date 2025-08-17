'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Skill = {
  name: string;
  value: number; // 0 a 100
};

type PolygonProps = {
  skills: Skill[]; // N lados = skills.length
  size?: number;
};

const Polygon: React.FC<PolygonProps> = ({ skills, size = 200 }) => {
  const n = skills.length;
  const center = size / 2;
  const radius = size / 2 - 20;
  const angleOffset = -Math.PI / 2; // empieza desde arriba

  // Calcula puntos de un polígono a cierto porcentaje del radio
  const calculatePolygon = (scale: number) =>
    skills
      .map((_, i) => {
        const angle = (i * 2 * Math.PI) / n + angleOffset;
        const x = center + radius * scale * Math.cos(angle);
        const y = center + radius * scale * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');

  // Polígono de valores reales
  const calculateValues = (values: Skill[]) =>
    values
      .map((skill, i) => {
        const angle = (i * 2 * Math.PI) / n + angleOffset;
        const r = (skill.value / 100) * radius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');

  return (
    <svg width={size} height={size}>
      {/* Polígonos guía (20%, 40%, 60%, 80%, 100%) */}
      {[0.2, 0.4, 0.6, 0.8, 1].map((scale, idx) => (
        <polygon
          key={idx}
          points={calculatePolygon(scale)}
          fill="none"
          stroke="lightgray"
          strokeWidth={1}
        />
      ))}

      <AnimatePresence>
        {/* Polígono con valores */}
        <motion.polygon
          points={calculateValues(skills)}
          fill="rgba(0, 150, 255, 0.3)"
          stroke="blue"
          strokeWidth={2}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>

      {/* Etiquetas */}
      {skills.map((skill, i) => {
        const angle = (i * 2 * Math.PI) / n + angleOffset;
        const x = center + (radius + 15) * Math.cos(angle);
        const y = center + (radius + 15) * Math.sin(angle);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fill="black"
          >
            {skill.name}
          </text>
        );
      })}
    </svg>
  );
};

export default Polygon;


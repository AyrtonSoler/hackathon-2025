'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Skill = {
  name: string;
  value: number; // 0 a 100
};

type PentagonProps = {
  skills: Skill[];
  size?: number;
};

const Pentagon: React.FC<PentagonProps> = ({ skills, size = 200 }) => {
  const center = size / 2;
  const radius = size / 2 - 20;
  const angleOffset = -Math.PI / 2; // empezar desde arriba

  const calculatePoints = (values: Skill[]) =>
    values
      .map((skill, i) => {
        const angle = (i * 2 * Math.PI) / 5 + angleOffset;
        const r = (skill.value / 100) * radius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');

  return (
    <svg width={size} height={size}>
      <AnimatePresence>
        <motion.polygon
          points={calculatePoints(skills)}
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
        const angle = (i * 2 * Math.PI) / 5 + angleOffset;
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

export default Pentagon;

"use client";
import React, { useState } from 'react';
import Pentagon from '../../components/Pentagon';

const skillsData = [
  { name: 'React', value: 80 },
  { name: 'TypeScript', value: 70 },
  { name: 'CSS', value: 90 },
  { name: 'Node', value: 60 },
  { name: 'SQL', value: 50 },
];

const App: React.FC = () => {
  const [skills, setSkills] = useState(skillsData);

  const randomizeSkills = () => {
    setSkills(skills.map(s => ({ ...s, value: Math.floor(Math.random() * 101) })));
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 50 }}>
  <Pentagon />
      <button onClick={randomizeSkills} style={{ marginTop: 20 }}>
        Cambiar habilidades
      </button>
    </div>
  );
};

export default App;

// frontend/menus/hackathon/lib/reference.ts
export type Weights = Record<string, number>;

export type TestDB = {
  habilidadesVocacionales: string[];     // 10 vértices del radar
  habilidadesAcademicas: string[];       // competencias para el mapa estelar
  psychoToRadar: Record<string, { weights: Weights; bias: number }>;
  knowledgeToCompetencies: Record<string, { weights: Weights; bias: number }>;
  groups?: Record<string, string[]>;
};

export const TEST_DB: TestDB = {
  habilidadesVocacionales: [
    'Científica',
    'Persuasiva',
    'Artística',
    'Mecánica',
    'Social',
    'Musical',
    'Investigativa',
    'Comunicativa',
    'Emprendedora',
    'Organizativa',
  ],

  habilidadesAcademicas: [
    'Administración',
    'Aritmética',
    'Biología',
    'Cálculo',
    'Derecho',
    'Economía',
    'Estadística',
    'Filosofía',
    'Física',
    'Historia',
    'Literatura',
    'Matemáticas',
    'Premedicina',
    'Psicología',
    'Química',
    'Salud',
  ],

  psychoToRadar: {
    enneagram_focus: {
      weights: { Organizativa: 6, Investigativa: 5, Científica: 3 },
      bias: 0,
    },
    bigfive_extroversion: {
      weights: { Social: 8, Comunicativa: 9, Persuasiva: 7 },
      bias: 0,
    },
  },

  knowledgeToCompetencies: {
    js_basics: {
      weights: { Aritmética: 6, Estadística: 5, Matemáticas: 6 },
      bias: 0,
    },
    react_fundamentals: {
      weights: { Matemáticas: 6, Administración: 4, Estadística: 4 },
      bias: 0,
    },
  },

  groups: {
    academicas: [
      'Administración','Aritmética','Biología','Cálculo','Derecho','Economía',
      'Estadística','Filosofía','Física','Historia','Literatura','Matemáticas',
      'Premedicina','Psicología','Química','Salud',
    ],
    vocacionales: [
      'Científica','Persuasiva','Artística','Mecánica','Social','Musical',
      'Investigativa','Comunicativa','Emprendedora','Organizativa',
    ],
  },
};
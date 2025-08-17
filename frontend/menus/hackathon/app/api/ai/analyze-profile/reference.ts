// Ajusta esta "DB" libremente (tu equipo puede ampliarla)
export type RefDB = {
  knowledgeToCompetency: {
    // id de test de conocimientos -> { peso por competencia, umbrales, deltas }
    [testId: string]: {
      weights: { [competency: string]: number };  // suma aprox 1.0
      thresholds: number[];                       // p. ej. [50, 70, 85]
      deltas: number[];                           // p. ej. [0, 4, 8, 12] (por tramo)
    };
  };
  psychoToRadar: {
    // id de test psicométrico -> { peso por eje del radar }
    [testId: string]: {
      weights: { [axis: string]: number };       // suma aprox 1.0
      invert?: boolean;                           // si el rasgo baja el eje
    };
  };
  projectHints?: {
    // reglas heurísticas (opcional): si un proyecto menciona X, sube Y competencias
    keywords: { [keyword: string]: { [competency: string]: number } };
  };
};

export const REF_DB: RefDB = {
  knowledgeToCompetency: {
    js_basics: {
      weights: { "Frontend-JS": 0.7, "Problem Solving": 0.3 },
      thresholds: [50, 70, 85],
      deltas:     [0,    4,   8,   12],
    },
    react_fundamentals: {
      weights: { "Frontend-React": 0.8, "UI/UX": 0.2 },
      thresholds: [50, 70, 85],
      deltas:     [0,    5,   9,   12],
    },
    data_structures: {
      weights: { "Estructuras de Datos": 0.7, "Algoritmos": 0.3 },
      thresholds: [50, 70, 85],
      deltas:     [0,    5,  10,   14],
    },
  },
  psychoToRadar: {
    enneagram_focus: {
      // ejemplo de ejes de radar en tu UI
      weights: { "Disciplina": 0.6, "Colaboración": 0.2, "Autonomía": 0.2 },
    },
    bigfive_extroversion: {
      weights: { "Colaboración": 0.6, "Liderazgo": 0.4 },
    },
  },
  projectHints: {
    keywords: {
      ecommerce:      { "Frontend-React": 3, "UI/UX": 2 },
      "data viz":     { "Visualización de Datos": 4 },
      "api rest":     { "Backend-API": 3, "Arquitectura": 2 },
      "tensorflow":   { "ML Básico": 5 },
      "typescript":   { "Frontend-TS": 3 },
    },
  },
};
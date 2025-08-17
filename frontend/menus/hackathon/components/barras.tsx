'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

type Result = {
  category: string;
  score: number;
};

type TestResultsPageProps = {
  title?: string;
  results: Result[];
};

const TestResultsPage: React.FC<TestResultsPageProps> = ({
  title = 'Resultados del Test',
  results,
}) => {
  return (
    <div className="flex flex-col items-center p-6 space-y-6">
      {/* Título */}
      <h1 className="text-2xl font-bold">{title}</h1>

      {/* Gráfica de Barras */}
      <div className="w-full h-[450px] max-w-4xl">
        <ResponsiveContainer>
          <BarChart
            data={results}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            {/* Eje X con las categorías */}
            <XAxis
              dataKey="category"
              angle={-20} // inclina etiquetas para que no se encimen
              textAnchor="end"
              interval={0}
            />
            {/* Eje Y con valores */}
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="score" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>


    </div>
  );
};

export default TestResultsPage;

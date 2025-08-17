import TestResultsPage from '../../components/barras';

const MyPage = () => {
  const myResults = [
    { category: "Comunicación", score: 85 },
    { category: "Trabajo en equipo", score: 70 },
    { category: "Liderazgo", score: 60 },
    { category: "Resolución de problemas", score: 90 },
    { category: "Creatividad", score: 75 },
  ];

  return <TestResultsPage title="Resultados de Habilidades Blandas" results={myResults} />;
};

export default MyPage;

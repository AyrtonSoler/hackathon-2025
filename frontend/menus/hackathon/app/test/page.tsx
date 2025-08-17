"use client";
import { useEffect, useState } from "react";
// Si no configuraste alias "@/...", cambia a: ../lib/api
import { getQuestions, submitAnswers } from "@/lib/api";

export default function Page() {
  const [qs, setQs] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuestions().then(setQs).catch(e => setError(String(e))).finally(() => setLoading(false));
  }, []);

  async function onSend() {
    try {
      const payload = Object.entries(answers).map(([qid, opt]) => ({
        questionId: Number(qid), optionId: opt
      }));
      const res = await submitAnswers(payload);
      setResult(res);
    } catch (e:any) {
      setError(String(e?.message ?? e));
    }
  }

  if (loading) return <p style={{padding:16}}>Cargando…</p>;
  if (error) return <p style={{padding:16, color:"crimson"}}>Error: {error}</p>;

  return (
    <main style={{maxWidth:720, margin:"40px auto", lineHeight:1.6}}>
      <h1>Test de Eneagrama</h1>
      {qs.map((q) => (
        <div key={q.id} style={{marginBottom:16}}>
          <p>{q.text}</p>
          {q.options.map((o:any) => (
            <label key={o.id} style={{marginRight:12}}>
              <input
                type="radio"
                name={`q-${q.id}`}
                onChange={() => setAnswers(a => ({...a, [q.id]: o.id}))}
              />
              {o.label}
            </label>
          ))}
        </div>
      ))}
      <button onClick={onSend}>Enviar</button>
      {result && (
        <pre style={{marginTop:24, background:"#f6f6f6", padding:12}}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}
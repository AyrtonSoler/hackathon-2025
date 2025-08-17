const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export async function getQuestions() {
  const r = await fetch(`${API}/api/test/questions/`, { cache: "no-store" });
  if (!r.ok) throw new Error(`Failed to load questions: ${r.status}`);
  return r.json();
}

export async function submitAnswers(
  answers: { questionId: number; optionId: string }[]
) {
  const r = await fetch(`${API}/api/test/submit/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  if (!r.ok) throw new Error(`Failed to submit: ${r.status}`);
  return r.json();
}
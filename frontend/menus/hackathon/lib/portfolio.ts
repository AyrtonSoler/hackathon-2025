const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export type Project = {
  id: number; owner: number | null; institution: string;
  title: string; description: string; created_at: string;
};
export type Assignment = {
  id: number; institution: string; owner: number | null;
  title: string; description: string; due_date?: string | null; created_at: string;
};
export type Submission = {
  id: number; assignment: number; student: number | null;
  text: string; created_at: string;
};

export async function getProjects(): Promise<Project[]> {
  const r = await fetch(`${API}/api/portfolio/projects/`, { cache: "no-store" });
  if (!r.ok) throw new Error(`Projects ${r.status}`);
  return r.json();
}
export async function createProject(data: Partial<Project>) {
  const r = await fetch(`${API}/api/portfolio/projects/`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(`Create project ${r.status}`);
  return r.json() as Promise<Project>;
}
export async function getProject(id: number) {
  const r = await fetch(`${API}/api/portfolio/projects/${id}/`, { cache: "no-store" });
  if (!r.ok) throw new Error(`Project ${id} → ${r.status}`);
  return r.json() as Promise<Project>;
}

export async function getAssignments(): Promise<Assignment[]> {
  const r = await fetch(`${API}/api/portfolio/assignments/`, { cache: "no-store" });
  if (!r.ok) throw new Error(`Assignments ${r.status}`);
  return r.json();
}
export async function createAssignment(data: Partial<Assignment>) {
  const r = await fetch(`${API}/api/portfolio/assignments/`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(`Create assignment ${r.status}`);
  return r.json() as Promise<Assignment>;
}

export async function getSubmissions(assignmentId: number): Promise<Submission[]> {
  const r = await fetch(`${API}/api/portfolio/assignments/${assignmentId}/submissions/`, { cache: "no-store" });
  if (!r.ok) throw new Error(`Submissions ${r.status}`);
  return r.json();
}
export async function createSubmission(assignmentId: number, data: Partial<Submission>) {
  const r = await fetch(`${API}/api/portfolio/assignments/${assignmentId}/submissions/`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(`Create submission ${r.status}`);
  return r.json() as Promise<Submission>;
}
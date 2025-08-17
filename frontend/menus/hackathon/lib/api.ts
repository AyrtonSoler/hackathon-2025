export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function getHealth() {
  const res = await fetch(`${apiBaseUrl}/health/live`);
  if (!res.ok) {
    throw new Error('Failed to fetch health');
  }
  return res.json();
}

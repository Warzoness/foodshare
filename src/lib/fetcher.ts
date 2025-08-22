// src/lib/fetcher.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

export async function apiFetch(input: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${input}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    },
    cache: "no-store"
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

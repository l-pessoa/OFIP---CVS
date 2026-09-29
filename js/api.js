const API_BASE = "https://x8ki-letl-twmt.n7.xano.io/api:u6Bs9PZE";

export async function listarHinos({ naipe, categoria, busca } = {}) {
  const params = new URLSearchParams();
  if (naipe) params.set("naipe", naipe);
  if (categoria) params.set("categoria", categoria);
  if (busca) params.set("busca", busca);

  const res = await fetch(`${API_BASE}/listar_hinos?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Falha ao buscar hinos (status ${res.status})`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : (data.items ?? []);
}

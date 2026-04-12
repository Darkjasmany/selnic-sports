const API_BASE = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://localhost:3000";

export function getPhotoUrl(photoUrl?: string | null): string | undefined {
  if (!photoUrl) return undefined;
  // Si ya es una URL completa, la devuelve tal cual
  if (photoUrl.startsWith("http")) return photoUrl;
  // Si es una ruta relativa, agrega el host del backend
  return `${API_BASE}${photoUrl}`;
}

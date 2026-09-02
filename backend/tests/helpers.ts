import jwt from "jsonwebtoken";

// Genera un token JWT con rol ADMIN (sin tocar la BD) para usar en los tests
// que requieren autenticación/autorización.
export function adminToken(overrides: { id?: string; role?: string } = {}) {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign(
    { id: overrides.id ?? "test-admin-id", role: overrides.role ?? "ADMIN" },
    secret,
    { expiresIn: "1h" }
  );
}

// Nombre único por corrida de tests para evitar colisiones con datos ya existentes
export function unique(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

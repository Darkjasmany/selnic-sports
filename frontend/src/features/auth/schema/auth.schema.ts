import { z } from "zod";

// Validaciones reutilizables
const emailValidation = z
  .string({ message: "El email es requerido" })
  .email("Email inválido")
  .toLowerCase()
  .trim()
  .min(1, "El email no puede estar vacío");

const passwordValidation = z
  .string({ message: "La contraseña es requerida" })
  .min(8, "Mínimo 8 caracteres")
  .trim();

// Schema de login
export const loginSchema = z.object({
  email: emailValidation,
  password: passwordValidation,
});

// Types inferidos
export type LoginInput = z.infer<typeof loginSchema>;

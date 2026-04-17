import { z } from "zod";

export const createPlayerSchema = z.object({
  firstName: z
    .string({ required_error: "El nombre es requerido" })
    .min(2, "Mínimo 2 caracteres")
    .trim(),
  lastName: z
    .string({ required_error: "El apellido es requerido" })
    .min(2, "Mínimo 2 caracteres")
    .trim(),
  birthDate: z
    .string({ required_error: "La fecha de nacimiento es requerida" })
    .refine(date => !isNaN(Date.parse(date)), { message: "Fecha inválida" }),
  // .datetime({ message: "Fecha inválida" }),
  documentId: z
    .string({ required_error: "La cédula es requerida" })
    .min(8, "Mínimo 8 caracteres")
    .trim(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  bloodType: z.string().trim().optional(),
  nationality: z.string().trim().default("Ecuatoriana"),
  isActive: z.boolean().default(true),
  teamId: z.string({ required_error: "El equipo es requerido" }).cuid("ID de equipo inválido"),

  // Representante
  guardianName: z.string().trim().optional(),
  guardianPhone: z.string().trim().optional(),
  guardianEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  guardianRelation: z.enum(["PADRE", "MADRE", "OTRO"]).optional(),
});

export const updatePlayerSchema = createPlayerSchema.partial();

export const saveBiometricSchema = z.object({
  biometricData: z.array(z.number()),
  biometricType: z.enum(["FACIAL", "FINGERPRINT"]).default("FACIAL"),
});

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
export type SaveBiometricInput = z.infer<typeof saveBiometricSchema>;

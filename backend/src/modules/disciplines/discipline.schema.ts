import { z } from "zod";

const nameValidation = z
  .string({ required_error: "El nombre es requerido" })
  .min(2, "Mínimo 2 caracteres")
  .max(50, "Máximo 50 caracteres")
  .trim();

export const createDisciplineSchema = z.object({
  name: nameValidation,
  playersPerField: z.number().int().min(1, "Debe haber al menos 1 jugador en campo"),
  maxSubstitutions: z
    .number()
    .int()
    .min(0, "Los cambios no pueden ser negativos")
    .nullable()
    .optional(),
  allowsDraw: z.boolean().default(true),
});

export const updateDisciplineSchema = createDisciplineSchema.partial();

export type CreateDisciplineInput = z.infer<typeof createDisciplineSchema>;
export type UpdateDisciplineInput = z.infer<typeof updateDisciplineSchema>;
